open Rebase;

/* supported protocol */
type protocol =
  | EmacsOnly
  | EmacsAndJSON;

type metadata = {
  path: string,
  args: array(string),
  version: string,
  protocol,
};

module Error = {
  type autoSearch =
    | ProcessHanging
    | NotSupported(string)
    | NotFound(string);

  type validation =
    /* the path is empty */
    | PathMalformed(string)
    /* the process is not responding */
    | ProcessHanging
    /* from the shell */
    | NotFound(Js.Exn.t)
    | ShellError(Js.Exn.t)
    /* from its stderr */
    | ProcessError(string)
    /* the process is not Agda */
    | IsNotAgda(string);

  type connection =
    | ShellError(Js.Exn.t)
    | ClosedByProcess(int, string)
    | DisconnectedByUser;

  type t =
    | AutoSearchError(autoSearch)
    | ValidationError(string, validation)
    | ConnectionError(connection);

  let toString =
    fun
    | AutoSearchError(ProcessHanging) => (
        "Process not responding",
        {j|Please restart the process|j},
      )
    | AutoSearchError(NotSupported(os)) => (
        "Auto search failed",
        {j|currently auto path searching is not supported on $(os)|j},
      )
    | AutoSearchError(NotFound(msg)) => ("Auto search failed", msg)
    | ValidationError(_path, PathMalformed(msg)) => ("Path malformed", msg)
    | ValidationError(_path, ProcessHanging) => (
        "Process hanging",
        "The program has not been responding for more than 1 sec",
      )
    | ValidationError(_path, NotFound(error)) => (
        "Agda not found",
        Util.JsError.toString(error),
      )
    | ValidationError(_path, ShellError(error)) => (
        "Error from the shell",
        Util.JsError.toString(error),
      )
    | ValidationError(_path, ProcessError(msg)) => (
        "Error from the stderr",
        msg,
      )
    | ValidationError(_path, IsNotAgda(msg)) => ("This is not agda", msg)
    | ConnectionError(ShellError(error)) => (
        "Socket error",
        Util.JsError.toString(error),
      )
    | ConnectionError(ClosedByProcess(code, signal)) => (
        "Socket closed",
        {j|code: $code
    signal: $signal|j},
      )
    | ConnectionError(DisconnectedByUser) => (
        "Disconnected",
        "Connection disconnected by ourselves",
      );
};

type t = {
  metadata,
  process: N.ChildProcess.t,
  mutable queue: array(Event.t(string, Error.connection)),
  errorEmitter: Event.t(string, unit),
  mutable connected: bool,
};

let disconnect = (error, self) => {
  self.queue |> Array.forEach(ev => ev |> Event.emitError(error));
  self.queue = [||];
  self.errorEmitter |> Event.removeAllListeners;
  self.connected = false;
  self.process |> N.ChildProcess.kill("SIGTERM");
};

/* a more sophiscated "make" */
let autoSearch = (path): Async.t(string, Error.autoSearch) =>
  Async.make((resolve, reject) =>
    switch (N.OS.type_()) {
    | "Linux"
    | "Darwin" =>
      /* reject if the process hasn't responded for more than 1 second */
      let hangTimeout =
        Js.Global.setTimeout(
          () => reject(ProcessHanging: Error.autoSearch),
          1000,
        );
      N.ChildProcess.exec(
        "which " ++ path,
        (error, stdout, stderr) => {
          /* clear timeout as the process has responded */
          Js.Global.clearTimeout(hangTimeout);

          /* error */
          switch (error |> Js.Nullable.toOption) {
          | None => ()
          | Some(err) =>
            reject(NotFound(err |> Js.Exn.message |> Option.getOr("")))
          };

          /* stderr */
          let stderr' = stderr |> Node.Buffer.toString;
          if (stderr' |> String.isEmpty |> (!)) {
            reject(NotFound(stderr'));
          };

          /* stdout */
          let stdout' = stdout |> Node.Buffer.toString;
          if (stdout' |> String.isEmpty) {
            reject(NotFound(""));
          } else {
            resolve(Parser.filepath(stdout'));
          };
        },
      )
      |> ignore;
    | "Windows_NT" => reject(NotSupported("Windows_NT"))
    | os => reject(NotSupported(os))
    }
  );

/* a more sophiscated "make" */
let validateAndMake = (pathAndParams): Async.t(metadata, Error.validation) => {
  let (path, args) = Parser.commandLine(pathAndParams);
  let parseError =
      (error: Js.Nullable.t(Js.Exn.t)): option(Error.validation) => {
    switch (error |> Js.Nullable.toOption) {
    | None => None
    | Some(err) =>
      let message = err |> Js.Exn.message |> Option.getOr("");
      if (message |> Js.Re.test_([%re "/No such file or directory/"], _)) {
        Some(NotFound(err));
      } else if (message |> Js.Re.test_([%re "/command not found/"], _)) {
        Some(NotFound(err));
      } else {
        Some(ShellError(err));
      };
    };
  };
  let parseStdout =
      (stdout: Node.Buffer.t): result(metadata, Error.validation) => {
    let message = stdout |> Node.Buffer.toString;
    switch (Js.String.match([%re "/Agda version (.*)/"], message)) {
    | None => Error(IsNotAgda(message))
    | Some(match) =>
      switch (match[1]) {
      | None => Error(IsNotAgda(message))
      | Some(version) =>
        Ok({
          path,
          args,
          version: Util.Semver.coerce(version),
          protocol:
            Js.Re.test_([%re "/--interaction-json/"], message)
              ? EmacsAndJSON : EmacsOnly,
        })
      }
    };
  };

  Async.make((resolve, reject) => {
    if (path |> String.isEmpty) {
      reject(Error.PathMalformed("the path must not be empty"));
    };

    /* reject if the process hasn't responded for more than 1 second */
    let hangTimeout =
      Js.Global.setTimeout(() => reject(Error.ProcessHanging), 1000);

    N.ChildProcess.exec(
      path,
      (error, stdout, stderr) => {
        /* clear timeout as the process has responded */
        Js.Global.clearTimeout(hangTimeout);

        /* parses `error` and rejects it if there's any  */
        switch (parseError(error)) {
        | None => ()
        | Some(err) => reject(err)
        };

        /* stderr */
        let stderr' = stderr |> Node.Buffer.toString;
        if (stderr' |> String.isEmpty |> (!)) {
          reject(ProcessError(stderr'));
        };

        /* stdout */
        switch (parseStdout(stdout)) {
        | Error(err) => reject(err)
        | Ok(self) => resolve(self)
        };
      },
    )
    |> ignore;
  });
};

let useJSON = metadata => {
  Atom.Environment.Config.get("agda-mode.enableJSONProtocol")
  && metadata.protocol == EmacsAndJSON;
};

let connect = (metadata): Async.t(t, Error.connection) => {
  N.(
    Async.make((resolve, reject) => {
      let args =
        (useJSON(metadata) ? [|"--interaction-json"|] : [|"--interaction"|])
        |> Array.concat(metadata.args);
      let process = ChildProcess.spawn(metadata.path, args, {"shell": true});

      let connection = {
        metadata,
        process,
        connected: true,
        queue: [||],
        errorEmitter: Event.make(),
      };
      /* Handles errors and anomalies */
      process
      |> ChildProcess.on(
           `error(
             exn => {
               connection |> disconnect(Error.ShellError(exn));
               reject(Error.ShellError(exn));
             },
           ),
         )
      |> ChildProcess.on(
           `close(
             (code, signal) => {
               connection |> disconnect(Error.ClosedByProcess(code, signal));
               reject(Error.ClosedByProcess(code, signal));
             },
           ),
         )
      |> ignore;
      process
      |> ChildProcess.stdout
      |> Stream.Readable.once(`data(_ => resolve(connection)))
      |> ignore;
    })
  );
};

let wire = (self): t => {
  /* resolves the requests in the queue */
  let response = data => {
    switch (self.queue[0]) {
    | None => self.errorEmitter |> Event.emitOk(data)
    | Some(req) =>
      req |> Event.emitOk(data);
      /* should updates the queue */
      self.queue |> Js.Array.pop |> ignore;
    };
  };

  let buffer = ref("");
  /* listens to the "data" event on the stdout */
  let onData = chunk => {
    let string = chunk |> Node.Buffer.toString;

    /* the prompt "Agda2> " should appear at the end of the response */
    let endOfResponse = string |> String.endsWith("Agda2> ");
    if (endOfResponse) {
      let withoutSuffix =
        Js.String.substring(~from=0, ~to_=String.length(string) - 7, string);
      /* append it to the accumulated buffer (without for the "Agda2> " suffix) */
      let data = buffer^ ++ withoutSuffix;
      if (data |> String.isEmpty |> (!)) {
        response(data);
      };
      /* empty the buffer */
      buffer := "";
    } else {
      /* append to the buffer and wait until the end of the response */
      buffer := buffer^ ++ string;
    };
  };

  self.process
  |> N.ChildProcess.stdout
  |> N.Stream.Readable.on(`data(onData))
  |> ignore;

  self;
};

let send = (request, self): Async.t(string, Error.connection) => {
  let reqPromise = Event.make();
  self.queue |> Js.Array.push(reqPromise) |> ignore;

  /* listen */
  let promise = reqPromise |> Event.once;
  /* write */
  self.process
  |> N.ChildProcess.stdin
  |> N.Stream.Writable.write(request ++ "\n" |> Node.Buffer.fromString)
  |> ignore;

  promise;
};

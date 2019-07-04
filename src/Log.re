open Rebase;

module Entry = {
  type request = Command.Remote.command;
  type response = {
    mutable rawText: array(string),
    mutable sexpression: array(Parser.SExpression.t),
    mutable response: array(Response.t),
  };
  type t = {
    request,
    response,
  };
  let serialize = (self, i) => {
    // indent some paragraph by 4 spaces
    let indent = xs =>
      xs
      |> Util.safeSplitByRe([%re "/\\n/"])
      |> Array.map(Option.mapOr(x => "    " ++ x, ""))
      |> List.fromArray
      |> String.joinWith("\n");
    let fold = (title, text) => {j|<details><summary> $title </summary>
<p>

$text

</p>
</details>
|j};
    let quote = (title, xs) =>
      xs
      |> Array.map(x => {j|```
$x
```
|j})
      |> List.fromArray
      |> String.joinWith("\n")
      |> fold(title)
      |> indent;

    let request = Command.Remote.toString(self.request);

    let rawText = self.response.rawText |> quote("raw text");
    let sexpression =
      self.response.sexpression
      |> Array.map(Parser.SExpression.toString)
      |> quote("s-expression");
    let response =
      self.response.response
      |> Array.map(Response.toString)
      |> quote("response");

    {j|$i. **$request**
$rawText
$sexpression
$response
|j};
  };
};

type t = array(Entry.t);

let empty = [||];

let createEntry = (cmd, log) => {
  let entry: Entry.t = {
    request: cmd,
    response: {
      rawText: [||],
      sexpression: [||],
      response: [||],
    },
  };
  Js.Array.push(entry, log) |> ignore;
};

let updateLatestEntry = (f: Entry.t => unit, log) => {
  let n = Array.length(log);
  log[n - 1] |> Option.forEach(f);
};

let logRawText = text =>
  updateLatestEntry(log =>
    Js.Array.push(text, log.response.rawText) |> ignore
  );

let logSExpression = text =>
  updateLatestEntry(log =>
    Js.Array.push(text, log.response.sexpression) |> ignore
  );

let logResponse = text =>
  updateLatestEntry(log =>
    Js.Array.push(text, log.response.response) |> ignore
  );

let serialize = log => {
  let entries =
    log
    |> Array.mapi(Entry.serialize)
    |> List.fromArray
    |> String.joinWith("\n");

  {j|## Parse Log
$entries
|j};
};

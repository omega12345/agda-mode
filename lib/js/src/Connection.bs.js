// Generated by BUCKLESCRIPT VERSION 5.0.4, PLEASE EDIT WITH CARE
'use strict';

var Os = require("os");
var Block = require("bs-platform/lib/js/block.js");
var Curry = require("bs-platform/lib/js/curry.js");
var Rebase = require("@glennsl/rebase/lib/js/src/Rebase.bs.js");
var Semver = require("semver");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var Util$AgdaMode = require("./Util.bs.js");
var Child_process = require("child_process");
var Async$AgdaMode = require("./Util/Async.bs.js");
var Event$AgdaMode = require("./Util/Event.bs.js");
var Parser$AgdaMode = require("./Parser.bs.js");
var Response$AgdaMode = require("./Response.bs.js");

function toString(param) {
  switch (param.tag | 0) {
    case 0 : 
        var match = param[0];
        if (typeof match === "number") {
          return /* tuple */[
                  "Process not responding",
                  "Please restart the process"
                ];
        } else if (match.tag) {
          return /* tuple */[
                  "Auto search failed",
                  match[0]
                ];
        } else {
          return /* tuple */[
                  "Auto search failed",
                  "currently auto path searching is not supported on " + (String(match[0]) + "")
                ];
        }
    case 1 : 
        var match$1 = param[1];
        if (typeof match$1 === "number") {
          return /* tuple */[
                  "Process hanging",
                  "The program has not been responding for more than 1 sec"
                ];
        } else {
          switch (match$1.tag | 0) {
            case 0 : 
                return /* tuple */[
                        "Path malformed",
                        match$1[0]
                      ];
            case 1 : 
                return /* tuple */[
                        "Agda not found",
                        Util$AgdaMode.JsError[/* toString */0](match$1[0])
                      ];
            case 2 : 
                return /* tuple */[
                        "Error from the shell",
                        Util$AgdaMode.JsError[/* toString */0](match$1[0])
                      ];
            case 3 : 
                return /* tuple */[
                        "Error from the stderr",
                        match$1[0]
                      ];
            case 4 : 
                return /* tuple */[
                        "This is not agda",
                        match$1[0]
                      ];
            
          }
        }
    case 2 : 
        var match$2 = param[0];
        if (typeof match$2 === "number") {
          return /* tuple */[
                  "Disconnected",
                  "Connection disconnected by ourselves"
                ];
        } else if (match$2.tag) {
          return /* tuple */[
                  "Socket closed by Agda",
                  "code: " + (String(match$2[0]) + ("\nsignal: " + (String(match$2[1]) + "\nIt\'s probably because Agda\'s not happy about the arguments you fed her\n")))
                ];
        } else {
          return /* tuple */[
                  "Socket error",
                  Util$AgdaMode.JsError[/* toString */0](match$2[0])
                ];
        }
    
  }
}

var $$Error = /* module */Block.localModule(["toString"], [toString]);

function disconnect(error, self) {
  Rebase.$$Array[/* forEach */8]((function (ev) {
          return Event$AgdaMode.emitError(error, ev);
        }), self[/* queue */2]);
  self[/* queue */2] = /* array */[];
  Event$AgdaMode.removeAllListeners(self[/* errorEmitter */3]);
  self[/* connected */4] = false;
  self[/* process */1].kill("SIGTERM");
  return /* () */0;
}

function autoSearch(path) {
  return Async$AgdaMode.make((function (resolve, reject) {
                var os = Os.type();
                var exit = 0;
                switch (os) {
                  case "Darwin" : 
                  case "Linux" : 
                      exit = 1;
                      break;
                  case "Windows_NT" : 
                      return Curry._1(reject, /* NotSupported */Block.variant("NotSupported", 0, ["Windows_NT"]));
                  default:
                    return Curry._1(reject, /* NotSupported */Block.variant("NotSupported", 0, [os]));
                }
                if (exit === 1) {
                  var hangTimeout = setTimeout((function (param) {
                          return Curry._1(reject, /* ProcessHanging */0);
                        }), 1000);
                  Child_process.exec("which " + path, (function (error, stdout, stderr) {
                          clearTimeout(hangTimeout);
                          if (!(error == null)) {
                            Curry._1(reject, /* NotFound */Block.variant("NotFound", 1, [Rebase.$$Option[/* getOr */16]("", error.message)]));
                          }
                          var stderr$prime = stderr.toString();
                          if (!Rebase.$$String[/* isEmpty */5](stderr$prime)) {
                            Curry._1(reject, /* NotFound */Block.variant("NotFound", 1, [stderr$prime]));
                          }
                          var stdout$prime = stdout.toString();
                          if (Rebase.$$String[/* isEmpty */5](stdout$prime)) {
                            return Curry._1(reject, /* NotFound */Block.variant("NotFound", 1, [""]));
                          } else {
                            return Curry._1(resolve, Parser$AgdaMode.filepath(stdout$prime));
                          }
                        }));
                  return /* () */0;
                }
                
              }));
}

function validateAndMake(pathAndParams) {
  var match = Parser$AgdaMode.commandLine(pathAndParams);
  var args = match[1];
  var path = match[0];
  var parseError = function (error) {
    if (error == null) {
      return undefined;
    } else {
      var message = Rebase.$$Option[/* getOr */16]("", error.message);
      if ((/No such file or directory/).test(message) || (/command not found/).test(message)) {
        return /* NotFound */Block.variant("NotFound", 1, [error]);
      } else {
        return /* ShellError */Block.variant("ShellError", 2, [error]);
      }
    }
  };
  var parseStdout = function (stdout) {
    var message = stdout.toString();
    var match = message.match((/Agda version (.*)/));
    if (match !== null) {
      var match$1 = Rebase.$$Array[/* get */17](match, 1);
      if (match$1 !== undefined) {
        var match$2 = (/--interaction-json/).test(message);
        return /* Ok */Block.variant("Ok", 0, [/* record */Block.record([
                      "path",
                      "args",
                      "version",
                      "protocol"
                    ], [
                      path,
                      args,
                      Semver.coerce(match$1),
                      match$2 ? /* EmacsAndJSON */1 : /* EmacsOnly */0
                    ])]);
      } else {
        return /* Error */Block.variant("Error", 1, [/* IsNotAgda */Block.variant("IsNotAgda", 4, [message])]);
      }
    } else {
      return /* Error */Block.variant("Error", 1, [/* IsNotAgda */Block.variant("IsNotAgda", 4, [message])]);
    }
  };
  return Async$AgdaMode.make((function (resolve, reject) {
                if (Rebase.$$String[/* isEmpty */5](path)) {
                  Curry._1(reject, /* PathMalformed */Block.variant("PathMalformed", 0, ["the path must not be empty"]));
                }
                var hangTimeout = setTimeout((function (param) {
                        return Curry._1(reject, /* ProcessHanging */0);
                      }), 1000);
                Child_process.exec(path, (function (error, stdout, stderr) {
                        clearTimeout(hangTimeout);
                        var match = parseError(error);
                        if (match !== undefined) {
                          Curry._1(reject, match);
                        }
                        var stderr$prime = stderr.toString();
                        if (!Rebase.$$String[/* isEmpty */5](stderr$prime)) {
                          Curry._1(reject, /* ProcessError */Block.variant("ProcessError", 3, [stderr$prime]));
                        }
                        var match$1 = parseStdout(stdout);
                        if (match$1.tag) {
                          return Curry._1(reject, match$1[0]);
                        } else {
                          return Curry._1(resolve, match$1[0]);
                        }
                      }));
                return /* () */0;
              }));
}

function useJSON(metadata) {
  if (atom.config.get("agda-mode.enableJSONProtocol")) {
    return metadata[/* protocol */3] === /* EmacsAndJSON */1;
  } else {
    return false;
  }
}

function connect(metadata) {
  return Async$AgdaMode.make((function (resolve, reject) {
                var match = useJSON(metadata);
                var args = Rebase.$$Array[/* concat */11](metadata[/* args */1], match ? /* array */["--interaction-json"] : /* array */["--interaction"]);
                var $$process = Child_process.spawn(metadata[/* path */0], args, {
                      shell: true
                    });
                var connection = /* record */Block.record([
                    "metadata",
                    "process",
                    "queue",
                    "errorEmitter",
                    "connected"
                  ], [
                    metadata,
                    $$process,
                    [],
                    Event$AgdaMode.make(/* () */0),
                    true
                  ]);
                $$process.on("error", (function (exn) {
                          disconnect(/* ShellError */Block.variant("ShellError", 0, [exn]), connection);
                          return Curry._1(reject, /* ShellError */Block.variant("ShellError", 0, [exn]));
                        })).on("close", (function (code, signal) {
                        disconnect(/* ClosedByProcess */Block.variant("ClosedByProcess", 1, [
                                code,
                                signal
                              ]), connection);
                        return Curry._1(reject, /* ClosedByProcess */Block.variant("ClosedByProcess", 1, [
                                      code,
                                      signal
                                    ]));
                      }));
                $$process.stdout.once("data", (function (param) {
                        return Curry._1(resolve, connection);
                      }));
                return /* () */0;
              }));
}

function wire(self) {
  var response = function (res) {
    var match = Rebase.$$Array[/* get */17](self[/* queue */2], 0);
    if (match !== undefined) {
      Event$AgdaMode.emitOk(res, match);
      if (typeof res === "number") {
        return Rebase.$$Option[/* forEach */8](Event$AgdaMode.destroy, Caml_option.undefined_to_opt(self[/* queue */2].pop()));
      } else {
        return /* () */0;
      }
    } else if (typeof res === "number" || !res.tag) {
      return /* () */0;
    } else {
      return Event$AgdaMode.emitOk(res[0], self[/* errorEmitter */3]);
    }
  };
  var continuation = /* record */Block.record(["contents"], [undefined]);
  var onData = function (chunk) {
    var string = chunk.toString();
    var endOfResponse = Rebase.$$String[/* endsWith */4]("Agda2> ", string);
    var trimmed;
    if (endOfResponse) {
      trimmed = string.substring(0, Rebase.$$String[/* length */1](string) - 7 | 0);
    } else {
      var length = Rebase.$$String[/* length */1](string) - 1 | 0;
      trimmed = Rebase.$$String[/* sub */9](0, length, string);
    }
    Rebase.$$Array[/* forEach */8]((function (line) {
            var $$continue = Rebase.$$Option[/* getOr */16](Parser$AgdaMode.SExpression[/* incrParse */4], continuation[0]);
            var match = Curry._1($$continue, line);
            switch (match.tag | 0) {
              case 0 : 
                  return response(/* Error */Block.variant("Error", 0, [/* SExpression */Block.variant("SExpression", 0, [match[0]])]));
              case 1 : 
                  continuation[0] = match[0];
                  return /* () */0;
              case 2 : 
                  var match$1 = Response$AgdaMode.parse(match[0]);
                  if (match$1.tag) {
                    response(/* Error */Block.variant("Error", 0, [match$1[0]]));
                  } else {
                    response(/* Data */Block.variant("Data", 1, [match$1[0]]));
                  }
                  continuation[0] = undefined;
                  return /* () */0;
              
            }
          }), Parser$AgdaMode.splitAndTrim(trimmed));
    if (endOfResponse) {
      return response(/* End */0);
    } else {
      return 0;
    }
  };
  self[/* process */1].stdout.on("data", onData);
  return self;
}

function send(request, self) {
  var reqEvent = Event$AgdaMode.make(/* () */0);
  self[/* queue */2].push(reqEvent);
  self[/* process */1].stdin.write(Buffer.from(request + "\n"));
  return reqEvent;
}

exports.$$Error = $$Error;
exports.disconnect = disconnect;
exports.autoSearch = autoSearch;
exports.validateAndMake = validateAndMake;
exports.useJSON = useJSON;
exports.connect = connect;
exports.wire = wire;
exports.send = send;
/* os Not a pure module */
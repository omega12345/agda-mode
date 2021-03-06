// Generated by BUCKLESCRIPT VERSION 5.0.6, PLEASE EDIT WITH CARE
'use strict';

var Curry = require("bs-platform/lib/js/curry.js");
var React = require("react");
var Rebase = require("@glennsl/rebase/lib/js/src/Rebase.bs.js");
var Hook$AgdaMode = require("../Hook.bs.js");
var Util$AgdaMode = require("../../Util.bs.js");
var Parser$AgdaMode = require("../../Parser.bs.js");
var Command$AgdaMode = require("../../Command.bs.js");
var Metadata$AgdaMode = require("../../Metadata.bs.js");
var Response$AgdaMode = require("../../Response.bs.js");
var Caml_chrome_debugger = require("bs-platform/lib/js/caml_chrome_debugger.js");

function Settings__Log$Entry(Props) {
  var entry = Props.entry;
  var match = Hook$AgdaMode.useState(true);
  var setHidden = match[1];
  var hidden = match[0];
  var className = hidden ? "hidden" : "";
  var rawTexts = Util$AgdaMode.React[/* manyIn */0]("ol")(Rebase.$$Array[/* map */0]((function (text) {
              return React.createElement("li", undefined, text);
            }), entry[/* response */1][/* rawText */0]));
  var sexpressions = Util$AgdaMode.React[/* manyIn */0]("ol")(Rebase.$$Array[/* map */0]((function (text) {
              return React.createElement("li", undefined, Curry._1(Parser$AgdaMode.SExpression[/* toString */0], text));
            }), entry[/* response */1][/* sexpression */1]));
  var responses = Util$AgdaMode.React[/* manyIn */0]("ol")(Rebase.$$Array[/* map */0]((function (text) {
              return React.createElement("li", undefined, Response$AgdaMode.toString(text));
            }), entry[/* response */1][/* response */2]));
  var hasError = Rebase.$$Array[/* length */16](entry[/* response */1][/* error */3]) > 0;
  var errors = Util$AgdaMode.React[/* manyIn */0]("ol")(Rebase.$$Array[/* map */0]((function (text) {
              return React.createElement("li", undefined, Parser$AgdaMode.$$Error[/* toString */0](text));
            }), entry[/* response */1][/* error */3]));
  return React.createElement("li", {
              className: "agda-settings-log-entry"
            }, React.createElement("h2", {
                  onClick: (function (param) {
                      return Curry._1(setHidden, !hidden);
                    })
                }, Command$AgdaMode.Remote[/* toString */2](entry[/* request */0])), React.createElement("section", {
                  className: className
                }, React.createElement("h3", undefined, "raw text"), rawTexts, React.createElement("hr", undefined), React.createElement("h3", undefined, "s-expression"), sexpressions, React.createElement("hr", undefined), React.createElement("h3", undefined, "response"), responses, hasError ? React.createElement(React.Fragment, undefined, React.createElement("hr", undefined), React.createElement("h3", undefined, "error"), errors) : null));
}

var Entry = /* module */Caml_chrome_debugger.localModule(["make"], [Settings__Log$Entry]);

function Settings__Log(Props) {
  var connection = Props.connection;
  var hidden = Props.hidden;
  var match = Hook$AgdaMode.useState(false);
  var setShowInstruction = match[1];
  var match$1 = Hook$AgdaMode.useState(true);
  var setRefreshOnLoad = match$1[1];
  var refreshOnLoad = match$1[0];
  Rebase.$$Option[/* forEach */8]((function (conn) {
          conn[/* resetLogOnLoad */5] = refreshOnLoad;
          return /* () */0;
        }), connection);
  var className = Curry._1(Util$AgdaMode.ClassName[/* serialize */2], Util$AgdaMode.ClassName[/* addWhen */1]("hidden", hidden, /* :: */Caml_chrome_debugger.simpleVariant("::", [
              "agda-settings-log",
              /* [] */0
            ])));
  var entries = Util$AgdaMode.React[/* manyIn */0]("ol")(Rebase.$$Array[/* map */0]((function (entry) {
              return React.createElement(Settings__Log$Entry, {
                          entry: entry
                        });
            }), Rebase.$$Option[/* mapOr */18]((function (conn) {
                  return conn[/* metadata */0][/* entries */4];
                }), /* array */[], connection)));
  return React.createElement("section", {
              className: className
            }, React.createElement("h1", undefined, React.createElement("span", {
                      className: "icon icon-comment-discussion"
                    }), React.createElement("span", undefined, "Log")), React.createElement("hr", undefined), React.createElement("p", undefined, "Keeps track of what Agda said what we've parsed. For reporting parse errors. "), React.createElement("p", undefined, React.createElement("label", {
                      className: "input-label"
                    }, React.createElement("input", {
                          className: "input-toggle",
                          checked: refreshOnLoad,
                          type: "checkbox",
                          onChange: (function (param) {
                              return Curry._1(setRefreshOnLoad, !refreshOnLoad);
                            })
                        }), "Refresh on Load (C-c C-l)")), React.createElement("p", undefined, React.createElement("button", {
                      className: "btn btn-primary icon icon-clippy",
                      onClick: (function (param) {
                          Curry._1(setShowInstruction, true);
                          return Rebase.$$Option[/* forEach */8]((function (conn) {
                                        return Metadata$AgdaMode.dump(conn[/* metadata */0]);
                                      }), connection);
                        })
                    }, "Dump log")), match[0] ? React.createElement("p", {
                    className: "text-warning"
                  }, "In case of parse error, please copy the log and paste it ", React.createElement("a", {
                        href: "https://github.com/banacorn/agda-mode/issues/new"
                      }, "here")) : null, React.createElement("hr", undefined), entries);
}

var make = Settings__Log;

exports.Entry = Entry;
exports.make = make;
/* react Not a pure module */

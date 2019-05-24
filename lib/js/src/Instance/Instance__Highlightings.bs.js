// Generated by BUCKLESCRIPT VERSION 5.0.4, PLEASE EDIT WITH CARE
'use strict';

var Fs = require("fs");
var Atom = require("atom");
var Util = require("util");
var Rebase = require("@glennsl/rebase/lib/js/src/Rebase.bs.js");
var Async$AgdaMode = require("../Util/Async.bs.js");
var Parser$AgdaMode = require("../Parser.bs.js");
var Highlighting$AgdaMode = require("../Highlighting.bs.js");

function add(annotation, instance) {
  var textEditor = instance[/* editors */1][/* source */1];
  var textBuffer = textEditor.getBuffer();
  var startPoint = textBuffer.positionForCharacterIndex(annotation[/* start */0] - 1 | 0);
  var endPoint = textBuffer.positionForCharacterIndex(annotation[/* end_ */1] - 1 | 0);
  var range = new Atom.Range(startPoint, endPoint);
  var marker = textEditor.markBufferRange(range);
  instance[/* highlightings */4].push(marker);
  var types = annotation[/* types */2].join(" ");
  textEditor.decorateMarker(marker, {
        type: "highlight",
        class: "highlight-decoration " + types
      });
  return /* () */0;
}

function addFromFile(filepath, instance) {
  var readFile = Util.promisify((function (prim, prim$1) {
          Fs.readFile(prim, prim$1);
          return /* () */0;
        }));
  return Async$AgdaMode.mapError((function (err) {
                  console.log(err);
                  console.log("cannot read the indirect highlighting file: " + filepath);
                  return /* () */0;
                }))(Async$AgdaMode.thenOk((function (content) {
                      var partial_arg = Rebase.$$Array[/* flatMap */5];
                      var partial_arg$1 = Rebase.$$Array[/* map */0];
                      Rebase.Result[/* forEach */9]((function (annotations) {
                              return Rebase.$$Array[/* forEach */8]((function (annotation) {
                                            return add(annotation, instance);
                                          }), Rebase.$$Array[/* filter */10](Highlighting$AgdaMode.Annotation[/* shouldHighlight */3], annotations));
                            }), Rebase.Result[/* map */0]((function (param) {
                                  return partial_arg((function (x) {
                                                return x;
                                              }), param);
                                }), Rebase.Result[/* map */0]((function (param) {
                                      return partial_arg$1((function (tokens) {
                                                    if (tokens.tag) {
                                                      return Highlighting$AgdaMode.Annotation[/* parseIndirectHighlightings */2](tokens[0]);
                                                    } else {
                                                      return /* array */[];
                                                    }
                                                  }), param);
                                    }), Parser$AgdaMode.SExpression[/* parse */5](content.toString()))));
                      return Async$AgdaMode.resolve(/* () */0);
                    }))(Async$AgdaMode.fromPromise(readFile(filepath))));
}

function destroyAll(instance) {
  Rebase.$$Array[/* forEach */8]((function (prim) {
          prim.destroy();
          return /* () */0;
        }), instance[/* highlightings */4]);
  instance[/* highlightings */4] = /* array */[];
  return /* () */0;
}

exports.add = add;
exports.addFromFile = addFromFile;
exports.destroyAll = destroyAll;
/* fs Not a pure module */
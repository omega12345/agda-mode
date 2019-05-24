// Generated by BUCKLESCRIPT VERSION 5.0.4, PLEASE EDIT WITH CARE
'use strict';

var Atom = require("atom");
var Curry = require("bs-platform/lib/js/curry.js");
var Rebase = require("@glennsl/rebase/lib/js/src/Rebase.bs.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var Goal$AgdaMode = require("../Goal.bs.js");
var Async$AgdaMode = require("../Util/Async.bs.js");

function pointingAt(cursor, instance) {
  var cursor_ = cursor !== undefined ? Caml_option.valFromOption(cursor) : instance[/* editors */1][/* source */1].getCursorBufferPosition();
  var pointedGoals = Rebase.$$Array[/* filter */10]((function (goal) {
          return goal[/* range */2].containsPoint(cursor_);
        }), instance[/* goals */5]);
  return Rebase.$$Array[/* get */17](pointedGoals, 0);
}

function getPointedGoal(instance) {
  var pointed = pointingAt(undefined, instance);
  if (pointed !== undefined) {
    return Async$AgdaMode.resolve(pointed);
  } else {
    return Async$AgdaMode.reject(/* OutOfGoal */2);
  }
}

function getPointedGoalAt(cursor, instance) {
  var pointed = pointingAt(Caml_option.some(cursor), instance);
  if (pointed !== undefined) {
    return Async$AgdaMode.resolve(pointed);
  } else {
    return Async$AgdaMode.reject(/* OutOfGoal */2);
  }
}

function handleOutOfGoal(callback) {
  return Async$AgdaMode.thenError((function (error) {
                if (typeof error === "number" && error >= 2) {
                  return Curry._1(callback, /* () */0);
                } else {
                  return Async$AgdaMode.reject(error);
                }
              }));
}

function getGoalIndex(goal) {
  var match = goal[/* index */1];
  if (match !== undefined) {
    return Async$AgdaMode.resolve(/* tuple */[
                goal,
                match
              ]);
  } else {
    return Async$AgdaMode.reject(/* GoalNotIndexed */1);
  }
}

function recoverCursor(callback, instance) {
  var cursor = instance[/* editors */1][/* source */1].getCursorBufferPosition();
  var result = Curry._1(callback, /* () */0);
  handleOutOfGoal((function (param) {
            instance[/* editors */1][/* source */1].setCursorBufferPosition(cursor);
            return Async$AgdaMode.resolve(/* () */0);
          }))(Async$AgdaMode.thenOk((function (goal) {
                var fresh = Goal$AgdaMode.isEmpty(goal);
                if (fresh) {
                  var delta = new Atom.Point(0, 3);
                  var newPosition = goal[/* range */2].start.translate(delta);
                  setTimeout((function (param) {
                          instance[/* editors */1][/* source */1].setCursorBufferPosition(newPosition);
                          return /* () */0;
                        }), 0);
                  return Async$AgdaMode.resolve(/* () */0);
                } else {
                  instance[/* editors */1][/* source */1].setCursorBufferPosition(cursor);
                  return Async$AgdaMode.resolve(/* () */0);
                }
              }))(getPointedGoalAt(cursor, instance)));
  return result;
}

function startCheckpoint(command, instance) {
  var checkpoint = instance[/* editors */1][/* source */1].createCheckpoint();
  instance[/* history */3][/* checkpoints */0].push(checkpoint);
  if (Rebase.$$Array[/* length */16](instance[/* history */3][/* checkpoints */0]) === 1) {
    instance[/* history */3][/* needsReloading */1] = typeof command === "number" ? (
        command >= 13 ? command < 17 : command === 6
      ) : false;
    return /* () */0;
  } else {
    return 0;
  }
}

function endCheckpoint(instance) {
  var checkpoint = instance[/* history */3][/* checkpoints */0].pop();
  if (Rebase.$$Array[/* length */16](instance[/* history */3][/* checkpoints */0]) === 0) {
    Rebase.$$Option[/* forEach */8]((function (n) {
            instance[/* editors */1][/* source */1].groupChangesSinceCheckpoint(n);
            return /* () */0;
          }), checkpoint === undefined ? undefined : Caml_option.some(checkpoint));
  }
  return /* () */0;
}

exports.pointingAt = pointingAt;
exports.getPointedGoal = getPointedGoal;
exports.getPointedGoalAt = getPointedGoalAt;
exports.handleOutOfGoal = handleOutOfGoal;
exports.getGoalIndex = getGoalIndex;
exports.recoverCursor = recoverCursor;
exports.startCheckpoint = startCheckpoint;
exports.endCheckpoint = endCheckpoint;
/* atom Not a pure module */
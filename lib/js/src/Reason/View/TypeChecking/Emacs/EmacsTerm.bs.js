// Generated by BUCKLESCRIPT VERSION 4.0.5, PLEASE EDIT WITH CARE
'use strict';

var Block = require("bs-platform/lib/js/block.js");
var React = require("react");
var ReasonReact = require("reason-react/lib/js/src/ReasonReact.js");
var Link$AgdaMode = require("../../Link.bs.js");

var component = ReasonReact.statelessComponent("EmacsTerm");

function make(term, _) {
  return /* record */Block.record([
            "debugName",
            "reactClassInternal",
            "handedOffState",
            "willReceiveProps",
            "didMount",
            "didUpdate",
            "willUnmount",
            "willUpdate",
            "shouldUpdate",
            "render",
            "initialState",
            "retainedProps",
            "reducer",
            "jsElementWrapped"
          ], [
            component[/* debugName */0],
            component[/* reactClassInternal */1],
            component[/* handedOffState */2],
            component[/* willReceiveProps */3],
            component[/* didMount */4],
            component[/* didUpdate */5],
            component[/* willUnmount */6],
            component[/* willUpdate */7],
            component[/* shouldUpdate */8],
            (function () {
                switch (term.tag | 0) {
                  case 0 : 
                      return React.createElement("span", {
                                  className: "expr"
                                }, term[0]);
                  case 1 : 
                      return ReasonReact.element(undefined, undefined, Link$AgdaMode.make(/* NoRange */0, true, true, /* :: */Block.simpleVariant("::", [
                                        "expr",
                                        /* :: */Block.simpleVariant("::", [
                                            "question-mark",
                                            /* [] */0
                                          ])
                                      ]), /* array */[term[0]]));
                  case 2 : 
                      return React.createElement("span", {
                                  className: "expr underscore"
                                }, term[0]);
                  
                }
              }),
            component[/* initialState */10],
            component[/* retainedProps */11],
            component[/* reducer */12],
            component[/* jsElementWrapped */13]
          ]);
}

var jump = true;

var hover = true;

exports.component = component;
exports.jump = jump;
exports.hover = hover;
exports.make = make;
/* component Not a pure module */
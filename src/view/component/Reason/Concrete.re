open ReasonReact;

open Type;

open Syntax.Concrete;

open C;

open Util;

let jump = true;

let hover = true;

module Expr = {
  open CommonPrim;
  let rec appView: expr => (expr, list(Syntax.CommonPrim.namedArg(expr))) =
    expr => {
      let vApp = ((e, es), arg) => (e, List.append(es, [arg]));
      let arg = expr =>
        switch (expr) {
        | HiddenArg(_, e) =>
          e
          |> CommonPrim.Arg.default
          |> CommonPrim.Arg.setArgInfoHiding(Syntax.CommonPrim.Hidden)
        | InstanceArg(_, e) =>
          e
          |> CommonPrim.Arg.default
          |> CommonPrim.Arg.setArgInfoHiding(
               Syntax.CommonPrim.Instance(Syntax.CommonPrim.NoOverlap),
             )
        | e => e |> CommonPrim.Named.unnamed |> CommonPrim.Arg.default
        };
      switch (expr) {
      | App(_, e1, e2) => vApp(appView(e1), e2)
      | RawApp(_, [e, ...es]) => (e, List.map(arg, es))
      | _ => (expr, [])
      };
    };
  let levelToString = [%raw
    "n => n.toString().split('').map(x => String.fromCharCode(0x2080 + parseInt(x))).join(\n      '')"
  ];
  let component = statelessComponent("Expr");
  let rec make = (~value, ~prec=0, _children) => {
    ...component,
    render: _self =>
      switch (value) {
      | Ident(value) => <QName value />
      | Lit(value) => <Literal value />
      | QuestionMark(range, None) =>
        <Link jump hover range> (string("?")) </Link>
      | QuestionMark(range, Some(n)) =>
        <Link jump hover range> (string("?" ++ string_of_int(n))) </Link>
      | Underscore(range, None) =>
        <Link jump hover range> (string("_")) </Link>
      | Underscore(range, Some(s)) =>
        <Link jump hover range> (string(s)) </Link>
      | App(_, _, _) =>
        let (e1, args) = appView(value);
        let items: list(reactElement) = [
          element(make(~value=e1, [||])),
          ...List.map(
               value =>
                 <Arg value>
                   ...(
                        (prec, value) =>
                          <Named prec value>
                            ...(
                                 (prec, value) =>
                                   element(make(~value, ~prec, [||]))
                               )
                          </Named>
                      )
                 </Arg>,
               args,
             ),
        ];
        sepBy(string(" "), items);
      | RawApp(_, exprs) =>
        exprs
        |> List.map(value => element(make(~value, [||])))
        |> sepBy(string(" "))
      | OpApp(_, qname, _, exprs) => <span> (string("unimplemented")) </span>
      | Set(range) => <Link jump hover range> (string("Set")) </Link>
      | Prop(range) => <Link jump hover range> (string("Prop")) </Link>
      | SetN(range, n) =>
        <Link jump hover range> (string("Set" ++ levelToString(n))) </Link>
      | PropN(range, n) =>
        <Link jump hover range> (string("Prop" ++ levelToString(n))) </Link>
      | _ => <span> (string("unimplemented")) </span>
      },
  };
};
open ReasonReact;

open Type;

open Syntax.Concrete;

open Syntax.C;

module NamePart = {
  let pretty: pretty(namePart) =
    part =>
      switch (part) {
      | Hole => "_"
      | Id(s) => s
      };
};

module Name = {
  let pretty: pretty(name) =
    name =>
      switch (name) {
      | Name(_, xs) => String.concat("", List.map(NamePart.pretty, xs))
      | NoName(_, _) => "_"
      };
  let isUnderscore: underscore(name) =
    name =>
      switch (name) {
      | NoName(_, _) => true
      | Name(_, [Id(x)]) => x === "_"
      | _ => false
      };
  let component = statelessComponent("Name");
  let make = (~value, children) => {
    ...component,
    render: _self => <span> (string(pretty(value))) </span>,
  };
};

let sepBy = (sep: reactElement, item: list(reactElement)) =>
  switch (item) {
  | [] => <> </>
  | [x] => x
  | [x, ...xs] =>
    <> x (array(Array.of_list(List.map(i => <> sep i </>, xs)))) </>
  };

module QName = {
  let component = statelessComponent("QName");
  let make = (~value, children) => {
    ...component,
    render: _self =>
      switch (value) {
      | QName([], x) => <Name value=x />
      | QName(xs, x) =>
        List.append(xs, [x])
        |> List.filter(x => ! Name.isUnderscore(x))
        |> List.map(n => <Name value=n />)
        |> sepBy(string("."))
      },
  };
};

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
  let component = statelessComponent("Expr");
  let rec make = (~value, ~prec=0, _children) => {
    ...component,
    render: _self =>
      switch (value) {
      | Ident(qname) => <QName value=qname />
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
      | _ => <span> (string("unimplemented")) </span>
      },
  };
};

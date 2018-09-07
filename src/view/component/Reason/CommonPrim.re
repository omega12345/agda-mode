open ReasonReact;

open Type;

open Syntax.CommonPrim;

let id = children => array(children);

/* let braces = children => <span>  ...children  </span>; */
let braces = children =>
  <span>
    ...(Array.concat([[|string("{")|], children, [|string("}")|]]))
  </span>;

let dbraces = children =>
  <span>
    ...(Array.concat([[|string("{{")|], children, [|string("}}")|]]))
  </span>;

let parens = children =>
  <span>
    ...(Array.concat([[|string("(")|], children, [|string(")")|]]))
  </span>;

let parensIf = (p, children) => p ? parens(children) : array(children);

module Hiding = {
  let component = statelessComponent("Hiding");
  let make =
      (~value=NotHidden, ~prec=0, ~parens, children: array(reactElement)) => {
    ...component,
    render: _self =>
      switch (value) {
      | Hidden => <> (braces(children)) </>
      | Instance(_) => <> (dbraces(children)) </>
      | NotHidden => <> (parens(children)) </>
      },
  };
};

module Named = {
  let map = (f, named) => {...named, value: f(named.value)};
  let unnamed = value => Named(None, value);
  let named = (name, value) => Named(Some(name), value);
  let component = statelessComponent("Named");
  let make = (~prec=0, ~value, children: (int, 'a) => reactElement) => {
    ...component,
    render: _self => {
      let Named(name, value) = value;
      switch (name) {
      | None => children(prec, value)
      | Some(Ranged(_, s)) =>
        parensIf(prec > 0, [|string(s ++ "="), children(0, value)|])
      };
    },
  };
};

module ArgInfo = {
  let default: argInfo = {
    hiding: NotHidden,
    modality: {
      relevance: Relevant,
      quantity: QuantityOmega,
    },
    origin: UserWritten,
    freeVariables: UnknownFVs,
  };
  let isVisible: argInfo => bool = argInfo => argInfo.hiding === NotHidden;
  let isHidden: argInfo => bool = argInfo => argInfo.hiding === Hidden;
};

module Arg = {
  let default: 'a => arg('a) = value => Arg(ArgInfo.default, value);
  let map = (f, arged) => {...arged, value: f(arged.value)};
  let setArgInfoHiding = (hiding: hiding, Arg(argInfo, value): arg('a)) =>
    Arg({...argInfo, hiding}, value);
  let component = statelessComponent("Arg");
  let make = (~prec=0, ~value, children) => {
    ...component,
    render: _self => {
      let Arg(argInfo, value) = value;
      let p = ArgInfo.isVisible(argInfo) ? prec : 0;
      let localParens = argInfo.origin == Substitution ? parens : id;
      <Hiding value=argInfo.hiding parens=localParens>
        (children(p, value))
      </Hiding>;
    },
  };
};

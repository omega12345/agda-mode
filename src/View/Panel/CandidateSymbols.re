[@bs.config {jsx: 3}];

open ReasonReact;

open Rebase;

open Webapi;

type action =
  | Up
  | Down
  | Right
  | Left;

let reducer = (totalSize, index, action) =>
  switch (action) {
  | Up => max(0, index - 10)
  | Right => min(totalSize - 1, index + 1)
  | Down => min(totalSize - 1, index + 10)
  | Left => max(0, index - 1)
  };

[@react.component]
let make =
    (
      ~isActive: bool,
      ~candidateSymbols: array(string),
      ~updateTranslation: option(string) => unit,
      ~chooseSymbol: string => unit,
    ) => {
  let (index, move) =
    React.useReducer(reducer(Array.length(candidateSymbols)), 0);

  let (listenerHandles, setListenerHandles) = React.useState(() => None);

  let startListening = () => {
    /* subscribe to Atom's core events */
    let disposables = Atom.CompositeDisposable.make();
    Atom.Environment.Commands.add(
      `CSSSelector("atom-text-editor.agda-mode-input-method-activated"),
      "core:move-up",
      event => {
        move(Up);
        event |> Dom.Event.stopImmediatePropagation;
      },
    )
    |> Atom.CompositeDisposable.add(disposables);
    Atom.Environment.Commands.add(
      `CSSSelector("atom-text-editor.agda-mode-input-method-activated"),
      "core:move-right",
      event => {
        move(Right);
        event |> Dom.Event.stopImmediatePropagation;
      },
    )
    |> Atom.CompositeDisposable.add(disposables);
    Atom.Environment.Commands.add(
      `CSSSelector("atom-text-editor.agda-mode-input-method-activated"),
      "core:move-down",
      event => {
        move(Down);
        event |> Dom.Event.stopImmediatePropagation;
      },
    )
    |> Atom.CompositeDisposable.add(disposables);
    Atom.Environment.Commands.add(
      `CSSSelector("atom-text-editor.agda-mode-input-method-activated"),
      "core:move-left",
      event => {
        move(Left);
        event |> Dom.Event.stopImmediatePropagation;
      },
    )
    |> Atom.CompositeDisposable.add(disposables);
    // return the handle
    disposables;
  };

  let stopListening = Atom.CompositeDisposable.dispose;

  React.useEffect1(
    () => {
      if (isActive) {
        let handles = startListening();
        setListenerHandles(_ => Some(handles));
      } else {
        listenerHandles
        |> Option.forEach(handles => {
             stopListening(handles);
             setListenerHandles(_ => None);
           });
      };
      None;
    },
    [|isActive|],
  );

  React.useEffect1(
    () => {
      updateTranslation(candidateSymbols[index]);
      None;
    },
    [|index|],
  );

  let rowStart = index / 10 * 10;
  let row =
    candidateSymbols |> Array.slice(~from=rowStart, ~to_=rowStart + 10);
  switch (candidateSymbols[index]) {
  | None => null
  | Some(_) =>
    row
    |> Array.mapi((key, i) => {
         let isSelected = rowStart + i === index;
         let className =
           Util.ClassName.(
             ["btn"] |> addWhen("selected", isSelected) |> serialize
           );
         <button className onClick={_ => chooseSymbol(key)} key>
           {string(key)}
         </button>;
       })
    |> ReactDOMRe.createDOMElementVariadic(
         "div",
         ~props=
           ReactDOMRe.domProps(
             ~className="candidates btn-group btn-group-sm",
             (),
           ),
       )
  };
};

module Jsx2 = {
  let component = ReasonReact.statelessComponent("CandidateSymbols");
  let make =
      (
        ~isActive: bool,
        ~candidateSymbols: array(string),
        ~updateTranslation: option(string) => unit,
        ~chooseSymbol: string => unit,
        children,
      ) =>
    ReasonReactCompat.wrapReactForReasonReact(
      make,
      makeProps(
        ~isActive,
        ~candidateSymbols,
        ~updateTranslation,
        ~chooseSymbol,
        (),
      ),
      children,
    );
};

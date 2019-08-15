open Rebase;
open Atom;

[@bs.get] external not: BsChai.Expect.chai => BsChai.Expect.chai = "not";

let base = Node.Path.join2([%raw "__dirname"], "../../../");
let file = path => Node.Path.join2(base, path);
let asset = path =>
  Node.Path.join2(Node.Path.join2(base, "test/asset"), path);

let openFile = (uri: string): Js.Promise.t(TextEditor.t) =>
  Environment.Workspace.openWithOnlyURI(uri);

let closeFile = (uri: string): Js.Promise.t(bool) => {
  let pane = Environment.Workspace.paneForURI(uri);
  switch (pane) {
  | None => Js.Promise.resolve(false)
  | Some(p) =>
    let item = Pane.itemForURI(uri, p);
    switch (item) {
    | None => Js.Promise.resolve(false)
    | Some(i) => Pane.destroyItem_(i, true, p)
    };
  };
};

let getActivePackageNames = () =>
  Packages.getActivePackages() |> Array.map(o => o |> Package.name);

let getLoadedPackageNames = () =>
  Packages.getLoadedPackages()
  |> Array.map((o: Package.t) => o |> Package.name);

exception DispatchFailure(string);
let dispatch = (editor: TextEditor.t, event) => {
  let element = Views.getView(editor);
  let result = Commands.dispatch(element, event);
  switch (result) {
  | None => Js.Promise.reject(DispatchFailure(event))
  | Some(_) => Js.Promise.resolve()
  };
};
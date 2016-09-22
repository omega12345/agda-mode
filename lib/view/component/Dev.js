"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var react_redux_1 = require('react-redux');
var DevPanel_1 = require('./DevPanel');
var mapStateToProps = function (state) {
    return {
        messages: state.dev.messages
    };
};
var Dev = (function (_super) {
    __extends(Dev, _super);
    function Dev() {
        _super.apply(this, arguments);
    }
    Dev.prototype.render = function () {
        var messages = this.props.messages;
        return (React.createElement("section", null, 
            React.createElement(DevPanel_1.default, null), 
            React.createElement("ol", {className: "agda-dev-view"}, messages.map(function (msg, i) {
                return React.createElement("li", {key: i, className: msg.kind}, msg.message);
            }))));
    };
    return Dev;
}(React.Component));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = react_redux_1.connect(mapStateToProps, null)(Dev);
//# sourceMappingURL=Dev.js.map
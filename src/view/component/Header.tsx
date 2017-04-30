import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import * as classNames from 'classnames';

import { View } from '../../type';
import Dashboard from './Dashboard';
import Core from '../../core';

function toStyle(type: View.Style): string {
    switch (type) {
        case View.Style.Error:     return 'error';
        case View.Style.Warning:   return 'warning';
        case View.Style.Info:      return 'info';
        case View.Style.Success:   return 'success';
        case View.Style.PlainText: return 'plain-text';
        default:                  return '';
    }
}

interface Props extends View.HeaderState {
    core: Core;
    inputMethodActivated: boolean;
    mountAtPane: () => void;
    mountAtBottom: () => void;
}

const mapStateToProps = (state: View.State) => {
    return {
        text: state.header.text,
        style: state.header.style,
        inputMethodActivated: state.inputMethod.activated
    }
}

class Header extends React.Component<Props, void> {
    render() {
        const { text, style, core, inputMethodActivated } = this.props;
        const { mountAtPane, mountAtBottom } = this.props;
        const classes = classNames({
            hidden: inputMethodActivated || _.isEmpty(text)
        }, 'agda-header')
        return (
            <header className={classes}>
                <h1 className={`text-${toStyle(style)}`}>{text}</h1>
                <Dashboard
                    core={core}
                    mountAtPane={mountAtPane}
                    mountAtBottom={mountAtBottom}
                />
            </header>
        )
    }
}

export default connect<any, any, any>(
    mapStateToProps,
    null
)(Header);

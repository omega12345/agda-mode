import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import * as classNames from 'classnames';

import { View } from '../../type';
import * as Action from '../actions';
import Core from '../../core';

// Atom shits
type CompositeDisposable = any;
var { CompositeDisposable } = require('atom');
declare var atom: any;

interface Props {
    core: Core;

    mountingPosition: View.MountingPosition;
    settingsView: boolean;
    // callbacks
    mountAtPane: () => void;
    mountAtBottom: () => void;
    // dispatch to the store
    handleMountAtPane: () => void
    handleMountAtBottom: () => void;
    handleToggleSettingsView: () => void;
}

const mapStateToProps = (state: View.State) => ({
    mountingPosition: state.view.mountAt.current,
    settingsView: state.view.settingsView
});

const mapDispatchToProps = (dispatch: any) => ({
    handleMountAtPane: () => {
        dispatch(Action.VIEW.mountAtPane());
    },
    handleMountAtBottom: () => {
        dispatch(Action.VIEW.mountAtBottom());
    },
    handleToggleSettingsView: () => {
        dispatch(Action.VIEW.toggleSettings());
    }
});

class Dashboard extends React.Component<Props, void> {
    private subscriptions: CompositeDisposable;
    private toggleMountingPositionButton: HTMLElement;
    private toggleSettingsViewButton: HTMLElement;

    constructor() {
        super();
        this.subscriptions = new CompositeDisposable;
    }

    componentDidMount() {
        this.subscriptions.add(atom.tooltips.add(this.toggleSettingsViewButton, {
            title: 'settings',
            delay: 100
        }));
        this.subscriptions.add(atom.tooltips.add(this.toggleMountingPositionButton, {
            title: 'toggle panel docking position',
            delay: 300,
            keyBindingCommand: 'agda-mode:toggle-docking'

        }));
    }

    componentWillUnmount() {
        this.subscriptions.dispose();
    }

    render() {
        const { mountingPosition, settingsView } = this.props;
        const { mountAtPane, mountAtBottom, core } = this.props;
        const { handleMountAtPane, handleMountAtBottom, handleToggleSettingsView } = this.props;
        const settingsViewClassList = classNames({
            activated: settingsView,
        }, 'no-btn');
        const toggleMountingPosition = classNames({
            activated: mountingPosition === View.MountingPosition.Pane
        }, 'no-btn');
        return (
            <ul className="agda-dashboard">
                <li>
                    <button
                        className={settingsViewClassList}
                        onClick={() => {
                            handleToggleSettingsView()
                            if (settingsView)
                                core.view.settingsViewPaneItem.close();
                            else
                                core.view.settingsViewPaneItem.open();
                        }}
                        ref={(ref) => {
                            this.toggleSettingsViewButton = ref;
                        }}
                    >
                        <span className="icon icon-settings"></span>
                    </button>
                </li>
                <li>
                    <button
                        className={toggleMountingPosition}
                        onClick={() => {
                            switch (mountingPosition) {
                                case View.MountingPosition.Bottom:
                                    handleMountAtPane();
                                    mountAtPane();
                                    break;
                                case View.MountingPosition.Pane:
                                    handleMountAtBottom();
                                    mountAtBottom();
                                    break;
                                default:
                                    console.error('no mounting position to transist from')
                            }
                        }}
                        ref={(ref) => {
                            this.toggleMountingPositionButton = ref;
                        }}
                    >
                        <span className="icon icon-versions"></span>
                    </button>
                </li>
            </ul>
        )
    }
}

export default connect<any, any, any>(
    mapStateToProps,
    mapDispatchToProps
)(Dashboard);

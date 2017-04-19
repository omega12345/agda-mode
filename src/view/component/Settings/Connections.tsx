import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import * as classNames from 'classnames';
import { View, Connection } from '../../../types';
import ConnectionItem from './ConnectionItem';

type Props = React.HTMLProps<HTMLElement> & View.ConnectionState;

const mapStateToProps = ({ connection } : View.State) => connection

class Connections extends React.Component<Props, void> {
    constructor(props) {
        super(props);
        // this.handleClick = this.handleClick.bind(this);
    }
    render() {
        // <button className='btn btn-error icon icon-trashcan inline-block-tight'>Delete</button>

        const {dispatch, connections, setupView, ...props} = this.props;
        // console.log(connections);
        const currentConnectionClassList = classNames('current-connection', {
            // hidden: setupView
        });
        const setupConnectionClassList = classNames('setup-connection', {
            hidden: !setupView
        });
        // const previousConnections = connections.map((conn, i) =>
        //     <li key={conn.guid}>
        //         <ConnectionItem
        //             connected={false}
        //             version={conn.version.raw}
        //             uri={conn.uri}
        //         />
        //     </li>
        // );

        // <section className={setupConnectionClassList}>
        //     <h2><span className="icon icon-plus">Set up New Connection</span></h2>
        //     <input className='input-text' type='text' placeholder='the location of Agda'/>
        //     <div>
        //         <button className="btn icon icon-trashcan inline-block-tight">cancel</button>
        //         <button className="btn icon btn-primary icon-plug inline-block-tight">connect</button>
        //     </div>
        // </section>
        return (
            <section {...props}>
                <section className={currentConnectionClassList}>
                    <h2><span className="icon icon-plug">Current Connection</span></h2>
                    <ConnectionItem
                        phase="connected"
                        version="Agda-2.5.2"
                        uri="path/to/agda"
                    />
                </section>
                <section className="previous-connections">
                    <h2><span className="icon icon-repo">Previous Connections</span></h2>
                    <p>
                        A list of previously established connections to Agda
                    </p>
                    <ol>
                        <li>
                            <ConnectionItem
                                phase="connecting"
                                version="Agda-2.6-2ade23"
                                uri="path/to/agda"
                            />
                        </li>
                        <li>
                            <ConnectionItem
                                phase="connected"
                                version="Agda-2.6"
                                uri="path/to/agda"
                            />
                        </li>
                        <li>
                            <ConnectionItem
                                phase="disconnected"
                                version="Agda-2.6"
                                uri="path/to/agda"
                            />
                        </li>
                        <li>
                            <ConnectionItem
                                phase="disconnected"
                                version="Agda-2.5.2"
                                uri="path/to/agda"
                            />
                        </li>
                    </ol>
                </section>
            </section>
        )
    }


}

// export default connect<View.ConnectionState, {}, Props>(
export default connect<any, any, any>(
    mapStateToProps
)(Connections);

    // <li>
    //     <ConnectionItem
    //         connected={false}
    //         version="Agda-2.3.2"
    //         uri="path/to/agda"
    //     />
    // </li>
    // <li>
    //     <ConnectionItem
    //         connected={false}
    //         version="Agda-2.3.2"
    //         uri="path/to/agda"
    //     />
    // </li>
    // <li>
    //     <ConnectionItem
    //         connected={false}
    //         version="Agda-2.5"
    //         uri="path/to/agda"
    //     />
    // </li>
    // <li>
    //     <ConnectionItem
    //         connected={false}
    //         version="Agda-2.3.2"
    //         uri="path/to/agda"
    //     />
    // </li>
    // <li>
    //     <ConnectionItem
    //         connected={false}
    //         version="Agda-2.3.2"
    //         uri="path/to/agda"
    //     />
    // </li>
    // <li>
    //     <ConnectionItem
    //         connected={false}
    //         version="Agda-2.3.2"
    //         uri="path/to/agda"
    //     />
    // </li>

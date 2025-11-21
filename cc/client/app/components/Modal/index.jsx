import React from "react";
import { connect } from "react-redux";

import ModalType from "./modals";
import { hideModal } from "./actions";

class Modal extends React.Component {
    get style ( ) {
        const { props }  = this;
        const modalProps = props.props;

        const style   = { };
        style.width   = modalProps.span ? window.innerWidth  - 108 : 'width' in modalProps ? modalProps.width : 500;
        style.height  = modalProps.span ? window.innerHeight - 108 : 'height' in modalProps ? modalProps.height : style.width / window.cc.constants.GOLDEN_RATIO;
        style.left    = (window.innerWidth  - (style.width ? style.width : 0))  / 2;
        style.top     = (window.innerHeight - (style.height ? style.height : 0)) / 2;

        return style;
    }

    render ( ) {
        const { props }  = this;

        const Component  = ModalType[props.type];
        const modalProps = props.props;
        
        return Component ? (
            <div className="overlay">
                <div className="view" style={this.style}>
                    <div>
                        <div className="bar">
                            {modalProps.title && <span>{modalProps.title}</span>}
                            <div className="actions">
                                <input className="no-hover icon base-close" type="button" onClick={() => { props.hideModal() }}/>
                            </div>
                        </div>
                        <div className="content" style={{ padding: "10px" }}>
                            <Component {...modalProps} />
                        </div>
                    </div>
                </div>
            </div>
        ) : null;
    }
}

const mapStateToProps    = state    => ({
     type: state.modal.type,
    props: state.modal.props || { }
});
const mapDispatchToProps = dispatch => ({
    hideModal: () =>
        dispatch(hideModal())
});

export default connect(mapStateToProps, mapDispatchToProps)(Modal)
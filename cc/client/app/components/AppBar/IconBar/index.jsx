import React from "react";
import { connect } from "react-redux";

import { openModal } from "../../Modal/actions";

import DomainSelection from './DomainSelection';

class IconBar extends React.Component {
    render ( ) {
        return [
            <DomainSelection />,
        ]
    }
}

const mapStateToProps    = state    => ({
});
const mapDispatchToProps = dispatch => ({
    openModal: (type, props) =>
        dispatch(openModal(type, props))
});

export default connect(mapStateToProps, mapDispatchToProps)(IconBar);
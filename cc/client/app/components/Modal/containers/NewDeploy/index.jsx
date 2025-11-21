import React from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";

import cc from "../../../../cc";

import newVersionImg from "./new_version.png"

import "./styles.scss";

class NewDeploy extends React.Component {
    render ( ) {
				const { props } = this;

        return (
            <div>
                <div className="newDeployMsg text-center">
                    <img src={newVersionImg} />
                    <p>
                        <FormattedMessage id="DashBoard.Modal.NewDeploy"
                            defaultMessage="
                            We are happy to introduce you newer and better ModelIt! version with the latest cutting edge technologies.
                            <br>
                            In order to get the newer version work for you, please kindly save your work and refresh the page.
                            "
													values={{
														br: <br/>
													}}
												/>
                    </p>
                </div>
            </div>
        )
    }
}

const mapStateToProps    = state    => ({
    domain: state.app.domain
});

export default connect(mapStateToProps)(NewDeploy);
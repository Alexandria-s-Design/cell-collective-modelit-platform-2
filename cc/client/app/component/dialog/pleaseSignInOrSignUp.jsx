import React from "react";
import PropTypes from "prop-types";

import view from "../base/view";

import 'bootstrap';

const styles = {
  divider: {
    width: "8px",
    height: "auto",
    display: "inline-block"
  },
  center: {
    margin: "auto",
    textAlign: "center",
    width: "80%",
    padding: "10px",
    paddingTop: "14px"
  }
};

class PleaseSignInOrSignUp extends React.Component {
  render() {
    const { onSignUp, onSignIn } = this.props;
    return (
      <div className="bootstrap-scope" style={styles.center}>
        <button type="button" className="btn btn-primary" onClick={onSignIn}>Sign in</button>
        <span style={styles.divider} />
        <button type="button" className="btn btn-primary" onClick={onSignUp}>Sign up</button>
      </div>
    );
  }
}

PleaseSignInOrSignUp.PropTypes = {
  onSignUp: PropTypes.func.isRequired,
  onSignIn: PropTypes.func.isRequired
};

const e = view(PleaseSignInOrSignUp, "Sign in or Sign up for instructor access");

e.width = 240;
e.height = 120;

export default e;
import React from 'react';
import { connect } from 'react-redux';

const matchRule = (ruleDef, userRole) => {
  const extractLastCharacter = (s) => s.substring(0, s.length-1);

  if(ruleDef[0] === '/'){
    return userRole.test(new RegExp(extractLastCharacter(ruleDef.substring(0)), 'g'));
  }
    else {
    return userRole.startsWith(ruleDef);
    }
  };

const checkPermissions = (rules, checkRole) => {
    for(const rule of Object.values(rules)){
      //if rule matches, then retur the value according to the rule
      if(matchRule(rule.feature, checkRole)){
        switch(rule.permission){
          case 'a':
          case 'allow':
            return true;
          case 'd':
          case 'deny':
            return false;
          default:
            throw new Error("UNREACHABLE");
        }

      }
    }
    return true;
};



class AccessControl extends React.Component {
  render(){
    const {
        rules,
        children,
        check,
        renderNoAccess = () => null,
      } = this.props;
    
    const permitted = checkPermissions(rules, check);
    
    if (permitted) {
        return children;
    }
    return renderNoAccess();
  }
}

const mapStateToProps = state => ({
  rules: state.auth.user && state.auth.user.rules || []
}); 

export default connect(
  mapStateToProps
)(AccessControl);

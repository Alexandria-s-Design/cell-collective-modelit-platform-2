import React from "react";
import { injectIntl } from "react-intl";

import messages from './messages';
import view from "../../base/view";
class Content extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
      requestTeachBtn: true
    }
    this.disableRequestTeachBtn = this.disableRequestTeachBtn.bind(this);
	}
	UNSAFE_componentWillMount() {
		document.addEventListener("keyup", this.dialogKeyUp = this.dialogKeyUp.bind(this));
	}
	dialogKeyUp(e){
		(e.which || e.keyCode) == 13 && this.props.onSubmit(null, this);
	}
	componentWillUnmount() {
		document.removeEventListener("keyup", this.dialogKeyUp);
  }
  
  disableRequestTeachBtn() { this.setState({ requestTeachBtn: false }); }

  render() {
    const { onClickRequestTeach, user, intl } = this.props;
    const havePending = user && user.teachAuthorityPendingRequest;
    const previouslyDenied = havePending &&  user.teachAuthorityRejectedRequest
    return (
      <div style={{padding: 10, textAlign: 'center'}}>
        { !previouslyDenied && this.state.requestTeachBtn && !havePending &&
          <button onClick={() => {
            onClickRequestTeach().then((res) => {
                this.disableRequestTeachBtn();
              }).catch(err => alert("Network error"));
            }
          }>
            {intl.formatMessage(messages.RequestAccess)}
          </button>}
        { !previouslyDenied && (havePending || !this.state.requestTeachBtn) &&
          intl.formatMessage(messages.AccessRequested)}
        { previouslyDenied && intl.formatMessage(messages.AccessDenied)}
      </div>
    )
  }
}

Content.defaultProps = {
  onClickRequestTeach: () => {},
  user: null,
}

const translatedContent = injectIntl(Content);

const e = view(translatedContent, "Unauthorized access to domain");

e.width = 340;  
e.height = 130;

export default e;

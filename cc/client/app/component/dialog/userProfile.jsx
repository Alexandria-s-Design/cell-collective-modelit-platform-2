import React from 'react';
import { FormattedMessage } from 'react-intl';

import view from '../base/view';
import Application from '../../application';

import InstitutionInput from './inputs/institution';
class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  onSubmit(_) {
    const data = this.props.getDataForm(_);
		data.user = {id: this.props.user.id, token: this.props.user.token}
		data.first_name = data.firstName
		data.last_name = data.lastName
    this.props.action(data, e => (e ? this.setState({ error: e }) : this.props.onClose()));
    _.preventDefault();
  }
  render() {
    const { user } = this.props;
    return (
      <form onSubmit={event => (event.preventDefault(), this.onSubmit(event))}>
        <dt>
          <FormattedMessage id="ModelDashBoard.ModalUserProfile.LabelEmail" defaultMessage="Email" />
        </dt>
        <input name="email" type="email" defaultValue={user.email} />
        <dt>
          <FormattedMessage id="ModelDashBoard.ModalUserProfile.LabelFirstEmail" defaultMessage="First Name" />
        </dt>
        <input name="firstName" type="text" defaultValue={user.firstName} />
        <dt>
          <FormattedMessage id="ModelDashBoard.ModalUserProfile.LabelLastName" defaultMessage="Last Name" />
        </dt>
        <input name="lastName" type="text" defaultValue={user.lastName} />
        <dt>
          <FormattedMessage id="ModelDashBoard.ModalUserProfile.LabelInstitution" defaultMessage="Institution" />
        </dt>
        <InstitutionInput className="block" defaultValue={user.institution} />

        <FormattedMessage id="ModelDashBoard.ModalUserProfile.LabelSave" defaultMessage="Save">
          {x => <input type="submit" value={x} />}
        </FormattedMessage>
        {this.state.error && <div className="error">{this.state.error}</div>}
      </form>
    );
  }
}

const e = view(Content);

if (Application.domain == 'learning') {
  e.width = 420;
  e.height = 500;
} else {
  e.width = 240;
  e.height = 316;
}

export default e;

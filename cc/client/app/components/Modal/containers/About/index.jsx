import React from 'react';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';


const styles = {
  changelog: {
    textAlign: 'right',
    paddingTop: '70px',
  },
};
class About extends React.Component {
  render() {
    const { props } = this;
    const domain = window.cc.config.domains.find(domain => domain.name == props.domain);

    return (
      <div>
        <div className="text-center">
          <img src={`/assets/images/${domain.image}`} width="200" />

          <h4>
            {/* {`Version: v${ClientConfig.version}-${ClientConfig.git.branch} (${ClientConfig.git.tag.substring(0, 7)} #${
              ClientConfig.git.commit
            })`} */}
          </h4>

          <p>
            <FormattedMessage
              id="DashBoard.Modal.About"
              defaultMessage="
                            ModelIt! is freely available for use by the academic and non-profit research community. The use of ModelIt! within pro-profit organizations may require additional licensing agreements. Please contact info@discoverycollective.com for more information.
                            <br>
                            <br>
                            Publications that result from use of ModelIt! should acknowledge http://www.cellcollective.org as the source of those data and cite the following paper: Helikar et. al. 2012. BMC Syst Biol. 6:96. doi: 10.1186/1752-0509-6-96.
                            "
							values={{
								br: <br />
							}}
            />
          </p>
        </div>
        <div style={styles.changelog}>
          <Link to="/changelog" target="_blank">
            Change log
          </Link>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  domain: state.app.domain,
});
const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(About);

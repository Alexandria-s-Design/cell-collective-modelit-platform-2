import React from "react";
import view from '../../../../component/base/view';
import { injectIntl, FormattedMessage } from "react-intl";
import '../styles.scss';

class AboutModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			version: "Loading...",
		};
	}

	async componentDidMount() {
		try {
			const response = await fetch('/web/api/ping');
			if (response.ok) {
				const data = await response.json();
				this.setState({ version: data.version });
			} else {
				this.setState({ version: "Version not available" });
			}
		} catch (error) {
			console.error(error);
			this.setState({ version: "Version not available" });
		}
	}

	render() {
		return (
			<div className="text-center" style={{ margin: '5px'}}>
					<p style={{ marginBottom: '16px' }}>
						<FormattedMessage
							id="DashBoard.Modal.About"
							defaultMessage="
									ModelIt! is freely available for use by the academic and non-profit research community. 
									The use of ModelIt! within pro-profit organizations may require additional licensing agreements. 
									Please contact {supportEmail} for more information. Publications that result from use of ModelIt! should 
									acknowledge {website} as the source of those data and cite the following paper: Helikar et. al. 2012. BMC Syst Biol. 
									6:96. doi: 10.1186/1752-0509-6-96."
							values={{
									supportEmail: (
											<a href="mailto:info@discoverycollective.com" style={{ color: '#007bb5', textDecoration: 'none' }}>
													info@discoverycollective.com
											</a>
									),
									website: (
											<a href="https://cellcollective.org" style={{ color: '#007bb5', textDecoration: 'none' }}>
													https://cellcollective.org
											</a>
									),
							}}
						/>
					</p>
					<p style={{ marginTop: '16px' }}>
						<FormattedMessage
							id="DashBoard.Modal.About.Version"
							defaultMessage="
									The current version of the application: {version}"
							values={{
									version: (
										<strong>{this.state.version}</strong>
									),
							}}
						/>
					</p>
			</div>
		);
	}
}

const translatedContent = injectIntl(AboutModal);

const e = view(translatedContent);
e.width = 500;
e.height = 150;

export default e;

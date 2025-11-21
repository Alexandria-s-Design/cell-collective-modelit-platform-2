import React from 'react';
import { connectNavigation } from "../Routes/navigation";
import { baseApiURL } from '../../request';

class ThirdPartySignIn extends React.Component {
  componentDidMount() {
    const queryParams = new URLSearchParams(window.location.search);
    const auth = queryParams.get('auth');
    const loginType = queryParams.get('type');
    const jwtEmail = queryParams.get('email');
		const jwtToken = queryParams.get('token');
		const redirectHash = queryParams.get('redirect');

		const { navigate: pushHistory } = this.props;

		(async () => {
			// Check if the URL has the parameters for Anonymous User login
			if (auth === 'anonymous-user' && jwtToken) {
				try {
					const response = await fetch(`${baseApiURL}/api/auth/login/?modelit_credentials=1`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ email: jwtEmail, password: jwtToken }),
					});

					const { data } = await response.json();

					if (data?.access_token) {
						try {
							await this.props.cc.userSignIn(data.user_email, data.access_token);

							let redirectTo = `/#${redirectHash}`;
							window.location.href = redirectTo;
						} catch (err) {
							console.error('Failed to sign in: ', err);
						}
					} else {
						console.error('Access token not found in response');
					}
				} catch (error) {
					console.error('Failed to fetch access token:', error);
				}
			}

			// Check if the URL has the parameters for external Google login
			if (auth === 'external' && (loginType === 'google' || loginType === 'facebook' || loginType === 'linkedin') && jwtToken) {
				// Make API request to login with third-party token
				fetch(`${baseApiURL}/api/auth/login`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ signin_temp_token: jwtToken }),
				})
					.then((response) => response.json())
					.then(({ data }) => {
						if (data.access_token) {
							this.props.cc.userSignIn(data.user_email, data.access_token)
								.then(() => {
									// Clear URL parameters after successful sign-in
									pushHistory("/dashboard");
								})
								.catch((err) => {
									console.error('Failed to sign in: ', err);
								});
						} else {
							console.error('Access token not found in response');
						}
					})
					.catch((error) => {
						console.error('Failed to fetch access token:', error);
					});
			}
		})();

  }

  render() {
    return null;
  }
}

export default connectNavigation(ThirdPartySignIn);

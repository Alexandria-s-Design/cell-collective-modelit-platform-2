import React, { useEffect } from 'react';
import InstitutionInput from '../../component/dialog/inputs/institution';
import { FormattedMessage } from 'react-intl';
import request from '../../request';
import "bootstrap";
import "../../../scss/bootstrap.scss";
import { useNavigate, Link } from "react-router-dom";

const AppBar = () => {
	return (
		<nav className="navbar navbar-expand-md navbar-dark bg-dark">
			<div className="container">
				<Link className="navbar-brand" to="/" title="Home">
					<img src="/assets/img/logo/base-title-inverse.png" height="30" alt="Brand ModelIt!"/>
				</Link>
				<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#appbar-landing">
					<span className="navbar-toggler-icon" />
				</button>
			</div>
		</nav>
	)
}

const Footer = () => {
	return (
		<div className="footer">
			<div className="bg-dark">
				<div className="container">
					<div className="card no-background no-border">
						<div className="card-body">
							<div className="text-center">
								<div className="text-muted">
									{(new Date()).getFullYear()} © ModelIt!
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

const InstitutionalOnboarding = () => {
	let state = { error: null };
	let user;
	const navigate = useNavigate();

	useEffect(async () => {

		// get currently logged in user
		const data = await request.get("api/users/me/session").catch(err => {
			state.error = err
		})

		//navigate home when there is no data for user
		user = data.data.data;

	}, []);

	const onSubmit = async (e) => {
		//update user institution in the user object
		e.preventDefault();
		user.institution = e.target[0].value;

		if (user.institution) {
			//store updated user information
			await request.post("api/users/me/updateInstitution", user).then(res => {
				// window.location.href = "/dashboard&sl=success";
				navigate("/dashboard&sl=success");
			});
		} else {
			state.error = "No values provided for institution"
		}
	}


	return (
		<div className="landing">
			<div className="bootstrap-scope">

				<AppBar />
				<div className="container">
					<div className="h6 text-muted" style={{ "marginTop": "10px" }}>
						Add Institution details
					</div>
					<form onSubmit={event => (event.preventDefault(), onSubmit(event))} style={{ "margin": "50px" }}>
						<InstitutionInput style={{
							"padding": "10px",
							"marginTop": "10px",
							"marginBottom": "10px",
							"width": "100%"
						}}></InstitutionInput><br />
						<FormattedMessage id="Dashboard.ModalSignIn.LabelSubmit" defaultMessage="Submit">
							{x => (
								<button style={{
									"padding": "10px",
									"borderColor": "#fff",
									"borderRadius": "5px",
									"marginTop": "10px",
									"marginBottom": "10px",
									"backgroundColor": "#E67E22",
									"color": "#fff",
									"width": "100%"
								}} type="submit">
									{x}
								</button>
							)}
						</FormattedMessage>
						{state.error && (<div className="error">{state.error}</div>)}
					</form>

				</div>
				<div style={{
					"left": "0",
					"bottom": "0",
					"position": "fixed",
					"width": "100%"
				}} >
					<Footer />
				</div>
			</div>
		</div>
	);
}

export default InstitutionalOnboarding;
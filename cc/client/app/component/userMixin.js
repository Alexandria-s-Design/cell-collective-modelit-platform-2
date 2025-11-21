import { Seq } from "immutable";
import Utils from "../utils";
import Application from "../application";
import Message from "./dialog/message";
import Entity from "../entity/Entity";
import Model from "../entity/model";
import ModelVersion from "../entity/ModelVersion";
import cc from "../cc";
import { ccappRequest } from "../request";

import * as CookieManager from "../util/cookies";
import errorResponse from "../util/errorResponse";

function fetchUserAuthorityAccess(userGroups = []) {
	let authorityRequest = null;
	let domainAccess = {};
	for (const authReq of userGroups) {			
			if (authReq.name === 'TEACHERS' && Application.isTeach){
				authorityRequest = {role: {name: 'INSTRUCTOR'}};
				domainAccess.teach = true;
			} else if (authReq.name === 'STUDENTS' && Application.isLearning){
				domainAccess.learn = true;
				break;
			} else if (authReq.name === 'RESEARCHERS' && Application.isResearch){
				domainAccess.research = true;
				break;
			} else if (authReq.name === 'LABMEMBERS'){
				domainAccess.labmember = true;
				break;
			}	else if (authReq.name === 'EDITORS'){
				domainAccess.editor = true;
				break;
			}
			else if(authReq.name === 'ADMINS') {
				domainAccess.admin = true;
				break;
			}
	}
	return { authorityRequest,	domainAccess }
}

export default (parent) => (class extends parent {
	componentDidMount(...args) {
		super.componentDidMount && super.componentDidMount(...args);

		this.getAccessCode(this.accessCode, (is) => {
			if(is){
				this.userInit();
			}else{
				!this.state.page && this.userInit();
			}
		});
		this.props.userDirtyUpdate(this.state.user, () => this.setState({user: null}));
		
		if (this.state.user === null) {
			this.clearUserSession();
		}
	}
	getAccessCode(code, cbk) {
		code ?
			this.ajax("_api/model/access/" + code, null, e => {
				this.accessCode = e.token;
				cbk(true, e);
			}, () => cbk(false), undefined, undefined, true) : cbk(false);
	}
	shouldComponentUpdate(nextProps, nextState){
		if(nextState.user !== this.state.user){
			this.props.userDirtyUpdate(nextState.user, () => this.setState({user: null}));
		}
		return super.shouldComponentUpdate ? super.shouldComponentUpdate(nextProps, nextState) : true;
	}
	userReset(e, done) {
		const p = this.persistLoad[null]() || {};
		this.layoutSection(e, p.section, e.user);
		const o = Seq(this.state)
		// .map(e=>undefined)
		// .concat({detail: undefined, master: undefined})
		// .concat(this.getInitState())
		.concat(p, this.frameGet(), e)
		.toObject();
		this.setState(o
			, done);
	}
	userInit() {
		const oldHash = window.location.hash.substring(1);

		this.ajax("_api/initialize", null, data => {
			if (Object.entries(data.definitionMap).length === 0 &&
					Object.entries(data.metadataValueRangeMap).length === 0 &&
					Object.entries(data.uploadMap).length === 0  &&
					data.modelDomainAccessList.length === 0 &&
					!data.subscriptionExpires) {
				return;
			}
			const s = Seq(data.metadataValueRangeMap)
								.groupBy(e => e.definitionId)
								.map(e => e.map((v, k) => (v.id = +k, v))
								.toObject()).toObject();

			this.MetadataDefinition = Seq(data.definitionMap).map((v, k) => {
				const type = "m" + v.name;

				class e extends Entity {
					constructor (...args) {
						super (...args)
					}
				}
				e.className = type;

				const d = { descriptor: { value: k } };
				const values = s[k];

				if (values) {
					Entity.init({[type]: e}, { definitionId: d, valueId: null });
					// changes
					Object.defineProperty(e.prototype, "values", { value: values });
					Object.defineProperty(e.prototype, "value", { get: function() {
							const e = this.valueId;
							return e && this.values[e];
					}});
					// changes
				} else {
						const p = { definitionId: d, position: null };
						v.type === "Attachment" ? (p.valueId = { ref: "bindings" }) : (p.value = null);
						Entity.init({[type]: e}, p);
				}
				// changes
				Object.defineProperty(e.prototype, "type", { value: v.type });
				// changes

				!ModelVersion.prototype.hasOwnProperty(k = type.substring(1, 2).toLowerCase() + type.substring(2)) && Object.defineProperty(ModelVersion.prototype, k, { get: function() {
					let e = Seq(this[type]).first();
					return e && (e = e.value) && (e.value !== undefined ? e.value : e);
				}});

				return e;
			}).toObject();

			const def = (k, v) => (k = Entity[k].prototype) && Object.defineProperty(k, "def", { value: Seq(k.values).find(e => e.value === v) });
			def("mLearningType", "Investigation");

			const user = this.state.user;
			this.entities = Seq(Application.entities).concat(Seq(this.MetadataDefinition).mapEntries(([_, e]) => [e.className, { source: e.prototype.values ? "metadataRangeMap" : "metadataValueMap" }])).toObject();
			this.properties = Seq(Application.properties).concat(Seq(this.MetadataDefinition).mapEntries(([_, e]) => [e.className, Utils.map(e.prototype.type === "Attachment" ? { value: "valueId" } : {})])).toObject();
			this.convert = Application.convert.bind(null, user && user.id, this.properties);

			const d = Application.domains.to[Application.domain];

			this.routerExecuteURL(oldHash).then(() => {});

			this.Workspace = Seq(data.modelDomainAccessList).filter(e => e.id.domain === d).toKeyedSeq().mapEntries(([_, e]) => [e.id.modelId, new Date(e.creationDate)]).toObject();
			// this.modelList(Seq(data.modelDomainAccessList).filter(e => e.id.domain === d).toKeyedSeq().mapEntries(([_, e]) => [e.id.modelId, new Date(e.creationDate)]));
//			this.modelList();
		});
	}

	 scheduleTokenRefresh = (expiresAt, access_token, refresh_token, otherSessionData) => {
		const expiryTime = new Date(expiresAt).getTime();
		const currentTime = Date.now();
	
		// Calculate the timeout duration (5 minutes before expiration)
		const fiveMinutesBeforeExpiry = 5 * 60 * 1000;
		const timeoutDuration = expiryTime - currentTime - fiveMinutesBeforeExpiry;
	
		if (timeoutDuration > 0) {
			console.log(`Token will be refreshed in ${timeoutDuration / 1000 / 60} minutes.`);
			setTimeout(refreshAccessToken, timeoutDuration);
		} else {
			// If the duration is already past or too close, refresh immediately
			this.refreshAccessToken(access_token, refresh_token, otherSessionData);
		}
	};
	
	 refreshAccessToken =  (access_token, refresh_token, otherSessionData) => {
		fetch(`${import.meta.env.VITE_CC_URL_CCAPP}/auth/token/refresh`, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				// 'Authorization': `Bearer ${access_token}`
			}, 
			body: JSON.stringify({"refresh": refresh_token}),
			})
			.then(res => res.json())
			.then(data => {
				const updatedSession = {
					user: {},
					...otherSessionData,
				}
				updatedSession['user']['token'] = data.access_token
				updatedSession['user'].refresh_token = data.refresh_token
		
				if (data.access_token && data.expirest_at) {
					window.localStorage.setItem('VERSION[0021].Main', JSON.stringify(updatedSession));
					this.scheduleTokenRefresh(data.expires_at, access_token, refresh_token, otherSessionData);
					return data.access_token
					console.log("Access token refreshed successfully.");
				} else {
					console.error("Failed to refresh access token.");
					// Optionally handle logout or redirect
				}
			})
			.catch(err => {
				console.error("Error refreshing access token:", err);
			});
	};

	userSyncSession(email=null, token=null, cbk=null, error=()=>{}, optionalRes = {refresh_token: null}){
		let user = {
			email: email,
			token: token,
		};
		user.token = this.state.user && user.token === null ? this.state.user.token : user.token;
    
		fetch(`${import.meta.env.VITE_CC_URL_CCAPP}/users/profile/me`,{
			method: 'GET',
					 headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'Authorization': `Bearer ${user.token}`
					}, 
		})
		.then(res => res.json())
		.then( res => {
					if (res.status && res.status == "error") {
						throw new Error("Unauthorized: Session is invalid or expired.")
					}
				const userAuthorityAccess = fetchUserAuthorityAccess(res.data.groups || []);
				user.activeTeachAuthorityRequest = userAuthorityAccess.authorityRequest;
				
				const userInfo = {};
				userInfo.token = user.token
				userInfo.refresh_token = optionalRes.refresh_token
				userInfo.avatarUri = res.data.profile.avatar_uri
				userInfo.firstName = res.data.user.first_name
				userInfo.lastName = res.data.user.last_name
				userInfo.name = res.data.user.username
				userInfo.expiresAt = optionalRes.expires_at
				userInfo.id = res.data.profile.user.id
				userInfo.app_user_id = optionalRes.app_user_id;
				userInfo.userDomainAccess = userAuthorityAccess.domainAccess;
				userInfo.teachAuthorityPendingRequest =  res.data.pending && res.data.pending.includes("TEACHERS")
				userInfo.teachAuthorityRejectedRequest = res.data.rejected && res.data.rejected.includes("TEACHERS")
				userInfo.subscription = [];

				const data = {
					user: userInfo,
					simulation: {
						speed: 1,
						window: 1,
						type: "SYNCHRONOUS"
					},
					globalViews: [],
					joyRideStepsCompleted: []
				}
				window.localStorage.setItem('VERSION[0021].Main', JSON.stringify(data));
				// this.refreshAccessToken(data.user.token, data.user.refresh_token, data)
				user = Seq(user).concat(userInfo).toObject();
				this.userReset({ user: user, page: undefined, layout: undefined});
				this.loggerSession(user);
				this.userInit();
				cbk && cbk();
				this.scheduleTokenRefresh(data.user.expiresAt, data.user.token, data.user.refresh_token, data)
		}).catch(err => {
			let error = err.toString()
			if(error.includes('Error:')){
				error = error.split('Error:')[1].trim();
			} 
			this.setState({error: error})
		});
	}

	userSignIn(email, token, res=false) {
		return new Promise((resolve, reject) => {
			if(res){
				this.userSyncSession(email, token, resolve(), reject(), res);
			} else {
				this.userSyncSession(email, token, resolve(), reject());
			}
		});
	}

	userImpersonate(email, token,  res) {
		window.localStorage.removeItem('VERSION[0021].Main');
		window.localStorage.removeItem('VERSION[0021]');
		return new Promise((resolve, reject) => {
			if(res){
				this.userSyncSession(email, token, resolve(), reject(), res);
			} else {
				this.userSyncSession(email, token, resolve(), reject());
			}
		});
	}
	
	userAnonymous() {
		this.userReset({ page: undefined, layout: undefined });
		this.userInit();
	}
	async userSignOut(c) {
		const expiryTime = new Date(c.state.user.expiresAt).getTime();
		const currentTime = Date.now();
		const timeoutDuration = expiryTime - currentTime ;
		// refresh expired token to correct logout invalidating refresh token
		let token = c.state.user.token
		if (timeoutDuration < 0 || timeoutDuration == 0) {
			token = this.refreshAccessToken(c.state.user.token, c.state.user.refresh_token, c.state.user)
		}
		try {
			await ccappRequest.get(`/auth/logout/${token}`);
		} catch (err) {
			console.error("Error ", err);
		}		
		this.clearUserSession();
	}

	async clearUserSession() {
		// CookieManager.DeleteCookie('transfer-auth-token');
		await cc.request.post("/api/auth/logout");
		window.localStorage.removeItem('VERSION[0021].Main');
		window.localStorage.removeItem('VERSION[0021]');			
		this.userReset({ user: null }, () => {
			this.ajax("_api/user/initialize");
			cc._.refresh({ force: true });
		});
	}
	async userSave(data, action) {
		await fetch(`${import.meta.env.VITE_CC_URL_CCAPP}/users/profile/edit/${data.user.id}`,{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${data.user.token}`
			}, 
			body: JSON.stringify(data)
		})
		.then(res => res.json())
		.then(res => {
			if(res.status != "success" || res.code != 200){
				action('Error occured updating your profile!')
				throw new Error(res.message)
			}
			const updatedData = {...data}
			delete updatedData.user
			const updatedUser = {...updatedData, ...data.user}
			this.setState({ user: Seq(this.state.user).concat(updatedUser).toObject() }) 
			action()
		}).catch(e => {
			// action(e) // not good for production
			action('Encountered an error updating your profile!')
		});
		// this.ajax("api/users/me", data, () => this.setState({ user: Seq(this.state.user).concat(data).toObject() }) || action(), action, null, true);
	}
	userForgotPassword(email) {
		const error = e => this.showDialog(Message, { message: errorResponse(e).message });
		const success = () => this.showDialog(Message, { message: `Password reset successful. Please check your email "${email}".` });
		this.ajax("api/users/reset", { email }, success, error, null, true);
	}
	userSubscribe(stripeToken, amount) {
		const error = e => this.showDialog(Message, { message: e });
		this.ajax("_api/user/subscribe/purchase", { token: stripeToken, amount: amount }, e => {
			const user = this.state.user;
			user.subscriptionExpires = e.expireDate;
			this.setState({ user: user });
			this.routerHome();
			this.showDialog(Message, { message: "Upgrading to premium student account was successful." });
		}, error, null, true);
	}
});

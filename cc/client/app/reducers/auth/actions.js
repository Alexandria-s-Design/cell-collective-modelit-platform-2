import request, {ccappRequest} from '../../request';

import showMessage, { TYPE_ERROR, TYPE_SUCCESS, TYPE_WARNING } from '../../message';

const HTTP_401_UNAUTHORIZED = 401;

const createApiActions = o => {
  const ret = {};
  for (const k in o) {
    const v = o[k];
    ret[`${k}_SUBMITTED`] = `${v}_SUBMITTED`;
    ret[`${k}_FINISHED`] = `${v}_FINISHED`;
  }
  return ret;
};

const URL = '@cc/cc/client/app/auth/user';
const ActionType = {
  USER_LOGGED_IN: `${URL}/USER_LOGGED_IN`,
  USER_LOGGED_OUT: `${URL}/USER_LOGGED_OUT`,
  ...createApiActions({
    SUBSCRIBE: `${URL}/SUBSCRIBE`,
  }),
};

const doDirtyUpdate = (deprecatedUser, onError) => async dispatch => {
  //login
  if (deprecatedUser) {
    try {
			const userMeData = await fetch(`${import.meta.env.VITE_CC_URL_CCAPP}/users/profile/me`,{
				method: 'GET',
						 headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json',
							'Authorization': `Bearer ${deprecatedUser.token}`
						}, 
			})
			.then(res => res.json())
			.then(resData => {
				if (resData && resData.code) {
					let errResp;
					if (resData.code == HTTP_401_UNAUTHORIZED) {
						console.log("Disconnecting unauthorized user...");
						errResp = "Unauthorized user";
					}
					if (resData.code >= 400) {
						console.error("Error response profile: "+ JSON.stringify(resData));
						errResp = "Error fetching profile data";
					}
					if (errResp) {						
						dispatch({
							type: ActionType.USER_LOGGED_OUT,
						});
						throw new Error(errResp);
					}
				}
			})
			dispatch({
				type: ActionType.USER_LOGGED_IN,
				payload: {
					userMeData,
					deprecatedUser,
				},
			});
    } catch (e) {
			console.error(e);
			onError && onError();
      //do not know what to do yet muheheh :D
    }
  } else {
    //logout
    dispatch({
      type: ActionType.USER_LOGGED_OUT,
    });
  }
};

const reloadUser = () => async (dispatch, getState) => {
  await dispatch(doDirtyUpdate(getState().auth.user));
};

const doPlanSubscribe = (token, bpPlanName, csPlanName, pdPlanName, usaPlanName, studentCount, sum) => async dispatch => {
	const body = {
    token: token,
		bpPlanName,
		csPlanName,
		pdPlanName,
		usaPlanName,
		studentCount,
		sum
  };

  await dispatch({
    type: ActionType.SUBSCRIBE_SUBMITTED,
  });
  try {
		await request.post(`/api/plan/subscribe`, body);
    await dispatch(reloadUser());
  } catch (e) {
    console.error(e);
  } finally {
    await dispatch({
      type: ActionType.SUBSCRIBE_FINISHED,
    });
		showMessage({
			message: `Transaction completed successfully`,
			type: TYPE_SUCCESS,
			options: {
				extendedTimeOut: 30000,
				timeOut: 60000,
			},
		});

  }
};

export { ActionType, doDirtyUpdate, doPlanSubscribe };

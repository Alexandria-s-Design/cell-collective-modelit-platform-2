const URL = '@cc/cc/containers/Application';
const ActionType = {
  SET_APPLICATION_DOMAIN: `${URL}/SET_APPLICATION_DOMAIN`,
  CHANGE_WORKSPACE: `${URL}/CHANGE_WORKSPACE`,
  REDIRECT_TO: `${URL}/REDIRECT_TO`,
  CHANGE_SAVING: `${URL}/CHANGE_SAVING`,
};

const updateSavingStatus = saving => ({
  type: ActionType.CHANGE_SAVING,
  payload: saving,
});

const setApplicationDomain = domain => ({
  type: ActionType.SET_APPLICATION_DOMAIN,
  payload: { domain },
});

const redirectTo = redirect => {
  /****
   *  internally pushing Redux action because the router is connected to Redux to its own reducer
   *  the action here is for making all CC core stuff in one place
   ****/
  history.push(redirect);
  return {
    type: ActionType.REDIRECT_TO,
    payload: redirectTo,
  };
};

export { ActionType, redirectTo, updateSavingStatus, setApplicationDomain };

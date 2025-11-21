export const URL = "@cc/cc/containers/Application/ModuleDM/Module";
export const ActionType =
{
    CHANGE_WORKSPACE : `${URL}/CHANGE_WORKSPACE`,
//    MODEL_OPEN_DETAIL: `${URL}/MODEL_OPEN_DETAIL`
};

//This has to be in the same naming
export const WORKSPACE = {
    MODEL   : "MODEL",
    CONTENT : "CONTENT",
    INSIGHTS: "INSIGHTS",
    SHARING : "SHARING",
};

/*** model / learning activity / sharing ***/
export const changeWorkspace = (workspace, moduleId='selected') => (dispatch) => {
    if(!WORKSPACE[workspace])
        {throw new Error(`Unknown workspace ${workspace}`);}
    dispatch({
        type: ActionType.CHANGE_WORKSPACE,
        payload: { workspace, moduleId }
    });
}


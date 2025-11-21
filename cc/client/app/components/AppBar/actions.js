const URL = '@cc/cc/client/app/components/AppBar';

const ActionType = {
    DO_SEARCH: `${URL}/DO_SEARCH`,
};

const doSearch  = (query) => 
    ({
        type: ActionType.DO_SEARCH,
        payload: query
    });

export { ActionType, doSearch };
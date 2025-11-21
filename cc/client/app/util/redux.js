const createAsyncActionType = type => ({
    [`${type}_REQUEST`]: `${type}_REQUEST`,
    [`${type}_SUCCESS`]: `${type}_SUCCESS`,
    [`${type}_FAILURE`]: `${type}_FAILURE`,
    [`${type}_ERROR`]  : `${type}_ERROR`,
});

export default { createAsyncActionType };
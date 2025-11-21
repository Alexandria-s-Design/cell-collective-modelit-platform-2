const ActionType = {
    SET_APPLICATION_DOMAIN: '@cc/cc/client/app/containers/App/SET_APPLICATION_DOMAIN'
}

const setApplicationDomain = domain => ({
    type: ActionType.SET_APPLICATION_DOMAIN,
    payload: { domain }
})

export { ActionType, setApplicationDomain }
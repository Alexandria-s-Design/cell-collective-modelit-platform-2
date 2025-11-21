const ActionType = {
    OPEN_MODAL: '@cc/cc/client/app/components/Modal/OPEN_MODAL',
    HIDE_MODAL: '@cc/cc/client/app/components/Modal/HIDE_MODAL'
};

const openModal  = (type, props) => ({
    type: ActionType.OPEN_MODAL,
    payload: { type, props }
});

const hideModal  = () => ({
    type: ActionType.HIDE_MODAL
});

export { ActionType, openModal, hideModal };
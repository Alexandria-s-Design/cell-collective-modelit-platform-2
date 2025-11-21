import cc from '../cc';

const ActionType = {
    SHOW_TOAST: '@cc/cc/client/app/message/SHOW_TOAST'
}

const TYPE_SUCCESS = 'success';
const TYPE_WARNING = 'warning';
const TYPE_ERROR   = 'error';

const defaultToastProperties = ({
       type: TYPE_SUCCESS,
      title: null,
    options: {
        "positionClass": "toast-bottom-right",
    }
});

const defaultTitles = {
    [TYPE_SUCCESS]: undefined,
    [TYPE_WARNING]: "Warning",
      [TYPE_ERROR]: "Error",
}

/*  message can be either string (which is default type success)
    or object with shape 
    {
        message: "text_of_message",
           type: "success" | "error" | "warning"
          title: "title_of_message"
        options: {
                    showDuration : 5000,
                    hideDuration : 5000,
                 }

    }
*/

const showToast = (message) => {
    if(!cc._.isObject(message)){
        message = {message: message};
    }
    if(message.options){
        message.options = {
            ...defaultToastProperties.options, 
            ...message.options
        };
    }
    message = {
        ...defaultToastProperties,
        ...message
    };
    if(message.title === null)
        {message.title = defaultTitles[message.type];}

    return {
        type: ActionType.SHOW_TOAST,
        payload: message
    }
};

export { ActionType, showToast, TYPE_ERROR, TYPE_SUCCESS, TYPE_WARNING }
import { defineMessages } from "react-intl";

const URL = '@cc/cc/client/app/components/AppBar/Toolbar/Edit';

export default defineMessages({
    Undo: {
        id: `${URL}/Undo`,
        defaultMessage: 'Undo'
    },
    Redo: {
        id: `${URL}/Redo`,
        defaultMessage: 'Redo'
    },


    RestoreLayout: {
        id: `${URL}/RestoreLayout`,
        defaultMessage: 'Restore Layout'
    },

    FromDefault: {
        id: `${URL}/FromDefault`,
        defaultMessage: 'From Defaults'
    },
    FromModel: {
        id: `${URL}/FromModel`,
        defaultMessage: 'From Model'
    },
});
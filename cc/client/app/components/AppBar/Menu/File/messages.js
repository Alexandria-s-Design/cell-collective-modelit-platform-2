import { defineMessages } from "react-intl";

const URL = '@cc/cc/client/app/components/AppBar/Toolbar/File';

export default defineMessages({

    NewModel: {
        id: `${URL}/NewModel`,
        defaultMessage: 'New Model'
    },
    Save: {
        id: `${URL}/Save`,
        defaultMessage: 'Save'
    },
    DisabledSavePublished: {
        id: `${URL}/DisabledSavePublished`,
        defaultMessage: 'Save (Unpublish to Save)'
    },
    SaveLayout: {
        id: `${URL}/SaveLayout`,
        defaultMessage: 'Save Layout'
    },
		DisabledSaveLayoutPublished: {
			id: `${URL}/DisabledSaveLayoutPublished`,
			defaultMessage: 'Save Layout (Unpublish to Save)'
		},
    Share: {
        id: `${URL}/Share`,
        defaultMessage: 'Share'
    },
    RestartLesson: {
        id: `${URL}/RestartLesson`,
        defaultMessage: 'Restart Lesson'
    },
    Copy: {
        id: `${URL}/Copy`,
        defaultMessage: 'Copy'
    },
    Download: {
        id: `${URL}/Download`,
        defaultMessage: 'Download'
    },
});

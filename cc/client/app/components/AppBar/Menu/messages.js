import { defineMessages } from "react-intl";

const URL = '@cc/cc/client/app/components/AppBar/Toolbar';

export default defineMessages({
    File: {
        id: `${URL}/File`,
        defaultMessage: 'File'
    },


    /**** Insert *****/
    Insert: {
        id: `${URL}/Insert`,
        defaultMessage: 'Insert'
    },

    /**** Edit ******/
    Edit: {
        id: `${URL}/Edit`,
        defaultMessage: 'Edit'
    },
    Undo: {
        id: `${URL}/Undo`,
        defaultMessage: 'Undo'
    },
    Redo: {
        id: `${URL}/Redo`,
        defaultMessage: 'Redo'
    },
    FromDefault: {
        id: `${URL}/FromDefault`,
        defaultMessage: 'From Default'
    },
    FromModel: {
        id: `${URL}/FromModel`,
        defaultMessage: 'From Model'
    },


    /***** Workspace  *****/

    Workspace: {
        id: `${URL}/Workspace`,
        defaultMessage: 'Workspace'
    },
    Model: {
        id: `${URL}/Model`,
        defaultMessage: 'Model'
    },
    ContentDesign: {
        id: `${URL}/ContentDesign`,
        defaultMessage: 'Content Design'
    },
    LearningInsights: {
        id: `${URL}/LearningInsights`,
        defaultMessage: 'Learning Insights'
    },

    /***** Reports *****/

    Reports: {
        id: `${URL}/Reports`,
        defaultMessage: 'Reports'
    },
    StudentLessonStatus: {
        id: `${URL}/StudentLessonStatus`,
        defaultMessage: 'Student Lesson Status'
    },
    ImageReport: {
        id: `${URL}/ImageReport`,
        defaultMessage: 'Image Report'
    },
    StudentReport: {
        id: `${URL}/StudentReport`,
        defaultMessage: 'Generate Student Report'
    },

    /***** Help  *****/

    Help: {
        id: `${URL}/Help`,
        defaultMessage: 'Help'
    },
    Tutorials: {
        id: `${URL}/Tutorials`,
        defaultMessage: 'Tutorials'
    },
    Debug: {
        id: `${URL}/Debug`,
        defaultMessage: 'Debug'
    },
    Documentation: {
        id: `${URL}/Documentation`,
        defaultMessage: 'Documentation'
    },
    Reload: {
        id: `${URL}/Reload`,
        defaultMessage: 'Reload'
    },
    About: {
        id: `${URL}/About`,
        defaultMessage: 'About'
    },
    
    ReloadInMoment: {
        id: '@cc/cc/client/app/components/AppBar/ReloadInMoment',
        defaultMessage: 'Application is going to reload in a moment...'
    }
});
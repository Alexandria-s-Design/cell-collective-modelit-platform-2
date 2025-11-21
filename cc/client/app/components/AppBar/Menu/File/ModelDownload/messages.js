import { defineMessages } from "react-intl";

const URL = '@cc/cc/client/app/components/AppBar/Menu/File/ModelDownload';

export default defineMessages({
    SBML: {
        id: `${URL}/SBML`,
        defaultMessage: 'SBML'
    },
    EXPR: {
        id: `${URL}/EXPR`,
        defaultMessage: 'Boolean Expressions'
    },
    TT: {
        id: `${URL}/TT`,
        defaultMessage: 'Truth Tables'
    },
    MATRIX: {
        id: `${URL}/MATRIX`,
        defaultMessage: 'Interaction Matrix'
    },
    GML: {
        id: `${URL}/GML`,
        defaultMessage: 'GML'
		},
});
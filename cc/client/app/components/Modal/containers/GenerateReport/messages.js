import { defineMessages } from "react-intl";

const URL = '@cc/cc/client/app/components/Modal/containers/GenerateReport';

export default defineMessages({
    MessageGenerate: {
        id: `${URL}/MessageGenerate`,
        defaultMessage: "Make report"
    },
    MessageFrom: {
        id: `${URL}/MessageFrom`,
        defaultMessage: "From: "
    },
    MessageTo: {
        id: `${URL}/MessageTo`,
        defaultMessage: "To: "
    }
});
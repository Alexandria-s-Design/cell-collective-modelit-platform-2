import React from "react";
import PropTypes from "prop-types";
import { IntlProvider } from "react-intl";

class LanguageProvider extends React.Component {
    render ( ) {
        const { props }  = this
        
        return (
            <IntlProvider locale={props.locale}>
                {props.children} {/* TODO (Achilles): React.Children.only(props.children)? */}
            </IntlProvider>
        )
    }
}

LanguageProvider.propTypes    = {
    locale: PropTypes.string
}
LanguageProvider.defaultProps = {
    locale: "en"
}

export default LanguageProvider
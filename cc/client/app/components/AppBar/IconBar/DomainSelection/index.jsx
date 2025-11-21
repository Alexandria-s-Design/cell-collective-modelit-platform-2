
import React from 'react';
import {connect} from 'react-redux';
import {Seq}    from 'immutable'
import classnames from 'classnames';

import cc from '../../../../cc';
import ccConfig from '../../../../../cc-config.json';

import { injectIntl } from 'react-intl';

import messages from './messages';

import * as CookieManager from "../../../../util/cookies";

import { setApplicationDomain } from "../../../../containers/Application/actions";

const URLS = {
	// "base": "http://localhost:5000",
	"support": "https://support.cellcollective.org",
	"research": import.meta.env.VITE_CC_URL_RESEARCH,
	"learn": import.meta.env.VITE_CC_URL_LEARN,
	"teach": import.meta.env.VITE_CC_URL_TEACH,
}

const refresh = (props) => {
    cc._.refresh({
        message: {
            message: props.intl.formatMessage(messages.DashBoardAppBarReloadInMoment),
                type: 'warning'
        }
    });
}

const chgDomain = (new_d, new_k, props) => (() => {
    if (import.meta.env.MODE === "development") {
        props.setApplicationDomain(new_d);
        if (props.user) {
            // We have a user logged in, so we should register a transfer token
            CookieManager.SetCookie('transfer-auth-token', props.user.token);
        }
        refresh(props);
    } else {
        window.location.href = `${URLS[new_k]}/dashboard`;
    }
});

const DomainSelection = (props) => (
    // <div className="menu right icon large-domain topRightMenu" title="Domains">
    //     <ul className="ul">
            // {
                Seq(ccConfig.domains).sortBy(domain => domain.priority).map(({ name, key, title, displayTitle }) => (
                    <li key={name}>
                        <div className={classnames("checkbox", { "checked": props.domain === name })}
                            onClick={chgDomain(name, key, props)}>
                            {displayTitle || title}
                        </div>
                    </li>
                ))
            // }
    //     </ul>
    // </div>
)

const mapStateToProps    = state    => ({
    domain: state.app.domain
});
const mapDispatchToProps = dispatch => ({
    setApplicationDomain: domain =>
        dispatch(setApplicationDomain(domain))
});

export default injectIntl(
    connect(
        mapStateToProps, 
        mapDispatchToProps
    )(DomainSelection)
);
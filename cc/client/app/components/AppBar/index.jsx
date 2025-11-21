import React from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";

import UserMenu from './UserMenu';
import IconBar from './IconBar';

import ErrorBoundary from '../../containers/ErrorBoundary';

import Application from '../../application';
import Editable from '../../component/base/editable';

import { doSearch } from './actions';

import Menu from './Menu';

import Upgrade from "./Upgrade/index";
import "./styles.scss";

let authUser = null;
class AppBar extends React.Component {
    render() {
				const { props } = this;
				// console.log(props.user);
				authUser = props.user;

        return (
            <div className="heading appBar">
                <ErrorBoundary>
                    <div>
                        <a className="cursor-pointer" onClick={() => {
													if (Application.isTeach) {
														return props.goHome()
													} else {
														window.location.href = import.meta.env.VITE_CC_URL_LEARN;
													}
												}}>
                            <img alt="logo-cellcollective" className="logoImg" width={props.smalllogo ? "auto" : "145px"} height="34px" src={`/assets/images/logo/${Application.domain}/${props.smalllogo ? 'logo-small.png' : 'logo.png'}?v=202510`} />
                        </a>
                        <div className='topbar'>
                            <div>
                                {props.header}
                                {props.showSearch && (
                                    <div className="search" >
                                        <input
                                            type="button"
                                            className="icon large-search" />
                                        <Editable
                                            className="heading search"
                                            value={props.modelSearch}
                                            placeHolder="Search"
                                            onEdit={(query) => props.doSearch(query)}
                                            maxWidth={200} />
                                    </div>
                                )}
                            </div>														
                        {props.showMenu && (<Menu {...props} />)}
                        </div>
												{Application.isTeach && <>
													{/* <IconBar /> */}
                        	<UserMenu />
													{props.user
															? (<dl className="right"><dd className="upgrade"><div><Upgrade/></div></dd> <dt className="profile username"><span>{props.user.name}</span> </dt></dl>)
															: (<span className="right warning minw600">Please sign in to be able to save your work.</span>)}
													{Application.notice && (<dt className="notice right warning minw1100">{Application.notice}</dt>)}
												</>}
                    </div>
                    {props.toolbar}
                </ErrorBoundary>
            </div>
        );
    }
}

AppBar.propTypes = {
    showSearch: PropTypes.bool,
    header: PropTypes.element,
    toolbar: PropTypes.element
};

const mapStateToProps = state => ({
    user: state.auth.user,
    modelSearch: state.appBar.modelSearchString,
    url: state.router.location.pathname
});
const mapDispatchToProps = dispatch => ({
    /*    goHome              : ()  =>
            dispatch(redirectTo("/model")), */
    doSearch: query =>
        dispatch(doSearch(query)),
});

export { authUser };

export default connect(mapStateToProps, mapDispatchToProps)(AppBar);
import Utils from '../utils';
import React from 'react';
import { connect } from "react-redux";
import { Range, Seq, Map } from 'immutable';
import Application from '../application';
import Update from '../action/update';
import Scrollable from './base/scrollable';
import LearningActivity from '../entity/learningActivity';
import Arrangement from './base/arrangement';
import Views from '../views';
import Views2 from './views';
import Preview from './base/preview';
import Editable from './base/editable';
import Confirmation from '../component/dialog/confirmation';
import viewsMessages from '../viewsMessages';
import { injectIntl, FormattedMessage } from 'react-intl';
import { getViewMessageKey } from "../viewsMessages"
// import { authUser } from '../../components/AppBar/index'


import ModelType from "../../../model";

import cc from "../cc";

class ModelMenu extends React.Component {
		componentDidMount() {
			const hostname = window.location.hostname;
			let measurementId;

			switch (hostname) {
				case "cellcollective.org":
					measurementId = "G-V89ZEJMZDR"; // Production landing
					break;
				case "research.cellcollective.org":
					measurementId = "G-FC5WJX5422"; // Production research
					break;
				case "teach.cellcollective.org":
					measurementId = "G-Q1M61MJ78H"; // Production teach
					break;
				case "learn.cellcollective.org":
					measurementId = "G-N15N4L9JEG"; // Production learn
					break;
				case "develop.cellcollective.org":
					measurementId = "G-EZ1XK3WELR"; // Develop
					break;
				case "staging.cellcollective.org":
					measurementId = "G-PDKQEH4GM4"; // Staging
					break;
				case "hotfix.cellcollective.org":
					measurementId = "G-9TJ0R5S67X"; // Hotfix
					break;
				case "localhost":
					measurementId = "G-ZP37KP1MJR"; // Localhost
					break;
				default:
					console.warn("Undefined host name", window.location.hostname);
					return;
			}

			// DISABLED: Check European GDPR
			// const script = document.createElement("script");
			// script.async = true;
			// script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
			// document.head.appendChild(script);

			// window.dataLayer = window.dataLayer || [];
			// function gtag() {
			// 	dataLayer.push(arguments);
			// }
			// gtag("js", new Date());
			// gtag("config", measurementId);
		}

    shouldComponentUpdate(props) {
        const skipKeys = ['versions'];
        return Seq(props)
            .filterNot(v => typeof v === 'function')
            .filterNot((_, k) => skipKeys.indexOf(k) >= 0)
            .map((v, k) => v !== this.props[k])
            .reduce((v, s) => v || s, false);
    }
    render() {
        let { modelLayoutSave, modelSave, modelIsShareAndEditable, modelIsDirty, modelCopy, modelAddVersion, modelUpdate, modelSelect, modelVersionRemove, modelDownload, modelSetDefaultVersion, modelAllVersionsEditable, modelChangeName,
            historyMove, canRestoreLayout, onHover, rView, access, layouts, favorites, playing, selected,
            actions: { onAdd, onEdit, onRemove },
            layoutIsValid, layoutIsDirty, layoutToggle, layoutSet, layoutGet, layoutGetViews, layoutGetKey, layoutRestore, layoutRemove, layoutAdd, entitySelect, entityUpdate,
            layout, saving, editable, detail, versions, typed, views, width, domain, hover,
            LayoutDomain, showConfimationOnClose,
            model, user, viewToggle, viewAddCustom, viewRemoveCustom, View, stateGet, permissions, self } = this.props;
				
				const modelType = model.modelType;
					
        layouts = layouts.get("").filter((_, l) => (layoutIsValid.bind(null, model.type, l)));
        const newLayout = Range(1, Infinity).map(e => "Custom Layout " + e).find(e => !layouts.has(e));
        const predefined = Seq(typed)
            // .filter(e => e && model && e.modelType == model.modelType)
            .filterNot(e => e.internal || e.minAccess > access)
            .keySeq()
            .sortBy(e => e.toLowerCase());
        const custom = layouts.keySeq().filterNot(e => typed[e]).sortBy(e => e.toLowerCase());
        const sharingNum = model && Seq(model.Sharing).count();

        //if it is education then put "edu"+string_with_capitalized_first_letter othervise return the same string
        const eduImageName = (name) => (Application.isEducation
            ? "edu" + name.charAt(0).toUpperCase() + name.slice(1)  //uppercase first character
            : name);

        const save = (
            <FormattedMessage id="ModelDashBoard.ModelMenu.LabelSaveModel" defaultMessage="Save Model">
                {message => <input type="button" className={"icon large-" + eduImageName("save")} title={message} onClick={() => modelSave(null, undefined).then(() => {})} disabled={Utils.enabled(user && detail !== undefined && modelIsShareAndEditable && modelIsDirty)} />}
            </FormattedMessage>
        );

        const saveLayout = (
            <FormattedMessage id="ModelDashBoard.ModelMenu.LabelSaveModelLayout" defaultMessage="Save Model Layout">
                {message => <input type="button" className={"icon large-" + eduImageName("savelayout")} title={message} onClick={modelLayoutSave.bind(null, null)} disabled={Utils.enabled(!saving && editable && user && detail !== undefined && layoutIsDirty)} />}
            </FormattedMessage>
        );
        const undo = (
            <FormattedMessage id="ModelDashBoard.ModelMenu.LabelUndo" defaultMessage="Undo">
                {message => <input type="button" className={"icon large-" + eduImageName("undo")} title={message} onClick={historyMove.bind(null, "undo")} disabled={Utils.enabled(!saving && model.history && model.history.undoable)} />}
            </FormattedMessage>
        );
        const redo = (
            <FormattedMessage id="ModelDashBoard.ModelMenu.LabelRedo" defaultMessage="Redo">
                {message => <input type="button" className={"icon large-" + eduImageName("redo")} title={message} onClick={historyMove.bind(null, "redo")} disabled={Utils.enabled(!saving && model.history && model.history.redoable)} />}
            </FormattedMessage>
        );

        const rPreview = e => {
            const description = View[e].description;
            return (
                <div>
                    <div>{rView(e, null, { persist: ".Preview", parentWidth: 300, parentHeight: 350, left: 0, top: 0, width: "100%", height: "100%" })}</div>
                    {description && (<p>{description}</p>)}
                </div>
            );
        };

        const rLayoutPreview = e => {
            const range = layoutGet(e);
            const k = layoutGetKey(e, range);
            const k2 = layoutGetKey(undefined, range);
            let v, description = (v = typed[e]) && v.description;

            return (
                <div>
                    <div className="page">
                        <div className="heading">
                            <div />
                            <div />
                        </div>
                        <Arrangement key={k} persist={k} persistGlobal={k2}>
                            {layoutGetViews(e, range).map(v => (<Preview key={v} {...Seq(View[v]).concat(range && range.views[v] || {}).toObject()} />)).toArray()}
                        </Arrangement>
                    </div>
                    {description && (<p>{description}</p>)}
                </div>
            );
        };

        const defaultVersion = model.top && model.top.selected || versions.sort(Application.cmpVersion(true)).first();
        const changeDefaultVersion = (m, e) => { e.stopPropagation(); modelSetDefaultVersion(m); };

        const rVersions = (c, w, edit) => {
            const select = (version) => {
                if (/^Activities/g.test(layout)) {
                    entityUpdate([new Update(selected.LearningActivity, 'version', version.id)]);
                }
                modelSelect(true, version, undefined, layout);
            }

            return (<div className={Utils.css(c, 'version')} style={{ width: w }}>
                <Editable className="heading" value={model.name} children={model && (<span>version {model.name}</span>)} onEdit={edit && editable && model && (e => e && onEdit(model, "name", e))} maxWidth={w} />
            
                {edit && (<ul className="ul" style={{ minWidth: 200 }}>
                    {versions.sort(Application.cmpVersion(false)).map((m, id) => (<li key={id}>
                        <div className={Utils.css(Utils.enabled(m !== model), 'version', modelAllVersionsEditable && 'versionSelect', m === defaultVersion && 'versionDefault')} onClick={select.bind(null, m)}>
                            <span className="selectVersion" title={modelAllVersionsEditable ? "Set as default" : ""} onClick={m !== defaultVersion && changeDefaultVersion.bind(null, m)} />
                            {(m.name || "")}
                            {m.permissions.delete && modelVersionRemove && (<div className="remove" onClick={modelVersionRemove && ((e) => { e.stopPropagation(); showConfimationOnClose(Confirmation, { type: "remove", entity: m.name, action: modelVersionRemove.bind(null, m) }) })} />)}
                        </div>
                        {m && m.description && (
                            <ul className="ul">
                                <li><div>{cc._.ellipsis(m.description)}</div></li>
                            </ul>
                        )}
                    </li>)).toArray()}
                    {modelAddVersion && (<li className="custom">
                        <div className="checkbox" onClick={modelAddVersion}>
                            <FormattedMessage id="ModelDashBoard.ModelMenu.LabelAddNewVersion"
                                defaultMessage="Add new version" />
                        </div>
                    </li>)}
                </ul>)}
            </div>);
        };

        const rName = (w, versions, editableVersions = true) => (
            <div className='menu name'>
                <Editable className="heading" value={model.top && model.top.name} onEdit={modelAllVersionsEditable && (e => e && modelChangeName(e))} maxWidth={w} />
                {versions && rVersions('menu', w, editableVersions)}
            </div>
        );

        const lSelected = (l) => !!(l === layout || Seq((typed[l] || {}).layouts).has(layout));

        const { props } = this;
        const { intl } = props;

        const translate = (k) => {
            const message = viewsMessages[getViewMessageKey(k)];

            if (message && 'defaultMessage' in message) {
                return intl.formatMessage(message)
            }

            return null
        }

        const layoutCaption = (k, n, remove) => (
            <li key={k}>
                <div className={Utils.checked(views.has(k))} onClick={viewToggle.bind(null, k, undefined)} {...onHover("view", k)}>
                    {translate(k) || n && n.toString() || View[k.replace(/\[.+$/g, "")].name}
                    {editable && remove && (<div className="remove" onClick={remove} />)}
                </div>
            </li>);
        const layoutAddCaption = (k, add) => (
            <li className="custom" key={k}>
                <div className="checkbox state" onClick={add}>Add {View[k].name}</div>
            </li>
        );




        const rViews = (c) => (Application.domain !== "learning" && <div className={Utils.css(c, "icon", "large-visibility")}>
            <ul className="ul">
                {Seq(Views).filter((_, k) => k).map(e => Seq(e).filter(e => !e.domains || e.domains.indexOf(domain) >= 0).toObject()).filter(e => Seq(e).size).map((v, k) => [v, Seq(v).map((v, k) => (
                    ((v = Views2[k]) && v.multiple && v.multiple.get) ?
                        Seq(v.multiple.get(self, model)).toIndexedSeq().map((v2, k2) =>
                            (layoutCaption(k + '[' + v.multiple.id(v2) + ']', (v.multiple.name && v.multiple.name(v2) || v2), v.multiple.remove && viewRemoveCustom.bind(null, k, v.multiple.remove.bind(self, self, model, v2))))
                        ).toIndexedSeq().concat(editable && v.multiple.add ? [layoutAddCaption(k, viewAddCustom.bind(null, k, v.multiple.add.bind(null, self, model)))] : [])
                        : [layoutCaption(k)]
                )).reduce((v, s) => v.concat(s), Seq())]
                ).filter(([_, views]) => !views.isEmpty()).map(([v, views], k) => (
                    <li key={k}>
                        <div>{translate(k) || k}</div>
                        <ul className="ul">
                            {views}
                            {hover && hover.entity === "view" && v[hover.property] && rPreview(hover.property)}
                        </ul>
                    </li>
                )).toArray()}
            </ul>
        </div>);

        // previously share access only, but enabling for people who have view access to view the panels within this layout.
        const sharingEl = permissions.edit && Application.domain !== "learning" && (
            <FormattedMessage id="ModelDashBoard.ModelMenu.LabelShare" defaultMessage="Share">
                {message => <input type="button" className={Utils.css("icon right large-share", layout === "Sharing" && "selected", stateGet("isPublic") && "public")} title={message} disabled={Utils.enabled(user && (permissions.view || permissions.share))} onClick={layoutSet.bind(null, "Sharing")} />}
            </FormattedMessage>
        );
        const sharingNumEl = (permissions.view || permissions.share) && sharingNum > 0 && (
            <div className="right sharing">
                <span>{sharingNum}</span>
            </div>
        );


        if (Application.isEducation) {
            const editableActivities = editable && Application.domain === 'teaching';

            const module = model.top;

            let menuItems = new Map({ "Overview": "Overview", "Model": "Model", "Activities": "Learning Activities", /*"Access":"Student Access",*/ "Insights":"Learning insights" });
            if (!editableActivities && Seq(module ? module.LearningActivity : []).isEmpty()) {
                menuItems = menuItems.delete("Activities");
            }

            const selectActivity = (ent) => {
                modelSelect(true, module.sub(ent.version), undefined, 'Activities[' + ent.id + ']');
            }

            const builtins = {"AccountUpgrade": true, "Access": true, "Insights": true };
            const clickTop = (e) => {
                if (builtins[e] || e === 'Model') {
                    return layoutSet.bind(null, e);
                }
                if (e == "Activities") {
                    return () => {
                        const ent = Seq(module ? module.LearningActivity : []).sortBy(e => e.position).first() || (editableActivities && addLearningActivity());
                        ent && selectActivity(ent);
                    }
                }
                return false;
            }

            const isLearnActivity = l => new RegExp("^Activities\\[", 'g').test(l);

            const addLearningActivity = () => {
                const ent = new LearningActivity({ name: Application.defName(module ? module.LearningActivity : [], "Activity"), version: model.id });
                onAdd(ent);
                return ent;
            }

            const isBuiltinLayout = (Layout, l) => (
                Layout[l] || Seq(Layout).filter(e => e.layouts).map(e => isBuiltinLayout(e.layouts, l)).reduce((r, n) => r || n, false)
            );
            const selectedTop = (e) => {
                if (e === 'Model')
                    {return !builtins[layout] && isBuiltinLayout(LayoutDomain, layout);}
                return e === layout || new RegExp("^" + e + "\\[", 'g').test(layout);
            }

            const bottom = (e) => {
                if (builtins[layout])
                    {return [];}

                if (isBuiltinLayout(LayoutDomain, layout)) {
                    const skipKeys = ['Home', 'Sharing', "ModelErr"];
                    return (<ul className="education">
                        {Seq(LayoutDomain).map((_, k) => k).filter(e => !builtins[e] && skipKeys.indexOf(e) < 0).map(e => (
                            <li key={e} className={Utils.css(lSelected(e) && "selected", "menu")}>
                                <div onClick={(!(typed[e] || {}).layouts) && layoutSet.bind(null, e)} {...((typed[e] && typed[e].layouts) ? {} : onHover("layout", e))}>{e}</div>
                                {(typed[e] || {}).layouts && (
                                    <ul className="ul">
                                        {Seq(typed[e].layouts).map((_, e) => (
                                            <li key={e}><div className={Utils.css(Utils.checked(lSelected(e)))} onClick={layoutSet.bind(null, e)}>{e}</div></li>
                                        )).toArray()}
                                    </ul>
                                )}
                            </li>
                        )).toArray()}
                    </ul>);
                }

                if (/^Activities\[/g.test(layout)) {
                    const getEl = () => {
                        return Seq(module ? module.LearningActivity : []).sortBy(e => e.position).map((learn) => {
                            const lk = 'Activities[' + learn.id + ']';
                            const select = () => layoutSet(lk);
                            const m = module.sub(learn.version);  //dirty hack haha

                            return (
                                <li key={learn.id} className={Utils.css(selected.LearningActivity === learn && "selected")}>
                                    {editableActivities && (<div className="remove-activity" onClick={showConfimationOnClose.bind(null, Confirmation, { type: "delete", entity: learn.name, action: onRemove.bind(null, learn) })} title="Remove this Activity"></div>)}
                                    <div onClick={m === model ? select : modelSelect.bind(null, true, m, undefined, lk, select)}>
                                        {editableActivities ? (<Editable value={learn.name} editOnDoubleClick={true} onEdit={onEdit.bind(null, learn, 'name')} />) : learn.name}
                                    </div>
                                </li>
                            );
                        });
                    }
                    return (
                        <div style={{ width: scrollW }} className="horizontal">
                            <Scrollable horizontal={true} parentHeight={32} parentWidth={scrollW}>
                                <div>
                                    <ul className="education">
                                        {Seq(editableActivities ? [(<input type="button" key="add" className="icon base-add-activity" title="Add new Activity" onClick={addLearningActivity} />)] : []).concat(getEl()).toArray()}
                                    </ul>
                                </div>
                            </Scrollable>
                        </div>
                    );
                }
            }

            const scrollW = width - 300 - 90;
            return (
                <span>
                    <div>
                        {save}
                        {!(Application.domain === "learning") && saveLayout}
                        {undo}
                        {redo}
                        {rName(width > 1000 ? 300 : 200, true, Application.domain !== 'learning')}
                        <ul className="education">
                            {menuItems.map((e, k) => {
                                return (<li key={k} className={Utils.css(selectedTop(k) && 'selected')} onClick={clickTop(k)}>{e}</li>);
                            }).toArray()}
                        </ul>
                    </div>
                    <div>
                        <div className="menu2 submenu">
                            {bottom(layouts)}
                        </div>
                        {rViews("menu right")}
                        {(Application.domain === "teaching") ?
                            <FormattedMessage id="ModelDashBoard.ModelMenu.LabelCopy" defaultMessage="Copy">
                                {x => <input type="button" className="icon right large-copy" title={x} disabled={Utils.enabled(detail !== undefined && !playing)} onClick={modelCopy} />}
                            </FormattedMessage>
                            : null
                        }
                        {sharingEl}
                        {sharingNumEl}
                    </div>
                </span>
            );
        } else {

            return width > 890 ? (
                <div>
                    {save}
                    {saveLayout}
                    {undo}
                    {redo}
                    {rName(width > 1000 ? 300 : 200, true)}
                    {rViews("menu")}
                    <div className="menu icon large-layout">
                        <ul className="ul">
                            <li>
                                <div>
                                    <FormattedMessage id="ModelDashBoard.Views.LabelCustom" defaultMessage="Customize" />
                                </div>
                                <ul className="ul customize">
                                    {predefined.map(e => (
                                        <li key={e}>
                                            <div className={Utils.checked(favorites.has(e))} onClick={layoutToggle.bind(null, e)}>
                                                {e}
                                            </div>
                                        </li>
                                    )).toArray()}
                                    {custom.map(e => (
                                        <li key={e} className="custom">
                                            <div className={Utils.checked(favorites.has(e))} onClick={layoutToggle.bind(null, e)}>
                                                <i>{e}</i>
                                                <div className="remove" onClick={layoutRemove.bind(null, e)} />
                                            </div>
                                        </li>
                                    )).toArray()}
                                    <li className="custom">
                                        <div className="checkbox state" onClick={layoutAdd.bind(null, newLayout)}>Add <i>{newLayout}</i></div>
                                    </li>
                                </ul>
                            </li>
                            {predefined.filterNot(e => favorites.has(e)).map(e => (
                                <li key={e} className={Utils.css(lSelected(e) && "selected")}>
                                    <div onClick={layoutSet.bind(null, e)} {...((typed[e] && typed[e].layouts) ? {} : onHover("layout", e))}>{e}</div>
                                    {(typed[e] || {}).layouts && (
                                        <ul className="ul">
                                            {Seq(typed[e].layouts).map((_, e) => (
                                                <li key={e}><div className={Utils.css(Utils.checked(lSelected(e)))} onClick={layoutSet.bind(null, e)}>{e}</div></li>
                                            )).toArray()}
                                        </ul>
                                    )}
                                </li>
                            )).toArray()}
                            {custom.filterNot(e => favorites.has(e)).map(e => (
                                <li key={e} className={Utils.css("custom", e === layout && "selected")}>
                                    <div onClick={layoutSet.bind(null, e)}><i>{e}</i></div>
                                </li>
                            )).toArray()}
                            <li>
                                <div><FormattedMessage id="ModelDashBoard.Views.LabelWorkspaceLayout" defaultMessage="Workspace Layout" /></div>
                                <ul className="ul">
                                    <li>
                                        <div onClick={layoutRestore.bind(null, false)}>
                                            <FormattedMessage
                                                id="ModelDashBoard.Views.LabelRestoreDefaults"
                                                defaultMessage="From Defaults" />
                                        </div>
                                    </li>
                                    <li>
                                        <div onClick={canRestoreLayout && layoutRestore.bind(null, true)} className={Utils.enabled(canRestoreLayout)}>
                                            <FormattedMessage
                                                id="ModelDashBoard.Views.LabelRestoreFromModel"
                                                defaultMessage="From Model" />
                                        </div>
                                    </li>
                                </ul>
                            </li>

                            {hover && hover.entity === "layout" && rLayoutPreview(hover.property)}

                        </ul>
                    </div>
                    <input type="button" className={Utils.css("icon large-info", layout === "Overview" && "selected")} title="Overview" onClick={layoutSet.bind(null, "Overview")} />
                    <ul className="favorites">
                        {favorites.filterNot(e => (e = typed[e]) && e.minAccess > access).map(e => (
                            <li key={e} className={Utils.css(lSelected(e) && "selected", (typed[e] || {}).layouts && "menu")} onClick={(!(typed[e] || {}).layouts) && layoutSet.bind(null, e)}>
                                <div>{e}</div>
                                {(typed[e] || {}).layouts && (
                                    <ul className="ul">
                                        {Seq(typed[e].layouts).map((_, l) => (<li key={l}><div className={Utils.css("checkbox", Utils.checked(l === layout))} onClick={layoutSet.bind(null, l)}>{l}</div></li>)).toArray()}
                                    </ul>
                                )}
                            </li>
                        )).toArray()}
                    </ul>
                    {sharingEl}
                    {sharingNumEl}
                    <div className={Utils.css("icon large-download menu right", Utils.enabled(detail !== undefined && (model.isPersisted || user)))}>
                        <ul className="ul">
													{
														Seq(ModelType[modelType].exportTypes)
															.map(({ label, name }, k) => (
																<li>
																	<div onClick={modelDownload.bind(null, k)}>
																		{label || name}
																	</div>
																</li>
															))
															.toArray()
													}
                        </ul>
                    </div>
                    <FormattedMessage id="ModelDashBoard.Views.LabelCopy" defaultMessage="Copy">
                        {x => <input type="button" className="icon right large-copy" title={x} disabled={Utils.enabled(detail !== undefined && !playing)} onClick={modelCopy} />}
                    </FormattedMessage>
                </div>
            ) : (
                    <div>
                        {save}
                        {saveLayout}
                        {undo}
                        {redo}
                        {rName(width > 350 ? 200 : 140)}
                        <div className="menu icon large-layout right">
                            <ul className="ul">
                                {Seq(typed).filterNot(e => e.minAccess > access).keySeq().map(e => (<li key={e} onClick={layoutSet.bind(null, e)}><div>{e}</div></li>)).toArray()}
                            </ul>
                        </div>
                    </div>
                );
        }
    }
}

const mapStateToProps = state => ({

});
const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ModelMenu));

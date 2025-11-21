//import Utils from '../../utils';
import React from "react";
import { connect } from "react-redux";
import classNames from "classnames";

import { Range, Seq, Map } from "immutable";

import Application from "../../application.js";
import { WORKSPACE } from "./ModuleDM/Module/actions.js";
import { getSelectedModule } from "./ModuleDM/accessors.js";

//import Scrollable from '../../component/base/scrollable';
//import Preview from '../../component/base/preview';
import Editable from "../../component/base/editable";
//import Slider from '../../component/base/slider';

import Update from "../../action/update.js";
import Add from "../../action/add.js";
import Remove from "../../action/remove.js";
import LearningActivity from "../../entity/learningActivity.js";
import LearningActivityGroup from "../../entity/learningActivityGroup.js";

//import Arrangement from '../../component/base/arrangement';
//import Views from '../../views';
//import Views2 from '../../component/views';
import Confirmation from "../../component/dialog/confirmation";
//import ModelVersion from '../../entity/ModelVersion';
import MovableMenuList from "../../components/AppBar/MovableMenuList/index.jsx";
import ModelVersionDropdown from "../../components/AppBar/ModelVersionDropdown/index.jsx";
import SelectVersionDropdown from "../../components/AppBar/SelectVersionDropdown/index.jsx";
import { FormattedMessage } from "react-intl";
// import { user } from '../../components/AppBar/Menu/index';
import { authUser } from "../../components/AppBar/index";
import { Tooltip as ReactTooltip } from "react-tooltip";
import insightsViews from "../../component/learning/insightsViews.js";

import messages from "./messages.js";

import request from "../../request.js";
import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
// import backgroundImage from "../../../public/images/cert.jpg";
import Anton from "./Anton-Regular.ttf";
import Julius from "./JuliusSansOne-Regular.ttf";
import Pacifico from "./Pacifico-Regular.ttf";
import { sanitizeLayoutName } from "../../layouts.js";
import isEqual from "lodash.isequal";

Font.register({ family: "Anton", src: Anton });
Font.register({ family: "Julius Sans One", src: Julius });
Font.register({ family: "Pacifico", src: Pacifico });

const fnAllowedToEdit =
  (rules = []) =>
  (nRules) => {
    let list = [...rules, nRules];
    return (
      list.reduce((prev, curr) => (curr ? prev + 1 : prev), 0) === list.length
    );
  };

class ModelMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isComplete: false,
      moduleName: "",
    };
  }

  checkIfLessonIsSubmitted = async (lessonId) => {
    const submitted = await request.get(
      `/api/module/${lessonId}/checkStartedLesson?source=modelMenu`
    );
    console.log(
      `submittedIn: ${submitted.data.data.submitted} moduleName: ${submitted.data.data.moduleName}`
    );

		const fnSetCurrentLesson = () => {
			this.props.cc.props.setCurrentLesson(
				submitted.data.data.lessonId,
				lessonId, submitted.data.data.submitted, null, null,
				submitted.data.data.started,
				submitted.data.data.versionId
			);
		}

		if (this.state.isComplete == submitted.data.data.submitted) {
			fnSetCurrentLesson();
		} else {
			this.setState((prev) => ({
				...prev,
				isComplete: submitted.data.data.submitted,
				moduleName: submitted.data.data.moduleName,
			}), fnSetCurrentLesson);
		}
  };

  checkIfModuleIsSubmitted = (props, prevState) => {
    // if currLesson is empty check if lesson is started via request using lessonId
    if (props.currLesson && Object.keys(props.currLesson).length === 0) {
      if (props.detail && props.detail[0]) {
        this.checkIfLessonIsSubmitted(props.detail[0]);
      }
      // return false
    }
    let currLessonStat =
      props.currLesson && props.currLesson.submitted
        ? props.currLesson.submitted
        : false;

    this.state.isComplete == currLessonStat
      ? ""
      : this.setState({ ...prevState, isComplete: currLessonStat });
  };

  componentDidUpdate(prevProps, prevState) {
    if (Application.domain === "learning") {
      if (
				!Map(this.props.currLesson).isEmpty() && 
				(!isEqual(prevProps.currLesson, this.props.currLesson)
					|| !isEqual(prevProps.detail, this.props.detail))
      ) {
        this.checkIfModuleIsSubmitted(this.props, this.state);
      }
    }
  }

  render() {
    const {
      modelLayoutSave,
      modelSave,
      modelIsShareAndEditable,
      modelIsDirty,
      modelCopy,
      modelAddVersion,
      modelUpdate,
      modelSelect,
      modelAllVersionsEditable,
      modelChangeName,
      historyMove,
      canRestoreLayout,
      onHover,
      rView,
      access,
      favorites,
      playing,
      selected,
      cc,
      actions: { onAdd, onEdit },
      setInsightsCategory,
      layoutIsValid,
      layoutIsDirty,
      layoutToggle,
      layoutSet,
      layoutGet,
      layoutGetViews,
      layoutGetKey,
      layoutRestore,
      layoutRemove,
      layoutAdd,
      entitySelect,
      entityUpdate,
      layout,
      saving,
      editable,
      detail,
      versions,
      typed,
      views,
      width,
      hover,
      LayoutDomain,
      showConfimationOnClose,
      modelWorkspace,
      domain,
      model,
    } = this.props;

    const modelName = this.props.modelName;
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let date = new Date();
    let day = date.getDate();
    let month = monthNames[date.getMonth()];
    let year = date.getFullYear();
    let fullDate = `${month} ${day}, ${year}`;

    const handleClick = () => {
      // console.log("handleClick")
      return (
        <div>
          <PDFDownloadLink document={<MyDoc />} fileName="certificate.pdf">
            {({ blob, url, loading, error }) =>
              loading ? "Loading document..." : "Download now!"
            }
          </PDFDownloadLink>
        </div>
      );
    };

    const styles = StyleSheet.create({
      page: {
        flexDirection: "row",
        backgroundColor: "#fff",
        width: "100%",
        // orientation: 'portrait',
      },
      section: {
        width: "100%",
        height: "100%",
        padding: 0,
        backgroundColor: "white",
      },
      image: {
        // objectFit: 'cover',
        position: "absolute",
        minWidth: "100%",
        minHeight: "100%",
        display: "block",
        height: "100%",
        width: "100%",
      },
      text: {
        fontSize: 59,
        textAlign: "center",
        fontFamily: "Anton",
        marginTop: 170,
      },
      student: {
        fontSize: 25,
        textAlign: "center",
        fontFamily: "Julius Sans One",
        marginTop: 40,
      },

      lesson: {
        fontSize: 22,
        textAlign: "center",
        fontFamily: "Pacifico",
        marginTop: 20,
      },
    });
    const MyDoc = () => (
      <Document>
        <Page size="LETTER" orientation="landscape" style={styles.page}>
          <View style={styles.section}>
            <Image
              style={styles.image}
              src="/images/cert.jpg"
              alt="Certificate of Completion"
            />
            <Text style={styles.text}>CERTIFICATE OF COMPLETION</Text>
            <Text style={styles.student}>{this.props.userName}</Text>
            <Text style={styles.lesson}>Has successfully completed</Text>
            <Text style={styles.lesson}>
              {modelName != "" ? modelName : this.state.moduleName}
            </Text>
            <Text style={styles.student}>{fullDate}</Text>
          </View>
        </Page>
      </Document>
    );

    const { isPublic } = (model && model.top) || {};
    let lSelected = () => false;
    let topMenuItems = [];
    let bottomMenuItems = [];
    let bottomAddingElement;
    let topAddingElement;
    let updatePositions;

    const isAllowedToEdit = fnAllowedToEdit([
      editable,
      !isPublic,
      Application.domain !== "learning",
    ]);

    // console.log(model.top.Persisted)
    if (modelWorkspace === WORKSPACE.CONTENT) {
      const module = model.top;

      lSelected = (l) => l === layout;

      const getLAkey = (learn) => "Activities[" + learn.id + "]";
      const selectedLAEntity = Seq(module ? module.LearningActivity : []).find(
        (entity) => lSelected(getLAkey(entity))
      );
      const selectedLAGroup = selectedLAEntity
        ? selectedLAEntity.group
        : undefined;

      const getNextPositionInList = (list) =>
        Seq(list).reduce((val, { position }) => Math.max(val, position), -1) +
        1;

      const addLearningActivity = () => {
        if (!selectedLAGroup) {
          return;
        }
        const ent = new LearningActivity({
          name: Application.defName(selectedLAGroup.activities, "Activity"),
          version: model.id,
          group: selectedLAGroup,
          position: getNextPositionInList(selectedLAGroup.activities), //this sould be always 0, but whatever muheheh
        });
        onAdd(ent);
        return ent;
      };
      const addLearningActivityGroup = () => {
        const allLaGroups = module ? module.LearningActivityGroup : [];

        const group = new LearningActivityGroup({
          name: Application.defName(allLaGroups, "ActivityGroup"),
          position: getNextPositionInList(allLaGroups),
        });
        const la = new LearningActivity({
          name: Application.defName(group.activities, "Activity"),
          version: model.id,
          group,
          position: getNextPositionInList(group.activities),
        });
        entityUpdate([new Add(group), new Add(la)]);
        return group;
      };

      updatePositions = (updates) => {
        return updates.map(
          (entity, position) => new Update(entity, "position", position)
        );
      };

      const removeAndShift = (remove, list) => {
        return [new Remove(remove)].concat(
          updatePositions(list.filter((e) => e != remove))
        );
      };

      bottomAddingElement = isAllowedToEdit(true) && selectedLAGroup && (
        <input
          type="button"
          key="add"
          className="icon base-add-activity"
          title="Add new Activity"
          onClick={addLearningActivity}
        />
      );
      topAddingElement = isAllowedToEdit(true) && (
        <input
          type="button"
          key="add"
          className="icon base-add-activity-group"
          title="Add new Group"
          onClick={addLearningActivityGroup}
        />
      );

      const allLearningActivities = Seq(module ? module.LearningActivity : []);
      const bottomEntities = allLearningActivities
        .filter((e) => e.group === selectedLAGroup)
        .sortBy((e) => e.position);

      const onSelectLA = (learn) => {
        const lk = getLAkey(learn);
        const select = () => layoutSet(lk);
        const m = module.sub(learn.version); //dirty hack haha
        if (m === model) {
          select();
        } else {
          modelSelect(true, m, undefined, lk, select);
        }
      };

      const onRemoveLA = (learn) => {
        if (learn === selectedLAEntity) {
          //select next in the row
          const nextInSameGroup = bottomEntities
            .filter((e) => e != selectedLAEntity)
            .first();
          if (nextInSameGroup) {
            onSelectLA(nextInSameGroup);
            return;
          }
          const nextInAllGroups = allLearningActivities
            .filter((e) => e != selectedLAEntity)
            .first();
          if (nextInAllGroups) {
            onSelectLA(nextInAllGroups);
            return;
          }
        }
      };

      bottomMenuItems = bottomEntities
        .map((learn) => {
          const lk = getLAkey(learn);
          const selectVersion = (version) => {
            cc.entityUpdate([new Update(learn, "version", version.id)]);
          };

          return {
            key: lk,
            content: ({ movable }) => (
              <div className="learning_activity">
                <div className="bottom_name">
                  <div>
                    {isAllowedToEdit(!movable) ? (
                      <Editable
                        value={learn.name}
                        onEdit={(v) => onEdit(learn, "name", v)}
                        editOnDoubleClick={true}
                      />
                    ) : (
                      learn.name
                    )}
                  </div>
                  {isAllowedToEdit(!movable) && (
                    <div
                      className="remove"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showConfimationOnClose(Confirmation, {
                          type: "delete",
                          entity: learn.name,
                          action: () => {
                            onRemoveLA(learn);
                            entityUpdate(
                              removeAndShift(learn, bottomEntities.toArray())
                            );
                          },
                        });
                      }}
                      title="Remove this Activity"
                    />
                  )}
                </div>
                {Application.domain !== "learning" && (
                  <SelectVersionDropdown
                    className="versionsMenu"
                    onEdit={isAllowedToEdit(true) && selectVersion}
                    value={learn.version}
                    versions={versions}
                  />
                )}
              </div>
            ),
            className: "fullWidth",
            entity: learn,
            selected: learn === selectedLAEntity,
            onClick: () => onSelectLA(learn),
          };
        })
        .toArray();

      const topEntities = Seq(
        module ? module.LearningActivityGroup : []
      ).sortBy((e) => e.position);
      topMenuItems = topEntities
        .map((learn) => {
          if (!learn.activities) {
            return null;
          }

          const la = Seq(learn.activities || [])
            .sortBy((e) => e.position)
            .first();
          const lk = getLAkey(la);

          const m = module.sub(la.version); //dirty hack haha
          const select = () => {
            layoutSet(getLAkey(la));
          };

          return {
            key: lk,
            content: ({ movable }) => (
              <div className="learning_activity">
                <div className="bottom_name">
                  <div>
                    {isAllowedToEdit(!movable) ? (
                      <Editable
                        value={learn.name}
                        onEdit={(v) => onEdit(learn, "name", v)}
                        editOnDoubleClick={true}
                      />
                    ) : (
                      learn.name
                    )}
                  </div>
                  {isAllowedToEdit(!movable) && (
                    <div
                      className="remove"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showConfimationOnClose(Confirmation, {
                          type: "delete",
                          entity: learn.name,
                          action: () =>
                            entityUpdate(
                              removeAndShift(learn, topEntities.toArray())
                            ),
                        });
                      }}
                      title="Remove this Activity"
                    />
                  )}
                </div>
              </div>
            ),
            //                    onClick: m === model ? select : modelSelect.bind(null, true, m, undefined, lk, select),
            //                    onClick: m === model ? select : modelSelect.bind(null, true, m, undefined, getLAkey(la)),
            selected: learn === selectedLAGroup,
            entity: learn,
            onClick:
              m === model
                ? select
                : modelSelect.bind(null, true, m, undefined, lk, select),
          };
        })
        .filter((e) => e)
        .toArray();
    } else if (modelWorkspace === WORKSPACE.MODEL) {
      // WORKSPACE.MODEL
      topMenuItems = favorites
        .filterNot((e) => (e = typed[e]) && e.minAccess > access)
        .map((e) => e)
        .toArray();

      lSelected = (l) =>
        !!(l === layout || Seq((typed[l] || {}).layouts).has(layout));

      const selectedTop = topMenuItems.find(lSelected);
      if (selectedTop && typed[selectedTop]) {
        bottomMenuItems = Seq(typed[selectedTop].layouts || [])
          .keySeq()
          .toArray();
      }

      topMenuItems = topMenuItems.map((e) => ({
        key: e,
        label: cc.translateLayoutKey(e),
        selected: lSelected(e),
      }));
      bottomMenuItems = bottomMenuItems.map((e) => ({
        key: e,
        label: cc.translateLayoutKey(e),
        selected: e === sanitizeLayoutName(layout),
      }));
    } else if (modelWorkspace === WORKSPACE.INSIGHTS) {
      const cat = cc.state.insights_category || Seq(insightsViews).first().name;

      // check if user exists
      if (authUser) {
        // check if user has not upgraded account or upgraded to a different account plan rather than 1 and 2
        if (
          !authUser.subscription[0] ||
          (authUser.subscription[0].AccountPlanId != 1 &&
            authUser.subscription[0].AccountPlanId != 2)
        ) {
          // only Overview and Download Student Report tabs are allowed when teachers' accounts are not upgraded yet
          let allowed = ["Overview", "Download Student Report"];

          // only get the allowed keys
          let filtered = Object.keys(insightsViews)
            .filter((key) => allowed.includes(key))
            .reduce((obj, key) => {
              obj[key] = insightsViews[key];
              return obj;
            }, {});

          topMenuItems = Seq(filtered)
            .map((v, k) => {
              return {
                selected: cat === k,
                label: v.name,
                key: k,
                onClick: setInsightsCategory.bind(null, k),
              };
            })
            .toIndexedSeq();
        }
        // if the teachers upgraded their accounts properly, display all tabs
        else if (
          authUser.subscription[0].AccountPlanId == 1 ||
          authUser.subscription[0].AccountPlanId == 2
        ) {
          topMenuItems = Seq(insightsViews)
            .map((v, k) => {
              return {
                selected: cat === k,
                label: v.name,
                key: k,
                onClick: setInsightsCategory.bind(null, k),
              };
            })
            .toIndexedSeq();
        }
      }

      // topMenuItems = Seq(insightsViews).map((v, k) => {
      // 	return {
      // 		selected: cat === k,
      // 		label: v.name,
      // 		key: k,
      // 		onClick: setInsightsCategory.bind(null, k)
      // 	}
      // }).toIndexedSeq();
    }

    const toNum = (bool) => (bool ? 1 : 0);
    return [
      <div>
        {modelWorkspace === WORKSPACE.MODEL && (
          <ModelVersionDropdown
            layout={layout}
            select={(model) => modelSelect(true, model, null, layout)}
            className="menu menuVersionSelect"
            edit={domain !== "learning"}
            versions={versions}
            editable={layout !== "Overview" && isAllowedToEdit(true)}
            width={width > 1000 ? 300 : 200}
          />
        )}
        <div className={classNames("menu", "menuBar", modelWorkspace)}>
          {modelWorkspace === WORKSPACE.CONTENT && (
            <ul>
              <li
                className={classNames(
                  layout == "Overview" && "selected",
                  "Overview"
                )}
              >
                <div
                  onClick={() => layoutSet("Overview")}
                  className="learning_overview"
                >
                  <FormattedMessage {...messages.Overview} />
                </div>
              </li>
            </ul>
          )}
          {Application.domain !== "learning" && topAddingElement}
          <MovableMenuList
            className={`menuScrollbar ` + layout}
						updatePositions = {true}
            // updatePositions={
            //   isAllowedToEdit(true) &&
            //   updatePositions &&
            //   ((positions) =>
            //     entityUpdate(updatePositions(positions.map((e) => e.entity))))
            // }
            items={topMenuItems.map(
              ({ key, onClick, selected, className, ...args }) => {
                const selectionLayout =
                  Seq((typed[key] || {}).layouts)
                    .keySeq()
                    .first() || key;
                return {
                  ...args,
                  className: classNames(
                    className,
                    selected && "selected",
                    key.replace(/[^A-Za-z0-9]/g, "_")
                  ),
                  onClick: onClick || layoutSet.bind(null, selectionLayout),
                };
              }
            )}
            responsive={true}
            layout={layout}
          />
        </div>
      </div>,
      <div>
        <div className={classNames("menu", "menuBar", modelWorkspace)}>
          {Application.domain !== "learning" && bottomAddingElement}
          {bottomMenuItems && (
            <MovableMenuList
              className="menuScrollbar bottom_tabs"
              updatePositions={
                isAllowedToEdit(true) &&
                updatePositions &&
                ((positions) => {
                  return entityUpdate(
                    updatePositions(positions.map((e) => e.entity))
                  );
                })
              }
              items={bottomMenuItems.map(
                ({ key, onClick, selected, className, ...args }) => {
                  return {
                    ...args,
                    className: classNames(
                      className,
                      selected && "selected",
                      key.replace(/[^A-Za-z0-9]/g, "_")
                    ),
                    onClick: onClick || layoutSet.bind(null, key),
                  };
                }
              )}
              layout={layout}
            />
          )}

          {/* certificate generate start  */}
          {authUser ? (
            authUser.subscription.length > 0 ? (
              <PDFDownloadLink document={<MyDoc />} fileName="certificate.pdf">
                {({ blob, url, loading, error }) =>
                  Application.domain === "learning" && this.state.isComplete ? (
                    <input type="button" className="icon base-download" style={{display: 'none'}} />
                  ) : Application.domain === "learning" ? (
                    <div>
                      <span
                        data-type="light"
                        data-tip
                        data-for="disabled-button"
                      >
                        <input
                          type="button"
                          className="icon base-download"
                          disabled
                        />
                      </span>
                      <ReactTooltip
                        id="disabled-button"
                        place="top"
                        effect="solid"
                      >
                        Complete the activity to unlock this feature
                      </ReactTooltip>
                    </div>
                  ) : (
                    <div></div>
                  )
                }
              </PDFDownloadLink>
            ) : Application.domain !== "learning" ? (
              <div>
                <span data-type="light" data-tip data-for="disabled-button">
                        <input
                          type="button"
                          className="icon base-download"
                          disabled
                          style={{display: 'none'}}
                        />
                </span>
                <ReactTooltip id="disabled-button" place="top" effect="solid">
                  Upgrade your account to unlock this feature
                </ReactTooltip>
              </div>
            ) : (
              <div style={{ margin: "0px" }}></div>
            )
          ) : Application.domain !== "research" && (
            <div>
              <span data-type="light" data-tip data-for="disabled-button">
                <input type="button" className="icon base-download" disabled style={{display: 'none'}} />
              </span>
              <ReactTooltip id="disabled-button" place="top" effect="solid">
                Sign up and Upgrade to unlock this feature
              </ReactTooltip>
            </div>
          )}
          {/* certificate generate end */}
          {(authUser &&
            Application.domain === "teaching" &&
            authUser.subscription[0] &&
            (authUser.subscription[0].AccountPlanId == 1 ||
              authUser.subscription[0].AccountPlanId == 2)) ||
          Application.domain === "learning" || Application.domain === "research" ? (
            <div></div>
          ) : (
            <div key={"info"} style={{ margin: "5px 0" }}>
              <span data-type="light" data-tip data-for="disabled-button">
                <input
                  type="button"
                  className="icon large-info"
                  style={{ "borderRadius": "20px" }}
                />
              </span>

              <ReactTooltip id="disabled-button" place="top" effect="solid">
                Upgrade to Premium Access plan to unlock "Benchmarks" and
                "Learning Objectives" tabs
              </ReactTooltip>
            </div>
          )}
        </div>
      </div>,
    ];
  }
}

const mapStateToProps = (state) => ({
	// modelSelectedState: state,
  modelWorkspace: getSelectedModule(state)?.workspace,
  domain: state.app.domain,
});

export default connect(mapStateToProps)(ModelMenu);

/**
 * if authuser exists
 *  = move to signed in user -> no react tooltip for guest
 *  * 		if subscribed
 * 						-> react tooltip saying that user needs to complete the activity
 * 				if not subscribed
 * 						-> react tooltip saying that user needs to upgrade there account
 *
 * else if authuser not exist
 *  = react tooltip for guest

 *
 */

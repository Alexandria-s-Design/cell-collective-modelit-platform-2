import React from 'react';
import { connect } from 'react-redux';
import {Outlet, useOutletContext, useLocation} from 'react-router-dom';
import Immutable, { Seq, Set, List, Map } from 'immutable';
import Utils from '../../utils';
import { getTimezoneInfo } from '../../util/timezone';
import Persist from '../../mixin/persist';
import ModelPersist from '../../mixin/modelpersist';
import Frame from '../../mixin/frame';
import Dialog from '../../mixin/dialog';
import Application from '../../application';
import LoggerMixin from '../../component/loggerMixin';
import UserMixin from '../../component/userMixin';
import LayoutMixin from '../../component/layoutMixin';
import ModelMixin from '../../component/modelMixin';
import EntityMixin from '../../component/entityMixin';
import StateMixin from '../../component/stateMixin';
import HistoryMixin from '../../component/historyMixin';
import CourseMixin from '../../component/courseMixin';
import View from '../../component/views';
import Add from '../../action/add';
import Remove from '../../action/remove';
import Update from '../../action/update';
import UpdateProperty from '../../action/updateProperty';
import Model from '../../entity/model';
import ModelVersion from '../../entity/ModelVersion';
import ModelEntity from '../../entity/modelEntity';
import Component from '../../entity/Component';
import Reference from '../../entity/reference';
import Document from '../../entity/document';
import Link from '../../entity/link';
import Sharing from '../../entity/sharing';
import SimulationRealtime from '../../analysis/simulationRealtime';
import LogPlayer from '../../logPlayer';
import Draggable from '../../component/base/draggable';
import Editable from '../../component/base/editable';
import CourseAdd from '../../component/dialog/courseAdd';
import Message from '../../component/dialog/message';
import Progress from '../../component/dialog/progress';
import Confirmation from '../../component/dialog/confirmation';
import SignIn from '../../component/dialog/signIn';
import SignUp from '../../component/dialog/signUp';
import OptionsDialog from '../../component/dialog/options';
import UnauthorizeOnTeachDomain from '../../component/dialog/unauthorizeOnTeachDomain';
import FileInput from '../../component/base/fileInput';
import PleaseSignInOrSignUp from '../../component/dialog/pleaseSignInOrSignUp';

import ModelMenu from './modelMenu';
import Entity from '../../entity/Entity';

import AccessControl from '../ACL/AccessControl';

import Loadable from '../../components/Loadable';
import AppBar from '../../components/AppBar';
import Modal from '../../components/Modal';
import AdminDashboard from '../../admin';
import RedirectToCreateModel from '../ModelCreateRedirect'

// temporary patch - otherwise the Annotation entity is never initialized :/
// removing this line WILL BREAK things (unless Annotation is initialized elsewhere!)
import Annotation from '../../entity/metabolic/Annotation';

/// #if !splitChunks
import BooleanAnalysis from '../../analysis/boolean';
import AnalysisContainer from '../../analysis';
/// #endif

import FluxBalanceAnalysis from '../../component/metabolic/Analysis/FluxBalanceAnalysis';
import FluxVariabilityAnalysis from '../../component/metabolic/Analysis/FluxVarianceAnalysis';

import QueryString from 'query-string';
import { FormattedMessage, injectIntl } from 'react-intl';
//import viewsMessages from '../../viewsMessages';
import messages from './messages';

import { doDirtyUpdate } from '../../reducers/auth/actions';
import { updateSavingStatus } from './actions';
import { changeWorkspace, WORKSPACE } from './ModuleDM/Module/actions';
import { getSelectedModule } from './ModuleDM/accessors';
import { modelsInit, modelsReplace, modelCopy, modelSelect, modelsRemove, setCurrentLessonAction } from './ModuleDM/actions';
//import * as CookieManager from "../../util/cookies";
//import view from '../../component/base/view';
import { CourseMenuToolbar } from '../teach/course/Components/CourseMenuToolbar';

import URLActionTemplate, { URLActionType, ENROLL_COURSE } from '../../util/URLActionTemplate';

//import AppUtil from "../../util/app";
import ErrorBoundary from '../../component/base/errorBoundary';

import cc, {ModelType, AdminAccounts} from '../../cc';


import GIMMEAnalysis from '../../component/metabolic/ContextSpecific/Analysis/GIMME';
import iMATAnalysis from '../../component/metabolic/ContextSpecific/Analysis/iMAT';
import FastCoreAnalysis from '../../component/metabolic/ContextSpecific/Analysis/FastCore';
import mCADREAnalysis from '../../component/metabolic/ContextSpecific/Analysis/mCADRE';
import iNITAnalysis from '../../component/metabolic/ContextSpecific/Analysis/iNIT';

import KineticAnalysis from '../../component/kinetic/Analysis/KineticAnalysis';
import PbpkAnalysis from '../../component/pharmacokinetic/Analysis/virtualClinicTrial/PbpkAnalysis';

import './style.scss';

import { APP_RESTART_LESSON, APP_RESUME_LESSON, APP_START_LESSON } from '../../util/constants';
import errorResponse from '../../util/errorResponse';

import ModelMenuToolbar from '../../components/AppBar/ModelMenuToolbar';
import LessonNavigation from '../../components/LessonNavigation';

import { COURSE_PATH_INDEX } from "../../component/courseMixin";
import ThirdPartySignIn from '../ThirdPartySignIn';
import { ccappRequest, getLoggedUser } from '../../request';
import { history } from '../../store';
import { isEditEnabled } from '../../util/permissionsUtil';

export const MODEL	= 'model';
export const MODULE = 'module';
export const ACTION = 'action';
export const COURSE = 'course'; 

const getAnalysis = name => {
  return () => import('../../analysis')
      .then(e => {
				if (!e.default) {
					throw new Error(`The imported function '${name}' does not have a default property.`);
				}
        if (!e.default[name]) {
          throw new Error(`The function "${name}" does not exist in the Analysis.`);
        }
        return e.default[name];
      })
			.catch(err => {
        console.error('ERROR: Importing analysis: ', err);
      });
};

const SimulationsGet = {
  '': getAnalysis('SimulationDynamic'),
  EnvironmentSensitivity: getAnalysis('EnvironmentSensitivity'),
};
const BooleanAnalysisGet = () => import('../../analysis/boolean').then(e => e.default);

const ArrangementLazy = React.lazy(() => import('../../component/base/arrangement'));
const Arrangement = function(props) {
  //   const [loading, setLoading] = React.useState(true);
  // React.useEffect(() => {
  // 	const t_wait = setTimeout(() => setLoading(false), 2500)
  // 	return () => clearInterval(t_wait);
  // }, []);
  // if (loading) return <span></span>
  return <ArrangementLazy {...props} />;
};
const ArrangementMemo = React.memo(Arrangement);

const AnalysisFetcher = {
  fba: FluxBalanceAnalysis,
  fva: FluxVariabilityAnalysis,
  gimme: GIMMEAnalysis,
  imat: iMATAnalysis,
  fcore: FastCoreAnalysis,
  mcadre: mCADREAnalysis,
  init: iNITAnalysis,
};

const CCContext = React.createContext('cc');
const CCEntities = React.createContext('entities');
const CCLayouts = React.createContext('cclayouts');
const CCViews = React.createContext('ccviews');
const CCActiveLayout = React.createContext('ccactivelayout');

let mdlName = "";


const appBarTitle = ({model, isDirty, isSaving, user}) => {
	let label='', divider=' - ', cssClass='saved';
	// if (Application.isResearch && !isDirty) {
	// 	label = "Autosaved";
	// } else if (isDirty) {
	// 	label = "changes not saved";
	// }
	if(!user){
		label = "You are not logged in, your work will not be saved.", cssClass="not-saved";
	} else {
		if (isDirty) {
			label = "changes not saved", cssClass="not-saved";
		} 
		if (isSaving) {
			label = "saving...", cssClass="saved";
		}
	}
	return (<span>
		<span className='modelName'>{model.name} ({model.id})</span>
		{false && <span>{label && divider}<span className={cssClass}>{label}</span></span>}
	</span>)
}

function handleSaveModel() {
  if (!this.modelIsDirty || !this.isAuthenticated()) {
    return;
  }
  this.modelSave();
}

function intervalProc(data) {
  return {
    start: (cbs = []) => {
      for (const cb of cbs) {
        this[cb](data);
      }
    },
    store: id => {
      this.intervalIds.push(id);
    },
    status: () => {
      return this.state.stopInterval;
    },
    clear: () => {
      if (!this.intervalIds) return;
      for (const t of this.intervalIds) {
        clearInterval(t);
      }
      this.intervalIds = [];
    },
  };
}

class Main extends Utils.MyComponent {
  // Sometime. displayName is undefined. therefore explicitly define displayName
  // Don't touch if you don't know :)
  static displayName = 'Main';

  constructor(...args) {
    super(...args);

    this.userAnonymous = this.userAnonymous.bind(this);
		this.loggedUser = getLoggedUser();

    //BEGIN: interval timer settings
    this.intervalIds = [];
    this.fnIntervalProc = intervalProc.bind(this);
    //END: interval timer settings
  }

  getInitState(m) {
    this.Model = {};
    this.BaseIdMap = {};
    cc.context = this;

    this.Persisted = {};

		this.lessonStatusX = {started: null, submitted: null}

    //reject all previous pending promises
    Seq(this.Pending || {}).forEach(modelPromises => {
      Seq(modelPromises).forEach(({ reject }) => reject());
    });
    this.Pending = {};

    this.Analyses = {
      '': {},
      EnvironmentSensitivity: {},
      fba: {},
      fva: {},
    };

    const { props } = this;

    const sectionMap = {
      research: props.intl.formatMessage(messages.LabelPublishedModels),
      teaching: props.intl.formatMessage(messages.LabelPublicModules),
      learning: props.intl.formatMessage(messages.LabelPublicModules),
    };

    return Utils.extend(this.layoutGetInitState(m), {
      section: [sectionMap[Application.domain]],
      simulation: new Immutable.Map({ speed: -1, window: 50 }),
      joyRideStepsCompleted: new Set(),
      joyRidePhase: 1,
      completedJoyride: new Set(),
			// lessonStatus: {started: null, submitted: null}
			loadedSurveys: new Set(),
    });
  }
  ajaxPromise(method, data, user, type, resend) {
    return new Promise((resolve, reject) => {
      this.ajax(method, data, resolve, reject, user, type, resend);
    });
  }
  ajax(method, data, action, error, user, type, resend, { requestMethod } = {}) {
    let xhr = new XMLHttpRequest();
    const useMethod = requestMethod ? requestMethod : data ? 'POST' : 'GET';
    xhr.open(useMethod, new URL(method, Application.api+"/"));
    type && type !== true && (xhr.responseType = type);
    data && !(data instanceof FormData) && xhr.setRequestHeader('content-type', 'application/json');
    user = user || this.state.user;
    user && user.token && xhr.setRequestHeader('X-AUTH-TOKEN', user.token);
		user && user.token && xhr.setRequestHeader('Authorization', `Bearer ${user.token}`);
    this.accessCode && xhr.setRequestHeader('TEMP-ACCESS', this.accessCode);
    xhr.setRequestHeader('OVRDDOMAIN', Application.domains.to[Application.domain]);
    
    const timezoneInfo = getTimezoneInfo();
    xhr.setRequestHeader('X-Timezone', timezoneInfo.timezone);
    xhr.setRequestHeader('X-Timezone-Offset', timezoneInfo.offset.toString());
    
    if (useMethod === 'GET') {
      xhr.setRequestHeader('Origin', window.location.origin);
    }
    if (useMethod === 'POST') {
      xhr.setRequestHeader('Domain', Application.domain);
    }
    action &&
      (xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          /* NOTE: Using 202 ACCEPTED for confirming valid actions */
          if (xhr.status === 202) {
            // confirm the action, using the response
            try {
              const resdata = JSON.parse(xhr.responseText).data;
              this.showDialog(Confirmation, {
                okText: resdata.yes || 'Yes',
                cancelText: resdata.no || 'No',
                message: resdata.message,
                onCancel: () => {
                  if (!resdata.fallback) return;

                  if (resdata.discard) {
                    delete this.Workspace[resdata.discard];
                    delete this.Model[resdata.discard];
                  }

                  const model = this.Model[resdata.fallback];
                  this.modelSelect(null, model);
                },
                action: this.ajax.bind(
                  this,
                  method,
                  {
                    ...data,
                    confirm: true,
                  },
                  action,
                  error,
                  user,
                  type,
                ),
              });
            } catch (e) {
              this.showDialog(Message, { message: 'Received an invalid response from the server.' });
              return;
            }
          } else if (xhr.status === 200 || xhr.status === 201) {
            const safeParse = resTxt => {
              let data;
              try {
                data = JSON.parse(resTxt);
              } catch (e) {
                data = {
                  error: e,
                  response: resTxt,
                };
              }
              return data;
            };
            action(type ? (type === 'blob' ? xhr.response : xhr.responseText) : safeParse(xhr.responseText));
          } else if (xhr.status === 403 && resend) {
            this.showDialog(SignIn, {
              action: (u, t) => this.userSignIn(u, t, () => this.ajax(method, data, action, error, user, type), error),
              forgotPassword: this.userForgotPassword,
            });
          } else {
            if (error) {
              if (['blob'].includes(xhr.responseType)) {
                error(JSON.stringify({ code: xhr.status, error: { errors: [{ message: xhr.statusText }] } }), xhr.status);
              } else {
                error(xhr.responseText, xhr.status);
              }
            }
            method !== '_api/client/log' && xhr.status === 400 && this.ajax('_api/client/log', { apierror: 'HTTP status 400', method: method, data: data });

            let showErrorTextFromBlob = blob => {
              let fileReader = new FileReader();
              fileReader.onload = () => {
                this.showDialog(Message, { message: fileReader.result });
              };
              fileReader.readAsText(blob);
            };

            /^_api\/model\/export\//g.test(method) && xhr.status === 500 && showErrorTextFromBlob(xhr.response);
          }
        }
      });
    try {
      xhr.send(data && (data instanceof FormData ? data : JSON.stringify(data)));
    } catch (e) {
      error();
      throw e;
    }
  }
  download(method, file, type) {
    let downloading = false;
    if (type == 'SBML') {
      downloading = true;
      // this.showDialog(Message, { message: `Downloading ${type} file...` });
    }

    this.ajax(
      method,
      null,
      e => {
        if (downloading == true) {
          this.showDialog(Message, { message: `Download ${type} completed!` });
        }
        return Utils.downloadBinary(file, e);
      },
      err => {
        let code = 502,
          message = '';
        try {
          const jsonRes = errorResponse(err);
          code = jsonRes.code;
          message = jsonRes.message;
        } catch (e) {
          message = e.toString();
        }
        this.showDialog(Message, { message: `[${code}]. Something went wrong when downloading ${type}. ${message}` });
      },
      null,
      'blob',
    );
  }
  UNSAFE_componentWillMount(...args) {
    super.UNSAFE_componentWillMount && super.UNSAFE_componentWillMount(...args);

    let state = {};

    // let e = window.location.hash.substr(1);
    // Utils.isGuid(e) && (this.accessCode = e);

    let stats = () => {
      let e = this.modelGetSelectedDetail();
      e.isPersisted && this.simulationStats(e, 'Realtime', 1);
    };

    this.simulationRealtime = new SimulationRealtime(
      () => this.state.simulation,
      () => this.state[this.stateGetKey(this.state)],
      () => this.modelGetPath(this.state.detail),
      () => this.state.Model.getIn(this.state.detail),
      stats,
      this.stateSetInternal.bind(this),
      this.entityUpdate.bind(this),
      this.loggerAdd.bind(this),
    );

    this.logPlayer = new LogPlayer(this.loggerInit.bind(this), this.loggerExecute.bind(this), e => this.setState({ logPlayer: e }));

    let path = this.routerGetModelPath();
    let user = this._persisted && this._persisted[null] && this._persisted[null].user;

    let id = path && path[0];

        if (id > 0 || this.accessCode || user) {
            state = {
                master: id > 0 ? id : undefined
            };
            id <= 0 && (state.layout = undefined);
            this._persisted && this._persisted[null] && this.layoutSection(state, this._persisted[null].section, user);
            this.setState(state);
        }
    }
    async componentDidUpdate(prevProps, prevState) {
			const justGotAuth = (!prevState.user && this.state.user);
      const fromOtherUrlToActionUrl = prevState.locationHash != this.state.locationHash &&
        prevState.locationHash?.split('/', 2)[0] !== ACTION &&
				this.state.locationHash?.split('/', 2)[0] === ACTION;
				if ((this.state.user && fromOtherUrlToActionUrl) || justGotAuth) {
        const [ type, rest ] = this.hashRoute.split('/', 2);
				if (type !== ACTION) { return; }
				const urlAction = URLActionTemplate.fromHashURL(rest);
				if (urlAction.actionType === ENROLL_COURSE) {
					await urlAction.execute({UserId: this.state.user?.app_user_id, CourseId: urlAction.params.courseId});
				}
			window.history.pushState(null, null, '#');
      }
    }

		

  componentDidMount(...args) {
    super.componentDidMount && super.componentDidMount(...args);
		
		const { user } = this.state;
		const loggedUser = this.loggedUser;

		if (!user && loggedUser?.token && loggedUser?.email) {
			this.userSyncSession(loggedUser?.email, loggedUser.token);
		}

    const query = QueryString.parse(window.location.search);
    if (query.dashboard !== undefined && !user) {
      this.userAnonymous();
      // this modal only pop up on teach. It would be anoying if it keep poping up on other domain.
      const [type, rest] = this.hashRoute.split('/', 2);
      if (Application.domain == 'teaching' || type === ACTION) {
        this.showDialog(SignIn, {
          action: !user && this.userSignIn.bind(this),
          forgotPassword: this.userForgotPassword.bind(this),
        });
      }
    }

    if (query.dashboard !== undefined && query.sl !== undefined) {
      this.ajax('api/users/me/session', null, res => {
        const data = res.data;
        this.userSignIn(data.user, data.token);
      });
    } else {
      if (Application.domain == 'teaching' && !this.getTeachDomainAccess() && query.dashboard) {
        this.userSyncSession();
      }
    }

    // scrap transfer-auth-token if we are on the dashboard page
    // if( query.dashboard )
    //     CookieManager.DeleteCookie('transfer-auth-token');

    window.onbeforeunload = () => {
      this.loggerSend();
      return user && Seq(this.b).some((v, k) => !v.isPersisted || this.state.Model.get(k) !== this.Persisted[k].self) ? 'You have unsaved changes in your models.' : undefined;
    };

		this.setState((prev) => ({...prev, locationHash: window.location.hash.substring(1)}));

		// Redirect user based on model hash
		if (query.modelHash) {
			this.getAccessCode(query.modelHash, async (success, access) => {
				if (success && access.modelId) {
					setTimeout(async () => {
						history.push(`/dashboard#module/${access.modelId}:0`);
						await this.routerExecuteURL();
					}, 300);
				}
			});
		}
  }
	
	get hashRoute() {
		return window.location.hash.substring(1);
	}

	routerGetCourse() {
		return parseInt(this.hashRoute.split('/')[COURSE_PATH_INDEX]);
	}

	
	routerGetModelPath(path = this.hashRoute) {
		const [type, rest] = path.split('/', 2);

		if (!/^(a-zA-Z)+$/.test(type)) {
			if (type === MODULE) {
				return this.routerGetModelPath(rest);
			} else if (type === ACTION) {
				return null;
			} else if (type === COURSE) {
				//TODO handle different routes
				this.routerGoTo();
				return null;
			}
		}

		const p = path.split('/', 1)[0];
		//For clearing out url for unsaved versions
		const modelPath = p.length && p.split(':');
		return modelPath
	}

	routerGoTo(e, action) {
		const getPath = () => {
			if (!e) {
				return '';
			}

			let paths = e;
			if (e instanceof ModelEntity) {					
				paths = [
					MODULE,
					e.persistedPath.join(':'),
					e.pathEl
						.filter(e => e.name)
						.map(e =>
							e.name
								.toLowerCase()
								.replace(/-+/g, '')
								.replace(/\s+/g, '-')
								.replace(/[^a-z0-9-]/g, ''),
						)
						.join('/'),
				];

				if (this.state.course) {
					paths.push(this.state.course.toString());
				}
			}

			return paths.join('/');
		};

		window.history[(action || 'push') + 'State'](null, null, '#' + getPath());
	}

	
	routerDashboard() {
		// TODO: active the new dashboard
		const newPath = Application.domain === 'research' ? '/research/dashboard/' : '/dashboard/';
		// const newPath = '/dashboard/';
		return window.location.href = `${window.location.origin}${newPath}`;	
	}
	
	routerHome() {
		const s = this.state;
		const news = s.help ? { help: false } : s.layout ? { layout: undefined } : s.searchValue ? { searchValue: undefined, searchResult: undefined } : { section: s.section.slice(0, 1) };
		news.detail = undefined;
		news.version = undefined;
		this.setState(news);
		this.routerGoTo();
	}

	
	routerAccountUpgrade() {
		this.setState({ detail: undefined, version: undefined, layout: 'AccountUpgrade' });
		this.routerGoTo();
	}
	

	triggerSimulation(experData) {
			const intervalValue = setInterval(() => {
					// console.log((new Date()).getTime(), " RUNNING SIMULATION");
					Seq(this.Analyses).forEach((data, simulationType) => {
							data = Seq(data);

							if (experData && experData.modeltype == 'metabolic') {
								if (experData.type == simulationType && data.isEmpty()) {
									this.fnIntervalProc().clear();
									// console.log((new Date()).getTime(), " STOPPED EMPTY SIMULATION");
								}
							}

        if (data.count()) {
          let state = {};

          data.groupBy(e => this.stateGetKey(e.model)).forEach((v, k) => (state[k] = this.state[k].updateIn(['Experiment', simulationType], e => e.mergeDeep(v.map(e => new Immutable.Map(e.data))))));
          this.setState(state);

          let completed = data.filter(e => e.data.state === 'COMPLETED').cacheResult();
          if (completed.size) {
            this.fnIntervalProc().clear();
            console.log(new Date().getTime(), ' STOPPED SIMULATION');

            let stats = (v, e) => this.simulationStats(v.model, 'Dynamic', e.numSimulations, v.data.elapsedTime);
            completed.forEach((_, k) => delete this.Analyses[simulationType][k]);

            if (simulationType === '') {
              if (this.state.user) {
                let f = () =>
                  completed.forEach((v, k) => {
                    let e = v.model.Experiment[k];
                    if (!e.userId && e.isPersisted) {
                      let outputs = v.model.OutputRange;
                      let components = v.model.Component;
                      let payload = Seq(v.data.analysis)
                        .mapEntries(([k, v]) => [
                          outputs[k].Persisted,
                          Seq(v)
                            .mapEntries(([k, v]) => [components[k].Persisted, v.map(e => e.toFixed(1))])
                            .toObject(),
                        ])
                        .toObject();

                      this.ajax('_api/simulate/save/' + e.Persisted, payload);
                    }
                    stats(v, e);
                  });
                completed.some(e => this.modelIsDirty(e.model)) ? this.modelSave(f).then(() => {}) : f();
              } else {
                completed.filter(e => e.model.isPersisted).forEach((v, k) => stats(v, v.model.Experiment[k]));
              }
            }
          }
        }
      });
    }, 600);
    this.fnIntervalProc().store(intervalValue);
  }

  triggerExperiment() {
    const intervalValue = setInterval(() => {
      let { detail } = this.state;
      if (detail) {
        let model = this.modelGetPath(detail);
        let state = this.state[this.stateGetKey(this.state)].getIn(['Experiment', '']);
        let running = Seq(model.Experiment)
          .filter(e => state.getIn([e.id, 'state']) === 'RUNNING' && !this.Analyses[''][e.id])
          .cacheResult();
        if (running.size) {
          let map = running.mapEntries(([k, v]) => [v.Persisted, k]).toObject();
          this.ajax('_api/simulate/dynamic/status?' + running.map(e => 'id=' + e.Persisted).join('&'), null, data => {
            let state = this.state[this.stateGetKey(this.state)];
            this.stateSetInternal(
              this.state,
              ['Experiment', ''],
              state.getIn(['Experiment', '']).withMutations(m => {
                m.mergeDeep(Seq(data).mapEntries(([k, v]) => [map[k], new Immutable.Map(v)]));
                let completed = Seq(data)
                  .filter((v, k) => v.state === 'COMPLETED')
                  .cacheResult();
                if (completed.size) {
                  completed.forEach((_, k) => m.deleteIn([map[k], 'analysis']));
                  let e = state.getIn(['selected', 'Experiment', '']);
                  if (e) {
                    e = model.Experiment[e];
                    completed.has(e.Persisted) &&
                      this.ajax('_api/simulate/get/' + e.Persisted + '?' + Date.now(), null, data => {
                        let f = e =>
                          Seq(e)
                            .mapEntries(([k, v]) => [v.Persisted, k])
                            .toObject();
                        let outputs = f(model.OutputRange);
                        let components = f(model.Component);
                        this.stateMerge(
                          this.state,
                          ['Experiment', '', e.id],
                          new Immutable.Map({
                            state: 'COMPLETED',
                            bitsAvailable: true,
                            analysis: Seq(data)
                              .mapEntries(([k, v]) => [
                                outputs[k],
                                Seq(v)
                                  .mapEntries(([k, v]) => [components[k], v])
                                  .toObject(),
                              ])
                              .toObject(),
                          }),
                        );
                      });
                  }
                }
              }),
            );
          });
        }
      }
    }, 1000);
    // if (Application.isResearch) {
    // 	setInterval(() => {
    // 			if ( this.modelIsDirty && this.isAuthenticated()) {
    // 					this.modelSave();
    // 			}
    // 	}, 2500);
    // }
    this.fnIntervalProc().store(intervalValue);
  }

  async startExperiment(e, props, immediate, type = '') {
    this.loggerAdd('Simulation', { action: 'start', type, entity: e.globalId });

    let path = this.state.detail;
    let model = this.modelGetPath(path);
    let state = this.state[this.stateGetKey(this.state)].getIn(['Experiment', type, e.top.id]) || new Immutable.Map();

    let f = p => {
      let o = { state: p, percentComplete: 0, elapsedTime: 0 };
      let s = this.state[this.stateGetKey(this.state)].getIn(['Experiment', type, e.top.id]);
      this.stateSetInternal(this.state, ['Experiment', type, e.top.id], s ? s.merge(o) : new Immutable.Map(o));
    };

    let simulationCallbacks = ['triggerSimulation', 'triggerExperiment'];
    if (model.modelType == 'boolean') {
      if (e.type === '' && e.bits) {
        this.stateSetInternal(this.state, ['Experiment', type, e.top.id, 'state'], 'WAITING');
				this.modelExecute(model, () => 
					this.ajax('_api/simulate/dynamic/start?id=' + e.top.Persisted, null, d => {
						f(d[e.Persisted] ? 'RUNNING' : 'FAILED');
					})
				);
			  } else {
        SimulationsGet[type]().then(Simulation => {
          this.Analyses[type][e.top.id] = new Simulation(model, e, state, immediate);
          f('RUNNING');
        });
      }
    } else if (model.modelType == 'kinetic') {
      simulationCallbacks = [];
      let analysis = new KineticAnalysis(this, e, props);
      analysis.run();
    } else if (model.modelType == 'pharmacokinetic') {
      simulationCallbacks = [];
      let analysis = new PbpkAnalysis(this, e, props);
      analysis.run();
    } else {
      const experimentType = e.experimentType;
      const experimentId = e.top.id;

      const Analysis = AnalysisFetcher[experimentType];

      let analysis;

      if (!this.Analyses[experimentType]) {
        this.Analyses[experimentType] = {};
      }

      try {
        console.info(`Running analysis for ${experimentType}`);
        analysis = new Analysis(this, e, props);
        analysis.run();
      } catch (err) {
        console.error(`Error occurred during analysis run for ${experimentType}:  ${err}`);
      }
    }
    this.fnIntervalProc().clear();
    this.fnIntervalProc({ type: e.experimentType, modeltype: model.modelType }).start(simulationCallbacks);
  }

  simulationStats(e, type, num, time) {
    if (!e.top.Persisted) {
      return;
    }
    this.ajax('_api/simulate/stats/' + e.top.Persisted + '?version=' + e.Persisted + '&type=' + type + '&simulations=' + num + (time !== undefined ? '&runtime=' + time : ''));
  }
  getReference(id, action) {
    let e = Seq(this.modelGetPath(this.state.detail)._Reference).find(e => e.pmid === id || e.doi === id);
    !id || e
      ? action(e)
      : this.ajax(
          '_api/knowledge/lookup?refid=' + id,
          null,
          e =>
            action(
              'error' in e
                ? e
                : Seq(e)
                    .map((v, k) => new Reference(this.convert('Reference', k, v)))
                    .first(),
            ),
          e => action({ error: new Error(e), response: e }),
        );
  }
  startFirstActivity(A = false, model = null) {
    model = model || this.modelGetSelectedDetail();
    const module = model.top;

        //find first group
        const firstGroup = Seq(module.LearningActivityGroup).sortBy(e=>e.position).first();
        const firstAct = Seq(firstGroup ? firstGroup.activities : []).sortBy(e=>e.position).first();
        if(firstAct){
            const layout = `Activities[${firstAct.id}]`;
            const select = () => {
//                if(forceSet)
//                    this.setState({forceLayout: layout});
//                else
                this.layoutSet(layout);
            }

            const m = module.sub(firstAct.version);  //dirty hack haha
            if(m === model){
                select() 
								this.setState({startButtonClicked: true})
            }else{
							 this.modelSelect(true, m, undefined, layout, select) 
							 this.setState({startButtonClicked: true});
            }
        }

        this.props.changeWorkspace(WORKSPACE.CONTENT);
    };

  // Navigation methods for lesson activities
  getAllActivities(model = null) {
    model = model || this.modelGetSelectedDetail();
    if (!model || !model.top) return [];
    
    const module = model.top;
    
    // Get all activities (no sorting needed since position is always 0)
    const allActivities = Seq(module.LearningActivity || []).toArray();
    
    return allActivities;
  }

  // Helper method to extract activity ID from layout string
  _extractActivityIdFromLayout(layout) {
    if (!layout || !layout.startsWith('Activities[')) return null;
    return parseInt(layout.match(/Activities\[(-?\d+)\]/)?.[1]);
  }

  // Helper method to compare activity IDs (handles both string and number)
  _compareActivityIds(activity1, activity2) {
    if (!activity1 || !activity2) return false;
    const id1 = parseInt(activity1.id);
    const id2 = parseInt(activity2.id);
    return id1 === id2 || activity1.id === activity2.id?.toString();
  }

  getCurrentActivity(model = null) {
    model = model || this.modelGetSelectedDetail();
    if (!model || !model.top) return null;
    
    const activityId = this._extractActivityIdFromLayout(this.state.layout);
    if (!activityId) return null;
    
    const allActivities = this.getAllActivities(model);
    return allActivities.find(activity => 
      this._compareActivityIds(activity, { id: activityId })
    );
  }

  navigateToActivity(activity) {
    if (!activity) {
      console.warn('navigateToActivity: No activity provided');
      return;
    }
    
    const layout = `Activities[${activity.id}]`;
    this.layoutSet(layout);
  }

  async addToWorkspace(e) {
    e = await this.modelCopy(e.top.name, e, 'learning', () => ({ Link: [new Link({ accessCode: Utils.newGuid(), access: 1 })] }));
    if (e === null) return;

    this.Workspace[e.originId] = e;
    this.Workspace[e.top.id] = Date.now();
    this.setState({ section: ['Courses'], layout: 'Overview' });
    await this.modelSave(undefined, undefined, true);
    this.startFirstActivity(false);
  }

  async restartActivity() {
    const exists = !!(this.state.user.workspace && this.state.user.workspace[id]); //to check if there is a defined parameter
    const model = this.modelGetSelectedDetail();
    await this.startActivity(model, exists, APP_RESTART_LESSON);
  }

  async startActivity(e, exists, type) {
    if ([APP_START_LESSON, APP_RESTART_LESSON, APP_RESUME_LESSON].includes(type)) {
      this.props.setCurrentLesson(e.top._id, null, false, null, type);

      if (e.top._id) {
        let message = '';
        if (type == APP_RESTART_LESSON) {
          message = `Lesson restarted!`;
        } else if (type == APP_RESUME_LESSON) {
          message = `Lessson Resumed`;
        } else {
          message = `The lesson ${e.top._id} has already started!`;
        }
        this.showDialog(Message, { message });
        return;
      }

      this.startFirstActivity(true);
    }

    const start = async _e => {
      //copy model
      const e = await this.modelCopy(_e.top.name, _e, 'learning');
      if (e === null) return;

      this.Workspace[e.top.id] = e; //: this.ajax("model/edu/add/" + e.top.id);
      this.Workspace[e.top.id] = Date.now();

      if (this.state.user && this.state.user.id) {
        if (type != APP_START_LESSON) {
          await this.modelSave(
            data => {
              const m = Seq(data.deleted);
              m.forEach(k => {
                let id = parseInt(k.split('/')[0]);
                delete this.Model[id];
                delete this.Workspace[id];
              });

              // delete model card for temp model
              Seq(data)
                .filter((_, k) => +k.split('/')[0] < 0)
                .forEach((_, k) => {
                  delete this.Workspace[k.split('/')[0]];
                });
            },
            undefined,
            true,
            type,
          );
        }
      } else {
        // this.showDialog(Message, { message: 'You are not logged in. All of your work done in lessons would be lost after logging in. Please login for being able to save your work.' });
      }

      this.startFirstActivity(true);

      if (e.top.Persisted > 0) {
        this.props.setCurrentLesson(e.top.Persisted, null, false, null);
      }
    };
    if (!e) return;
    await start(e);
  }

  async submitActivity(e) {
    const wasBlocking = !!this.state.blockSubmit;
    console.log('Blocking submit', this.state.blockSubmit);
    console.log('Was Blocking', wasBlocking);

    this.setState({
      blockSubmit: true,
    });

    const { detail } = this.state;
    const model = this.modelGetPath(detail);
    if (this.course === null && Number(model.top.Persisted) >= 0) {
      this.setState({ blockSubmit: wasBlocking });
			let course;
			try {
      	course = await this.coursePrompt(model.top.Persisted);
			} catch(err) {
				console.error("Error while fetching the course: ", err)
				throw err;
			}

      if (course) {
        await this.courseSelect(course);
        this.setState({
          blockSubmit: wasBlocking,
        });
        this.submitActivity(e);

        return;
      }
    }

    const doSubmit = () => {

			let lessonId = e.top._id || e.top.id;
			let originId = lessonId;

			if (this.props.currLesson && this.props.currLesson.id) {
				lessonId = this.props.currLesson.versionId;
				originId = this.props.currLesson.originId;
			}

      cc.request
        .post(`/api/module/${lessonId}/submit`, {
          forCourse: this.course, originId
        })
        .then(() => {
          console.log('Submitted lesson');
          this.showDialog(Message, {
            message: 'Lesson submitted.',
            onSubmit: async () => {
							if (Application.isModelIt === false) {
								console.log('Changing workspace');
								this.props.changeWorkspace(WORKSPACE.INSIGHTS);
								// this.startFirstActivity(true);
							}
							this.closeDialog();
            },
            closable: true,
          });
					if (Application.isModelIt === true) {
						this.setState({	blockSubmit: true	});
					} else {
						this.props.setCurrentLesson(lessonId, originId, true, null);
					}
        })
        .catch(err => {
          this.showDialog(Message, { message: err.response.data.error.errors[0].message });
          this.setState({
            blockSubmit: wasBlocking,
          });
        });
    };

    if (this.modelIsDirty(e)) {
      await this.modelSave(doSubmit.bind(this));
    } else {
      doSubmit();
    }
  }

  onUserSubscribed() {
    return new Promise((done, error) =>
      cc.request
        .get('api/users/subscribed')
        .then(r => {
          const user = this.state.user;
          user.subscribed = r.data.data;
          this.setState({ user: user });
          done(user.subscribed);
        })
        .catch(e => error(e)),
    );
  }

  async isSubmittedLesson(e, courseId, recheck) {
    if (!this._submitted) {
      this._submitted = {};
    }
    let ret,
      querystring = '';

    if (courseId) {
      querystring += '?course_id=' + courseId;
    }

    const useId = e.top._id || e.top.id;

    if (useId && recheck) {
      return new Promise(async (rlv, rjt) => {
        try {
          const submitted = await cc.request.get(`/api/module/${useId}/submitted?domain=${Application.domain}&course=${this.course}`);
          rlv(submitted.data.data.submitted);
        } catch (err) {
          rjt(err);
        }
      });
    }

    if (!(useId in this._submitted)) {
      let cbk;
      ret = new Promise(resolve => {
        cbk = resolve;
      });

      let promise = cc.request.get(`/api/module/${e.top._id || e.top.id}/submitted?domain=${Application.domain}&course=${this.course}`).then(res => {
        this._submitted[useId] = res.data.data.submitted;
        cbk(this._submitted[useId]);
      });
      this._submitted[useId] = promise;
    } else if (this._submitted[useId] instanceof Promise) {
      ret = new Promise(resolve => {
        this._submitted[useId].then(() => resolve(this._submitted[useId]));
      });
    } else {
      ret = Promise.resolve(this._submitted[useId]);
    }

    return ret;
  }

  removeReference(e) {
    this.ajax('_api/model/edu/remove/' + e.top.id);
    delete this.Workspace[e.top.id];
  }

  isAuthenticated() {
    return this.state.user && this.state.user.token;
  }

  uploadDocuments(init, done, progress, files) {
    let type = Application.values.Document.type.from;
    let s = Seq(files)
      .map(e => e.name)
      .map(e => new Document({ name: e, type: type[e.substring(e.lastIndexOf('.') + 1).toUpperCase()] }))
      .cacheResult();
    init(s);
    s.forEach((e, i) => {
      let data = new FormData();
      data.append('upload', files[i]);
      let xhr = new XMLHttpRequest();
      xhr.open('POST', Application.api + '/_api/model/upload');
      this.state.user && this.state.user.token && xhr.setRequestHeader('X-AUTH-TOKEN', this.state.user.token);
      xhr.upload.onprogress = Utils.debounce(progress.bind(null, e), 200);
      xhr.onreadystatechange = () => xhr.readyState === 4 && xhr.status === 200 && Seq(JSON.parse(xhr.responseText)).forEach((v, k) => done(k, this.convert('Document', e.id, v)));
      xhr.send(data);
    });
  }

  uploadFiles(path, files, cbDone, cbError, fields = []) {
    return new Promise(async (resolve, reject) => {
      try {
        const formEl = new FormData();

        files.forEach((file, index) => {
          formEl.append(`files`, file);
          if ('input' in file) {
            fields.push({ name: file.input, value: file.name });
            fields.push({ name: file.input, value: file.lastModified });
          }
        });

        fields.forEach(field => {
          formEl.append(field.name, field.value);
        });

        const response = await new Promise((resolveFile, rejectFile) => {
          this.ajax(`api/${path}`, formEl, resolveFile, rejectFile);
        });

        if (response.status == 'success') {
          cbDone && cbDone();
          resolve(response.data);
        } else {
          throw new Error(response.data);
        }
      } catch (err) {
        cbError && cbError(err);
        reject(err);
      }
    });
  }

  getTeachDomainAccess() {
    let domain = Application.domain;
    let res = domain == 'teaching' && this.state.user && this.state.user.userDomainAccess && this.state.user.userDomainAccess.teach;
    return res ? true : false;
  }

  async saveGraphImage(id, image) {
    const blob = Utils.dataURItoBlob(image);

    const data = new FormData();
    data.append('image', blob);

    const response = await cc.request.post(`/api/model/${id}/graph`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

	updatePermission(permission, value = false, top={}) {
		if (!top.permissions) {
			console.error("Permission '"+permission+"' could not be modified");
			return;
		}
		let _permissions = {...top.permissions};
		_permissions[permission] = value;
		top.permissions = _permissions;
	}

  _userHasAuthorizedTeach() {
    let domain = Application.domain;
    return domain === 'teaching' && this.state.user && this.state.user.userDomainAccess && (this.state.user.userDomainAccess.teach || this.state.user.userDomainAccess.admin);
  }

  setInsightsCategory(insights_category) {
    this.setState({
      insights_category,
    });
  }

  varCheckComplete = false;
  modelName = '';

  checkComplete(model) {
    const entity = model.top;
    if (!model.top.LearningActivity) {
      this.varCheckComplete = true;
      return this.varCheckComplete;
    }
    let surveys = Seq();
    Seq(entity.LearningActivity).forEach(activity => {
      if (!activity.views) return;
      const _surveys = activity.views
        .filter(view => view.startsWith('SurveyView'))
        .map(view => {
          const match = view.match(/^SurveyView\[([0-9]+)\]$/);
          if (match === null || match.length <= 1) return;
          let index = parseInt(match[1]);
          return Seq(model.Survey).find(s => s.index === index);
        });

      surveys = surveys.concat(_surveys.filter(survey => !surveys.includes(survey))).filter(survey => survey);
    });
    const incomplete = surveys.some(survey_entity => {
      const questions = Seq(survey_entity.questions);
      const survey_incomplete = questions.some(question => {
        switch (question.type) {
          case 0:
            return !question.studentText;
          case 1:
          case 2:
            const opts = Seq(model.SurveyQuestionOption).filter(opt => opt.parentId == question.id);
            return !opts.some(opt => opt.studentAnswer);
          case 3:
            const rows = question.tableRow;
            const cols = question.tableCol;
            for (let row = 1; row < rows; row++) {
              for (let col = 1; col < cols; col++) {
                const cell = Seq(model.SurveyTableCell).find(cell => cell.parentId == question.id && cell.tCol == col && cell.tRow == row);
                if (!cell?.studentAnswer) {
                  return true;
                }
              }
            }
            return false;
          default:
            return false;
        }
      });
      this.varCheckComplete = survey_incomplete;
      return survey_incomplete;
    });
    this.varCheckComplete = !incomplete;
    return !incomplete;
  }

  updateModelName() {
    this.props.dispatch({
      type: 'GET_MODEL_NAME',
      // payload: this.props.actions.checkLessonComplete()
      payload: this.modelName,
    });
  }

	async routerExecuteURL(hash = this.hashRoute){
		let path = this.routerGetModelPath(hash);
		if(!path){
			this.routerHome();
			return;
		}

		if(!this.modelGetPath(path)){
			//not in path >> try to load it
			try{
				if(path[0]){
					const data = await this.ajaxPromise(`api/model/cards/${Application.domain}?${cc._.constructGetParams({id: path[0]})}`);
					await this.modelLoad(data);
					return;
				}
			}catch(e){
				console.warn(e); 
			}
		}

		if(!(path = this.modelGetPath(path))){
			//model found >> SUCCESS :)
			this.modelSelect(true, path);
			return;
		}
		if(path.isPersisted != undefined && !path.isPersisted ){
			// select unsaved model to prevent  the changes from being lost
			this.modelSelect(true, path);
			return;
		}
		this.routerHome();
	}


  render() {
    let domain = Application.domain;
    let { master, detail, version, hover, model } = this.state;
    const { workspace, useLocationApp } = this.props;
    let playing = this.logPlayer.runner;
    let entities, persisted, state, permissions, access, selected, subSelected, versions;
    let editable = false,
      publishedStatusEditable = false;

    if (detail !== undefined) {
      state = this.state[this.stateGetKey(this.state)];
      entities = this.state.Model.getIn(detail) || new Immutable.Map();
      model = this.modelGetPath(detail) || {};

      versions = Seq(this.Model[detail[0]].all());
      persisted = this.modelGetPath(detail, this.Persisted, true) || {};
      permissions = model.permissions || {};
      access = isEditEnabled(model) + permissions.share;
      editable = this.modelIsShareAndEditable(model);
      publishedStatusEditable = this.modelIsPublishable(model);
      selected = state
        ? state
            .get('selected')
            .map((v, k) => (v !== undefined ? ((Application.entities[k] && Application.entities[k].global ? model.top : model)[k] || {})[v] : undefined))
            .toObject()
        : {};
      this.state.layout &&
        this.state.layout.replace(/^Activities\[([0-9-]+)\]/g, (_, actId) => {
          if (model.top.LearningActivity) selected.LearningActivity = model.top.LearningActivity[actId];
          //TODO: hacky autoselecting for entities
          /*                if(!selected.LearningActivity){
                                    selected.LearningActivity = Seq(model.top.LearningActivity).first();
                                }
                */
        });
      let e = selected.Component;
      selected.Biologic = e && !e.isExternal ? e : null;
      subSelected = state
        .get('subSelected')
        .map((v, k) =>
          v !== undefined
            ? Seq(v)
                .map((_, eid) => model[k][eid])
                .toObject()
            : undefined,
        )
        .toObject();
    } else {
      versions = Seq();
      state = entities = new Immutable.Map();
      model = persisted = permissions = selected = {};
      access = 0;
    }

    let user = Seq(this.getUser(this.state.user)).toObject();
    let typed = this.Layout[model.type];
    let range, views, layout = this.state.layout; // || (detail && model ? 'Overview' : undefined);
    if (detail) {
      if (workspace === WORKSPACE.SHARING) {
        layout = 'Sharing';
      } else if (workspace === WORKSPACE.INSIGHTS) {
        layout = 'Insights';
      }
    }
    let route = layout || 'Home';

    let readonly = Application.domain === 'research' && layout === 'Description';
    let vp;
    const magicOffset = 12;
    let width = this.state.width - magicOffset;
    const headerHeight = 36;
    const headerNum = detail !== undefined ? 3 : 2;
    let height = this.state.height - headerHeight * headerNum - magicOffset;

    const onLayoutViewChange = this.layoutSetValue.bind(this),
      layoutConf = this.state.layoutConf;
    let modelCreator = () => {
      if (!this.Model) return;
      let now = new Date();

      let v = new ModelVersion({
        name: '1.0',
        created: now,
        updated: now,
      });

      let m = new Model({
        type: domain === 'teaching' ? 'learning' : 'research',
        name: Application.defName(this.Model, 'New Model '),
        userId: this.state.user && this.state.user.id,
        currentVersion: v.id,
      });
      m.add(v);
      return m;
    };
    let modelUpdate = (p, v) => this.entityUpdate([new UpdateProperty(p, v)]);
    let rTitle = (e, p) => (
      <span>
        {p && p + ' '}
        {e && <i>{e.name}</i>}
      </span>
    );

    let ed = readonly ? true : editable;
    const onAdd = (e, s, cb = () => {}) => this.entityUpdate([new Add(e, s)], cb);
    const onRemove = (e, s) => this.entityUpdate([new Remove(e, s)]);

    const setBooleanState = newState => this.stateMerge(this.state, ['BooleanAnalysis'], new Immutable.Map(newState));

    const isAdmin = this.state.user && AdminAccounts.includes(this.state.user.email);

    const onEdit = (e, p, v) => this.entityUpdate([new Update(e, p, v)]);

		range = this.layoutGet(model, route, this.curLayoutConf && this.curLayoutConf.get('_genWidth'));
		views = this.layoutGetViews(layout, range, model);

		//Dashboard View: Reset current data lesson
		if (layout === undefined) {
			if (this.props.currLesson && this.props.currLesson.id) {
				this.props.setCurrentLesson(null, null, false, null);
			}
			if (this.state.startButtonClicked) {
				this.setState((prev) => ({...prev, startButtonClicked: false}));
			}
			if (this.course) {
				this.setSelectedCourseId(null);
			}
			if (this.openedFromCategory) {
				this.setOpenedFromCategory(null);
			}
			if (this.state.loadedSurveys && !this.state.loadedSurveys.isEmpty()) {
				this.setState((prev) => ({...prev, loadedSurveys: new Set()}));
			}
		}

		//Enable edit for non-submitted lessons
		if (Application.isLearning && workspace == WORKSPACE.CONTENT) {
			if (model.top && model.top.id) {
				if (this.props.currLesson
					&& this.props.currLesson.id
					&& !this.props.currLesson.submitted) {
						ed = editable = true;
				}
			}
		}

		vp = {
			master: {
				cc: this,
				actions: {
					load: this.modelGet.bind(this),
					loadCards: this.modelLoad.bind(this),
					onMaster: views.size > 1 && this.modelSelect.bind(this, true), //Access model workspace on click & dblclick
					onDetail: this.modelSelect.bind(this),
					onAdd: this.modelAdd.bind(this),
					onRemove: (e, s) => this.showDialog(Confirmation, { type: 'delete', entity: e.top.name, action: this.modelRemove.bind(this, e, false) }),
					onRemoveRef: e => this.showDialog(Confirmation, { type: 'delete', entity: e.top.name, action: this.removeReference.bind(this, e) }),
					onSection: e => this.setState({ section: e }),
					onUserSubscribe: this.userSubscribe.bind(this),
					saveGraphImage: this.saveGraphImage.bind(this),
					selectCourse: this.courseSelect.bind(this),
					promptCourse: this.coursePrompt.bind(this),
				},
				searchCartLoading: this.state.searchCartLoading,
				modelCartLoading: this.state.modelCartLoading,
				cardLayoutLoading: this.state.cardLayoutLoading || false,
				creator: modelCreator,
				entities: this.state.Model,
				models: this.Model,
				persisted: this.Persisted,
				master: this.modelGetPath(master, this.Model) || {},
				detail: model,
				section: this.state.section,
				search: this.state.searchResult,
				setOpenedFromCategory: this.setOpenedFromCategory,
			},
			detail: {
				cc: this,
				draggable: (e, def) => <div className={e instanceof Component ? (e.isExternal ? 'external' : 'internal') : 'condition'}>{e.name || def}</div>,
				editable: ed,
				editableContent: ed && isEditEnabled(model),
				readonly: readonly,
				isLoading: model && !model.complete,
				actions: {
					onSelect: this.entitySelect.bind(this),
					onSubSelect: this.entitySubSelect.bind(this),
					onHover: this.entityHover.bind(this),
					onDrag: this.entityDrag.bind(this),
					onAdd,
					onRemove,
					onEdit,
					addToCourse: (id, cbk = null) =>
						this.showDialog(CourseAdd, {
							model: id,
							close: cbk || this.closeDialog.bind(this),
							message: msg => this.showDialog(Message, { message: msg }),
						}),
					onEditProperty: modelUpdate.bind(this),
					batch: this.entityUpdate.bind(this),
					onChangeVersion: id => this.modelSelect(true, this.Model[id]),
					onEditState: this.stateSet.bind(this),
					onEditModelState: detail !== undefined && this.stateSet.bind(this, this.state),
					onPublish: (e, n) => this.showDialog(Confirmation, { type: e ? 'publish' : 'unpublish', entity: n, action: this.modelPublish.bind(this, model, e) }),
					onLayoutViewChange,
					getReference: this.getReference.bind(this),
					uploadDocuments: this.uploadDocuments.bind(this),
					uploadFiles: this.uploadFiles.bind(this),
					onStartExperiment: this.startExperiment.bind(this),
					addToWorkspace: this.addToWorkspace.bind(this),
					download: this.download.bind(this),
					showError: e => this.showDialog(Message, { message: e }),
					onStartTopologyAnalysis: (c, s, props) => BooleanAnalysisGet().then(Analysis => Analysis.doTopologyAnalysis(c, s, props, setBooleanState)),
					onFunctionalCircuitAnalysis: c => BooleanAnalysisGet().then(Analysis => Analysis.functionalCircuitAnalysis(model, c, setBooleanState)),
					onFeedbackLoops: (c, props) => BooleanAnalysisGet().then(Analysis => Analysis.feedbackLoops(model, c, props, setBooleanState)),
					onStateTransitionGraph: (c, props) => BooleanAnalysisGet().then(Analysis => Analysis.stateTransitionGraph(model, c, props, setBooleanState)),
					onCycleSelect: c => this.setState({ funcCircuit: c }),
					onLoopSelect: c => this.setState({ loop: c }),
					startActivity: this.startActivity.bind(this),
					startFirstActivity: this.startFirstActivity.bind(this),
					submitActivity: this.submitActivity.bind(this),
					checkIsSubmitted: this.isSubmittedLesson.bind(this),
					checkLessonComplete: this.checkComplete.bind(this, model),
					onShowMessageOnAction: message => this.showDialog(Message, { message }),
					onShowProgressOnAction: (waitMessage, title) => this.showDialog(Progress, { waitMessage, title }),
					onConfirm: (message, action, options) => this.showDialog(Confirmation, { type: 'delete', message, action, ...options }),
					onUserSubscribed: this.onUserSubscribed.bind(this),
					onSaveModel: handleSaveModel.bind(this),
					routerExecuteURL: this.routerExecuteURL.bind(this),
					saveGraphImage: this.saveGraphImage.bind(this),
					onEditPermission: this.updatePermission.bind(this),
				},
				networkAnalysis: state.has('BooleanAnalysis') ? state.get('BooleanAnalysis').toJS() : {},
				inLayout: true,
				insights_category: this.state.insights_category,
				layoutGetValue: { get: this.layoutGetValue.bind(this) },
				layout: this.state.layout,
				layoutConf,
				hover: hover && hover.entity.className && hover,
				dragging: this.state.dragging && this.state.dragging.entity,
				entities,
				model,
				persisted: persisted,
				state: this.state,
				modelState: state,
				selected: selected,
				subSelected: subSelected,
				simulation: this.simulationRealtime,
				intl: this.props.intl,
				currLessonState: this.props.currLesson,
			},
			separate: {
				cc: this,
				model: model,
				versions,
				player: this.logPlayer,
				actions: {
					onChangeVersion: id => this.modelSelect(true, this.Model[id]),
					onEdit,
				},
			},
		};

		Seq(vp).forEach(e => {
			e.title = rTitle;
			e.parentWidth = width;
			e.parentHeight = height;
			e.user = user;
			e.users = this.User;
		});


    let onHover = (e, p) => ({ onMouseOver: this.entityHover.bind(this, e, p), onMouseOut: this.entityHover.bind(this, null, null) });

    let rView = (k, s, p) => {
      const view = this.View[k.replace(/\[.+$/g, '')];
      const i = k.search(/\(|\[/);
      const ViewEl = View[i < 0 ? k : k.substring(0, i)];
      //console.log("ViewEl", ViewEl);
      //console.log("i", i);

      // SurveyView entity refers to survey.
      // To get all visible surveys, loop through all
      // LearningActivity entries, and aggregate a list of
      // all Surveys which are displayed.

      // Potential challenge - do I need to also need to
      // distinguish between activities which are only present
      // in certain model versions??

      const render = (Component, props) => {
        let entityIndex;
        k.replace(/\[(.*)\]/g, (all, v) => {
          entityIndex = v;
        });
        let entity = ViewEl.multiple && ViewEl.multiple.entity(self, model, entityIndex);
        const viewElementToShow =
          !ViewEl.multiple || entity ? (
            React.createElement(
              Component,
              Seq(vp[view.type || 'detail'])
                .concat({ entity })
                .concat(
                  view,
                  (s && s[k]) || {},
                  {
                    key: k,
                    type: i < 0 ? undefined : k.substring(i + 1, k.indexOf(')')),
                  },
                  p || {},
                  props || {},
                )
                .toObject(),
            )
          ) : (
            <div />
          );

        return (
          <AccessControl check={`model_view_${k}`} key={k}>
            {viewElementToShow}
          </AccessControl>
        );
      };

      return <Loadable component={ViewEl.Component} loadingLazy={() => <div />} renderLazy={render} key={k} />;
    };

    let toolbar;
    let appHome = false;
    let smalllogo = false;
    let modelIsDirty = true;

    const modelAllVersionsEditable = Seq(versions).every(this.modelIsShareAndEditable.bind(this));
    if (layout) {
      let selectedVersion = Seq(versions)
        .sort(Application.cmpVersion(true))
        .first();
      modelIsDirty = Seq(versions).some(this.modelIsDirty.bind(this));

      smalllogo = true;

      toolbar = React.createElement(ModelMenu, {
        cc: this,
        model,
        modelUpdate,
        modelSave: this.modelSave.bind(this),
        modelIsShareAndEditable: Seq(versions).some(this.modelIsShareAndEditable.bind(this)),
        modelAllVersionsEditable,
        modelIsDirty,
        modelLayoutSave: this.modelLayoutSave.bind(this, model),
        modelAddVersion: modelAllVersionsEditable && this.modelAddVersion.bind(this, model, model.top),
        modelDownload: (t, e) => this.modelDownload(t, model, e),
        modelSelect: this.modelSelect.bind(this),
        modelSetDefaultVersion: this.modelSetDefaultVersion.bind(this),
        layoutAdd: this.layoutAdd.bind(this),
        layoutIsDirty: this.layoutIsDirty(model),
        layoutIsValid: this.layoutIsValid.bind(this),
        layoutGetViews: (e, range) => this.layoutGetViews(e, range, model),
        layoutGetKey: this.layoutGetKey.bind(this),
        layoutGet: this.layoutGet.bind(this, model),
        layoutSet: this.layoutSet.bind(this),
        layoutRemove: this.layoutRemove.bind(this),
        layoutRestore: this.layoutRestore.bind(this),
        layoutToggle: this.layoutToggle.bind(this),
        setInsightsCategory: this.setInsightsCategory.bind(this),
        viewToggle: this.viewToggle.bind(this, model),
        viewAddCustom: this.viewAddCustom.bind(this, model),
        viewRemoveCustom: this.viewRemoveCustom.bind(this, model),
        user: this.state.user,
        saving: this.state.saving,
        selected,
        editable,
        detail,
        View: this.View,
        stateGet: (state || new Map()).get.bind(state),
        canRestoreLayout: !Seq(persisted.workspaceLayout || {}).isEmpty(),
        entityUpdate: this.entityUpdate.bind(this),
        favorites: this.state.favorites,
        entitiesSelected: this.state.Model && this.state.Model.get(selectedVersion && selectedVersion.id),
        entitySelect: this.entitySelect.bind(this),
        LayoutDomain: this.Layout[Application.domain === 'teaching' ? 'learning' : Application.domain],
        // checkLessonComplete: this.varCheckComplete,
        actions: {
          onAdd,
          onRemove,
          onEdit,
        },
        checkComplete: this.varCheckComplete,
        modelName: this.modelName,
        userName: this.state.user ? this.state.user.firstName + ' ' + this.state.user.lastName : null,
        entities,
        permissions,
        hover,
        playing,
        views,
        width,
        layout,
        typed,
        versions,
        onHover,
        rView,
        access,
        self: this,
        showConfimationOnClose: this.showDialog.bind(this),
        currLesson: this.props.currLesson,
      });
    } else {
      let isModelImporting = this.state.isModelImporting;
      let stateModel = this.state.Model;
      appHome = true;

      const isActive = modelType => {
        return modelType.active[Application.domain];
      };

      let insideToolbar;
      if (this.state.section[0] === 'Courses') {
        //course toolbar
        insideToolbar = <CourseMenuToolbar />;
      } else {
        //model toolbar
        insideToolbar = <ModelMenuToolbar isModelImporting={isModelImporting} isActive={isActive} isAdmin={isAdmin} modelImport={this.modelImport} modelAdd={this.modelAdd} application={this} />;
      }

      toolbar = (
        <div className="mainTopbar" style={{ backgroundColor: 'transparent' }}>
          {insideToolbar}
        </div>
      );
    }

		if (Application.isEducation && layout == 'Overview' && detail && model) {
			this.modelLoadAllVersions(model).then(() => {
				//set top
				const versions = Seq(this.Model[detail[0]].all())
				const defaultVersion = model.top?.selected || versions.sort(Application.cmpVersion(true)).first()
				if (model !== defaultVersion) {
					this.modelSelect(true, defaultVersion)
				}
			})
		}

		const k = this.layoutGetKey(route, range)
		const k2 = this.layoutGetKey(undefined, range)

		const s = range && range.views;
		let l = typed[route];
		!l && Seq(typed).forEach(e => e.layouts && e.layouts[l] && (l = e.layouts[l]));
		const ed1 = !l || l.editable !== false;

		const rViewRow = el => {
			try {
				return rView(el, s, ed1 && { onClose: () => this.showDialog(Confirmation, { type: 'close', action: this.viewToggle.bind(this, model, el, undefined) }) })
			} catch (err) {
				console.error('Rendering View: ', el, '\nError:\n', err)
				return null
			}
		}

		let appBarHeader
		if (detail !== undefined) {
			const modelChangeName = n => this.entityUpdate([new Update(model.top, 'name', n)])

			this.modelName = model.top.name
			this.updateModelName.bind(this)
			mdlName = this.modelName

			appBarHeader = (
				<Editable
					value={model.top.name}
					onEdit={modelAllVersionsEditable && ((e) => e && modelChangeName(e))}
					children={appBarTitle({
						model: { name: model.top.name, id: model.top.Persisted },
						isDirty: modelIsDirty && editable,
						isSaving: this.state.saving,
						user: this.state.user || undefined
					})}
				/>
			)
		}

		const authorizedTeach = this._userHasAuthorizedTeach()
		const onTeachAndHaveAccess = ((domain === 'teaching' && authorizedTeach) || domain != 'teaching')
		let mainContent = (
			<React.Suspense fallback={(<div>Loading...</div>)}>
				<ArrangementMemo model={model} joyRideStepsCompleted={this.state.joyRideStepsCompleted} editable={editable} setJoyRide={e => this.setState(e)} joyRidePhase={this.state.joyRidePhase || 1} completedJoyride={this.state.completedJoyride} onLayoutViewChange={onLayoutViewChange} layoutConf={layoutConf} key={k} persist={k} persistGlobal={k2} startButtonClicked={this.state.startButtonClicked} currentLesson={this.props.currLesson}>
					{views.map((e) => rViewRow(e))}
				</ArrangementMemo>
			</React.Suspense>
		)

		if (domain === 'teaching' && !this.state.user) {
			const signIn = this.showDialog.bind(this, SignIn, { action: !this.state.user && this.userSignIn.bind(this), forgotPassword: this.userForgotPassword.bind(this) })
			const signUp = this.showDialog.bind(this, SignUp, { signInAction: !this.state.user && this.userSignIn.bind(this) })
			let modal = this.getRenderedDialog(
				PleaseSignInOrSignUp,
				{
					onSignUp: signUp,
					onSignIn: signIn,
				},
				false,
				false,
				false,
			)
			mainContent = (
				<ErrorBoundary>
					{' '}
					{modal}
				</ErrorBoundary>
			)
		} else if (domain === 'teaching' && this.state.user
			&& (!this.state.user.userDomainAccess?.teach && !this.state.user.userDomainAccess?.admin)
		) {
			let onClickRequestTeach = async () => {
				try {
					await ccappRequest.post("/users/group/request", {"new_group": "TEACHERS"});
          if (import.meta.env.MODE === "production") {
					  await this.ajaxPromise(`_api/user/requestTeach`, { email: this.state.user.email }, data => { }, null, null, null);
          }
				} catch(err) {
					console.error(err)
				}
			}
			let modal = this.getRenderedDialog(
				UnauthorizeOnTeachDomain,
				{
					onClickRequestTeach: onClickRequestTeach,
					user: this.state.user,
				},
				false,
				false,
			)
			mainContent = (
				<ErrorBoundary>
					{' '}
					{modal}
				</ErrorBoundary>
			)
		} 
		else if (useLocationApp.pathname === '/admin'){
			mainContent = (<React.Suspense fallback={(<div>Loading...</div>)}>
				<AdminDashboard  />
			</React.Suspense>)	
		} else if (useLocationApp.pathname === '/model-create-redirect') { 
			mainContent = (<React.Suspense fallback={(<div>Loading...</div>)}>
        <RedirectToCreateModel/>
      </React.Suspense>)
		}

      return (
				<div className="app">
					<div className={Utils.css(Application.domain, 'layout' + route)}>
						<ErrorBoundary>
							<CCContext.Provider value={{ cc: this, model, Model: this.Model, BaseIdMap: this.BaseIdMap, entities, versions, editable, publishedStatusEditable }}>
								<CCLayouts.Provider value={{ cc: this, layouts: this.state.layouts, favorites: this.state.favorites, typed, access }}>
									<CCViews.Provider value={{ cc: this, views }}>
										<CCActiveLayout.Provider value={{ layout: this.state.layout }}>
											<CCEntities.Provider value={this.state.Model}>
												<ErrorBoundary>
													<AppBar
														cc={this}
														goHome={() => domain === 'research' ? this.routerDashboard() : this.routerHome()}
														showMenu={!!layout && onTeachAndHaveAccess}
														toolbar={toolbar && onTeachAndHaveAccess ? toolbar : null}
														showSearch={onTeachAndHaveAccess ? !layout : false}
														header={appBarHeader}
														smalllogo={smalllogo}
													/>
												</ErrorBoundary>
												<ErrorBoundary>
													<ThirdPartySignIn 
														cc={this}
													/>
												</ErrorBoundary>
												<Outlet context={mainContent} />
												<>
													<ErrorBoundary>
														{Draggable.helper(this.state.dragging)}
													</ErrorBoundary>
													<ErrorBoundary>
														{this.renderDialog()}
													</ErrorBoundary>

													<ErrorBoundary>
														<Modal></Modal>
													</ErrorBoundary>
													
													{/* Lesson Navigation - only show in learning domain with activities */}
													{Application.isLearning && detail && model && this.state.layout && this.state.layout.startsWith('Activities[') && (
														<ErrorBoundary>
															<LessonNavigation
																currentActivity={this.getCurrentActivity(model)}
																allActivities={this.getAllActivities(model)}
																onNavigate={this.navigateToActivity.bind(this)}
															/>
														</ErrorBoundary>
													)}
												</>
											</CCEntities.Provider>
										</CCActiveLayout.Provider>
									</CCViews.Provider>
								</CCLayouts.Provider>
							</CCContext.Provider>
						</ErrorBoundary>
					</div>
				</div>
      );
    
  }
}

const App = [
  Persist(
    {
      user: null,
      simulation: 'Map',
      joyRidePhase: null,
      joyRideStepsCompleted: 'Set',
      globalViews: 'Set',
    },
    undefined,
    undefined,
    undefined,
    {
      simulation: new Immutable.Map({ speed: 1, window: 1, type: 'SYNCHRONOUS' }),
      globalViews: new Immutable.Set(),
    },
  ),
  ModelPersist(
    {
      // favorites: 'Set', // fix: the metabolic menu overwrite issue
      section: null,
      layouts: {
        from: e =>
          Seq(e)
            .map(e =>
              Seq(e)
                .map(e => new Immutable.Set(e))
                .toMap(),
            )
            .toMap(),
        to: e => e.map(e => e.map(e => e.toArray()).toObject()).toObject(),
      },
    },
    (_, state) => state.layoutConf,
    self => self.layoutSetValue.bind(self),
    'model',
    null,
    [
      v => {
        const merge = v => {
          if (v.Overview) {
            v.Overview = ['LearningView', 'LearningObjectiveView', 'LearningDocumentsView', 'LearningReferencesView', 'LearningPropertiesView', 'StartButtonView'];
          }
        };

        if (v.layouts && v.layouts.teaching) {
          merge(v.layouts.teaching);
        }
        if (v.layouts && v.layouts.learning) {
          merge(v.layouts.learning);
        }
        return v;
      },
    ],
  ),
  Dialog,
  Frame,
  LoggerMixin,
  UserMixin,
  LayoutMixin,
  ModelMixin,
  EntityMixin,
  StateMixin,
  HistoryMixin,
  CourseMixin,
].reduce((s, v) => v(s), Main);

const CCContextConsumer = CCContext.Consumer;
export { CCContextConsumer, CCContext, CCEntities, CCLayouts, CCViews, CCActiveLayout };

const mapStateToProps = state => ({
  workspace: getSelectedModule(state) && getSelectedModule(state).workspace,
  modelSearch: state.appBar.modelSearchString,
  modelName: mdlName,
  currLesson: state.app.modules && state.app.modules.currLesson,
});
const mapDispatchToProps = dispatch => ({
  userDirtyUpdate: (user, onError) => dispatch(doDirtyUpdate(user, onError)),
  updateSavingStatus: saving => dispatch(updateSavingStatus(saving)),
  changeWorkspace: (...args) => dispatch(changeWorkspace(...args)),
  modelsInit: (...args) => dispatch(modelsInit(...args)),
  modelsReplace: (...args) => dispatch(modelsReplace(...args)),
  modelCopy: (...args) => dispatch(modelCopy(...args)),
  modelsRemove: (...args) => dispatch(modelsRemove(...args)),
  modelSelect: (...args) => dispatch(modelSelect(...args)),
  setCurrentLesson: (...args) => dispatch(setCurrentLessonAction(...args)),
  startFirstActivity: () => this.startFirstActivity.bind(this),
});

/**
 * Set the hooks to be used with the Dashboard.
 * Note that the hooks are defined with 'App' at the end of their names
 */
const DashboardHooksWrapper = (props) => {
  const location = useLocation();
  return <App {...props} useLocationApp={location} />;
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(DashboardHooksWrapper));

export const Dashboard = () => {
	const dashboard = useOutletContext();
	return dashboard;
}

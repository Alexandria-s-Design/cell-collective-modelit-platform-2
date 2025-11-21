import Utils from '../utils';
// import ClientConfig from '../../../config/.client.json'
import cclib from '../cc';
import {store} from '../store';
import showMessage, { TYPE_ERROR, TYPE_SUCCESS } from '../message';
import { getModel } from '../containers/Model/actions';

export const ENROLL_COURSE = 'enroll_course';
export const URLActionType = {
  [ENROLL_COURSE]: ENROLL_COURSE,
};

const courseReduxModel = getModel('course');


export const URLActionCallback = {
  [ENROLL_COURSE]: async ({ UserId, CourseId }) => {
    const ret = await cclib.request.post(`/api/course/association/UserCourse`, {
      UserId, CourseId
		});
		//invalidate list of courses
		await store.dispatch(courseReduxModel.reset());
		return ret;
  },
};

const showToast = (type, msg) => {
  showMessage({
    message: msg,
    type: type,
    options: {
      extendedTimeOut: 30000,
      timeOut: 60000,
    },
  });
};

export default class URLActionTemplate {
  constructor(actionType, params) {
    if (!URLActionType[actionType]) {
      const errMsg = `Action type (${actionType}) doesn't exist`;
      console.error(errMsg);
      showToast(TYPE_ERROR, errMsg);
    }
    this.actionType = actionType;
    this.params = params;
  }
  get json() {
    return this.constructJson(this.actionType, this.params);
  }

  get url() {
    return this.constructUrl(this.actionType, this.params);
  }
  async execute(actionParams) {
    try {
      await URLActionCallback[this.actionType](actionParams);
      showToast(TYPE_SUCCESS, `Sucessfully ${this.actionType}`);
    } catch (e) {
      showToast(TYPE_ERROR, `Error on ${this.actionType}: ${JSON.stringify(e.response?.data?.error) || e.toString()}`);
    }
  }

  static constructJson(actionType, params) {
    return {
      content: {
        action: actionType,
        params: params,
      },
      sig: '',
    };
  }

  static constructUrl(actionType, params) {
    return `${import.meta.env.VITE_CC_URL_LEARN}/dashboard#action/${Utils.base64Encode(JSON.stringify(this.constructJson(actionType, params)))}`;
  }

  static fromHashURL(base64) {
    const data = JSON.parse(Utils.base64Decode(base64));
    return new URLActionTemplate(data.content.action, data.content.params);
  }

  toString() {
    return `ACTION: ${this.actionType}, PARAMS: ${JSON.stringify(this.params)}`;
  }
}

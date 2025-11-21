import Utils from '../utils';
import URLActionTemplate, { ENROLL_COURSE } from '../util/URLActionTemplate';
import ModelEntity from '../entity/modelEntity';
import Application from '../application';
import cc from '../cc';

import { COURSE_PATH_INDEX } from "./courseMixin";
import { el } from 'date-fns/locale';

export const MODEL	= 'model';
export const MODULE = 'module';
export const ACTION = 'action';
export const COURSE = 'course'; 
export const CREATE_MODEL = 'create-model';

export const hashRoutes = {
	[MODULE] : MODULE,
	[ACTION] : ACTION,
	[COURSE] : COURSE,
	[CREATE_MODEL] : CREATE_MODEL,
}

export default parent =>
  class extends parent {
    componentDidMount(...args) {
			super.componentDidMount && super.componentDidMount(...args);
			this.setState({ locationHash: window.location.hash.substr(1) });
      window.addEventListener('hashchange', () => {
        const a = window.location.hash.substring(1);
				const [type, rest] = window.location.hash.substr(1).split('/', 2);
				this.setState({ locationHash: window.location.hash.substr(1) });
				if (type === ACTION) {
					return null;
				} else {
					this.getAccessCode(Utils.isGuid(a) && a, async () => await this.routerExecuteURL());
				}
      });
		}
		
		async routerExecuteURL(hash = this.hashRoute){
			let path = this.routerGetModelPath(hash);
			if(!path){
				this.routerHome();
				return;
			}

			if (this.getModelType && this.getModelTypes().indexOf(path) !== -1) {
				this.routeToNewModel(path);
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

		get hashRoute() {
			return window.location.hash.substr(1);
		}

		async performURLActionThenClear() {
			const [ type, rest ] = this.hashRoute.split('/', 2);
			if (type !== ACTION) { return; }
			const urlAction = URLActionTemplate.fromHashURL(rest);
			if (urlAction.actionType === ENROLL_COURSE) {
				await urlAction.execute({UserId: this.state.user.id, CourseId: urlAction.params.courseId});
			}
			window.history.pushState(null, null, '#');
		}

		routerGetCourse() {
			return parseInt(this.hashRoute.split('/')[COURSE_PATH_INDEX]);
		}

		routeToNewModel(modelType) {
			this.modelAdd(undefined, null, { modelType });
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
        } else if (type === CREATE_MODEL) {
					this.routeToNewModel(rest)
					return null;
				}
      }

      const p = path.split('/', 1)[0];
      //For clearing out url for unsaved versions
      const modelPath = p.length && p.split(':');
      const value = modelPath && modelPath.filter(value => +value > 0);
      // return value.length ? modelPath : this.routerGoTo();
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
			let dashboardBaseURL = `${window.location.origin}/research/dashboard/`;
			return window.location.href = dashboardBaseURL;
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
  };

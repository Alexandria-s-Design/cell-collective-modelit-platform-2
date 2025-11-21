import cc from '../cc';
import OptionsDialog from './dialog/options';

export const COURSE_PATH_INDEX = 4;

export default (parent) => ( class extends parent {
	courseSelect(courseId) {
		let route = this.hashRoute.split("/");
		if (route.length < COURSE_PATH_INDEX) {
			throw new Error("Course can only be selected when in a model context.");
		} else if (route.length === COURSE_PATH_INDEX) {
			if (courseId) {
				route.push(courseId.toString());
			}
		} else {
			if (courseId) {
				route[COURSE_PATH_INDEX] = courseId.toString();
			} else {
				route = route.slice(0, COURSE_PATH_INDEX);
			}
		}
		this.routerGoTo(route);
		return new Promise((resolve) => {
			this.setState({
				course: courseId
			}, resolve);
		});
	}

	coursePrompt(lessonId, message = "Select a course to submit to:") {
		return new Promise(resolve => {
			cc.request.get(`/api/module/${lessonId}/courses-for`).then(async ({ data: { data: list } }) => {
				let course = null;
				if (list.length === 1) {
					course = list[0].id;
					resolve(course);
				} else if (list.length === 0) {
					resolve(course);
				} else {
					this.showDialog(OptionsDialog, {
						values: list,
						get: "title",
						prompt: message,
						onSubmit: async (ent) => {
							this.closeDialog();
							resolve(ent.id);
						},
						closable: false
					});
				}
			});
		});
	}

	get course() {
		return this.state.course || null
	}

	/**
	 * Sets the selected course ID for the current Model object
	 * @param {number} courseId 
	 */
	setSelectedCourseId(courseId = 0) {
		this.setState((prev) => ({...prev, course: courseId}));
	}

} );
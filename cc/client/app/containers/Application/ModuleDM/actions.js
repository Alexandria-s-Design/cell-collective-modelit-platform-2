const URL = "@cc/cc/containers/Application/ModuleDM";
export const ActionType =
{
    REPLACE_MODELS: `${URL}/REPLACE_MODELS`,
    INIT_MODELS: `${URL}/INIT_MODELS`,
    COPY_MODEL: `${URL}/COPY_MODEL`,
    SELECT_MODEL: `${URL}/SELECT_MODEL`,
    REMOVE_MODELS: `${URL}/REMOVE_MODELS`,
		LESSON_SELECTED: `${URL}/LESSON_SELECTED`,
		SUBMITTED_LESSONS: `${URL}/SUBMITTED_LESSONS`,
};

const modelsReplaceOrInit = (replace) => (data) => ({
    type: replace ? ActionType.REPLACE_MODELS : ActionType.INIT_MODELS,
    payload: data
});

export const modelsReplace = modelsReplaceOrInit(true);
export const modelsInit = modelsReplaceOrInit(false);
export const modelsRemove = (ids) => ({
        type: ActionType.REMOVE_MODELS,
        payload: { ids }
});

export const modelSelect = (id) => ({
        type: ActionType.SELECT_MODEL,
        payload: {id}
})

export const modelCopy = (fromId, toId) => {
	return ({
        type: ActionType.COPY_MODEL,
        payload: {
            fromId,
            toId
        }
  })
};

export const setCurrentLessonAction = (id, originId, submitted, data, actType, started = false, versionId=null, version=null) => ({
	type: ActionType.LESSON_SELECTED,
	payload: {
			id: id === undefined ? null : id,
			originId: originId === undefined ? null : originId,
			data,
			submitted,
			type: actType,
			started: started,
			versionId: versionId != null ? Number(versionId) : id,
			version: version != null ? Number(version) : 0,
	}
});

export const setSubmittedLessonsAction = (models = []) => ({
	type: ActionType.SUBMITTED_LESSONS,
	payload: {
		models
	}
});
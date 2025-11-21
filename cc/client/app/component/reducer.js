import React from 'react'

export default function checkCompleteReducer(state = [], action) {
	switch(action.type) {
		case CHECK_LESSON_COMPLETE:
			{
				const checkComplete = action.payload;
				return {
					...state,
					checkComplete // update the checkComplete boolean value
				}
			}
		case GET_MODEL_NAME:
			{
				const modelName = action.payload;
				return modelName;
			}
		default:
			return state;
	}
}
export const getSelectedModuleId = (state) => 
    state.app.modules.selected;

export const getSelectedModule = (state) =>{
		const modules = state.app.modules || {};
    return modules[modules.selected];
}

export const getModule = (state, id) => {
    const modules = state.app.modules || {};
    return modules[id];
}
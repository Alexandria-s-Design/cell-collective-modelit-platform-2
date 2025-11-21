import Entity  from "../../Entity";

export const ContextType = { iMAT: 'iMAT', FastCore: 'FASTCORE', GIMME: 'GIMME'}

export default class ContextDownloads extends Entity { }

Entity.init({ ContextDownloads }, {
	contextType: null,
	id: null,
	count: 0,
	action: '',
	context: '',
	createdAt: ''
});
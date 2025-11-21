import request from '../../request';

const _cache = {};
let cache = null;
const cbks = [];

const loaded_page   = new Promise(resolve => window.addEventListener('load', () => {
	_cache['components'] = window.UIDemo;
	resolve();
}));
const loaded_source = request.get('/dev/ui-test').then(res => {
	_cache['source'] = res.data;
});

Promise.all([loaded_page, loaded_source]).then(() => {
	cache = _cache;
	for (const cbk of cbks) {
		cbk(cache);
	}
});

export default async () => {
	if (cache === null) {
		return await new Promise(resolve => {
			cbks.push(resolve);
		});
	} else {
		return cache;
	}
};
const cache = require("../../cc/cache");

describe('Testing Cache by Redis', () => {
  var pathCacheRds = 'test:spec:redis-cache';
	var msgCacheRds = '{"message":"test"}';
	var cacheData = '';

  beforeEach((done) => {
		new Promise(async (resolve) => {
			await cache.call("JSON.SET", `test:spec:redis-cache`, ".", msgCacheRds);
			cacheData = await cache.call("JSON.GET", pathCacheRds);
			done();
		})
  });

  afterEach((done) => {		
		new Promise(async (resolve) => {
			await cache.call('JSON.DEL', pathCacheRds);
			done();
		})
  });

  test('cache data', () => {
    expect(cacheData).toBe(msgCacheRds);
		expect(cacheData).not.toBeNull();
  });

});
var fs = require('fs');

test('Testing storage folder', () => {

	let content_test = 'Test';
	let content_tested = '';

	let fname = '/storage/log_test_'+(new Date()).getTime()+'.txt';
	
	fs.writeFileSync(fname, content_test, {encoding: 'utf8' });
	
	content_tested = fs.readFileSync(fname, (err) => console.log(err));

	fs.unlinkSync(fname);

	expect(content_test).toEqual(content_test.toString());
});

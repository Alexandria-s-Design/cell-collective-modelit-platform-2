const { EMAIL } = require("../../cc/const");

test('Testing const Email: SMTP options', () => {
	expect(true).toBe('SMTP_OPTIONS' in EMAIL);
});

test('Testing const Email: Template', () => {
	expect(true).toBe('REMINDER_TEMPLATE' in EMAIL);
})
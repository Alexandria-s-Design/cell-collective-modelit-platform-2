const PREFIX    = "cc";

const getevent  = (name, { user = null, prefix = PREFIX } = { }) =>
{
		if ( user ) {
			prefix = `${prefix}:${user.id}`
		}

    return `${prefix}:${name}`
};

export { PREFIX, getevent };
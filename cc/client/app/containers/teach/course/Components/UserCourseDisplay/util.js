
const MAX_TITLE_LENGTH = 20;
const extractSemesterFromDate = dateObj => {
	if (!dateObj) { return 'not specified'; }
  const month = dateObj.getMonth();
  if (month >= 0 && month <= 5) {
    return 'spring';
  }
  if (month >= 6 && month <= 8) {
    return 'summer';
  }
  if (month >= 9 && month <= 12) {
    return 'fall';
  }
};

export const courseDisplayFormatter = course => {
  if (!course) {
    return '...';
  }
	const date = new Date(course.startDate);
  course.title += ''; //force type
  const formattedTitle = course.title.substring(0, Math.min(course.title.length, MAX_TITLE_LENGTH)) + (course.title.length > MAX_TITLE_LENGTH ? '...' : '');
  return formattedTitle + '|' + extractSemesterFromDate(date) + '|' + (date ? date.getYear() : 'not specified');
};
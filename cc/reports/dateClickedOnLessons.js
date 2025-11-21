import fs from 'fs';
import { db } from "../models"
import moment from 'moment';
import { getenv } from '../util/environment';
import { fromJS } from 'immutable';
import { reportToCSV } from '../util/report';

console.log('process.argv', process.argv);
const OUTPUT_PATH = (process.argv.length < 3) ? 
										`${__dirname}/./dateClickedOnLessonReport.csv` : 
										process.argv[2];

const processDataFromReport = res => {
  const columns = ['Institution', 'Lesson Name', 'Date clicked', 'Email', 'First Name', 'Last Name']; //Header list
  let data = [];

  res.map(row => {
    const formated_row = {};
    formated_row['Institution'] = row.institution;
    formated_row['Lesson Name'] = row.lesson_name;
    formated_row['Date clicked'] = moment(row.creationdate).format('YYYY-MM-DD HH:mm:ss');
    formated_row['Email'] = row.email;
    formated_row['First Name'] = row.firstname;
    formated_row['Last Name'] = row.lastname;
    data.push(formated_row);
  });
  data = fromJS(data).toOrderedSet();

  const output = [];
  data.map(item => {
    output.push(item.toObject());
  });
  return { columns: columns, data: output };
};

const getReport = async () => {
  const query = `
		SELECT  
			u.institution as "institution", 
			m.name as "lesson_name", 
			mda.creationdate, 
			u.email,
			u.firstname,
			u.lastname
		FROM model_domain_access mda  
			INNER JOIN model m ON m.id=mda.modelid 
			INNER JOIN user_identity_view u ON u.id=mda.userid 
		ORDER BY mda.creationdate DESC
  `;

  const results = await db.query(query);
  const report = processDataFromReport(results);
	const csv = reportToCSV(report);
  return csv;
};

(
	async () => {
		console.log("Writing file.....");
		const csv = await getReport();

		fs.writeFile(OUTPUT_PATH, csv, 'utf8', () => {
			console.log(`File saved to path - ${OUTPUT_PATH}`);
			process.exit(1);
		});
	}
)();


import React from "react";
import view from "../../../base/view";
import Panel from "../../../base/panel";
import Message from '../../../dialog/message';
import Scrollable from "../../../base/scrollable";
import FileInput from "../../../base/fileInput";
import csv from "csv-parser";

class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			csvData: null
		};
	}
	
	shouldComponentUpdate(props, state) {
		return props.entities !== this.props.entities;
	}

	render() {
		const { entity, actions, cc } = this.props;

		const readFileAsync = (file) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = (event) => resolve(event.target.result);
				reader.onerror = (error) => reject(error);
				reader.readAsText(file);
			});
		};

		const parseCsvAsync = (csvText) => {
			return new Promise((resolve, reject) => {
				const csvData = [];
				const stream = csv()
					.on('data', (row) => {
						const cleanRow = {};
						for (const key in row) {
							const cleanedKey = key.replace(/[^a-zA-Z0-9]/g, ''); // Remove non-alphanumeric characters
							cleanRow[cleanedKey] = row[key];
						}
						csvData.push(cleanRow);
					}) 
					.on('end', () => {
						
						if (
							!csvData[0] ||
							!Object.keys(csvData[0]).some((key) => key.toLowerCase() === 'conc')
						) {
							cc.showDialog(
								Message,
								{ message: 'CSV file must have "conc" columns.' });
						} else {
							resolve(csvData);
						}
					})
					.on('error', (error) => {
						reject(error);
					});
		
				stream.write(csvText);
				stream.end();
			});
		};
		

		const uploadDocuments = async (e) => {
			const file = e[0];

			if (file) {
				try {
					const fileData = await readFileAsync(file);
					this.setState({csvData: await parseCsvAsync(fileData)})
					actions.onEditModelState(["observation", "csvData"], this.state.csvData);
				} catch (error) {
					console.error('Error:', error);
				}
			}
		};

		return (
			<Panel>
				<Scrollable>
					<FileInput
						name="fileImportInput"
						ext=".csv"
						title="Upload data:" multiple={true}
						inSpan={true}
						onChange={uploadDocuments} />
				</Scrollable>
			</Panel>
		);
	}
}

const Actions = () => {
	return {
	};
};

export default view(Content, null, Actions);
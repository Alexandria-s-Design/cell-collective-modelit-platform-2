import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import backgroundImage from '../../assets/images/cert.jpg';

// Create Document Component
class PDF extends React.Component {
	
	render() {
		// Create styles
		const styles = StyleSheet.create({
			page: {
				flexDirection: 'row',
			},
			section: {
				margin: 10,
				padding: 10,
				flexGrow: 1
			},
			image: {
				objectFit: 'cover',
				zIndex: '1'
			}
		});
		return (
			<Document>
					<Page size="A4" style={styles.page}>
						<View style={styles.section}>
							<Image style={styles.image} src={backgroundImage} alt='Certificate of Completion'/>
						</View>
					</Page>
				</Document>
		)
	}
}

export default PDF;
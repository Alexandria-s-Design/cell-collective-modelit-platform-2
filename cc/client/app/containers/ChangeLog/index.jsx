import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CircularProgress } from '@mui/material';


class ChangeLog extends Component {
	state = {
		content: null
	}

	componentDidMount() {
		fetch('/api/system/changelog', {
			method: "GET"
		})
		.then((res) => res.json())
		.then((data) => {
			this.setState({content: data.data});
		})
		.catch((err) => {
			this.setState({content: "Error loading CHANGELOG.. \n\n" + JSON.stringify(err) });
		})
	}

  render() {
    return (
      <div id="page-container">
        <div id="back-to-dashboard">
          <Link to="/dashboard">
            <ArrowBackIcon /> Cellcollective Dashboard
          </Link>
        </div>
        <div id={'page-content'}>
          {this.state.content && <ReactMarkdown source={this.state.content} />}
					{!this.state.content && <CircularProgress />}
        </div>
      </div>
    );
  }
}

export default ChangeLog;

import React from "react";
import view from "../base/view";
import Panel from "../base/panel";
import Scrollable from "../base/scrollable";
import Utils from "../../utils";
import Checkbox from "../base/checkbox";
import { FormattedMessage } from "react-intl"
import messages from "../../containers/Application/messages";

class Content extends React.Component {
	constructor(props){
		super(props);
		this.state = {msg : false, allSelect : false};
	}
	componentWillUnmount(props){
		this.props.actions.onStartTopologyAnalysis(null, null);
	}
	setValue(k, v, prev){
		return this.props.actions.onEditModelState(["Topology", "selection", k],v, prev);
	}
	getValue(k){
		return this.props.modelState.getIn(["Topology", "selection", k]);
	}
	selectAll(){
		const checkboxes = ["cmatrix", "shortestPair", "averageShortestPath", "diameter", "avgConn", "topology", "distribution", "inDegree", "outDegree", "closeness"];    
		let prev;
		checkboxes.forEach(e => (prev = this.setValue(e, true, prev)));
	}
	render(){
		const props = this.props;
		const actions = props.actions;
		const networkAnalysis = props.modelState.getIn(["Topology", "data"]) || props.networkAnalysis;
		const playState = props.modelState.getIn(["Topology", "selection"]);
    
		const roundDecimal = (d) => ((d !== undefined) ? d.toFixed(3) : d);


		return (
			<Panel {...props.view}>
				<Scrollable className="topology-panel">
					<div className="simulation control">
						<input type="button" className={"icon large-" + "run"} disabled={Utils.enabled(playState)} onClick={() => {actions.onStartTopologyAnalysis(props.model.Component, props.modelState, props); this.setState({msg : true});}}/>
						<FormattedMessage id="ModelDashboard.TopologyView.LabelClickHereToSelectAll" defaultMessage="Click Here to Select All">
						{(message)=>(<input type="button" className={"icon large-" + "list"} onClick={this.selectAll.bind(this)} title={message}/>)}
						</FormattedMessage>
						
					</div><br/>

					<div className="simulation">
						<div>
							<Checkbox value={this.getValue("cmatrix")}  onEdit={this.setValue.bind(this,"cmatrix",!this.getValue("cmatrix"), undefined)}/>
							<span className="topology"> <FormattedMessage id="ModelDashBoard.TopologyView.LabelConnectivityMatrix" defaultMessage="Connectivity Matrix"/>

							<FormattedMessage id="ModelDashboard.TopologicalView.LabelDownloadConnectivityMatrixFile" defaultMessage="Download Connectivity Matrix File">
							{(message)=>(<input type="button" className="icon base-download topology-result" title={message} disabled={!networkAnalysis.cmatrix} style={{color: "white"}} onClick={()=> Utils.downloadBinary(`[${props.model.name}]_connectivityMatrix.csv`, new Blob([networkAnalysis.cmatrix], { type: "text/plain" }))}/>)}
								</FormattedMessage>
								
							</span>
						</div><br/>
						<div>
							<Checkbox value={this.getValue("shortestPair")} onEdit={this.setValue.bind(this,"shortestPair",!this.getValue("shortestPair"), undefined)}/>
							<span className="topology"> <FormattedMessage id="ModelDashBoard.TopologyView.LabelAllPairsShortestPath" defaultMessage="All-Pairs Shortest Path"/>
							<FormattedMessage id="ModelDashboard.TopologyView.LabelDownloadAllPairsofShortestPath" defaultMessage ="Download All Pairs of Shortest Path File">
								{(message)=>(<input type="button" className="icon base-download" title={message} disabled={!networkAnalysis.shortestPair} style={{color: "white"}} onClick={()=> Utils.downloadBinary(`[${props.model.name}]_allPairShortestPair.csv`, new Blob([networkAnalysis.shortestPair], { type: "text/plain" }))}/>
								)}
							</FormattedMessage>
							</span>
						</div><br/><br/>
						<div>
							<Checkbox value={this.getValue("averageShortestPath")} onEdit={this.setValue.bind(this,"averageShortestPath",!this.getValue("averageShortestPath"), undefined)}/>
							
							<span className="topology"> <FormattedMessage id="ModelDashBoard.TopologyView.LabelAverageShortestPath" defaultMessage="Average Shortest Path"/> 
							<span className="results">{roundDecimal(networkAnalysis.averageShortestPath)}</span></span>
						</div><br/>
						<div>
							<Checkbox value={this.getValue("diameter")} onEdit={this.setValue.bind(this,"diameter",!this.getValue("diameter"), undefined)}/>
							<span className="topology"> <FormattedMessage id="ModelDashBoard.TopologyView.LabelNetworkDiameter" defaultMessage="Network Diameter"/> 
							<span className="results nDiameter">{networkAnalysis.diameter}</span></span>
						</div><br/>
						<div>
							<Checkbox value={this.getValue("avgConn")} onEdit={this.setValue.bind(this,"avgConn",!this.getValue("avgConn"), undefined)}/><span className="topology">
								<FormattedMessage id="ModelDashBoard.TopologyView.LabelAverageConnectivity" defaultMessage="Average Connectivity"/> 
								<span className="results">{roundDecimal(networkAnalysis.avgConn)}</span></span>
						</div><br/><br/><br/>
						<div>
							<Checkbox value={this.getValue("distribution")} onEdit={this.setValue.bind(this,"distribution",!this.getValue("distribution"), undefined)}/>
							<span className="topology"> <FormattedMessage id="ModelDashBoard.TopologyView.LabelConnectivityDistribution" defaultMessage="Connectivity Distribution"/>

							<FormattedMessage id="ModelDashboard.TopologyView.DownloadConnectivityDistributionFile" defaultMessage ="Download Connectivity Distribution File">
								{(message)=>(<input type="button" className="icon base-download" title={message} disabled={!networkAnalysis.distribution} style={{color: "white"}} onClick={()=> Utils.downloadBinary(`[${props.model.name}]_connectivityDistribution.csv`, new Blob([networkAnalysis.distribution], { type: "text/plain" }))}/>
								)}
							</FormattedMessage>
							</span>
						</div><br/>
						<div>
							<Checkbox value={this.getValue("inDegree")} onEdit={this.setValue.bind(this,"inDegree",!this.getValue("inDegree"), undefined)}/>
							<span className="topology"> <FormattedMessage id="ModelDashBoard.TopologyView.LabelConnectivityInDegree" defaultMessage="Connectivity In Degree"/>
								<FormattedMessage id="ModelDashboard.TopologyView.LabelDownloadConnectivityDistributionFile" defaultMessage="Download Connectivity Distribution File">
								{(message)=> (<input type="button" className="icon base-download" title={message} disabled={!networkAnalysis.inDegree} style={{color: "white"}} onClick={()=> Utils.downloadBinary(`[${props.model.name}]_connectivityInDegree.csv`, new Blob([networkAnalysis.inDegree], { type: "text/plain" }))}/>)}
								</FormattedMessage>
							</span>
						</div><br/>
						<div>
							<Checkbox value={this.getValue("outDegree")} onEdit={this.setValue.bind(this,"outDegree",!this.getValue("outDegree"), undefined)}/>
							<span className="topology"> <FormattedMessage id="ModelDashBoard.TopologyView.LabelConnectivityOutDegree" defaultMessage="Connectivity Out Degree"/>
							<FormattedMessage id="ModelDashboard.TopologicalView.DownloadConnectivityDistributionFile" defaultMessage="Download Connectivity Distribution File">
								{(message)=>(<input type="button" className="icon base-download" title={message} disabled={!networkAnalysis.outDegree} style={{color: "white"}} onClick={()=> Utils.downloadBinary(`[${props.model.name}]_connectivityOutDegree.csv`, new Blob([networkAnalysis.outDegree], { type: "text/plain" }))}/>)}
							</FormattedMessage>
								
							</span>
						</div><br/>
						<div>
							<Checkbox value={this.getValue("closeness")} onEdit={this.setValue.bind(this,"closeness",!this.getValue("closeness"), undefined)}/>
							<span className="topology"> <FormattedMessage id="ModelDashBoard.TopologyView.LabelClosenessCentrality" defaultMessage="Closeness Centrality"/>
							<FormattedMessage id="ModelDashboard.TopologicalView.DownloadClosenessCentralityFile" defaultMessage="Download Closeness Centrality file">
								{(message)=>(<input type="button" className="icon base-download" title={message} disabled={!networkAnalysis.closeness} style={{color: "white"}} onClick={()=> Utils.downloadBinary(`[${props.model.name}]_closenessCentrality.csv`, new Blob([networkAnalysis.closeness], { type: "text/plain" }))}/>)}
							</FormattedMessage>
								
							</span>
						</div><br/><br/>
					</div>
				</Scrollable>
			</Panel>
		);
	}
}


export default view(Content, null, null);

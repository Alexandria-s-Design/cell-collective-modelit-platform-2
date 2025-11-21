import  React  from "react";
import { Seq, Set } from "immutable";
import Options from "../base/options";


export default class DownloadControl extends React.Component{      
			
	render() {

		const {handleDownloadPNG, handleDownloadSVG} = this.props;
		
		const data = Seq([
			{ name: "SVG", id: "1"},
			{ name: "PNG", id: "2"}
		]);
		
		const handleOption = (e) => {
			if (e.name === "SVG") {
				handleDownloadSVG();
			}
			if (e.name === "PNG") {
				handleDownloadPNG();
			}
		}

		return (
			<dl>
				<dt>Download</dt>
				<Options
					none=""
					options={data}
					propertyName="List"
					onChange={handleOption.bind(this)}
				/>
			</dl>
		);        
	}
}


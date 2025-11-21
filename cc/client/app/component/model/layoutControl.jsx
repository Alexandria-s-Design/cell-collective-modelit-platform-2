import React from "react";
import { Seq } from "immutable";
import Application from "../../application";
import Options from "../base/options";
import Add from "../../action/add";
import UpdateProperty from "../../action/updateProperty";
import Layout from "../../entity/layout";
import LayoutComponent from "../../entity/layoutComponent";
import { FormattedMessage } from "react-intl";

const ext = (e, editable) => ((e = e.map((e, i) => new Add(e.entity, !i)).toArray()) && editable && e.push(new UpdateProperty("layout", e[0].entity)), e);

export default class LayoutControl extends React.Component {
	static creator(name, components, editable, cur, sel, initLayout, currLayout) {
		let p;
		if (currLayout) {
			p = currLayout;
		} else {
			p = new Layout( Seq(components).reduce((r,v) => ({ name: name, minX: Math.min(r.minX, v.x), maxX: Math.max(r.maxX, v.x), minY: Math.min(r.minY, v.y), maxY: Math.max(r.maxY, v.y) }), initLayout || {minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity}));
		}
		return ext(Seq([{ entity: p }]).concat(Seq(components).map(e => {
			let c = { parent: p, component: e, x: e.x, y: e.y };
			cur === e && (c = sel(c));
			return { entity: new LayoutComponent(c) };
		})), editable);
	}
	render() {
		const { model, editable, selected: { Layout: value }, actions } = this.props;
		const data = model.Layout ? Seq(model.Layout) : Seq();
		const creator = e => (value ? ext(value.copy({ name: e }, ["components"]), editable) : LayoutControl.creator(e, model.Component, editable));        

		return (
			<dl>
				<FormattedMessage id="Research.ModelDashboard.LayoutControlLabel" defaultMessage= "Layout:"/>

				<FormattedMessage id= "Research.ModelDashboard.LayoutControlDropDown" defaultMessage="Default"> 
					{x => <Options value={value} none={x} options={data.sortBy(e => e && e.name && e.name.toLowerCase())} propertyName="Layout" enabled={data.size} onChange={e => (editable && actions.batch([new UpdateProperty("layout", e)]), actions.onSelect(e || "Layout"))} editable={editable} onEdit={actions.onEdit} onAdd={() => actions.batch(creator(Application.defName(data, "New Layout ")))} 
					onRemove={e => actions.onRemove(e, e !== value ? value : undefined)}/>}
				</FormattedMessage> 

			</dl>
		);
	}
}
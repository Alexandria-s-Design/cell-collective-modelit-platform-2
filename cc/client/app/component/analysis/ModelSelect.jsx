import React from "react";
import { FormattedMessage } from "react-intl";

import Options from "../base/options";

export default class ModelSelect extends React.Component {
    render ( ) {
				const { model } = this.props;
				
        return (
            <dl>
                <dt>
                    <FormattedMessage
                        id="ModelDashBoard.ContextSpecificExperimentSettings.LabelModel"
                        defaultMessage="Model"/>
                </dt>
                {/* <Option
                  options={}/> */}
            </dl>
        )
    }
}
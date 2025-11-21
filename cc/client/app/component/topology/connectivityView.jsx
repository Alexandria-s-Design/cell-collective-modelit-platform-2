import React from "react"
import degreeGraphView from "./degreeGraphView";
import { FormattedMessage } from "react-intl"

export default degreeGraphView("distribution", {
    placeholder: <FormattedMessage id="ModelDashBoard.PanelConnectivityDistribution.LabelInstructionPlaceholder"
        defaultMessage="Select Connectivity Distribution and click run button to display the Graph"/>
});


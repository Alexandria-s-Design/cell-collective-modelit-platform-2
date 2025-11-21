import React from "react";
import { FormattedMessage } from "react-intl"

export default {
	Integrate: "Integrate knowledge and data from various parts and scales of biological systems into comprehensive computational models. Evolve models in a collaborative fashion or in your private \"sandbox\".",
	Model: "Model a multitude of biological processes, including metabolic networks, gene regulation, signal transduction, cell-cell interaction networks, food webs, etc. related to various organisms ranging from bacteria to viruses to flies to plants to humans. Define models without the need to enter or modify complex mathematical equations.",
	Simulate: "Use real-time, interactive simulations to visualize the dynamics of the biological process under various extracellular as well as mutational (i.e., diseased) conditions. Run hundreds of simulation experiments in a matter of minutes and perform input-output analysis to visualize cellular responses under different conditions.",
	Analyze: "Analyze the dynamics and responses of biological systems under different conditions. Run system-wide perturbation analyses to predict and rank the effects of individual and combinations of components on the system. Predict and explore drug re-purposing and combinatorial therapy opportunities.",
	ContactUs: "Is there a feature that you would like for your research? Do you have suggestions for improving the platform? Let us know!",
	Privacy: (<span>Models (and any associated data/knowledge) created as private are owned by the user who created the model. Models made public (i.e. under &quot;Public Modules&quot;) are governed by the <a href="http://www.gnu.org/licenses/gpl-3.0.en.html">GNU GPL v.3 license</a>.</span>),
	TermsOfUse: (<span>
		<FormattedMessage id="ModelDashBoard.SignUpModal.TermsOfUse"
			defaultMessage={`ModelIt! is freely available for use by the academic and non-profit research community. The use of ModelIt! within pro-profit organizations may require additional licensing agreements. Please contact {supportEmailLink} for more information.<br/><br/>Publications that result from use of ModelIt! should acknowledge {websiteLink} as the source of those data and cite the following paper: Helikar et. al. 2012. BMC Syst Biol. 6:96. doi: 10.1186/1752-0509-6-96.`}
			values={{
				supportEmailLink: <a href="mailto:info@discoverycollective.com">info@discoverycollective.com</a>,
				websiteLink: <a href="http://www.cellcollective.org">http://www.cellcollective.org</a>,
				br: <br />, 
			}}
			/>
	</span>),
	LearningType: {
		Editing: "Model editing activities"
	}
};
/**
 * 
 */
package cc.application.jsbml;

import java.util.Map;
import java.util.Set;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.LinkedList;

import javax.xml.stream.XMLStreamException;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringEscapeUtils;
import org.sbml.jsbml.ASTNode;
import org.sbml.jsbml.Annotation;
import org.sbml.jsbml.CVTerm;
import org.sbml.jsbml.CVTerm.Qualifier;
import org.sbml.jsbml.Compartment;
import org.sbml.jsbml.Creator;
import org.sbml.jsbml.History;
import org.sbml.jsbml.Model;
import org.sbml.jsbml.SBMLDocument;
import org.sbml.jsbml.SBMLException;
import org.sbml.jsbml.SBMLWriter;
import org.sbml.jsbml.ext.layout.BoundingBox;
import org.sbml.jsbml.ext.layout.Layout;
import org.sbml.jsbml.ext.layout.LayoutModelPlugin;
import org.sbml.jsbml.ext.layout.Point;
import org.sbml.jsbml.ext.layout.GeneralGlyph;
import org.sbml.jsbml.ext.qual.FunctionTerm;
import org.sbml.jsbml.ext.qual.Input;
import org.sbml.jsbml.ext.qual.InputTransitionEffect;
import org.sbml.jsbml.ext.qual.Output;
import org.sbml.jsbml.ext.qual.OutputTransitionEffect;
import org.sbml.jsbml.ext.qual.QualModelPlugin;
import org.sbml.jsbml.ext.qual.QualitativeSpecies;
import org.sbml.jsbml.ext.qual.Sign;
import org.sbml.jsbml.ext.qual.Transition;
import org.sbml.jsbml.text.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cc.application.jsbml.knowledge.ReferenceNode;
import cc.common.data.biologic.Species;
import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.builder.BooleanExpressionBuilder;
import cc.common.data.builder.BooleanExpressionBuilder.INPUT_SIGN;
import cc.common.data.knowledge.Content;
import cc.common.data.knowledge.Page;
import cc.common.data.knowledge.Reference;
import cc.common.data.knowledge.ReferenceBase;
import cc.common.data.knowledge.Section;
import cc.common.data.model.LayoutNode;
import cc.common.data.user.Profile;

/**
 * @author Bryan Kowal
 *
 */
public class SBMLExporter {

	private static final String KB_SECTION_DESCRIPTION = "Description";

	private static final String KB_SECTION_REGULATORY_SUMMARY = "RegulatorySummary";

	private static final String KB_SECTION_UPSTREAM_REGULATOR = "UpstreamRegulator";

	private static final String TR_ID_PREFIX = "tr_";

	private static final String IN_ID_TEMPLATE = "%s_in_%s";

	private final Logger logger = LoggerFactory.getLogger(getClass());

	private final cc.common.data.model.Model model;

	private final Map<Long, Page> pageMap;

	private final cc.common.data.model.Layout layout;

	private final List<LayoutNode> layoutNodes;

	private final Profile profile;

	private final Map<Long, String> sbmlVariableMap;

	private final List<Species> externalSpeciesList;

	private boolean biologicSpeciesExist;

	private final SBMLExpressionCustomizer expressionCustomizer;

	private SBMLDocument sbmlDocument;

	private Model sbmlModel;

	private QualModelPlugin qualModel;

	private LayoutModelPlugin layoutModel;

	private Set<List<ReferenceNode>> referencesKnowledgeBase = new HashSet<>();

	/*
	 * Compartment for external Species.
	 */
	private Compartment extracellularCompartment;

	/*
	 * Compartment for biologic Species.
	 */
	private Compartment cytosolCompartment;

	/**
	 * References added in the model
	 */
	private Set<ReferenceBase> referencesBase;

	public SBMLExporter(cc.common.data.model.Model model, final Map<Long, Page> pageMap, final Profile profile,
			final cc.common.data.model.Layout layout, final List<LayoutNode> layoutNodes) {
		this.model = model;
		this.pageMap = pageMap;
		this.layout = layout;
		this.layoutNodes = layoutNodes;
		this.profile = profile;
		this.sbmlVariableMap = new HashMap<>(model.getSpecies().size(), 1.0f);
		this.externalSpeciesList = new LinkedList<>();
		int count = 0;
		for (Species species : model.getSpecies()) {
			++count;
			final String idAlias = SBMLProperties.SPECIES_ID_PREFIX + Integer.toString(count);
			this.sbmlVariableMap.put(species.getId(), idAlias);
			if (species.isExternal() != null && species.isExternal()) {
				this.externalSpeciesList.add(species);
			} else if (this.biologicSpeciesExist == false) {
				this.biologicSpeciesExist = true;
			}
		}
		expressionCustomizer = new SBMLExpressionCustomizer(this.sbmlVariableMap);
	}

	public byte[] exportSBML() throws SBMLExportException {
		/*
		 * Start the {@link SBMLDocument}.
		 */
		this.sbmlDocument = new SBMLDocument(SBMLProperties.SBML_LEVEL, SBMLProperties.SBML_VERSION);
		this.sbmlDocument.addDeclaredNamespace(SBMLProperties.SBML_NAMESPACE, SBMLProperties.SBML_QUAL_URI);
		this.sbmlDocument.getSBMLDocumentAttributes().put(SBMLProperties.QUAL_REQUIRED, SBMLProperties.TRUE);

		this.createQualModel();
		this.createLayoutModel();
		this.createCompartments();
		this.createExternalQualSpecies();
		this.createBiologicQualSpecies();

		SBMLWriter sbmlWriter = new SBMLWriter();
		final ByteArrayOutputStream baos = new ByteArrayOutputStream();
		try {
			sbmlWriter.write(this.sbmlDocument, baos);
		} catch (SBMLException | XMLStreamException e) {
			throw new SBMLExportException(this.model, e);
		}

		return baos.toByteArray();
	}

	private void createQualModel() throws SBMLExportException {
		final String modelId = "M" + Long.toString(this.model.getId());

		this.sbmlModel = this.sbmlDocument.createModel(modelId);
		this.sbmlModel.setName(this.model.getName());
		this.sbmlModel.getHistory().addModifiedDate(this.model.getUpdateDate().getTime());
		if (this.model.getDescription() != null && !this.model.getDescription().trim().isEmpty()) {
			try {
				this.sbmlModel.appendNotes("<body xmlns=\"http://www.w3.org/1999/xhtml\">"
						+ StringEscapeUtils.escapeXml11(this.model.getDescription().trim()) + "</body>");
			} catch (XMLStreamException e) {
				/*
				 * Ignore.
				 */
			}
		}
		final Annotation annotation = new Annotation();
		final History history = new History();
		Date modifiedDate = model.getBiologicUpdateDate().getTime();
		if (model.getKnowledgeBaseUpdateDate() != null
				&& model.getKnowledgeBaseUpdateDate().getTime().after(modifiedDate)) {
			modifiedDate = model.getKnowledgeBaseUpdateDate().getTime();
		}
		history.setModifiedDate(modifiedDate);
		if (model.getCreationDate() != null) {
			history.setCreatedDate(model.getCreationDate().getTime());
		}
		if (this.profile != null) {
			history.addCreator(new Creator(profile.getFirstName(), profile.getLastName(), profile.getInstitution(),
					profile.getEmail()));
		}
		annotation.setHistory(history);

		if (CollectionUtils.isNotEmpty(model.getReferences())) {
			final Set<Reference> references = new HashSet<>(model.getReferences().size(), 1.0f);
			model.getReferences().forEach(mr -> references.add(mr.getReference()));
			String[] referenceArray = buildReferenceArray(references);
			if (referenceArray != null) {
				for (String reference : referenceArray) {
					annotation.addCVTerm(new CVTerm(Qualifier.BQB_IS_DESCRIBED_BY, reference));
				}
			}
		}
		this.sbmlModel.setAnnotation(annotation);

		qualModel = new QualModelPlugin(this.sbmlModel);
		this.sbmlModel.addExtension(SBMLProperties.SBML_QUAL_URI, qualModel);
	}

	private void createLayoutModel() {
		if (this.layout == null) {
			return;
		}

		layoutModel = new LayoutModelPlugin(this.sbmlModel);
		this.sbmlModel.addExtension(SBMLProperties.SBML_LAYOUT_URI, layoutModel);

		final Layout sbmlLayout = new Layout();
		// String layoutId = "layout_" + System.currentTimeMillis();
		// sbmlLayout.setId(layoutId);

		if (layout.getName() != null) {
			sbmlLayout.setName(layout.getName());
		}
		List<String> sbmlReferenceIds = new ArrayList<>();
		if (CollectionUtils.isNotEmpty(layoutNodes)) {
			for (LayoutNode layoutNode : layoutNodes) {
				GeneralGlyph generalGlyph = new GeneralGlyph();
				final String reference = sbmlVariableMap.get(layoutNode.getComponentId());
				if (reference == null) {
					logger.error("Component "+layoutNode.getComponentId() + " was not found into map "+sbmlVariableMap.toString());
					continue;
				}
				if (sbmlReferenceIds.contains(reference)) {
					logger.error("Component "+layoutNode.getComponentId() + " was already added into map "+reference);
					continue;
				}
				sbmlReferenceIds.add(reference);
				if (layoutNode.getX() == null) {
					layoutNode.setX(0.11);
				}
				if (layoutNode.getY() == null) {
					layoutNode.setY(0.15);
				}

				generalGlyph.setId(reference + "_glyph");
				generalGlyph.setReference(reference);

				final Point point = new Point();
				point.setX(layoutNode.getX());
				point.setY(layoutNode.getY() * -1);
				point.setZ(0.0);

				final BoundingBox boundingBox = new BoundingBox();
				boundingBox.setPosition(point);
				generalGlyph.setBoundingBox(boundingBox);

				sbmlLayout.addGeneralGlyph(generalGlyph);
			}
		}

		layoutModel.add(sbmlLayout);
	}

	private String[] buildReferenceArray(final Collection<Reference> references) {
		if (CollectionUtils.isEmpty(references)) {
			return null;
		}

		List<String> referenceLinks = new ArrayList<>(references.size());
		for (Reference reference : references) {
			String referenceLinkString = null;

			if (reference.getPmid() != null && !reference.getPmid().isEmpty()) {
				referenceLinkString = "urn:miriam:pubmed:" + reference.getPmid().trim();
			}
			if (reference.getDoi() != null && !reference.getDoi().isEmpty()) {
				referenceLinkString = "https://doi.org/" + reference.getDoi().trim();
			}

			if (referenceLinkString != null) {
				referenceLinks.add(referenceLinkString);
			}
		}
		return referenceLinks.toArray(new String[0]);
	}

	private void createCompartments() {
		this.extracellularCompartment = new Compartment(SBMLProperties.COMPARTMENT_EXTRACELLULAR);
		this.extracellularCompartment.setName(SBMLProperties.COMPARTMENT_EXTRACELLULAR);
		this.extracellularCompartment.setConstant(true);
		this.cytosolCompartment = new Compartment(SBMLProperties.COMPARTMENT_CYTOSOL);
		this.cytosolCompartment.setName(SBMLProperties.COMPARTMENT_CYTOSOL);
		this.cytosolCompartment.setConstant(true);
	}

	private void createExternalQualSpecies() throws SBMLExportException {
		if (this.externalSpeciesList.isEmpty()) {
			return;
		}

		for (Species species : this.externalSpeciesList) {
			final String speciesAlias = this.sbmlVariableMap.get(species.getId());
			QualitativeSpecies qSpecies = this.qualModel.createQualitativeSpecies(speciesAlias,
					SBMLProperties.COMPARTMENT_EXTRACELLULAR, true);
			qSpecies.setName(species.getName());
			qSpecies.setLevel(SBMLProperties.SBML_LEVEL);

			final Page page = pageMap.get(species.getId());
			if (page != null && CollectionUtils.isNotEmpty(page.getSections())) {
				Section descriptionSection = null;
				Section regulatorySummarySection = null;

				/*
				 * Find a Description Section.
				 */
				for (Section section : page.getSections()) {
					if (KB_SECTION_DESCRIPTION.equals(section.getType())) {
						descriptionSection = section;
					} else if (KB_SECTION_REGULATORY_SUMMARY.equals(section.getType())) {
						regulatorySummarySection = section;
					}
				}
				String notes = buildTextFromContents(descriptionSection);
				String notesRegulatory = buildTextFromContents(regulatorySummarySection);
				if (notes != null) {
					try {
						qSpecies.appendNotes(notes);
					} catch (XMLStreamException e) {
						/*
						 * Ignore.
						 */
					}
				}
				if (notesRegulatory != null) {
					try { qSpecies.appendNotes(notesRegulatory); } catch (XMLStreamException e) { }
				}
			}
			final Annotation annotation = new Annotation();
			if (species.getUpdateDate() != null) {
				final History history = new History();
				history.setModifiedDate(species.getUpdateDate().getTime());
				annotation.setHistory(history);
			}
			if (page != null && CollectionUtils.isNotEmpty(page.getReferences())) {
				final Set<Reference> references = new HashSet<>(page.getReferences().size(), 1.0f);
				page.getReferences().forEach(pr -> references.add(pr.getReference()));
				String[] referenceArray = buildReferenceArray(references);
				if (referenceArray != null) {
					for (String reference : referenceArray) {
						annotation.addCVTerm(new CVTerm(Qualifier.BQB_IS_DESCRIBED_BY, reference));
					}
				}
			}

			if (CollectionUtils.isNotEmpty(this.referencesKnowledgeBase)) {
				for (List<ReferenceNode> referenceList : this.referencesKnowledgeBase) {
					final CVTerm referGroup = new CVTerm(Qualifier.BQB_IS_DESCRIBED_BY);
					for (ReferenceNode reference : referenceList) {											
						referGroup.addResource(this.buildReferenceLink(reference.getPmid(), reference.getDoi()));
					}
					annotation.addCVTerm(referGroup);
				}
			}			
			qSpecies.setAnnotation(annotation);
		}

		this.sbmlModel.addCompartment(this.extracellularCompartment);
	}

	private String buildTextFromContents(final Section section) {
		if (section == null || CollectionUtils.isEmpty(section.getContents())) {
			return null;
		}

		int pContentKey = 0;
		String sectionPkey = "P_"+section.getType().toLowerCase()+"_";
		StringBuilder sb = new StringBuilder("<body xmlns=\"http://www.w3.org/1999/xhtml\">");
		for (Content content : section.getContents()) {
			if (content.getText() == null || content.getText().trim().isEmpty()) {
				continue;
			}

			sb.append("<p key=\""+sectionPkey+pContentKey+"\" contentType=\""+section.getType()+"\">").append(StringEscapeUtils.escapeXml11(content.getText().trim())).append("</p>");
			if (CollectionUtils.isNotEmpty(content.getReferences())) {

				List<ReferenceNode> referencesFromContent = new ArrayList<>();

				final StringBuilder sbRefersTagLi = new StringBuilder();
				content.getReferences().forEach(mr -> {
					String typeRefer = null;
					String doiStr = "";
					String pmidStr = "";
					
					if (mr.getReference().getDoi() != null) {
						typeRefer = "DOI";
						doiStr 		= mr.getReference().getDoi().trim();
					} else if (mr.getReference().getPmid() != null) {
						typeRefer = "PMID";
						pmidStr 	= mr.getReference().getPmid().trim();
					}

					sbRefersTagLi.append("<li>");
					sbRefersTagLi.append("<span class=\"referType\">"+typeRefer+"</span>");
					sbRefersTagLi.append("<span class=\"position\">"+mr.getPosition()+"</span>");
					sbRefersTagLi.append("<span class=\"doi\">"+doiStr+"</span>");
					sbRefersTagLi.append("<span class=\"pmid\">"+pmidStr+"</span>");
					sbRefersTagLi.append("</li>");

					final ReferenceNode referNode = new ReferenceNode();
					referNode.setDoi(doiStr);
					referNode.setPmid(pmidStr);
					referNode.setPosition(mr.getPosition());
					referNode.setReferType(typeRefer);
					referNode.setSectionType(section.getType());
					referencesFromContent.add(referNode);
				});
				sb.append("<ul key=\""+sectionPkey+pContentKey+"\">").append(sbRefersTagLi.toString().trim()).append("</ul>");
				this.referencesKnowledgeBase.add(referencesFromContent);
			}
			pContentKey++;
		}
		sb.append("</body>");

		return sb.toString();
	}

	private void createBiologicQualSpecies() throws SBMLExportException {
		if (this.biologicSpeciesExist == false) {
			return;
		}

		this.sbmlModel.addCompartment(this.cytosolCompartment);
		for (Species species : model.getSpecies()) {
			if (species.isExternal() != null && species.isExternal()) {
				continue;
			}

			final String speciesAlias = this.sbmlVariableMap.get(species.getId());
			final Set<SpeciesIdentifier> inputSpeciesSet = BooleanExpressionBuilder.buildInputSpeciesList(species);
			QualitativeSpecies qSpecies = this.qualModel.createQualitativeSpecies(speciesAlias,
					SBMLProperties.COMPARTMENT_CYTOSOL, inputSpeciesSet.isEmpty());
			qSpecies.setName(species.getName());
			qSpecies.setLevel(SBMLProperties.SBML_LEVEL);
			qSpecies.setMaxLevel(SBMLProperties.SBML_SPECIES_MAX_LEVEL);
			qSpecies.setInitialLevel(SBMLProperties.SBML_SPECIES_INITIAL_LEVEL);

			final Page page = pageMap.get(species.getId());
			Section descriptionSection = null;
			Section regulatorySummarySection = null;
			final Map<String, Section> upstreamRegulatorSectionMap = new HashMap<>();
			if (page != null && CollectionUtils.isNotEmpty(page.getSections())) {
				for (Section section : page.getSections()) {
					if (KB_SECTION_DESCRIPTION.equals(section.getType())) {
						descriptionSection = section;
					} else if (KB_SECTION_REGULATORY_SUMMARY.equals(section.getType())) {
						regulatorySummarySection = section;
					} else if (KB_SECTION_UPSTREAM_REGULATOR.equals(section.getType())) {
						upstreamRegulatorSectionMap.put(section.getTitle(), section);
					}
				}
			}
			final Annotation annotation = new Annotation();
			if (species.getUpdateDate() != null) {
				final History history = new History();
				history.setModifiedDate(species.getUpdateDate().getTime());
				annotation.setHistory(history);
			}
			if (page != null && CollectionUtils.isNotEmpty(page.getReferences())) {
				final Set<Reference> references = new HashSet<>(page.getReferences().size(), 1.0f);
				page.getReferences().forEach(pr -> references.add(pr.getReference()));
				String[] referenceArray = buildReferenceArray(references);
				if (referenceArray != null) {
					for (String reference : referenceArray) {
						annotation.addCVTerm(new CVTerm(Qualifier.BQB_IS_DESCRIBED_BY, reference));
					}
				}
			}
			qSpecies.setAnnotation(annotation);

			String notes = buildTextFromContents(descriptionSection);
			if (notes != null) {
				try {
					qSpecies.appendNotes(notes);
				} catch (XMLStreamException e) {
					/*
					 * Ignore.
					 */
				}
			}

			Map<SpeciesIdentifier, INPUT_SIGN> inputSpeciesMap = new HashMap<>();
			final String sbmlExpression = BooleanExpressionBuilder.buildSBMLBooleanExpression(species,
					expressionCustomizer, inputSpeciesMap);
			System.out.println("-----> SBML Expression for: " + species.toString() + " <===> " + sbmlExpression);
			if (inputSpeciesMap.isEmpty()) {
				/*
				 * {@link Species} does not contain any actual Biologic information.
				 */
				continue;
			}

			final String transitionId = TR_ID_PREFIX + speciesAlias;
			Transition transition = new Transition(transitionId, SBMLProperties.SBML_LEVEL,
					SBMLProperties.SBML_VERSION);
			notes = buildTextFromContents(regulatorySummarySection);
			if (notes != null) {
				try {
					transition.appendNotes(notes);
				} catch (XMLStreamException e) {
					/*
					 * Ignore.
					 */
				}
			}
			/*
			 * Add inputs.
			 */
			for (SpeciesIdentifier input : inputSpeciesMap.keySet()) {
				final String inputId = String.format(IN_ID_TEMPLATE, transitionId,
						this.sbmlVariableMap.get(input.getId()));
				final INPUT_SIGN inputSign = inputSpeciesMap.get(input);
				Input sbmlInput = new Input(inputId, new QualitativeSpecies(this.sbmlVariableMap.get(input.getId())),
						InputTransitionEffect.valueOf(SBMLProperties.TRANSITION_EFFECT_NONE));
				sbmlInput.setThresholdLevel(SBMLProperties.SBML_INPUT_THRESHOLD_LEVEL);
				if (inputSign == INPUT_SIGN.POSITIVE) {
					sbmlInput.setSign(Sign.positive);
				} else if (inputSign == INPUT_SIGN.NEGATIVE) {
					sbmlInput.setSign(Sign.negative);
				} else if (inputSign == INPUT_SIGN.BOTH) {
					sbmlInput.setSign(Sign.dual);
				}
				notes = buildTextFromContents(upstreamRegulatorSectionMap.get(input.getName()));
				if (notes != null) {
					try {
						sbmlInput.appendNotes(notes);
					} catch (XMLStreamException e) {
						/*
						 * Ignore.
						 */
					}
				}
				transition.addInput(sbmlInput);
			}

			// Add the output to the transition.
			transition.addOutput(new Output(qSpecies, OutputTransitionEffect.assignmentLevel));
			// Add the default term to the transition.
			FunctionTerm functionTerm = new FunctionTerm();
			functionTerm.setDefaultTerm(true);
			functionTerm.setResultLevel(0);
			transition.addFunctionTerm(functionTerm);

			// Add the "math" to the transition
			functionTerm = new FunctionTerm();
			functionTerm.setResultLevel(SBMLProperties.SBML_TERM_DEFAULT_RESULT_LEVEL);
			try {
				functionTerm.setMath(ASTNode.parseFormula(sbmlExpression));
			} catch (ParseException e) {
				logger.error("Failed to generate MathML for expression: " + sbmlExpression + " generated for: "
						+ species.toString() + ".", e);
				throw new SBMLExportException(model, e);
			}

			transition.addFunctionTerm(functionTerm);

			// Add the transition to the model.
			this.qualModel.addTransition(transition);
		}
	}

	private String buildReferenceLink(String pmid, String doi) {
		String referenceLink = null;
		if (pmid != null && !pmid.isEmpty()) {
			referenceLink = "urn:miriam:pubmed:" + pmid.trim();
		}
		if (doi != null && !doi.isEmpty()) {
			referenceLink = "https://doi.org/" + doi.trim();
		}
		return referenceLink;
	}

	public Map<Long, String> getSbmlVariableMap() {
		return sbmlVariableMap;
	}
}

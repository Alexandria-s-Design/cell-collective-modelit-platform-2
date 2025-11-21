import React from 'react';
import { Seq } from 'immutable';
import JSZip from 'jszip';
import Utils from '../../../../utils';
import view from '../../../base/view';
import Panel from '../../../base/panel';
import Scrollable from '../../../base/scrollable';
import Add from '../../../../action/add';
import Update from '../../../../action/update';
import EditableProperty from '../../../model/editableProperty';
import Editable from '../../../base/editable';
import Application from '../../../../application';
import Experiment from '../../../../entity/Experiment';
import SliderInput from '../../../base/sliderInput';
import { FormattedMessage } from 'react-intl';
import Options from '../../../base/options';
import cc from '../../../../cc';
import errorResponse from '../../../../util/errorResponse';
import classNames from 'classnames';
import '../styles.scss';
import { convertDrugScoreToBlob, convertDrugListToCSV } from './convertDataToBlob';
import ImportFile from '../ImportFileView';

const LIMIT_SIZE = 10; //M
const LIMIT_FILES = 2;
const LIMIT_ATTEMPT = 900;

const solverOptions = [
  { id: 'GLPK', name: 'GLPK' },
  // { id: 'GUROBI', name: 'Gurobi' },
];
const DEFAULT_SOLVER = solverOptions.find(solver => solver.id == 'GLPK');

const statisticalOptions = [{ id: 'DESEQ2', name: 'DESeq2' }];

const correctionOptions = [{ id: 'BENHBERG', name: 'Benjamini-Hochberg' }];

const knockoutMethodOptions = [{ id: 'MOMA', name: 'MOMA' }];
const DEFAULT_KNOCKOUT_METHOD = knockoutMethodOptions.find(km => km.id === 'MOMA');

// Homo Sapiens (Taxon id: 9606)
// Mus musculus (Taxon id:10090)
// and Macacca Mulatta (Taxon id: 9544)
const taxonOptions = [
  { id: '9606', name: 'Humans' },
  { id: '9544', name: 'Primate' },
  { id: '10090', name: 'Mouse' },
];

const mockData = false;

export const ExperimentDrugSettingsViewBuilder = ({ modelType = 'metabolic', experimentType = null, experimentGroupType = null, onDownload = null, experimentSettings = null } = {}) => {
  const Content = props => {
    const {
      model,
      modelState: state,
      selected: { Experiment: selectedExper, DrugEnvironment: environment },
    } = props;
    const mType = model.modelType || modelType;
    const actions = props.actions;
    //const copy = (s, n, p) => Seq(s).map(e => e.copy(p, null, n)).flatten(true).map(e => new Add(e.entity)).toArray();
    //const eType = (selectedExper && selectedExper.experimentType) || experimentType;
    const changeable = selectedExper && !selectedExper.userId;
    const editable = changeable && props.editable;
    //let ss, state = selectedExper && modelState.getIn(["Experiment", eType || "", selectedExper.id]);
    //const completed = state && ((ss = state.get("state")) === "RUNNING" ? state.get("percentComplete") : (ss === "COMPLETED" ? 1 : null));
    const ep = { entity: selectedExper, onEdit: changeable && actions.onEdit, parentWidth: props.parentWidth };

    const fileUpRegulatedPath = ['analysisDrugIdentification', 'upRegulated'];
    const fileDownRegulatedPath = ['analysisDrugIdentification', 'downRegulated'];
    const uploadCSV = {
      upRegulated: state.getIn(fileUpRegulatedPath).toObject().upload,
      downRegulated: state.getIn(fileDownRegulatedPath).toObject().upload,
    };

    const [logFileName, setLogFileName] = React.useState(null);
    const [uploadFormFields, setUploadFormFields] = React.useState({
      experId: null,
      experName: null,
      solver: DEFAULT_SOLVER,
      statistical: statisticalOptions[0],
      correction: correctionOptions[0],
      taxonId: null,
      knockoutMethod: DEFAULT_KNOCKOUT_METHOD,
      sectionAdvanced: false,
      playState: false,
      fluxRatioUp: 1.1,
      fluxRatioDown: 0.9,
    });

    const onSelectOption = (name, _, e) => {
      const opts = { ...uploadFormFields };
      opts[name] = e ? e : '';
      setUploadFormFields(opts);
    };

    const onChangeInput = (name, val) => {
      setUploadFormFields(p => ({ ...p, [name]: val }));
    };

    const onFileChange = () => {
      setUploadFormFields(p => ({ ...p, playState: true, experName: selectedExper.name, experId: selectedExper.id }));
    };

    const onSubmitFiles = async e => {
      e.preventDefault();

      if (!environment) {
        actions.onShowMessageOnAction('Select a Drug List!');
        return;
      }
      const dataDrugScore = Seq(model.DrugScore).filter(d => d.parentId == environment.id);
      try {
        const [modelId] = model.path;

        if (!modelId) {
          throw new Error(`Please, inform a valid model ID`);
        }

        if (dataDrugScore.count() == 0) {
          throw new Error(`Please, add your Drug List`);
        }

        const selectedFiles = [];
        if (uploadCSV.upRegulated) {
          selectedFiles.push(uploadCSV.upRegulated.objectFile);
        }
        if (uploadCSV.downRegulated) {
          selectedFiles.push(uploadCSV.downRegulated.objectFile);
        }

        if (!mockData) {
          const fileNames = [];
          for (const file of selectedFiles) {
            if (fileNames.includes(file.name)) {
              throw new Error(`The CSV file "${file.name}" already exists`);
            }
            if (Math.ceil(file.size / (1024 * 1024)) > LIMIT_SIZE) {
              throw new Error(`Sorry, the file you have chosen is too large. Please select a file smaller than ${LIMIT_SIZE} megabytes.`);
            }
            if (!['text/plain', 'text/csv'].includes(file.type)) {
              throw new Error(`The CSV file "${file.name}" does not have a valid format: ${file.type}`);
            }
            fileNames.push(file.name);
          }

          if (selectedFiles.length < LIMIT_FILES) {
            throw new Error('Expected ' + LIMIT_FILES + ' CSV files but found ' + selectedFiles.length);
          }
        }
        const addFields = Seq(uploadFormFields)
          .map((v, k) => ({ name: k, value: v ? (v.id !== undefined ? v.id : v) : '' }))
          .toArray();
        const drugListFile = convertDrugListToCSV(dataDrugScore);

        const addFiles = [...selectedFiles].concat(drugListFile);

        const { experId, experLog } = await actions.uploadFiles(`model/analyze/drug-identification/model/${modelId}?mock=${mockData}`, addFiles, null, null, addFields);
        if (experId == undefined) {
          throw new Error('Drug score file not generated');
        }

        setLogFileName(experLog);

        actions.onShowProgressOnAction('It may take a few minutes.', 'Processing...');

        let checkAnalyzedCount = 0;
        let checkAnalyzed = null;

        checkAnalyzed = setInterval(async () => {
          checkAnalyzedCount++;
          try {
            const { data: resultData } = await cc.request.get(`api/model/analyze/drug-identification/result/${experId}?attempts=${checkAnalyzedCount}&mock=${mockData}`);
            if (resultData.data.experStatus === 'COMPLETED') {
              if (resultData.data) {
                setUploadFormFields(prev => ({ ...prev, experName: null }));
                const updates = [];
                dataDrugScore.forEach(d => {
                  let score = resultData.data.scores.filter(v => v.code == d.code);
                  if (Array.isArray(score) && score.length) {
                    score = score[0]['score'];
                  } else {
                    score = 0.0;
                  }
                  updates.push(new Update(d, 'd_score', score));
                });
                actions.batch(updates);
              }

              clearInterval(checkAnalyzed);
              actions.onShowMessageOnAction('Successfully processed!');
            } else if (checkAnalyzedCount > LIMIT_ATTEMPT) {
              clearInterval(checkAnalyzed);
              actions.showError(`Exceeded attempt limit of ${checkAnalyzedCount}`);
            }
          } catch (err) {
            checkAnalyzedCount = -1;
            clearInterval(checkAnalyzed);
            actions.showError('Something went wrong when check status progress. ' + err.message);
          }
        }, 5000);
      } catch (err) {
        const jsonRes = errorResponse(err);
        actions.showError('Something went wrong: ' + jsonRes.message);
      }
    };

    const addExperiment = () => {
      const e = new Experiment({ experimentType, name: Application.defName(model.Experiment, 'New Experiment '), created: new Date(), numSimulations: 100, bits: false });
      actions.batch([new Add(e, true)]);
    };

    const runExperiment = async e => {
      const {
        selected: { Experiment: experiment },
      } = props;
      //const eType = (experiment && experiment.experimentType) || experimentType;

      if (experiment) {
        await onSubmitFiles(e);
      }
    };

    const onEditTaxonId = val => {
      //Humans, Mouse, and Primate
      //Homo Sapiens (Taxon id: 9606), Mus musculus (Taxon id:10090), and Macacca Mulatta (Taxon id: 9544)
    };

    const handleOptionEnv = e => {
      let updateEntities = [];
      if (selectedExper) {
        updateEntities = [new Update(selectedExper, 'drugEnvironment', e)];
      }
      actions.batch(updateEntities);
      actions.onSelect(e || 'DrugEnvironment');
      if (!e) {
        let selectedElement = state.getIn(['selected']);
        selectedElement = selectedElement.delete('DrugEnvironment');
        actions.onEditModelState(['selected'], selectedElement);
      }
    };

    const experimentContent = () => {
      return (
        <React.Fragment>
          {mType !== 'metabolic' ? <span>It&apos;s not a metabolic model.</span> : null}
          <div className="simulation settings">
            <FormattedMessage id="ModelsDashboard.ExperimentView.LabelName" defaultMessage="Name">
              {message => <EditableProperty {...ep} property="name" label={message} />}
            </FormattedMessage>
            <p>
              <span>Species: </span>
              <Options none={'Select'} options={Seq(taxonOptions)} value={uploadFormFields.taxonId} editable={false} onChange={onSelectOption.bind(null, 'taxonId', selectedExper)} />
            </p>
            <p>
              <span>List: </span>
              <Options none="Default" value={environment} options={Seq(model.DrugEnvironment)} editable={false} onChange={handleOptionEnv.bind(this)} />
            </p>
          </div>
          <div className="uploads-settings">
            <h4 className="top-title">
              Upregulated Gene List
            </h4>
            <section>
                <ImportFile.UpRegulated
                  title={null}
                  actions={actions}
                  download={uploadCSV.upRegulated}
                  pathState={fileUpRegulatedPath.concat(['upload'])}
                  btnDownload={true}
                  onLoaded={null}
                  onEdit={onFileChange.bind(this)}
                />
            </section>

            <h4 className="top-title">
              Downregulated Gene List
            </h4>
            <section>
              <p>
                <ImportFile.DownRegulated
                  title={null}
                  actions={actions}
                  download={uploadCSV.downRegulated}
                  pathState={fileDownRegulatedPath.concat(['upload'])}
                  btnDownload={true}
                  onLoaded={null}
                  onEdit={onFileChange.bind(this)}
                />
              </p>
            </section>

            <h4 className="top-title hover highlight" onClick={e => setUploadFormFields(p => ({ ...p, sectionAdvanced: !uploadFormFields.sectionAdvanced }))}>
              <span>Advanced Settings</span>
              <input type="button" className={classNames('icon', 'base-menu', !uploadFormFields.sectionAdvanced ? 'closed' : '')} />
            </h4>
            {!uploadFormFields.sectionAdvanced ? null : (
              <section className="dge-advanced-section">
                <p>
                  <span>Knockout Method: </span>
                  <Options
                    def={DEFAULT_KNOCKOUT_METHOD}
                    options={Seq(knockoutMethodOptions)}
                    value={uploadFormFields.knockoutMethod}
                    editable={false}
                    onChange={onSelectOption.bind(null, 'knockoutMethod', selectedExper)}
                    dropdowIcon="icon-inheritb-bg"
                  />
                </p>
                <p>
                  <span>Solver: </span>
                  <Options
                    def={DEFAULT_SOLVER}
                    options={Seq(solverOptions)}
                    value={uploadFormFields.solver}
                    editable={false}
                    onChange={onSelectOption.bind(null, 'solver', selectedExper)}
                    dropdowIcon="icon-inheritb-bg"
                  />
                </p>
                <p>
                  <span>Flux Ratio Up Cutoff:</span>
                  <SliderInput min={1} max={10} value={uploadFormFields.fluxRatioUp} maxLength={4} format={v => Utils.toFixed1Float(v)} onEdit={onChangeInput.bind(null, 'fluxRatioUp')} />
                </p>
                <p>
                  <span>Flux Ratio Down Cutoff:</span>
                  <SliderInput min={-10} max={1} value={uploadFormFields.fluxRatioDown} maxLength={5} format={v => Utils.toFixed1Float(v)} onEdit={onChangeInput.bind(null, 'fluxRatioDown')} />
                </p>
              </section>
            )}
            {logFileName ? (
              <span className="base-log-explorer">
                <a target={`_blank`} href={location.origin + '/api/model/analyze/drug-identification/log/' + logFileName}>
                  Log Explorer
                </a>
              </span>
            ) : null}
          </div>
        </React.Fragment>
      );
    };

    return (
      <Panel {...props.view} className="analysis3-phase1 analysis2-phase2 drug-experiment-settings">
        <Scrollable>
          <div className="simulation control">
            <input title={logFileName ? 'Change Up or Down regulated files' : 'Play'} type="button" className={Utils.css('icon', 'large-run')} disabled={Utils.enabled(uploadFormFields.playState)} onClick={runExperiment} />
          </div>
          {selectedExper ? (
            experimentContent()
          ) : (
            <div className="panel-instruction" onClick={addExperiment}>
              <div>
                <FormattedMessage id="MetabolicDrugIdentification.ExperimentSettings.SelectExperiment" defaultMessage="Click Here to Add New Experiment">
                  {message => <span>{message}</span>}
                </FormattedMessage>
              </div>
            </div>
          )}
        </Scrollable>
      </Panel>
    );
  };

  const downloadResult = ({ selected: { Experiment: experiment, DrugEnvironment: environment }, model, modelState }) => {
    if (environment) {
      const dataDrugScore = Seq(model.DrugScore).filter(d => d.parentId == environment.id);
      const zip = new JSZip();
      const drugResultBlob = convertDrugScoreToBlob(dataDrugScore);
      zip.file('drug_result.csv', drugResultBlob);
      zip.generateAsync({ type: 'blob' }).then(e => Utils.downloadBinary('drug_' + experiment.name + '.zip', e));
    }
  };

  const Actions = props => {
    const {
      model,
      selected: { DrugEnvironment: environment },
    } = props;

    let emptyPanel = true;
    if (environment) {
      emptyPanel = Seq(model.DrugScore)
        .filter(d => d.parentId == environment.id)
        .cacheResult()
        .isEmpty();
    }
    const editable = emptyPanel === false;
    return Utils.pick({
      download: {
        action: editable && downloadResult.bind(null, props),
        title: 'Download',
      },
    });
  };

  return view(Content, null, Actions);
};

export default ExperimentDrugSettingsViewBuilder();

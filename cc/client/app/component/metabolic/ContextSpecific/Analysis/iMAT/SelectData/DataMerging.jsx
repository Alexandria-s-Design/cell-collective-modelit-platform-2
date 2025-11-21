import React, { useState } from "react";
import { Seq, Map } from "immutable";
import Options from "../../../../../base/options";
import SliderInput from "../../../../../base/sliderInput";
import Utils from "../../../../../../utils";

export default function DataMerging({ optionsMergingMethod, actions, state, optionsList }) {

  const dataMergingPath = ['contextSpecificiMAT', 'typeDataMerging'];
  const componentStates = state.getIn(dataMergingPath).toObject();

	const handleSelectMethod = (e) => {
		let stateData = state.getIn(dataMergingPath);
		stateData = { ...stateData.toObject() };
		stateData.method = e;
		actions.onEditModelState(dataMergingPath, new Map(stateData));
	}

  const handleSlider = (type, e) => {
    actions.onEditModelState(dataMergingPath.concat([type]), e);
  }

	const getSelectedOption = (e) => {
		return typeof (e) == 'string' ? Utils.capitalize(e) : e.name;
	}

  return (
    <div className="bottom">
      <h3 className="underline">Data Merging Settings</h3>
      <dt>
        <dd>Data Merging Method:</dd>
        <Options
          value={componentStates.method}
          get={getSelectedOption}
          options={optionsMergingMethod.sortBy(e => (e && e.name && e.name.toLowerCase()))}
          enabled={optionsMergingMethod.size}
          editable={true}
          dropdowIcon="base-menu-gray"
          onChange={handleSelectMethod} />
      </dt>
      <div className="underline">Data Type Weight</div>
      {optionsList.map(option => {
        if (option.checked && option.id !=='data_merging') {
          let sliderValue;
          let sliderOnEdit;
          switch (option.id) {
            case 'bulk_rna':
              sliderValue = componentStates.bulkTotalRnaSeq;
              sliderOnEdit = handleSlider.bind(null, 'bulkTotalRnaSeq');
              break;
            case 'bulk_polya_rna':
              sliderValue = componentStates.bulkPolyARnaSeq;
              sliderOnEdit = handleSlider.bind(null, 'bulkPolyARnaSeq');
              break;
            case 'bulk_cell_rna':
              sliderValue = componentStates.singleCellRnaSeq;
              sliderOnEdit = handleSlider.bind(null, 'singleCellRnaSeq');
              break;
            case 'proteomics':
              sliderValue = componentStates.proteomics;
              sliderOnEdit = handleSlider.bind(null, 'proteomics');
              break;
            default:
              return null;
          }
          return (
            <dt key={option.name}>
              <dd>{option.name}: </dd>
              <SliderInput
                min={1}
                max={10}
								maxLength={2}
                value={sliderValue}
                onEdit={sliderOnEdit}
              />
            </dt>
          );
        }
        return null;
      })}
    </div>
  );
}

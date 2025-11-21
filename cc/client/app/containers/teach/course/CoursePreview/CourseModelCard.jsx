import React, { useContext, useState, useEffect } from 'react';
import {connect} from 'react-redux';
import { CCContext } from '../../../../containers/Application/index';
import Confirmation from '../../../../component/dialog/confirmation';
import ErrorBoundary from '../../../../component/base/errorBoundary';

import { formatISO } from "date-fns"; 
import { openModal, hideModal } from '../../../../components/Modal/actions';
import Utils from '../../../../utils';

import ccRequest from '../../../../../app/cc';
import Application from '../../../../../app/application';

// TODO: use different card or refractor the whole modelsView
import { ModelCard } from '../../../../component/home/modelsView';
import './style.scss';
import { APP_MODEL_CATEGORIES } from '../../../../util/constants';

const CourseModelCard = ({ modelId, onRemove, courseId, goToInsights, openReportDialog, submittedLessons }) => {
  let content = `Model ${modelId} not found`;
  // Bind models to the card
  let { BaseIdMap, Model, cc } = useContext(CCContext);
	cc.onlyPublic = false;
  const [loading, changeLoading] = useState(false);
  const [err, changeErr] = useState(false);
  const [loaded, changeLoaded] = useState(!!(Model && Model[modelId]));
  
  useEffect(() => {
    changeLoading(false);
    changeErr(false);
  }, [modelId]);

  useEffect(() => {
    (async () => {
      if(Model && !Model[modelId]){
        if(!err && !loaded && !loading){
          changeLoading(true);
          try{
						const _modelId = modelId.hasOwnProperty('id') ? modelId.id : modelId;
            const data  = await cc.ajaxPromise(`api/model/cards/${Application.domain}?${ccRequest._.constructGetParams({
                id: _modelId,	courseId
              })}`			
            );
            if(data.length > 0){
							await cc.modelLoad(data, {courseId});
            }else{
              changeErr(true);
            }
          }catch(e){
            changeErr(true);
            console.error(e);
          }finally{
            changeLoaded(true);	
            changeLoading(false);
          }
        }
      }
    })();
  }, [modelId, Model[modelId], err, Model, loaded, loading]);

	if (modelId in BaseIdMap) {
		modelId = BaseIdMap[modelId];
	}

  if (Model && Model[modelId]) {
    const model = Model[modelId].sub();
		const reportCourseId = cc.state.course || '';
    const props = {
      data: model,
      load: cc.modelGet.bind(cc),
      courseId: courseId,
			goToInsights: goToInsights,
      onSelect: (...args) => {
				cc.setSelectedCourseId(courseId);
				cc.setOpenedFromCategory(APP_MODEL_CATEGORIES.MY_COURSES);
				let openModel = cc.modelSelect.bind(cc, true) || cc.modelSelect.bind(cc);
				openModel(...args);
			},
			selectCourse: cc.courseSelect.bind(cc),
      // openStudentReportDialog: openStudentReportDialog,
      onDoubleClick: () => {},
      onRemoveRef: () => {},
      image: () => {},
			generateReport: openReportDialog.bind(null, Model[modelId].sub(), reportCourseId),
			submittedLessons,
			modelId
    };
    content = (
      <ErrorBoundary>
        <ModelCard {...props} />
      </ErrorBoundary>
    );
  }else{
    if(loading){
      content = null;
    }else	if(err){
      content = `Error loading model ${modelId}`;
    }else{
      content = `Model ${modelId} not found`;
    }
  }

  let entity = null;
  if(Model[modelId] !== undefined){
    if(Model[modelId].sub() !== undefined){
     entity = Model[modelId].sub().top.name;
    }
  }
  else{
    entity = modelId;
  }
  
  return (
    <div className="courseCard card" style={{ width: '100%' }}>
      <div>
        <div className="frame">{content}</div>
				{onRemove && <div className="remove" onClick={() => cc.showDialog(Confirmation, {type: "delete", action: onRemove, entity: entity, message: <>Are you sure you want to
					remove &lquot;{entity}&rquot; from this course? You will no longer be able to access student data for this lesson.</>})} />}
      </div>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
	openReportDialog: (model, courseId) => {
		const modelTop = model.top;
		dispatch(openModal("GenerateStudentReport", {
			title: "Generate Student Report",
			modelID: modelTop.Persisted,
			downloadUrlParams: {
				course: courseId,
        isPublic: modelTop.isPublic? 1 : 0,
        for_domain: Application.domain,
        view: 'courses'
			},
		}));
	}
});

export default connect(null, mapDispatchToProps)(CourseModelCard);
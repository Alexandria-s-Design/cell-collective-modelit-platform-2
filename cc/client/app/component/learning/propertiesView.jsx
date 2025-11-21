import React from 'react';
import { Seq } from 'immutable';
import Application from '../../application';
import view from '../base/view';
import Panel from '../base/panel';
import Scrollable from '../base/scrollable';
import PropertyLine from '../description/propertyLine';
import PropertyArea from '../description/propertyArea';
import MetadataSingle from '../description/metadataSingle';
import MetadataImage from '../description/metadataImage';
import { FormattedMessage } from 'react-intl';

export default view(({ view, model, editable, state, actions }) => {
  const date = e => e.toLocaleDateString();
  const p = { entity: model, actions: editable && actions };
  const cover = Seq(model.mCover).first();

  return (
    <Panel {...view} className="description">
      <Scrollable fixedWidth="true">
        {!Application.isEducation ? (
          <span>
            <FormattedMessage id="ModelsView.propertiesView.labelType" defaultMessage="Type">
              {message => <MetadataSingle {...p} name="LearningType" label={message} />}
            </FormattedMessage>
            <MetadataSingle {...p} name="TargetAudience" label="Target Audience" />

            <MetadataSingle
              {...p}
              name="EstimatedTime"
              label="Time"
              placeHolder="hours"
              parse={(e, p) => (isNaN(e) ? p : parseFloat(e))}
              format={e => '~ ' + (e < 2 ? Math.round(60 * e) + ' minutes' : Math.floor(e) + ' hours')}
            />

            <FormattedMessage id="ModelsView.propertiesView.labelAuthor" defaultMessage="Author">    
              {message => (
                <PropertyLine
                  {...p}
                  name={editable ? 'author' : 'publisher'}
                  label={message}
                  placeHolder={model.publisher}
                />
              )}  
            </FormattedMessage>
            <FormattedMessage id="ModelsView.propertiesView.labelCreated" defaultMessage="Created">                       
              {message => <PropertyLine {...p} name="created" label={message} format={date} />}               
            </FormattedMessage>
            <FormattedMessage id="ModelsView.propertiesView.labelUpdated" defaultMessage="Updated">             
              {message => <PropertyLine {...p} name="updated" label={message} format={date} />}
            </FormattedMessage>
            <br />
            <FormattedMessage id="ModelsView.propertiesView.labelTags" defaultMessage="Tags">
							{message => <PropertyArea {...p} name="tags" label="Tags" />}
            </FormattedMessage>
            <br />
          </span>
        ) : null}

        <div className="cover">
          <div>
            {cover ? <img alt="model picture" src={Application.url(cover.value)} /> : <dt>Cover Image</dt>}
            {editable && Application.domain === 'teaching' && (
              <div>
                <MetadataImage entity={cover} name="Cover" title="Cover" user={state.user} actions={actions} />
              </div>
            )}
          </div>
        </div>
      </Scrollable>
    </Panel>
  );
});

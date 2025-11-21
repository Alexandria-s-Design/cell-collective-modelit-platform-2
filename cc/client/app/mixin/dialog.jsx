import React from 'react';
import { Seq } from 'immutable';
import Application from '../application';
import Message from '../component/dialog/message';
import cc from '../cc';
import { getTimezoneInfo } from '../util/timezone';


const expandDiv = (e) => (e.tagName === 'DIV' ? [...e.children].map(expandDiv) : e);

export function getDataForm(event) {
	if (!event) { return {}; }
	event.persist();
	const data = {};
	const children = [...event.target.children].map(expandDiv).flat(3);
	children.forEach((child) => {
		if (child.tagName === 'INPUT' && child.name) {
			data[child.name] = child.value;
		}
	})
	return data;
}


export default parent =>
  class extends parent {
    showDialog(dialog, props) {
      this.dialogProps = props || {};

      // although this code is universally applicable, it likely won't
      // do anything noticeable on any page except the landing pages.
      if (dialog !== null) window.scrollTo(0, 0);
      document.body.classList.toggle('has-modal', dialog !== null); // safe way to modify body class

      this.setState({ dialog: dialog });
    }
    UNSAFE_componentWillMount(...args) {
      super.UNSAFE_componentWillMount && super.UNSAFE_componentWillMount(...args);

      this.closeDialog = this.showDialog.bind(this, null);
      this._dialogKeyUp = this.dialogKeyUp.bind(this);
      document.addEventListener('keyup', this._dialogKeyUp);
    }
    dialogKeyUp(e) {
      (e.which || e.keyCode) == 27 && this.closeDialog();
    }
    componentWillUnmount(...args) {
      super.componentWillUnmount && super.componentWillUnmount(...args);
      document.removeEventListener('keyup', this._dialogKeyUp);
    }

    onSubmitPromise(endpoint = null, self = null, event = null, intermidiateCallback = () => null, errorCb = () => {}, externalAPI=false) {
      const data = getDataForm(event);
      const urlEncoded = new URLSearchParams(data).toString();

			if(externalAPI){
				const timezoneInfo = getTimezoneInfo();
				return  fetch(`${import.meta.env.VITE_CC_URL_CCAPP}/${endpoint}`,{
					method: 'POST',
					 headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'X-Timezone': timezoneInfo.timezone,
						'X-Timezone-Offset': timezoneInfo.offset.toString(),
					}, 
					body: JSON.stringify(data)
					}).then(res => res.json()
					)
				.then(res => {
					return intermidiateCallback(res) || res;
				}).catch(err => {
					errorCb(err);
				}) 
			} else {
				return cc.request
					.post(endpoint, urlEncoded, {
						headers: {
							'content-type': 'application/x-www-form-urlencoded',
							'X-AUTH-TOKEN': (this.state.user && this.state.user.token) || '',
						},
					})
					.then(res => {
						return intermidiateCallback(res) || res;
					})
					.catch(err => {
						errorCb(err);
					});				
			}

    }

    onSubmit(action, self, _) {
      if (action) {
        const data = getDataForm(_);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', Application.api+"/" + action, true);
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
        this.state.user && xhr.setRequestHeader('X-AUTH-TOKEN', this.state.user.token);
        
        const timezoneInfo = getTimezoneInfo();
        xhr.setRequestHeader('X-Timezone', timezoneInfo.timezone);
        xhr.setRequestHeader('X-Timezone-Offset', timezoneInfo.offset.toString());

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status) {
              const msg = self.onSubmit(xhr, data);
              msg && this.showDialog(Message, { message: msg });
            } else {
              this.showDialog(Message, { message: 'Service Unavailable' });
            }
          }
        };
        xhr.send(
          Seq(data)
            .map((v, k) => k + '=' + v)
            .join('&'),
        );
      } else {
        this.showDialog();
      }
      _ && _.preventDefault();
    }

    getRenderedDialog(component, dialogProps = {}, closable = true, overlay = true, submitable = true) {
      if (!component) {
        return <></>;
      }

      const center = (e, p) => 50 * (1 - e / p);
      const props = Seq({
        persist: '.dialog',
        onSubmit: submitable ? this.onSubmit.bind(this) : null,
        onSubmitPromise: submitable ? this.onSubmitPromise.bind(this) : null,
        onClose: closable ? this.closeDialog.bind(this) : null,
        getDataForm: getDataForm,
        left: center(component.width, this.state.width),
        top: center(component.height, this.state.height),
        minWidth: component.width,
        minHeight: component.height,
        parentWidth: this.state.width,
        parentHeight: this.state.height,
        isDialog: true,
      })
        .concat(dialogProps)
        .toObject();

      return overlay ? <div className="overlay">{React.createElement(component, props)}</div> : <>{React.createElement(component, props)}</>;
    }

    renderDialog(closable = true) {
      const el = this.state.dialog;
      if (!el) return <></>;
      return this.getRenderedDialog(el, this.dialogProps, 'closable' in this.dialogProps ? this.dialogProps.closable : closable);
    }
  };

import React, { useState, useEffect }  from 'react';
import cc from './cc';

// OK, next up:
// (1) prevent spamming the capture functionality?
// (2) finish up the Image Report dialog
// (3) ???

const capture = (imgURL, view, model, type, onStateChanged = null) => {
    const imageData = atob(imgURL.split(',')[1]);
                    
    const binDataArray = new Uint8Array(imageData.length);
    for( let i = 0; i < imageData.length; i++ ) binDataArray[i] = imageData.charCodeAt(i);

    const blob = new Blob([binDataArray], {type: 'image/png'});

    const data = new FormData();
    data.append('image', blob);
    data.append('file', model.top.name);
    data.append('type', type);

    const callback = onStateChanged != null ? onStateChanged : () => {};

    view.setState({
        imageCaptureState: 1
    }, callback);

    cc.request.post(`/api/module/${model.top.Persisted}/lesson-image`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(resp => {
        const data = resp.data.data;
        if( data.success ) {
            view.setState({
                imageCaptureState: 2
            }, callback);
        } else {
            view.setState({
                imageCaptureState: -1
            }, callback)
        }
    }).catch(err => {
        view.setState({
            imageCaptureState: -1
        }, callback);
    });
}

const generateViewModal = (content, onClose) => {
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(false);
      if (onClose) {
        onClose();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!showModal) {
    return null;
  }

    return (
        <div className="view-modal">
            <div className="dialog">
                <div className="content">
                    {content}
                </div>
            </div>
        </div>
    );
};

const CaptureModal = ({ view, onClose }) => {
    let modal = null;

    const viewState = view.getState();
    const ics = viewState.imageCaptureState;

    const closeDialog = () => { view.setState({ imageCaptureState: 0 }, onClose) };
    if( ics !== undefined ) {
        if( ics === 1 ) {
            modal = generateViewModal("Uploading...", closeDialog);
        } else if( ics === -1 ) {
            modal = generateViewModal(<span className="error">Error: Image upload failed.</span>, closeDialog);
        } else if( ics === 2 ) {
            modal = generateViewModal(<span className="success">Image successfully saved.</span>, closeDialog);
        }
    }

    return modal;
};

export { capture, CaptureModal };
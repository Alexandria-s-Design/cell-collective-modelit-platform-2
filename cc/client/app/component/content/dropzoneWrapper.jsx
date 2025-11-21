import { useDropzone } from 'react-dropzone';

export const DropzoneWrapper = ({ onDrop, message, onReject, acceptedFormats }) => {
	const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
		onDrop,
		accept: acceptedFormats,
		multiple: false,
	});

	return (
		<div
			{...getRootProps({
				className: `dropzone dropzone-position ${
					isDragReject ? 'dropzone-reject' : isDragActive ? 'dropzone-active' : ''
				}`,
			})}
		>
			<input {...getInputProps()} />
			{isDragReject ? onReject : <div></div>}
		</div>
	);
};
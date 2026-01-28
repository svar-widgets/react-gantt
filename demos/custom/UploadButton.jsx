import React, { useRef } from 'react';
import './UbloadButton.css';

function UploadButton({ text, onChange }) {

	const fileInput = useRef(null);

	function handleClick() {
		fileInput.current?.click();
	}

	function handleChange() {
		if (onChange) {
			onChange();
		}
	}

	return (
		<>
			<button className="button" onClick={handleClick}>
				{text}
			</button>
			<input
				ref={fileInput}
				id="import-file"
				type="file"
				accept=".xml"
				onChange={handleChange}
				style={{ display: 'none' }}
			/>
		</>
	);
}

export default UploadButton;
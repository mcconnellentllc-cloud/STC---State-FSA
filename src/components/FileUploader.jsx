import React, { useState, useRef } from 'react';

export default function FileUploader({ onUpload }) {
  const [dragover, setDragover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      console.error('Upload error:', err);
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragover(true);
  };

  return (
    <div
      className={`upload-zone ${dragover ? 'dragover' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragover(false)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
      {uploading ? (
        <div><div className="spinner" /><p style={{ marginTop: 8 }}>Uploading and processing...</p></div>
      ) : (
        <>
          <p style={{ fontSize: '1.1rem', marginBottom: 4 }}>Drop a file here or click to browse</p>
          <p>Supports PDF, DOCX, XLSX, JPG, PNG (max 50MB)</p>
        </>
      )}
    </div>
  );
}

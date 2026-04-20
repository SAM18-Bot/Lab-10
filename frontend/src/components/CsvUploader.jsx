import React, { useState } from 'react';

const CsvUploader = ({ onUpload, loading }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h3>Upload CSV</h3>
      <input
        data-testid="csv-input"
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => setSelectedFile(event.target.files[0] || null)}
      />
      <button className="btn" type="submit" disabled={!selectedFile || loading}>
        {loading ? 'Uploading...' : 'Upload Dataset'}
      </button>
    </form>
  );
};

export default CsvUploader;

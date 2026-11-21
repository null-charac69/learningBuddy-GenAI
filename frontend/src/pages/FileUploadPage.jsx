
import React, { useState } from 'react';
import { uploadFile } from '../services/api';
import { FiUploadCloud } from 'react-icons/fi';

const FileUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      await uploadFile(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      alert('File uploaded successfully');
      setSelectedFile(null);
      setUploadProgress(0);
    }
  };

  return (
    <div className="text-text">
      <h1 className="text-3xl font-bold mb-6">Upload Files</h1>
      <div className="bg-secondary p-8 rounded-lg shadow-lg flex flex-col items-center">
        <FiUploadCloud className="text-6xl text-highlight mb-4" />
        <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="cursor-pointer bg-highlight text-white py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors">
          Choose a file
        </label>
        {selectedFile && <p className="mt-4 text-text-secondary">{selectedFile.name}</p>}
        {uploadProgress > 0 && (
          <div className="w-full bg-accent rounded-full h-2.5 mt-4">
            <div className="bg-highlight h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
        <button onClick={handleUpload} className="mt-6 bg-highlight text-white py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors" disabled={!selectedFile}>
          Upload
        </button>
      </div>
    </div>
  );
};

export default FileUploadPage;

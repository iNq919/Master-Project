"use client";

import React from 'react';

const FileUpload = ({ onUpload }) => {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
  };

  return (
    <div className="p-4 border border-gray-300 rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-2">Upload Image</h2>
      <input
        type="file"
        onChange={handleChange}
        className="p-2 border border-gray-300 rounded-md w-full"
      />
    </div>
  );
};

export default FileUpload;

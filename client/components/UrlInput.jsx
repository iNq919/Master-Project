"use client";

import React from 'react';

const UrlInput = ({ onFetch }) => {
  const handleBlur = (e) => {
    const url = e.target.value;
    if (url) onFetch(url);
  };

  return (
    <div className="p-4 border border-gray-300 rounded-md shadow-md mt-4">
      <h2 className="text-lg font-semibold mb-2">Fetch Image by URL</h2>
      <input
        type="text"
        placeholder="Enter image URL"
        onBlur={handleBlur}
        className="p-2 border border-gray-300 rounded-md w-full"
      />
    </div>
  );
};

export default UrlInput;

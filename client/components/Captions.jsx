"use client";

import React from 'react';

const Captions = ({ captions, onSelect, selectedCaptionIndex }) => {
  return (
    <div className="p-4 border border-gray-300 rounded-md shadow-md mt-4 text-white">
      {captions.map((caption, index) => (
        <div
          key={index}
          className={`flex items-center cursor-pointer p-2 rounded-md transition-colors ${selectedCaptionIndex === index ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
          onClick={() => onSelect(index)}
        >
          <div
            className={`relative flex items-center justify-center w-6 h-6 mr-2 rounded-full border-2 transition-colors ${selectedCaptionIndex === index ? 'border-blue-400 bg-blue-600' : 'border-gray-300'}`}
          >
            {selectedCaptionIndex === index && (
              <div className="absolute w-3 h-3 rounded-full bg-white"></div>
            )}
          </div>
          <p>{caption}</p>
        </div>
      ))}
    </div>
  );
};

export default Captions;

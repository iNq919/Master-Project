"use client";

import React from 'react';

const Captions = ({ captions, onSelect }) => {
  return (
    <div className="p-4 border border-gray-300 rounded-md shadow-md mt-4">
      {captions.map((caption, index) => (
        <div key={index} className="flex items-center mb-2">
          <input
            type="radio"
            name="caption"
            value={index}
            onChange={() => onSelect(index)}
            className="w-fit mr-2"
          />
          <p>{caption}</p>
        </div>
      ))}
    </div>
  );
};

export default Captions;


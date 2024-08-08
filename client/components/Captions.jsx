"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Captions = ({ captions, onSelect, selectedCaptionIndex }) => {
  return (
    <Card className="p-4 mt-4 border border-gray-100 rounded-md shadow-sm">
      {captions.map((caption, index) => (
        <div
          key={index}
          className={`flex items-center cursor-pointer p-2 rounded-md transition-colors ${selectedCaptionIndex === index ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
          onClick={() => onSelect(index)}
        >
          <div
            className={`relative flex items-center justify-center w-6 h-6 max-[600px]:hidden mr-2 rounded-full border-2 transition-colors ${selectedCaptionIndex === index ? 'border-blue-400 bg-blue-600' : 'border-gray-300'}`}
          >
            {selectedCaptionIndex === index && (
              <div className="absolute w-3 h-3 rounded-full bg-white"></div>
            )}
          </div>
          <p>{caption}</p>
        </div>
      ))}
    </Card>
  );
};

export default Captions;

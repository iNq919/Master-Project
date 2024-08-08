"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const UrlInput = ({ onFetch }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setUrl(e.target.value);
  };

  const handleFetch = () => {
    const sanitizedUrl = sanitizeUrl(url);
    if (isValidUrl(sanitizedUrl)) {
      onFetch(sanitizedUrl);
      setError('');
    } else {
      setError('Invalid URL');
    }
  };

  const sanitizeUrl = (input) => {
    return input.trim().replace(/[^a-zA-Z0-9:/._-]/g, '');
  };

  // Basic URL validation function
  const isValidUrl = (input) => {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
      <div className="flex flex-1 w-full">
        <Input
          id="url-input"
          type="text"
          placeholder="Adres URL"
          value={url}
          onChange={handleChange}
          className="flex-1"
        />
      </div>
      <Button
        onClick={handleFetch}
        className="flex-shrink-0 max-[640px]:w-full h-10 px-4 text-sm font-medium"
      >
        Pobierz obraz
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default UrlInput;

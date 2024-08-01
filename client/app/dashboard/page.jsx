"use client";

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import UrlInput from '@/components/UrlInput';
import Captions from '@/components/Captions';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserInfo from '@/components/UserInfo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Page = () => {
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [language, setLanguage] = useState("pl");

  const handleResponse = (response, successMessage) => {
    if (response.data.status === "success") {
      setCaptions(response.data.captions);
      setImagePath(response.data.image_path);
      setImageSrc(`${API_BASE_URL}/uploads/${response.data.image_path}`);
      toast.success(successMessage);
    } else {
      toast.error(response.data.message || "An error occurred.");
    }
  };

  const handleError = (error, errorMessage) => {
    console.error(errorMessage, error);
    toast.error(`${errorMessage}: ${error.message}`);
  };

  const handleUpload = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(response => handleResponse(response, "File uploaded and captions fetched successfully!"))
    .catch(error => handleError(error, "Error uploading file"));
  };

  const handleFetch = (url) => {
    axios.post(`${API_BASE_URL}/fetch`, { url })
      .then(response => handleResponse(response, "Image fetched successfully!"))
      .catch(error => handleError(error, "Error fetching image"));
  };

  const handleRegenerate = () => {
    if (!imagePath) {
      toast.error("No image to regenerate captions for.");
      return;
    }

    axios.post(`${API_BASE_URL}/regenerate`, { image_path: imagePath })
      .then(response => {
        if (response.data.status === "success") {
          setCaptions(response.data.captions);
          toast.success("Captions regenerated successfully!");
        } else {
          toast.error(response.data.message || "Error regenerating captions.");
        }
      })
      .catch(error => handleError(error, "Error regenerating captions"));
  };

  const handleTranslate = () => {
    axios.post(`${API_BASE_URL}/translate`, { captions, language })
      .then(response => {
        if (response.data.status === "success") {
          setCaptions(response.data.translated_captions);
          toast.success("Captions translated successfully!");
        } else {
          toast.error(response.data.message || "Error translating captions.");
        }
      })
      .catch(error => handleError(error, "Error translating captions"));
  };

  const handleConfirm = async () => {
    if (!selectedCaption || !imagePath) {
      toast.error("Please select a caption and ensure the image path is valid.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/confirm`, {
        selected_caption: selectedCaption,
        image_path: imagePath,
      });
      toast.success(response.data.message || "Caption confirmed successfully!");
    } catch (error) {
      handleError(error, "Error confirming caption");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <UserInfo />
      <div className="container mx-auto max-w-4xl bg-white p-6 rounded-lg shadow-md bg-gray-50 dark:bg-gray-700">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Image Captioning App</h1>
        <FileUpload onUpload={handleUpload} />
        <UrlInput onFetch={handleFetch} />

        {imageSrc && (
          <div className="mt-4 text-center">
            <h2 className="text-xl text-white font-semibold mb-2">Uploaded/Fetched Image:</h2>
            <img
              src={imageSrc}
              alt="Uploaded or Fetched"
              className="w-full max-w-md mx-auto rounded-md shadow-md"
            />
          </div>
        )}

        {captions.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl text-white font-semibold mb-2">Captions:</h2>
            <Captions 
              captions={captions} 
              onSelect={index => setSelectedCaption(captions[index])} 
              selectedCaptionIndex={captions.indexOf(selectedCaption)}
            />
            <div className="mt-4 flex items-center">
              <button
                onClick={handleTranslate}
                className="mt-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
              >
                Translate to Polish
              </button>
            </div>
            <button
                onClick={handleRegenerate}
                className="mt-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
              >
                Regenerate Captions
              </button>
          </div>
        )}

        {selectedCaption && (
          <div className="mt-4 text-center text-white">
            <h2 className="text-xl font-semibold mb-2">Selected Caption:</h2>
            <p className="mb-2">{selectedCaption}</p>
            <button
              onClick={handleConfirm}
              className="mt-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

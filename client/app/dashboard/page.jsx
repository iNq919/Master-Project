"use client";

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import UrlInput from '@/components/UrlInput';
import Captions from '@/components/Captions';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserInfo from '@/components/UserInfo'; // Import UserInfo

const Page = () => {
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [imageSrc, setImageSrc] = useState("");

  const handleUpload = (file) => {
    const formData = new FormData();
    formData.append("file", file);
  
    axios.post("http://localhost:8501/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      if (response.data.status === "success") {
        setCaptions(response.data.captions);
        setImagePath(response.data.image_path);
        setImageSrc(`http://localhost:8501/uploads/${response.data.image_path}`);
        toast.success("File uploaded and captions fetched successfully!");
      } else {
        toast.error(response.data.message || "Error uploading file.");
      }
    })
    .catch((error) => {
      toast.error("Error uploading file: " + error.message);
    });
  };

  const handleFetch = (url) => {
    axios
      .post("http://localhost:8501/fetch", { url })
      .then((response) => {
        setCaptions(response.data.captions);
        setImagePath(response.data.image_path);
        setImageSrc(url);
        toast.success("Image fetched successfully!");
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
        toast.error("Error fetching image. Please try again.");
      });
  };

  const handleRegenerate = () => {
    axios
      .post("http://localhost:8501/regenerate", { image_path: imagePath })
      .then((response) => {
        setCaptions(response.data.captions);
        toast.success("Captions regenerated successfully!");
      })
      .catch((error) => {
        console.error("Error regenerating captions:", error);
        toast.error("Error regenerating captions. Please try again.");
      });
  };

  const handleCaptionSelect = (index) => {
    setSelectedCaption(captions[index]);
  };

  const handleConfirm = async () => {
    if (!selectedCaption || !imagePath) {
      toast.error("Please select a caption and ensure the image path is valid.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8501/confirm", {
        selected_caption: selectedCaption,
        image_path: imagePath,
      });
      toast.success(response.data.message || "Caption confirmed successfully!");
    } catch (error) {
      console.error("Error confirming caption:", error);
      toast.error("Error confirming caption. Please try again.");
    }
  };

  return (
   
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
       <UserInfo />
      <div className="container mx-auto max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-center">Image Captioning App</h1>
        <FileUpload onUpload={handleUpload} />
        <UrlInput onFetch={handleFetch} />

        {imageSrc && (
          <div className="mt-4 text-center">
            <h2 className="text-xl font-semibold mb-2">Uploaded/Fetched Image:</h2>
            <img
              src={imageSrc}
              alt="Uploaded or Fetched"
              className="w-full max-w-md mx-auto rounded-md shadow-md"
            />
          </div>
        )}

        {captions.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Captions:</h2>
            <Captions captions={captions} onSelect={handleCaptionSelect} />
            <button
              onClick={handleRegenerate}
              className="mt-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
            >
              Regenerate Captions
            </button>
          </div>
        )}

        {selectedCaption && (
          <div className="mt-4 text-center">
            <h2 className="text-xl font-semibold mb-2">Selected Caption:</h2>
            <p className="mb-2">{selectedCaption}</p>
            <button
              onClick={handleConfirm}
              className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
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

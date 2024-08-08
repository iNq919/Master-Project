"use client";

import { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';
import Captions from '@/components/Captions';
import Header from '@/components/Header';
import UrlInput from '@/components/UrlInput';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Page() {
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [language, setLanguage] = useState("pl");

  const imageRef = useRef(null);
  const captionsRef = useRef(null);
  const selectRef = useRef(null);

  const handleResponse = (response, successMessage) => {
    if (response.data.status === "success") {
      setCaptions(response.data.captions);
      setImagePath(response.data.image_path);
      setImageSrc(`${API_BASE_URL}/uploads/${response.data.image_path}`);
      toast.success(successMessage);

      if (imageSrc) {
        imageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        captionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      toast.error(response.data.message || "An error occurred.");
    }
  };

  const handleError = (error, errorMessage) => {
    if (error.response) {
      toast.error(`${error.response.data.message || errorMessage}: ${error.response.status}`);
    } else if (error.request) {
      toast.error("No response received from the server.");
    } else {
      toast.error(`Error: ${error.message}`);
    }
    console.error(errorMessage, error);
  };

  const handleUpload = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(response => handleResponse(response, "Plik przesłany i napisy wygenerowane pomyślnie!"))
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
          captionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    <div className="flex flex-col min-h-screen p-4 lg:p-6">
      <Header />
      <main className="flex-1">
        <section className="w-full py-6 md:py-12 lg:py-6">
          <div className="container px-4 md:px-6 space-y-10 max-w-7xl mx-auto border border-gray-100 rounded-md shadow-sm">
            <div className="flex flex-col items-center justify-center space-y-4 text-center p-6 md:p-12 lg:p-12">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Generowanie opisów Twoich zdjęć
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Prześlij obraz lub wprowadź adres URL obrazu i pozwól naszej sztucznej inteligencji wygenerować opisy.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-md">
                <FileUpload onUpload={handleUpload} />
                <UrlInput onFetch={handleFetch} />
              </div>
            </div>

            {imageSrc && (
              <div ref={imageRef} className="flex flex-col items-center justify-center space-y-4">
                <img
                  src={imageSrc}
                  alt="Uploaded or Fetched"
                  className="max-w-full rounded-md object-cover"
                />
              </div>
            )}

            {captions.length > 0 && (
              <div ref={captionsRef} className="flex flex-col items-center justify-center ">
                <h2 className="text-xl font-bold">Wygenerowane opisy</h2>
                <Captions 
                  captions={captions} 
                  onSelect={index => setSelectedCaption(captions[index])} 
                  selectedCaptionIndex={captions.indexOf(selectedCaption)}
                />
                <div className="flex flex-col md:flex-row items-center gap-4 m-4">
                  <Button
                    type="button"
                    onClick={handleTranslate}
                    className="inline-flex h-10 px-6 text-base font-medium rounded-md bg-primary text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    Tłumacz
                  </Button>
                  <Button
                    type="button"
                    onClick={handleRegenerate}
                    className="inline-flex h-10 px-6 text-base font-medium rounded-md bg-primary text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    Nowe opisy
                  </Button>
                </div>
              </div>
            )}

            {selectedCaption && (
              <div ref={selectRef} className="flex flex-col items-center justify-center space-y-4 text-center py-6">
                <h2 className="text-xl font-bold">Wybrany opis:</h2>
                <p>{selectedCaption}</p>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  className="inline-flex h-10 px-6 text-base font-medium rounded-md bg-primary text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  Prześlij
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

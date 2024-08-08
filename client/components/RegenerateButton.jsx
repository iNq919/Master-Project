"use client";

import React from "react";
import axios from "axios";

const RegenerateButton = ({ imagePath, onRegenerate }) => {
  const handleRegenerate = async () => {
    try {
      const response = await axios.post("http://localhost:8501/regenerate", {
        image_path: imagePath,
      });
      onRegenerate(response.data);
    } catch (error) {
      console.error("Error regenerating captions:", error);
    }
  };

  return <button onClick={handleRegenerate}>Nowe opisy</button>;
};

export default RegenerateButton;

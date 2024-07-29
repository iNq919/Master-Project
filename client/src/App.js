import React, { useState } from "react";

function App() {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("file", image);

    try {
      // Upload image
      const uploadResponse = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      const result = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Get caption
      const captionResponse = await fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_path: result.file_path }), // Adjust based on the actual path returned
      });

      const captionData = await captionResponse.json();
      if (!captionResponse.ok) {
        throw new Error(captionData.error || "Prediction failed");
      }

      setCaption(captionData.caption);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Image Caption Generator</h1>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleSubmit}>Generate Caption</button>
      {caption && <p>Caption: {caption}</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}

export default App;

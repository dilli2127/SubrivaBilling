// src/hooks/useFileUpload.ts
import { useState } from "react";
import { message } from "antd";

export const useFileUpload = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // The reusable file upload function
  const handleFileUpload = async (file: any) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("http://localhost:8247/file-upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.result && data.result.file) {
        const uploadedImageUrl = data.result.file;
        setImageUrl(uploadedImageUrl);
        message.success("File uploaded successfully!");
        return uploadedImageUrl;
      } else {
        setImageUrl("");
        throw new Error("File upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("File upload failed!");
    }
  };

  return {
    url: imageUrl,
    handleFileUpload,
  };
};

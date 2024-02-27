import React, { useState } from "react";
import { db } from "../../utils/next.config";
import { collection, doc, setDoc } from "firebase/firestore";
import { Button, CircularProgress } from "@mui/material";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        alert("Please select a file.");
        return;
      }

      setUploading(true);
      setProgress(0);

      // Read the uploaded CSV file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split("\n").map((row) => row.split(","));

        const totalRows = rows.length;
        let uploadedCount = 0;

        // Extract data from CSV and upload to Firestore
        for (const row of rows) {
          if (row.length === 0) {
            // Skip empty rows
            break;
          }

          const [employeeId, name, trade] = row;

          const userData = {
            employeeId,
            name,
            trade,
            timestamp: new Date(),
          };

          const docRef = doc(collection(db, "Users"));
          await setDoc(docRef, userData);

          uploadedCount++;
          const uploadProgress = (uploadedCount / totalRows) * 100;
          setProgress(uploadProgress);
        }

        setUploading(false);
        setProgress(100);
        alert("CSV data added to Firestore successfully.");
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error uploading CSV data to Firestore:", error);
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={uploading}>
        Upload
      </Button>
      {uploading && (
        <div>
          <CircularProgress variant="determinate" value={progress} />
          <p>{Math.round(progress)}% uploaded</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

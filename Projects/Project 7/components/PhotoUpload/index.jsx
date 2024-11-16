import React, { useRef } from "react";
import { Button, Box, Typography } from "@mui/material";
import axios from "axios";

function PhotoUpload() {
  const fileInput = useRef();

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("uploadedphoto", fileInput.current.files[0]);
    try {
      const response = await axios.post("/photos/new", formData);
      console.log(response.data);
    } catch {
      alert("Error uploading photo");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: 300,
        margin: "auto",
      }}
    >
      <Typography variant="h5" align="center">
        Upload Photo
      </Typography>
      <input type="file" ref={fileInput} style={{ marginBottom: 10 }} />
      <Button variant="contained" color="primary" onClick={handleUpload}>
        Upload
      </Button>
    </Box>
  );
}

export default PhotoUpload;

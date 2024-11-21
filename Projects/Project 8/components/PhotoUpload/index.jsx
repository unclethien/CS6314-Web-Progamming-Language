import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
  Snackbar
} from '@mui/material';
import axios from 'axios';

function PhotoUpload({ open, onClose, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('uploadedphoto', selectedFile);

    try {
      const response = await axios.post('/photos/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSelectedFile(null);
      setShowSuccess(true);
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
      onClose();
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={() => onClose()}>
        <DialogTitle>Add Photo</DialogTitle>
        <DialogContent>
          <input
            accept="image/*"
            type="file"
            onChange={handleFileSelect}
            style={{ marginTop: '10px' }}
          />
          {error && (
            <Typography color="error" style={{ marginTop: '10px' }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || uploading}
            variant="contained"
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="Photo uploaded successfully"
      />
    </>
  );
}

export default PhotoUpload;
import { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface UploadModalProps {
  onUploadSuccess?: (payload: { title: string; acronym: string; description: string; visualization: any, label: string, upper: string, lower: string, estimate: string, dataset: string }) => void;
}

const UploadModal = ({ onUploadSuccess }: UploadModalProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [acronym, setAcronym] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [visualization, setVisualization] = useState("table");
  // New fields for label, upper, lower, estimate
  const [label, setLabel] = useState("");
  const [upper, setUpper] = useState("");
  const [lower, setLower] = useState("");
  const [estimate, setEstimate] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setTitle("");
    setAcronym("");
    setDescription("");
    setFileName("");
    setFile(null);
    setVisualization("table");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (!selectedFile) return;
    const isJson = selectedFile.name.endsWith('.json');
    const isJsonl = selectedFile.name.endsWith('.jsonl');
    if (isJson || isJsonl) {
      setFileName(selectedFile.name);
      setFile(selectedFile);
    } else {
      alert('Please upload a valid JSON or JSONL file');
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert('Please select a file');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data;
        if (file && file.name.endsWith('.jsonl')) {
          const text = e.target && typeof e.target.result === 'string' ? e.target.result : '';
          data = text
            ? text
                .split('\n')
                .map((line: string) => line.trim())
                .filter((line: string) => line.length > 0)
                .map((line: string) => {
                  try {
                    return JSON.parse(line);
                  } catch (err) {
                    return null;
                  }
                })
                .filter(Boolean)
            : [];
        } else {
          const jsonString = e.target && typeof e.target.result === 'string' ? e.target.result : '';
          data = JSON.parse(jsonString);
        }
        sessionStorage.setItem(acronym, JSON.stringify(data));
        setUploading(false);
        handleClose();
        if (onUploadSuccess) onUploadSuccess({ title, acronym, description, visualization, label, upper, lower, estimate, dataset: "sessionStorage" });
      } catch (error) {
        setUploading(false);
        alert('Error parsing file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
        Upload Target profile data
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Upload Data</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Acronym"
            value={acronym}
            onChange={e => setAcronym(e.target.value.toUpperCase())}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
          {/* Show these fields only if visualization is 'forestplot' */}
          {visualization === 'forestplot' && (
            <>
              <TextField
                label="Label column"
                value={label}
                onChange={e => setLabel(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Upper confidence interval column"
                value={upper}
                onChange={e => setUpper(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Lower confidence interval column"
                value={lower}
                onChange={e => setLower(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Estimate column"
                value={estimate}
                onChange={e => setEstimate(e.target.value)}
                fullWidth
                margin="normal"
              />
            </>
          )}
          <input
            type="file"
            accept=".json,.jsonl"
            onChange={handleFileChange}
            id="fileInputModal"
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              const el = document.getElementById('fileInputModal');
              if (el) el.click();
            }}
            sx={{ mt: 2 }}
            fullWidth
          >
            {fileName ? `File Selected: ${fileName}` : 'Select JSON/JSONL File'}
          </Button>
          <FormControl fullWidth margin="normal">
            <InputLabel id="visualization-label">Visualization</InputLabel>
            <Select
              labelId="visualization-label"
              value={visualization}
              label="Visualization"
              onChange={e => setVisualization(e.target.value)}
            >
              <MenuItem value="table">Table only</MenuItem>
              <MenuItem value="forestplot">Forestplot</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" color="primary" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadModal;

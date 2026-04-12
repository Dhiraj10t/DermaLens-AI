import { useCallback, useState } from 'react';
import { Upload, FileImage } from 'lucide-react';

export default function ImageUploader({ onImageSelect }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, []);

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file) => {
    if (!file.type.match('image.*')) {
      alert("Please upload an image file.");
      return;
    }
    const url = URL.createObjectURL(file);
    onImageSelect(file, url);
  };

  return (
    <div 
      className={`glass-panel border-2 border-dashed transition-all duration-300 w-full h-80 flex flex-col items-center justify-center p-6 text-center cursor-pointer 
        ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-blue-400/50 hover:bg-slate-800/50'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload').click()}
    >
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
        <Upload className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-medium mb-2">Upload Facial Image</h3>
      <p className="text-slate-400 mb-4 max-w-sm">Drag and drop your image here, or click to browse. Use a clear, well-lit photo of your face.</p>
      <div className="text-xs text-slate-500 flex items-center gap-1">
        <FileImage className="w-3 h-3" /> PNG, JPG, JPEG up to 10MB
      </div>
    </div>
  );
}

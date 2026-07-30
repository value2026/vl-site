import { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';
import ConfirmModal from './ConfirmModal';

/**
 * CloudinaryUploader — direct browser-to-Cloudinary upload.
 * No backend proxy needed (uses unsigned upload preset).
 *
 * Props:
 *   value      — current image URL (string)
 *   onChange   — called with the new Cloudinary URL on success
 *   label      — optional label text
 *
 * Setup: set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET
 * in your .env (create a free Cloudinary account → Settings → Upload Presets → New unsigned preset)
 */
export default function CloudinaryUploader({ value, onChange, label = 'Upload Image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [confirmConfig, setConfirmConfig] = useState(null);
  const inputRef                  = useRef(null);

  const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const isConfigured  = CLOUD_NAME && UPLOAD_PRESET;

  const handleFile = async (file) => {
    if (!file) return;

    // If Cloudinary not configured, upload directly to the backend
    if (!isConfigured) {
      setUploading(true);
      setError('');
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.upload('/upload', formData);
        if (!res.ok) throw new Error('Local upload failed');
        const data = await res.json();
        onChange(data.url);
      } catch (err) {
        setError('Local upload failed. Please try again.');
        console.error('Local media upload error:', err);
      } finally {
        setUploading(false);
      }
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onChange(data.secure_url);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Cloudinary upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10 group">
          <img src={value} alt="Uploaded" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white text-sm transition-colors"
            >
              <Upload className="w-4 h-4" />
              Change
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmConfig({
                  title: 'Remove Image',
                  message: 'Are you sure you want to remove this image?',
                  onConfirm: () => onChange('')
                });
              }}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/30 hover:bg-red-500/50 border border-red-400/30 rounded-lg text-red-300 text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
              <p className="text-slate-400 text-sm">Uploading…</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-white/5 group-hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors">
                <ImageIcon className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-slate-300 text-sm font-medium">Click or drag to upload</p>
                <p className="text-slate-500 text-xs mt-1">PNG, JPG, WebP up to 10MB</p>
                {!isConfigured && (
                  <p className="text-amber-400 text-xs mt-2">⚠ Cloudinary not configured — using local preview</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <ConfirmModal isOpen={!!confirmConfig} {...(confirmConfig || {})} onClose={() => setConfirmConfig(null)} />
    </div>
  );
}

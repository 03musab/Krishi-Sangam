import { useState, useRef, useCallback } from 'react';
import { apiUpload } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function PhotoUpload({ onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const result = await apiUpload(file);
      if (onUploaded) onUploaded(result.url);
    } catch (err) {
      showToast(t('upload.failed', { msg: err.message }));
    } finally {
      setUploading(false);
    }
  }, [onUploaded, showToast]);

  return (
    <div className="upload-section">
      <label className="upload-label">{t('upload.photo')}</label>
      <div
        className="upload-dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
      >
        <input
          type="file"
          ref={inputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="upload-preview" />
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span>{uploading ? t('upload.uploading') : t('upload.clickOrDrag')}</span>
          </>
        )}
      </div>
    </div>
  );
}

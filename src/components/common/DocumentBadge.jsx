import React, { useRef, useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Upload, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../api/apiClient';

export const DocumentBadge = ({
  docType, // 'msds' | 'draftCoa' | 'coa'
  docData, // { url, fileName, fileSize, uploadedAt }
  onUpload, // async (file) => Promise<void>
  onDelete, // async () => Promise<void>
  label,
  compact = false,
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const displayLabel = label || (
    docType === 'msds' ? 'MSDS' : docType === 'draftCoa' ? 'Draft COA' : 'COA'
  );

  const hasDoc = Boolean(docData && docData.url);

  // Normalize document URL if relative
  const getFullUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendRoot = API_BASE_URL.replace(/\/api\/?$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${backendRoot}${cleanPath}`;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    try {
      setUploading(true);
      await onUpload(file);
    } catch (err) {
      console.error('Document upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!onDelete) return;
    if (!window.confirm(`Are you sure you want to remove the ${displayLabel} document?`)) return;
    try {
      setDeleting(true);
      await onDelete();
    } catch (err) {
      console.error('Document delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        {hasDoc ? (
          <a
            href={getFullUrl(docData.url)}
            target="_blank"
            rel="noopener noreferrer"
            title={`${displayLabel}: ${docData.fileName || 'Available'}`}
            className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-all"
          >
            <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{displayLabel}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
          </a>
        ) : (
          <span
            title={`${displayLabel} is missing`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium"
          >
            <AlertCircle className="w-3 h-3 text-orange-500 shrink-0" />
            <span>{displayLabel}</span>
          </span>
        )}

        {onUpload && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            title={hasDoc ? `Replace ${displayLabel}` : `Upload ${displayLabel}`}
            className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
            ) : (
              <Upload className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
        hasDoc
          ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-3 min-w-0 pr-2">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            hasDoc
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-orange-50 text-orange-600 border border-orange-200'
          }`}
        >
          <FileText className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {displayLabel}
            </span>
            {hasDoc ? (
              <>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-1.5 py-0.2 rounded">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Attached
                </span>
                {docData?.url?.includes('cloudinary.com') && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-sky-700 font-semibold bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
                    Cloudinary
                  </span>
                )}
              </>
            ) : (
              <span className="text-[11px] text-orange-700 font-medium bg-orange-100/70 px-1.5 py-0.2 rounded">
                Not Attached
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 truncate mt-0.5">
            {hasDoc ? (
              docData.fileName || 'Document available'
            ) : (
              'Upload PDF file for customer downloads'
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {hasDoc && (
          <a
            href={getFullUrl(docData.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors bg-white shadow-2xs"
            title="Preview / Download Document"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {onUpload && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-300 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{hasDoc ? 'Replace' : 'Upload'}</span>
          </button>
        )}

        {hasDoc && onDelete && (
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer bg-white"
            title="Delete Document"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentBadge;

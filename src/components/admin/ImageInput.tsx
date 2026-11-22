import { useEffect, useId, useState } from 'react';
import { AlertCircle, ImageOff, Link2, Trash2, Upload } from 'lucide-react';
import { getErrorMessage } from '../../lib/format';
import type { StorageBucket } from '../../lib/storageUrl';
import {
  deleteStorageImageByPublicUrl,
  uploadStorageImage,
} from '../../services/storage';
import { Button } from '../ui/Button';

interface ImageInputProps {
  label?: string;
  value: string;
  onChange: (nextUrl: string) => void;
  bucket: StorageBucket;
  pathPrefix: string;
  fileNameHint?: string;
  deleteOnRemove?: boolean;
  aspect?: 'square' | 'landscape' | 'wide';
  helperText?: string;
  clearAfterPick?: boolean;
  multipleFiles?: boolean;
  onMultipleUploaded?: (urls: string[]) => void;
}

export function ImageInput({
  label,
  value,
  onChange,
  bucket,
  pathPrefix,
  fileNameHint,
  deleteOnRemove = false,
  aspect = 'landscape',
  helperText,
  clearAfterPick = false,
  multipleFiles = false,
  onMultipleUploaded,
}: ImageInputProps) {
  const inputId = useId();
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlDraft, setUrlDraft] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!clearAfterPick) {
      setUrlDraft(value);
      setPreviewFailed(false);
    }
  }, [value, clearAfterPick]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);
    setProgress(10);
    setProgressStage('Preparing image...');

    try {
      const fileList = Array.from(files);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const publicUrl = await uploadStorageImage(bucket, pathPrefix, file, {
          fileNameHint,
          onProgress: (pct, stage) => {
            const overall = Math.round(((i + pct / 100) / fileList.length) * 100);
            setProgress(overall);
            setProgressStage(
              fileList.length > 1
                ? `${stage} (${i + 1}/${fileList.length})`
                : stage,
            );
          },
        });
        uploadedUrls.push(publicUrl);
      }

      if (multipleFiles && onMultipleUploaded) {
        onMultipleUploaded(uploadedUrls);
      } else if (uploadedUrls[0]) {
        onChange(uploadedUrls[0]);
        if (!clearAfterPick) {
          setUrlDraft(uploadedUrls[0]);
          setPreviewFailed(false);
        }
      }
      setProgress(100);
    } catch (err) {
      setError(getErrorMessage(err, 'Image upload failed.'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) {
      setError('Please enter an image URL.');
      return;
    }
    if (!/^(https?:\/\/|\/)/i.test(trimmed)) {
      setError('Enter a valid https:// or http:// image URL.');
      return;
    }
    setError(null);
    setPreviewFailed(false);
    onChange(trimmed);
    if (clearAfterPick) {
      setUrlDraft('');
    }
  };

  const handleRemove = async () => {
    const current = value;
    setError(null);
    setPreviewFailed(false);
    onChange('');
    setUrlDraft('');
    if (deleteOnRemove && current) {
      setRemoving(true);
      try {
        await deleteStorageImageByPublicUrl(current);
      } finally {
        setRemoving(false);
      }
    }
  };

  const previewUrl = clearAfterPick ? urlDraft.trim() : value.trim();
  const hasPreviewCandidate = /^(https?:\/\/|data:image\/|\/)/i.test(previewUrl);
  const aspectClass =
    aspect === 'square'
      ? 'w-28 h-28'
      : aspect === 'wide'
        ? 'w-full max-w-md aspect-[16/7]'
        : 'w-48 aspect-[4/3]';

  return (
    <div className="space-y-2.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--ink)]"
        >
          {label}
        </label>
      )}

      <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-alt)]/50 p-3.5 space-y-3">
        {/* Two clearly labelled options */}
        <div
          role="tablist"
          aria-label={label ? `${label} source` : 'Image source'}
          className="inline-flex rounded-lg border border-[var(--line)] bg-white p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'upload'}
            onClick={() => {
              setMode('upload');
              setError(null);
            }}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'upload'
                ? 'bg-[var(--brand-red)] text-white'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload image</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'url'}
            onClick={() => {
              setMode('url');
              setError(null);
            }}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'url'
                ? 'bg-[var(--brand-red)] text-white'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Paste image URL</span>
          </button>
        </div>

        {mode === 'upload' ? (
          <div className="space-y-2">
            <label
              htmlFor={inputId}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-[var(--ink)] hover:border-[var(--brand-red)] transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[var(--brand-red)] shrink-0" />
              <span>
                {uploading
                  ? progressStage || 'Uploading...'
                  : multipleFiles
                    ? 'Choose image file(s) to upload (max 1600px, 2 MB)'
                    : 'Choose image file to upload (max 1600px, 2 MB)'}
              </span>
              <input
                id={inputId}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                multiple={multipleFiles}
                disabled={uploading}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {uploading && (
              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-[var(--brand-red)] transition-all duration-200"
                    style={{ width: `${Math.max(8, progress)}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--ink-soft)] tabular-nums">
                  {progressStage} ({progress}%)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id={inputId}
              type="url"
              value={urlDraft}
              onChange={(e) => {
                const next = e.target.value;
                setUrlDraft(next);
                setError(null);
                setPreviewFailed(false);
                if (!clearAfterPick) {
                  onChange(next);
                }
              }}
              placeholder="https://example.com/image.jpg"
              className="flex-1 min-h-[42px] rounded-lg border border-[var(--line)] bg-white px-3.5 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 focus:border-[var(--brand-red)]"
            />
            {clearAfterPick && (
              <Button type="button" variant="secondary" onClick={handleApplyUrl}>
                Add URL
              </Button>
            )}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-[var(--brand-red-light)] px-3 py-2 text-xs font-medium text-[var(--brand-red-dark)]"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Preview */}
        {hasPreviewCandidate && !clearAfterPick && (
          <div className="flex flex-wrap items-start gap-3 pt-1">
            <div
              className={`${aspectClass} rounded-lg border border-[var(--line)] bg-white overflow-hidden flex items-center justify-center`}
            >
              {!previewFailed ? (
                <img
                  src={previewUrl}
                  alt={label || 'Image preview'}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setPreviewFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 p-2 text-center text-[var(--ink-soft)]">
                  <ImageOff className="w-5 h-5 opacity-60" />
                  <span className="text-[11px]">Could not load preview</span>
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              loading={removing}
              onClick={handleRemove}
              className="text-[var(--brand-red)] hover:bg-[var(--brand-red-light)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </Button>
          </div>
        )}

        {hasPreviewCandidate && clearAfterPick && (
          <div className="flex items-center gap-3 pt-1">
            <div className="w-16 h-16 rounded-lg border border-[var(--line)] bg-white overflow-hidden flex items-center justify-center">
              {!previewFailed ? (
                <img
                  src={previewUrl}
                  alt="URL preview"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setPreviewFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageOff className="w-4 h-4 text-[var(--ink-soft)]" />
              )}
            </div>
            <span className="text-xs text-[var(--ink-soft)]">
              Live URL preview — click Add URL to include this photo
            </span>
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-[var(--ink-soft)]">{helperText}</p>
      )}
    </div>
  );
}

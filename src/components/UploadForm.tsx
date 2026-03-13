'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Upload, ImageIcon, X, Loader2 } from 'lucide-react';
import { voiceCategories, voiceOptions, DEFAULT_VOICE } from '@/lib/constant';
import { UploadSchema } from '@/lib/zod';
import { BookUploadFormValues } from '@/lib/types';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { checkBookExists, createBook } from '@/lib/actions/book.actions';
import { useRouter } from 'next/navigation';
import { parsePDFFile } from '@/lib/utils';
import { upload } from '@vercel/blob/client';
// ─── Loading Overlay ────────────────────────────────────────────────────────

function LoadingOverlay() {
  return (
    <div className="loading-wrapper">
      <div className="loading-shadow-wrapper bg-white shadow-soft-lg">
        <div className="loading-shadow">
          <Loader2 className="loading-animation w-12 h-12 text-[#663820]" />
          <p className="loading-title">Synthesising your book…</p>
          <div className="loading-progress">
            <div className="loading-progress-item">
              <span className="loading-progress-status" />
              <span className="text-(--text-secondary)">
                Uploading and processing PDF
              </span>
            </div>
            <div className="loading-progress-item">
              <span className="loading-progress-status" />
              <span className="text-(--text-secondary)">
                Generating AI conversation
              </span>
            </div>
            <div className="loading-progress-item">
              <span className="loading-progress-status" />
              <span className="text-(--text-secondary)">
                Preparing your book
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dropzone Field ─────────────────────────────────────────────────────────

interface DropzoneFieldProps {
  file: File | undefined;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  accept: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
  disabled?: boolean;
}

function DropzoneField({
  file,
  onFileSelect,
  onRemove,
  accept,
  icon,
  label,
  hint,
  disabled,
}: DropzoneFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onFileSelect(selected);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`upload-dropzone ${file ? 'upload-dropzone-uploaded' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {file ? (
        <div className="file-upload-shadow w-full">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {icon}
              <span className="upload-dropzone-text truncate max-w-[260px]">
                {file.name}
              </span>
            </div>
            <button
              type="button"
              className="upload-dropzone-remove shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="upload-dropzone-hint mt-2">
            {(file.size / (1024 * 1024)).toFixed(1)} MB
          </p>
        </div>
      ) : (
        <div className="file-upload-shadow">
          <div className="upload-dropzone-icon">{icon}</div>
          <p className="upload-dropzone-text">{label}</p>
          <p className="upload-dropzone-hint">{hint}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Form ───────────────────────────────────────────────────────────────

const UploadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useAuth();
  const router = useRouter();

  const form = useForm<BookUploadFormValues>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      pdfFile: undefined,
      coverImage: undefined,
      title: '',
      author: '',
      voiceId: voiceOptions[DEFAULT_VOICE as keyof typeof voiceOptions].id,
    },
  });

  const onSubmit = async (data: BookUploadFormValues) => {
    if (!userId) {
      return toast.error('Please sign in to upload a book');
    }

    setIsSubmitting(true);

    try {
      const existsCheck = await checkBookExists(data.title);

      if (existsCheck.exists && existsCheck.book) {
        toast.info('Book with this title already exists');
        form.reset();
        router.push(`/books/${existsCheck.book.slug}`);
        return;
      }

      const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
      const pdfFile = data.pdfFile;
      const parsedPDF = await parsePDFFile(pdfFile);
      if (parsedPDF.content.length === 0) {
        toast.error('No text found in the PDF file');
        return;
      }
      const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        contentType: 'application/pdf',
      });

      let coverUrl: string;

      if (data.coverImage) {
        const coverFile = data.coverImage;
        const uploadedCoverBlob = await upload(
          `${fileTitle}_cover.png`,
          coverFile,
          {
            access: 'public',
            handleUploadUrl: '/api/upload',
            contentType: coverFile.type,
          },
        );
        coverUrl = uploadedCoverBlob.url;
      } else {
        const response = await fetch(parsedPDF.cover);
        const blob = await response.blob();

        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          contentType: blob.type,
        });
        coverUrl = uploadedCoverBlob.url;
      }

      const book = await createBook({
        clerkId: userId,
        title: data.title,
        author: data.author,
        persona: data.voiceId,
        fileURL: uploadedPdfBlob.url,
        fileBlobKey: uploadedPdfBlob.pathname,
        fileSize: pdfFile.size,
        coverURL: coverUrl,
      });
    } catch (error) {
      console.log('Error submitting form', error);
      return toast.error('Failed to upload book');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting && <LoadingOverlay />}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="new-book-wrapper space-y-8"
        >
          {/* ── PDF Upload ── */}
          <FormField
            control={form.control}
            name="pdfFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Book PDF File</FormLabel>
                <FormControl>
                  <DropzoneField
                    file={field.value}
                    onFileSelect={(f) => field.onChange(f)}
                    onRemove={() => field.onChange(undefined)}
                    accept="application/pdf"
                    icon={<Upload className="w-full h-full" />}
                    label="Click to upload PDF"
                    hint="PDF file (max 50MB)"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Cover Image Upload ── */}
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">
                  Cover Image{' '}
                  <span className="text-(--text-muted) font-normal">
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <DropzoneField
                    file={field.value}
                    onFileSelect={(f) => field.onChange(f)}
                    onRemove={() => field.onChange(undefined)}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    icon={<ImageIcon className="w-full h-full" />}
                    label="Click to upload cover image"
                    hint="Leave empty to auto-generate from PDF"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Title ── */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Title</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    placeholder="ex: Rich Dad Poor Dad"
                    disabled={isSubmitting}
                    className="form-input border border-(--border-subtle) focus:outline-none focus:ring-2 focus:ring-(--accent-warm)/30 focus:border-(--accent-warm) transition-colors"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Author ── */}
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Author Name</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    placeholder="ex: Robert Kiyosaki"
                    disabled={isSubmitting}
                    className="form-input border border-(--border-subtle) focus:outline-none focus:ring-2 focus:ring-(--accent-warm)/30 focus:border-(--accent-warm) transition-colors"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Voice Selector ── */}
          <FormField
            control={form.control}
            name="voiceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">
                  Choose Assistant Voice
                </FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {/* Male voices */}
                    <div>
                      <p className="text-sm font-medium text-(--text-muted) mb-3">
                        Male Voices
                      </p>
                      <div className="voice-selector-options flex-wrap">
                        {voiceCategories.male.map((key) => {
                          const voice =
                            voiceOptions[key as keyof typeof voiceOptions];
                          const selected = field.value === voice.id;
                          return (
                            <label
                              key={voice.id}
                              className={`voice-selector-option ${
                                selected
                                  ? 'voice-selector-option-selected'
                                  : 'voice-selector-option-default'
                              } ${isSubmitting ? 'voice-selector-option-disabled' : ''} cursor-pointer`}
                            >
                              <input
                                type="radio"
                                name="voiceId"
                                value={voice.id}
                                checked={selected}
                                onChange={() => field.onChange(voice.id)}
                                disabled={isSubmitting}
                                className="sr-only"
                              />
                              <div className="flex items-center gap-2 w-full">
                                <div
                                  className={`w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                                    selected
                                      ? 'border-(--accent-warm)'
                                      : 'border-(--border-medium)'
                                  }`}
                                >
                                  {selected && (
                                    <div className="w-2 h-2 rounded-full bg-(--accent-warm)" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-(--text-primary) text-sm leading-5">
                                    {voice.name}
                                  </p>
                                  <p className="text-xs text-(--text-muted) leading-4 mt-0.5">
                                    {voice.description}
                                  </p>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Female voices */}
                    <div>
                      <p className="text-sm font-medium text-(--text-muted) mb-3">
                        Female Voices
                      </p>
                      <div className="voice-selector-options flex-wrap">
                        {voiceCategories.female.map((key) => {
                          const voice =
                            voiceOptions[key as keyof typeof voiceOptions];
                          const selected = field.value === voice.id;
                          return (
                            <label
                              key={voice.id}
                              className={`voice-selector-option ${
                                selected
                                  ? 'voice-selector-option-selected'
                                  : 'voice-selector-option-default'
                              } ${isSubmitting ? 'voice-selector-option-disabled' : ''} cursor-pointer`}
                            >
                              <input
                                type="radio"
                                name="voiceId"
                                value={voice.id}
                                checked={selected}
                                onChange={() => field.onChange(voice.id)}
                                disabled={isSubmitting}
                                className="sr-only"
                              />
                              <div className="flex items-center gap-2 w-full">
                                <div
                                  className={`w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                                    selected
                                      ? 'border-(--accent-warm)'
                                      : 'border-(--border-medium)'
                                  }`}
                                >
                                  {selected && (
                                    <div className="w-2 h-2 rounded-full bg-(--accent-warm)" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-(--text-primary) text-sm leading-5">
                                    {voice.name}
                                  </p>
                                  <p className="text-xs text-(--text-muted) leading-4 mt-0.5">
                                    {voice.description}
                                  </p>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="form-btn disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Begin Synthesis
          </button>
        </form>
      </Form>
    </>
  );
};

export default UploadForm;

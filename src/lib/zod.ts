import z from 'zod';
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_PDF_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
} from '@/lib/constant';

export const UploadSchema = z.object({
  pdfFile: z
    .instanceof(File, { message: 'A PDF file is required.' })
    .refine((f) => f.size <= MAX_FILE_SIZE, 'File must be 50MB or less.')
    .refine(
      (f) => ACCEPTED_PDF_TYPES.includes(f.type),
      'Only PDF files are accepted.',
    ),
  coverImage: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_IMAGE_SIZE, 'Image must be 10MB or less.')
    .refine(
      (f) => ACCEPTED_IMAGE_TYPES.includes(f.type),
      'Only JPEG, PNG, and WebP images are accepted.',
    )
    .optional(),
  title: z
    .string()
    .min(1, 'Title is required.')
    .max(200, 'Title must be 200 characters or less.'),
  author: z
    .string()
    .min(1, 'Author name is required.')
    .max(100, 'Author must be 100 characters or less.'),
  voiceId: z.string().min(1, 'Please select a voice.'),
});

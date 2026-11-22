import { z } from 'zod';

export function countPhoneDigits(phone: string): number {
  return phone.replace(/\D/g, '').length;
}

export const buyerOrderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name (min 2 characters)')
    .max(80, 'Name must be 80 characters or fewer'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => {
        const len = countPhoneDigits(val);
        return len >= 10 && len <= 15;
      },
      { message: 'Enter a valid phone / WhatsApp number (10-15 digits)' },
    ),
  city: z
    .string()
    .trim()
    .min(2, 'Please enter your city')
    .max(80, 'City must be 80 characters or fewer'),
  business_name: z
    .string()
    .trim()
    .max(120, 'Business name must be 120 characters or fewer')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .trim()
    .max(1000, 'Message must be 1000 characters or fewer')
    .optional()
    .or(z.literal('')),
  website: z.string().optional(), // honeypot
});

export type BuyerOrderFormValues = z.infer<typeof buyerOrderSchema>;

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your name (min 2 characters)')
    .max(80, 'Name must be 80 characters or fewer'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => {
        const len = countPhoneDigits(val);
        return len >= 10 && len <= 15;
      },
      { message: 'Enter a valid phone / WhatsApp number (10-15 digits)' },
    ),
  message: z
    .string()
    .trim()
    .min(5, 'Please write a brief message (min 5 characters)')
    .max(1000, 'Message must be 1000 characters or fewer'),
  website: z.string().optional(), // honeypot
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const whatsappSettingSchema = z.object({
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, 'Digits only with country code, e.g. 923001234567 (10-15 digits, no + or spaces)'),
});

export function validateQuantity(quantity: number, moq: number): boolean {
  return Number.isInteger(quantity) && quantity >= moq && quantity <= 1_000_000;
}

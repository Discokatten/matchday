import { z } from 'zod';

const DISALLOWED_EMAIL_DOMAINS = ['privaterelay.appleid.com', '@passinbox.com'];

const normalizeEmailForValidation = (value: string) => value.trim().toLowerCase();

export const emailField = z
  .string()
  .trim()
  .min(1, { message: 'Ange e-postadress' })
  .email({ message: 'Ange en giltig e-postadress' })
  .refine(
    (value) => {
      const normalizedValue = normalizeEmailForValidation(value);
      return !DISALLOWED_EMAIL_DOMAINS.some((domain) =>
        normalizedValue.includes(domain),
      );
    },
    { message: 'Denna e-postadress är inte godkänd' },
  );

export const passwordField = z
  .string()
  .trim()
  .min(1, { message: 'Ange lösenord' })
  .min(8, { message: 'Lösenordet måste vara minst 8 tecken' });

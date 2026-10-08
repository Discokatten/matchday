import { z } from 'zod';
import { emailField, passwordField } from './authSchema';

const PASSWORD_MISMATCH_MESSAGE = 'Lösenorden matchar inte';

export const registerUserSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: PASSWORD_MISMATCH_MESSAGE,
    path: ['confirmPassword'],
  });

export type RegisterUserFormValues = z.infer<typeof registerUserSchema>;

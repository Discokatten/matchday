import { z } from 'zod';
import { passwordField } from './authSchema';

export const loginSchema = z.object({
  email: z.string().trim().min(1, { message: 'Ange e-post eller användarnamn' }),
  password: passwordField,
});
export type LoginFormValues = z.infer<typeof loginSchema>;

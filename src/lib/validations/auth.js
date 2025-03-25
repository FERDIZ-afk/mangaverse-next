import { object, string, email, minLength, maxLength } from "valibot";

export const loginSchema = object({
  email: string([email("Email tidak valid")]),
  password: string([
    minLength(6, "Password minimal 6 karakter"),
    maxLength(100, "Password terlalu panjang"),
  ]),
});

export const registerSchema = object({
  name: string([
    minLength(2, "Nama minimal 2 karakter"),
    maxLength(50, "Nama terlalu panjang"),
  ]),
  email: string([email("Email tidak valid")]),
  password: string([
    minLength(6, "Password minimal 6 karakter"),
    maxLength(100, "Password terlalu panjang"),
  ]),
  confirmPassword: string([
    minLength(6, "Password minimal 6 karakter"),
    maxLength(100, "Password terlalu panjang"),
  ]),
});

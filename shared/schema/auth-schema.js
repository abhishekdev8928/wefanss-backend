const { z } = require("zod");

// Register Schema
const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
  role: z
    .string()
    .optional()
    .default("USER"),
});

// Login Schema
const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required"),
});

// Verify OTP Schema (for login verification)
const verifyOtpSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
  otp: z
    .string()
    .min(6, "Code must be at least 6 characters")
    .max(8, "Code must be less than 8 characters")
    .trim(),
});

// Resend OTP Schema (for login)
const resendOtpSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
});

// Forgot Password Schema (Step 1: Send OTP)
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
});

// Verify Reset OTP Schema (Step 2: Verify OTP only, no password)
const verifyResetOtpSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
  otp: z
    .string()
    .min(6, "Code must be at least 6 characters")
    .max(8, "Code must be less than 8 characters")
    .trim(),
});

// Reset Password Schema (Step 3: Set new password)
const resetPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
});

// Refresh Token Schema
const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .optional(), // Can come from cookie, so it's optional in body
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  refreshTokenSchema,
};
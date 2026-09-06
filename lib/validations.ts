import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000, "Description too long"),
  price: z.number().min(0, "Price must be positive"),
  negotiable: z.boolean().default(true),
  phone: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  locationId: z.string().min(1, "Location is required"),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(["DRAFT", "ACTIVE", "SOLD", "EXPIRED", "DELETED"]).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(5000, "Message too long"),
  conversationId: z.string().min(1, "Conversation ID required"),
});

export const createConversationSchema = z.object({
  listingId: z.string().min(1, "Listing ID required"),
  content: z.string().min(1, "Initial message required").max(5000, "Message too long"),
});

export const createPromotionSchema = z
  .object({
    audienceType: z.enum(["AUTOMATIC", "CUSTOM"]),
    location: z.string().min(2).max(80),
    minAge: z.number().int().min(18).max(65),
    maxAge: z.number().int().min(18).max(65),
    startDate: z.string().date(),
    durationDays: z.number().int().min(1).max(30),
    dailyBudget: z.number().min(100).max(5000),
    gender: z.enum(["BOTH", "MALE", "FEMALE"]),
  })
  .refine((data) => data.maxAge >= data.minAge, {
    message: "Maximum age must be greater than or equal to minimum age",
    path: ["maxAge"],
  });

export const submitPromotionPaymentSchema = z.object({
  transactionId: z
    .string()
    .trim()
    .min(6, "Transaction ID must be at least 6 characters")
    .max(32, "Transaction ID must be 32 characters or fewer")
    .regex(/^[A-Za-z0-9]+$/, "Transaction ID can only contain letters and numbers"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type SubmitPromotionPaymentInput = z.infer<typeof submitPromotionPaymentSchema>;

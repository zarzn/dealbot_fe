import { z } from "zod";

export const marketCategories = [
  'Electronics',
  'Gaming',
  'Home & Kitchen',
  'Fashion',
  'Books',
  'Sports & Outdoors',
  'Toys & Games',
  'Automotive',
  'Health & Beauty',
  'Other'
] as const;

export const goalStatuses = [
  'active',
  'paused',
  'completed',
  'expired'
] as const;

export const goalPriorities = [
  'low',
  'medium',
  'high'
] as const;

export const goalConstraintsSchema = z.object({
  maxPrice: z.number()
    .positive("Maximum price must be positive")
    .max(1000000, "Maximum price cannot exceed $1,000,000"),
  minPrice: z.number()
    .min(0, "Minimum price cannot be negative"),
  brands: z.array(z.string())
    .optional()
    .default([]),
  conditions: z.array(
    z.enum(['new', 'used', 'refurbished', 'any'])
  )
    .optional()
    .default(['any']),
  keywords: z.array(z.string())
    .min(1, "At least one keyword is required")
    .max(10, "Maximum 10 keywords allowed"),
  features: z.array(z.string())
    .optional()
    .default([])
}).refine(
  (data) => data.maxPrice > data.minPrice,
  {
    message: "Maximum price must be greater than minimum price",
    path: ["maxPrice"]
  }
);

export const goalNotificationSchema = z.object({
  email: z.boolean().default(true),
  inApp: z.boolean().default(true),
  priceThreshold: z.number()
    .min(0, "Price threshold cannot be negative")
    .max(1, "Price threshold must be between 0 and 1")
});

export const createGoalSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title cannot exceed 255 characters"),
  itemCategory: z.enum(marketCategories, {
    errorMap: () => ({ message: "Please select a valid category" })
  }),
  description: z.string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  constraints: goalConstraintsSchema,
  notifications: goalNotificationSchema,
  deadline: z.date()
    .min(new Date(), "Deadline must be in the future")
    .optional(),
  priority: z.enum(goalPriorities)
    .default("medium"),
  maxMatches: z.number()
    .int()
    .positive("Maximum matches must be positive")
    .optional(),
  maxTokens: z.number()
    .positive("Maximum tokens must be positive")
    .optional(),
  marketplaces: z.array(z.string())
    .min(1, "At least one marketplace must be selected")
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type GoalConstraints = z.infer<typeof goalConstraintsSchema>;
export type GoalNotifications = z.infer<typeof goalNotificationSchema>;

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: z.enum(goalStatuses).optional()
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>; 
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
  maxPrice: z.number().min(0),
  minPrice: z.number().min(0),
  brands: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});

export const goalNotificationSchema = z.object({
  email: z.boolean().default(true),
  inApp: z.boolean().default(true),
  priceThreshold: z.number()
    .min(0, "Price threshold cannot be negative")
    .max(1, "Price threshold must be between 0 and 1")
});

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  itemCategory: z.string().min(1, 'Category is required'),
  marketplaces: z.array(z.string()).min(1, 'At least one marketplace is required'),
  constraints: goalConstraintsSchema,
  notifications: z.object({
    email: z.boolean(),
    inApp: z.boolean(),
    priceThreshold: z.number().min(0).max(100),
  }),
  priority: z.enum(['low', 'medium', 'high']),
  deadline: z.string().optional(),
  maxMatches: z.number().optional(),
  maxTokens: z.number().optional(),
});

export type GoalConstraints = z.infer<typeof goalConstraintsSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type GoalNotifications = z.infer<typeof goalNotificationSchema>;

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: z.enum(goalStatuses).optional()
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>; 
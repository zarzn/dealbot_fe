import { z } from "zod";

export const marketCategories = [
  'electronics',
  'fashion',
  'home',
  'toys',
  'books',
  'sports',
  'automotive',
  'health',
  'beauty',
  'grocery',
  'other'
] as const;

export const goalStatuses = [
  'active',
  'paused',
  'completed',
  'expired'
] as const;

export const goalPriorities = [1, 2, 3, 4, 5] as const;

export const goalPriorityLabels: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Urgent',
  5: 'Critical'
};

export const goalConstraintsSchema = z.object({
  max_price: z.number().min(0).max(10000, "Maximum price cannot exceed $10,000"),
  min_price: z.number().min(0),
  brands: z.array(z.string()).default([]),
  conditions: z.array(z.string())
    .min(1, "Select at least one condition")
    .default(['new']),
  keywords: z.array(z.string()).default([]),
  features: z.array(z.string()).optional(),
}).refine(data => data.min_price < data.max_price, {
  message: "Minimum price must be less than maximum price",
  path: ["min_price"]
});

export const goalNotificationSchema = z.object({
  email: z.boolean().default(true),
  inApp: z.boolean().default(true),
  priceThreshold: z.number()
    .min(0, "Price threshold cannot be negative")
    .max(1, "Price threshold must be between 0 and 1")
    .default(0.8)
});

export type MarketCategory = typeof marketCategories[number];
export type GoalStatus = typeof goalStatuses[number];
export type GoalPriority = typeof goalPriorities[number];

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title cannot exceed 255 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  item_category: z.enum(marketCategories),
  marketplaces: z.array(z.string()).min(1, 'At least one marketplace is required'),
  constraints: goalConstraintsSchema,
  notifications: goalNotificationSchema,
  priority: z.number().int().min(1).max(5),
  deadline: z.date().optional(),
  max_matches: z.number().positive().optional(),
  max_tokens: z.number().positive().optional(),
  notification_threshold: z.number().min(0).max(1).optional(),
  auto_buy_threshold: z.number().min(0).max(1).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type GoalConstraints = z.infer<typeof goalConstraintsSchema>;

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: z.enum(goalStatuses).optional()
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>; 
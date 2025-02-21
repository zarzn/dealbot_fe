export interface GoalConstraints {
  min_price?: number;
  max_price?: number;
  brands?: string[];
  categories?: string[];
  keywords?: string[];
  excluded_keywords?: string[];
  condition?: string;
  shipping_days_max?: number;
  meta_data?: Record<string, any>;
}

export interface GoalBase {
  title: string;
  item_category: string;
  constraints: GoalConstraints;
  deadline?: string;
  priority: number;
  max_matches?: number;
  max_tokens?: number;
  notification_threshold?: number;
  auto_buy_threshold?: number;
}

export interface GoalCreate extends GoalBase {}

export interface GoalUpdate {
  title?: string;
  item_category?: string;
  constraints?: GoalConstraints;
  deadline?: string;
  priority?: number;
  max_matches?: number;
  max_tokens?: number;
  notification_threshold?: number;
  auto_buy_threshold?: number;
}

export interface MatchedDeal {
  deal_id: string;
  title: string;
  price: number;
  match_score: number;
  matched_at: string;
}

export interface GoalAnalytics {
  total_matches: number;
  active_matches: number;
  best_match_score?: number;
  average_match_score?: number;
  total_notifications: number;
  last_checked?: string;
  recent_matches: MatchedDeal[];
  meta_data?: Record<string, any>;
}

export interface GoalResponse extends GoalBase {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_checked_at?: string;
  analytics?: GoalAnalytics;
} 
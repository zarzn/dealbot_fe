/**
 * Types for sharing functionality
 */

export enum ShareableContentType {
  DEAL = 'deal',
  SEARCH_RESULTS = 'search_results',
  COLLECTION = 'collection', // For future use
}

export enum ShareVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

/**
 * Request to create shareable content
 */
export interface ShareContentRequest {
  content_type: ShareableContentType;
  content_id?: string; // Required for single deal sharing
  search_params?: Record<string, any>; // Required for search results sharing
  title?: string;
  description?: string;
  expiration_days?: number;
  visibility: ShareVisibility;
  include_personal_notes: boolean;
  personal_notes?: string;
}

/**
 * Response from creating shareable content
 */
export interface ShareContentResponse {
  share_id: string;
  title: string;
  description?: string;
  content_type: ShareableContentType;
  shareable_link: string;
  expiration_date?: string;
  created_at: string;
}

/**
 * Detailed shared content information
 */
export interface SharedContentDetail {
  share_id: string;
  title: string;
  description?: string;
  content_type: ShareableContentType;
  content: Record<string, any>;
  created_by?: string;
  created_at: string;
  expires_at?: string;
  view_count: number;
  personal_notes?: string;
}

/**
 * Metrics for shared content engagement
 */
export interface SharedContentMetrics {
  share_id: string;
  view_count: number;
  unique_viewers: number;
  referring_sites: Record<string, number>;
  viewer_devices: Record<string, number>;
  created_at: string;
  last_viewed?: string;
} 
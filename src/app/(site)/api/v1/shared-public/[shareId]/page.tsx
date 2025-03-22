'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FiArrowLeft, FiExternalLink, FiUser, FiCalendar, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import { format } from 'date-fns';
import { viewSharedContent } from '@/services/sharing';
import { SharedContentDetail, ShareableContentType } from '@/types/sharing';
import { Spinner } from '@/components/ui';
import { DealCard } from '@/components/Deals/DealCard';
import { DealsList } from '@/components/Deals/DealsList';

export default function SharedContentPage() {
  const { shareId } = useParams();
  const [content, setContent] = useState<SharedContentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`Fetching shared content with ID: ${shareId} from new API path`);
        const data = await viewSharedContent(shareId as string);
        setContent(data);
      } catch (err: any) {
        console.error('Failed to fetch shared content:', err);
        setError(err.message || 'Failed to load shared content. It may have expired or been removed.');
      } finally {
        setIsLoading(false);
      }
    };

    if (shareId) {
      fetchSharedContent();
    }
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading shared content...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Unable to Load Content
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {error || 'The shared content could not be found or has expired.'}
          </p>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const renderContentByType = () => {
    switch (content.content_type) {
      case ShareableContentType.DEAL:
        return (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Shared Deal</h2>
            {content.content.deal && (
              <DealCard deal={content.content.deal} showActions={false} />
            )}
          </div>
        );
      
      case ShareableContentType.SEARCH_RESULTS:
        return (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Shared Search Results</h2>
            {content.content.search_params && (
              <div className="mb-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Search Query:</strong> {content.content.search_params.query || 'No specific query'}
                  </p>
                  {content.content.search_params.filters && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <strong>Filters:</strong> {
                        Object.entries(content.content.search_params.filters)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ')
                      }
                    </p>
                  )}
                </div>
              </div>
            )}
            {content.content.results && (
              <DealsList 
                deals={content.content.results} 
                isLoading={false}
                showFilters={false}
              />
            )}
          </div>
        );
      
      default:
        return (
          <div className="mt-6">
            <p className="text-gray-600 dark:text-gray-400">
              This content type is not supported for viewing.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link 
        href="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Back to Home
      </Link>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2">{content.title}</h1>
        
        {content.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {content.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
          {content.created_by && (
            <div className="flex items-center">
              <FiUser className="mr-2" />
              <span>Shared by: {content.created_by}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <FiCalendar className="mr-2" />
            <span>Shared on: {format(new Date(content.created_at), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center">
            <FiEye className="mr-2" />
            <span>{content.view_count} {content.view_count === 1 ? 'view' : 'views'}</span>
          </div>
        </div>
        
        {content.personal_notes && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 rounded">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Personal Notes</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {content.personal_notes}
            </p>
          </div>
        )}
        
        {renderContentByType()}
        
        {content.expires_at && (
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>This shared content will expire on {format(new Date(content.expires_at), 'MMM d, yyyy')}.</p>
          </div>
        )}
      </div>
    </div>
  );
} 
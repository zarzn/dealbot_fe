import React, { useState, createContext } from 'react';
import { Deal, DealResponse } from '@/types/deals';
import NotificationTest from '@/components/Notifications/NotificationTest';
import { DealsList } from '@/components/Deals/DealsList';
import { DealDetail } from '@/components/Deals/DealDetail';
import { Button } from '@/components/ui/button';
import Head from 'next/head';

// Create a context to provide mock deals data
interface DealContextType {
  deals: DealResponse[];
}

export const DealContext = createContext<DealContextType>({ deals: [] });

// Mock deals data that conforms to the DealResponse type
const mockDeals: DealResponse[] = [
  {
    id: '1',
    title: 'Apple MacBook Pro 14" with M2 Pro chip',
    description: 'Latest MacBook Pro with M2 Pro chip, 16GB RAM, 512GB SSD',
    price: 1799,
    original_price: 1999,
    url: 'https://example.com/macbook-deal',
    image_url: 'https://placekitten.com/400/300',
    category: 'Electronics',
    source: 'Apple Store',
    currency: 'USD',
    status: 'active',
    found_at: '2023-05-10T14:30:00Z',
    market_id: 'apple-store',
    created_at: '2023-05-10T14:30:00Z',
    updated_at: '2023-05-10T14:30:00Z',
    is_tracked: false,
    seller_info: {
      name: 'Apple Store',
      rating: 4.8,
      condition: 'New'
    },
    shipping_info: {
      cost: 0,
      free_shipping: true,
      estimated_days: 5
    },
    tags: ['laptop', 'apple', 'macbook', 'tech'],
    verified: true,
    featured: true
  },
  {
    id: '2',
    title: 'Sony WH-1000XM4 Noise Cancelling Headphones',
    description: 'Industry-leading noise cancellation with premium sound quality',
    price: 279.99,
    original_price: 349.99,
    url: 'https://example.com/sony-headphones-deal',
    image_url: 'https://placekitten.com/400/301',
    category: 'Electronics',
    source: 'Amazon',
    currency: 'USD',
    status: 'active',
    found_at: '2023-05-12T10:15:00Z',
    market_id: 'amazon',
    created_at: '2023-05-12T10:15:00Z',
    updated_at: '2023-05-12T10:15:00Z',
    is_tracked: false,
    seller_info: {
      name: 'Amazon',
      rating: 4.7,
      condition: 'New'
    },
    shipping_info: {
      cost: 0,
      free_shipping: true,
      estimated_days: 2
    },
    tags: ['headphones', 'sony', 'audio', 'noise-cancelling'],
    verified: true,
    featured: true
  },
  {
    id: '3',
    title: 'Ninja Foodi 10-in-1 Pressure Cooker and Air Fryer',
    description: 'Multi-functional cooking appliance with pressure cooking and air frying capabilities',
    price: 149.99,
    original_price: 199.99,
    url: 'https://example.com/ninja-foodi-deal',
    image_url: 'https://placekitten.com/400/302',
    category: 'Home & Garden',
    source: 'Target',
    currency: 'USD',
    status: 'active',
    found_at: '2023-05-11T09:45:00Z',
    market_id: 'target',
    created_at: '2023-05-11T09:45:00Z',
    updated_at: '2023-05-11T09:45:00Z',
    is_tracked: false,
    seller_info: {
      name: 'Target',
      rating: 4.5,
      condition: 'New'
    },
    shipping_info: {
      cost: 0,
      free_shipping: true,
      estimated_days: 4
    },
    tags: ['kitchen', 'cooking', 'pressure cooker', 'air fryer'],
    verified: false,
    featured: false
  }
];

/**
 * This page is for development and testing purposes only.
 * It will be removed in production.
 */
export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('deals');

  // Simple tabs implementation
  const renderTabContent = () => {
    switch (activeTab) {
      case 'deals':
        return (
          <div className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Deal Management (DEMO)</h2>
            <p className="text-gray-700 mb-6">
              This section demonstrates the deal management interface, including listing, filtering, and viewing deal details.
              The data shown is mock data for development and testing purposes only.
            </p>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-6">
              <p className="text-amber-800 font-medium">Development Notice</p>
              <p className="text-amber-700 text-sm mt-1">
                This page is for development and testing purposes only. 
                In the production environment, this will be replaced with real API integrations.
              </p>
            </div>
            
            <hr className="my-6 border-t border-gray-200" />
            
            <div className="deal-section-wrapper">
              {/* Demo deals list */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <DealsList 
                    initialDeals={mockDeals}
                    showCreateButton={true}
                    initialFilters={{}}
                  />
                </div>
                
                <div className="lg:col-span-2 flex items-center justify-center h-full bg-gray-50 rounded-lg border border-dashed border-gray-300 p-8">
                  <div className="text-center max-w-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Deal</h3>
                    <p className="text-gray-500 mb-6">
                      Select a deal from the list to view its details in this area.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Notification Testing (DEMO)</h2>
            <p className="text-gray-700 mb-6">
              This section allows you to test the notification system by sending test notifications.
              The notifications will appear in the notification center and as toasts.
            </p>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-6">
              <p className="text-amber-800 font-medium">Development Notice</p>
              <p className="text-amber-700 text-sm mt-1">
                This page is for development and testing purposes only. 
                In the production environment, real notifications will be sent from the backend.
              </p>
            </div>
            
            <hr className="my-6 border-t border-gray-200" />
            
            <NotificationTest />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Demo Components | AI Agentic Deals System</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h1 className="text-3xl font-bold mb-2">Development & Testing Demo</h1>
            <p className="text-gray-600">
              This page is for development purposes only and will not be included in the production build.
            </p>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                className={`px-6 py-3 font-medium text-sm ${activeTab === 'deals' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('deals')}
              >
                Deal Management
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm ${activeTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </>
  );
} 
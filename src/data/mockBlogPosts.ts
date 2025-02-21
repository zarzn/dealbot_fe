interface Author {
  _id: string;
  name: string;
  slug: string;
  image: string;
  bio: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  metadata: {
    description: string;
    keywords: string[];
  };
  slug: string;
  tags: string[];
  author: Author;
  mainImage: string;
  publishedAt: string;
  body: string;
  readTime: number;
}

const mockAuthors: Author[] = [
  {
    _id: 'author-1',
    name: 'Sarah Johnson',
    slug: 'sarah-johnson',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    bio: 'AI and e-commerce expert with 10+ years of experience in price analysis and market trends.'
  },
  {
    _id: 'author-2',
    name: 'Michael Chen',
    slug: 'michael-chen',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    bio: 'Deal hunting specialist and consumer technology analyst.'
  },
  {
    _id: 'author-3',
    name: 'Emily Rodriguez',
    slug: 'emily-rodriguez',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
    bio: 'Market researcher specializing in AI-driven price predictions and consumer behavior.'
  }
];

export const mockBlogPosts: BlogPost[] = [
  {
    _id: 'post-1',
    title: 'The Future of AI-Powered Deal Finding: What to Expect in 2024',
    metadata: {
      description: 'Explore the latest trends and innovations in AI-driven deal discovery and price prediction technology.',
      keywords: ['AI', 'deal finding', 'price prediction', '2024 trends']
    },
    slug: 'future-of-ai-powered-deal-finding-2024',
    tags: ['AI', 'Technology', 'E-commerce', 'Future Trends'],
    author: mockAuthors[0],
    mainImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
    publishedAt: '2024-02-15T09:00:00Z',
    body: 'As we move further into 2024, artificial intelligence continues to reshape how we discover and evaluate online deals...',
    readTime: 8
  },
  {
    _id: 'post-2',
    title: 'Maximizing Savings: Advanced Deal Hunting Strategies',
    metadata: {
      description: 'Learn expert techniques for finding the best deals using AI-powered tools and smart shopping strategies.',
      keywords: ['savings', 'deal hunting', 'shopping strategies', 'AI tools']
    },
    slug: 'maximizing-savings-advanced-deal-hunting-strategies',
    tags: ['Deals', 'Shopping', 'Tips', 'Savings'],
    author: mockAuthors[1],
    mainImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000&auto=format&fit=crop',
    publishedAt: '2024-02-10T10:30:00Z',
    body: 'In today\'s digital age, finding the best deals requires more than just browsing discount sections...',
    readTime: 6
  },
  {
    _id: 'post-3',
    title: 'Understanding Price Prediction: How AI Forecasts the Best Time to Buy',
    metadata: {
      description: 'Dive deep into the technology behind AI price predictions and learn how to leverage them for better deals.',
      keywords: ['AI', 'price prediction', 'forecasting', 'machine learning']
    },
    slug: 'understanding-price-prediction-ai-forecasts',
    tags: ['AI', 'Price Analysis', 'Technology', 'Shopping'],
    author: mockAuthors[2],
    mainImage: 'https://images.unsplash.com/photo-1642006953663-06f0387f5652?q=80&w=1000&auto=format&fit=crop',
    publishedAt: '2024-02-05T14:15:00Z',
    body: 'Price prediction algorithms have become increasingly sophisticated, leveraging machine learning to analyze patterns...',
    readTime: 10
  },
  {
    _id: 'post-4',
    title: 'The Rise of Social Deal Sharing',
    metadata: {
      description: 'Explore how community-driven deal sharing is transforming the way we find and share great deals.',
      keywords: ['social shopping', 'deal sharing', 'community', 'collaboration']
    },
    slug: 'rise-of-social-deal-sharing',
    tags: ['Community', 'Social', 'Deals', 'Trends'],
    author: mockAuthors[0],
    mainImage: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=1000&auto=format&fit=crop',
    publishedAt: '2024-01-30T11:45:00Z',
    body: 'The evolution of deal-finding platforms has led to the emergence of strong communities centered around sharing savings...',
    readTime: 7
  },
  {
    _id: 'post-5',
    title: 'Cryptocurrency and Deal Hunting: The Future of Digital Rewards',
    metadata: {
      description: 'Learn about the integration of cryptocurrency rewards in modern deal-hunting platforms.',
      keywords: ['cryptocurrency', 'rewards', 'blockchain', 'digital tokens']
    },
    slug: 'cryptocurrency-deal-hunting-digital-rewards',
    tags: ['Cryptocurrency', 'Technology', 'Rewards', 'Future'],
    author: mockAuthors[1],
    mainImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1000&auto=format&fit=crop',
    publishedAt: '2024-01-25T13:20:00Z',
    body: 'The integration of cryptocurrency rewards in deal-hunting platforms is opening up new possibilities for savvy shoppers...',
    readTime: 9
  }
]; 
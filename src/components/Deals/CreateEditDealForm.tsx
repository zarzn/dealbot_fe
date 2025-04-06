import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { dealsService } from '@/services/deals';
import { DealResponse } from '@/types/deals';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';

interface FormData {
  title: string;
  description: string;
  price: string;
  category: string;
  url: string;
  tags: string[];
}

interface CreateEditDealFormProps {
  dealId?: string; // If provided, we're editing a deal
  onSuccess?: (deal: DealResponse) => void;
}

export const CreateEditDealForm: React.FC<CreateEditDealFormProps> = ({
  dealId,
  onSuccess,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    url: '',
    tags: [],
  });

  // Load deal data if editing
  useEffect(() => {
    if (dealId) {
      const fetchDealDetails = async () => {
        setIsLoading(true);
        try {
          const deal = await dealsService.getDealById(dealId);
          setFormData({
            title: deal.title || '',
            description: deal.description || '',
            price: deal.price?.toString() || '',
            category: deal.category || '',
            url: deal.url || '',
            tags: deal.tags || [],
          });
        } catch (err) {
          console.error('Error fetching deal details:', err);
          toast.error('Failed to load deal details');
        } finally {
          setIsLoading(false);
        }
      };

      fetchDealDetails();
    }
  }, [dealId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!/^(https?:\/\/)/.test(formData.url)) {
      newErrors.url = 'URL must start with http:// or https://';
    }
    
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = 'Price must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please check the form for errors');
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      let response;
      
      // Convert form data to API format
      const dealData = {
        title: formData.title,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : undefined,
        category: formData.category || undefined,
        url: formData.url,
        tags: formData.tags,
      };
      
      if (dealId) {
        // Update existing deal
        response = await dealsService.updateDeal(dealId, dealData);
        toast.success('Deal updated successfully');
      } else {
        // Create new deal
        response = await dealsService.createDeal(dealData);
        toast.success('Deal created successfully');
      }
      
      if (onSuccess) {
        onSuccess(response);
      } else {
        router.push(`/dashboard/deals?id=${response.id}`);
      }
    } catch (err) {
      console.error('Error saving deal:', err);
      toast.error('Failed to save deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <Loader size="lg" />
        <h2 className="mt-4 text-lg font-medium">Loading deal data...</h2>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{dealId ? 'Edit Deal' : 'Create New Deal'}</h1>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className={errors.title ? "text-red-500" : ""}>
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter deal title"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className={errors.description ? "text-red-500" : ""}>
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the deal"
            className={`min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price" className={errors.price ? "text-red-500" : ""}>
            Price
          </Label>
          <Input
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price (if applicable)"
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">
            Category
          </Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Kitchen</option>
            <option value="sports">Sports & Outdoors</option>
            <option value="beauty">Beauty & Personal Care</option>
            <option value="toys">Toys & Games</option>
            <option value="books">Books & Media</option>
            <option value="services">Services</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="url" className={errors.url ? "text-red-500" : ""}>
            Deal URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com/product"
            className={errors.url ? "border-red-500" : ""}
          />
          {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tags">
            Tags
          </Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tags"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button type="button" onClick={handleAddTag}>Add</Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <div key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/20 text-primary">
                {tag}
                <button 
                  type="button" 
                  onClick={() => handleRemoveTag(tag)} 
                  className="ml-2 text-primary/70 hover:text-primary"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-200 my-6"></div>
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
          >
            {isSubmitting ? (
              <>
                <Loader size="sm" className="mr-2" />
                {dealId ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              dealId ? 'Update Deal' : 'Create Deal'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CreateEditDealForm; 
import React, { useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import BASE_URL from "../utils/Url.js";
import { Upload, Link as LinkIcon, Send, Loader2, AlertTriangle, Check, Info, Type, FileText, User as UserIcon, Tag as TagIcon, Eye, EyeOff } from 'lucide-react';
import { useSelector } from 'react-redux'

const blogPostSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  slug: z.string()
          .min(3, { message: 'Slug must be at least 3 characters' })
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase alphanumeric with hyphens' }),
  excerpt: z.string().min(10, { message: 'Excerpt must be at least 10 characters' }),
  author: z.string().min(2, { message: 'Author name must be at least 2 characters' }),
  tags: z.string().min(1, { message: 'Please enter at least one tag' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  imageFile: z.instanceof(File).optional(),
  isPublished: z.boolean().default(true),
}).refine(data => !(data.imageUrl && data.imageFile), {
  message: "Please provide either an Image URL or an Image File, not both.",
  path: ["imageUrl"],
});


const AddBlogPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    author: '',
    tags: '',
    imageUrl: '',
    isPublished: true,
  });
 
  const [imageFile, setImageFile] = useState(null);
  const [imageOption, setImageOption] = useState('url');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (name === 'title') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if ((name === 'imageUrl' || name === 'imageFile') && formErrors.imageUrl) {
         setFormErrors(prev => ({ ...prev, imageUrl: undefined }));
    }
  };

  const handleImageOptionChange = (e) => {
    setImageOption(e.target.value);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImageFile(null);
    setFormErrors(prev => ({ ...prev, imageUrl: undefined }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
     if (formErrors.imageUrl) {
         setFormErrors(prev => ({ ...prev, imageUrl: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    const dataToValidate = {
        ...formData,
        imageFile: imageOption === 'file' ? imageFile : undefined,
        imageUrl: imageOption === 'url' ? formData.imageUrl : '',
    };

    const validationResult = blogPostSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      console.log("Validation Errors:", errors);
      setFormErrors(errors);
      
      toast.error('Please fix the errors in the form.');
      setIsSubmitting(false);
      return;
    }

    
    const loadingToastId = toast.loading('Creating blog post...');
   

    try {
      const postData = new FormData();
      postData.append('title', validationResult.data.title);
      postData.append('slug', validationResult.data.slug);
      postData.append('excerpt', validationResult.data.excerpt);
      postData.append('author', validationResult.data.author);
      postData.append('isPublished', String(validationResult.data.isPublished));

      const tagsArray = validationResult.data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      tagsArray.forEach(tag => postData.append('tags', tag));

      if (imageOption === 'file' && imageFile) {
        postData.append('imageFile', imageFile);
      } else if (imageOption === 'url' && validationResult.data.imageUrl) {
        postData.append('imageUrl', validationResult.data.imageUrl);
      }

      const apiUrl = `${BASE_URL}/blogs/create`;

      const response = await axios.post(apiUrl, postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if(response.data.success){
         toast.success('Blog post created successfully!', { id: loadingToastId });
         navigate('/blogs');
      }
    } catch (error) {
      console.error('Blog post creation error:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to create blog post. Please try again.';
 
      toast.error(errorMessage, { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

 const [token,setToken]=useState(useSelector((state)=>state.auth.token));
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 ">
    
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg mt-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Add New Blog Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <div className="relative">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"> <Type size={16} /> </span>
                <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${formErrors.title ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300'}`}
                placeholder="Enter blog post title"
                />
            </div>
            {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title[0]}</p>}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
             <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"> <LinkIcon size={16} /> </span>
                <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${formErrors.slug ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300'}`}
                placeholder="auto-generated-slug"
                />
            </div>
            {formErrors.slug && <p className="mt-1 text-xs text-red-500">{formErrors.slug[0]}</p>}
             <p className="mt-1 text-xs text-gray-500">URL-friendly identifier (auto-generated from title).</p>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
             <div className="relative">
                <span className="absolute top-3 left-0 flex items-start pl-3 text-gray-400"> <FileText size={16} /> </span>
                <textarea
                id="excerpt"
                name="excerpt"
                rows="4"
                value={formData.excerpt}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${formErrors.excerpt ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300'}`}
                placeholder="Enter a short summary of the blog post..."
                />
            </div>
            {formErrors.excerpt && <p className="mt-1 text-xs text-red-500">{formErrors.excerpt[0]}</p>}
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Author</label>
             <div className="relative">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"> <UserIcon size={16} /> </span>
                <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${formErrors.author ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300'}`}
                placeholder="Enter author's name"
                />
            </div>
            {formErrors.author && <p className="mt-1 text-xs text-red-500">{formErrors.author[0]}</p>}
          </div>

           <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
             <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"> <TagIcon size={16} /> </span>
                <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${formErrors.tags ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300'}`}
                placeholder="e.g., seo, marketing, tech"
                />
            </div>
            {formErrors.tags && <p className="mt-1 text-xs text-red-500">{formErrors.tags[0]}</p>}
            <p className="mt-1 text-xs text-gray-500">Enter tags separated by commas.</p>
          </div>

          <fieldset className="space-y-4 border p-4 rounded-md">
             <legend className="text-sm font-medium text-gray-700 px-1">Featured Image</legend>
             <div className="flex items-center space-x-6">
                <div className="flex items-center">
                    <input
                        type="radio"
                        id="imageOptionUrl"
                        name="imageOption"
                        value="url"
                        checked={imageOption === 'url'}
                        onChange={handleImageOptionChange}
                        disabled={isSubmitting}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="imageOptionUrl" className="ml-2 block text-sm text-gray-900">Image URL</label>
                </div>
                 <div className="flex items-center">
                    <input
                        type="radio"
                        id="imageOptionFile"
                        name="imageOption"
                        value="file"
                        checked={imageOption === 'file'}
                        onChange={handleImageOptionChange}
                        disabled={isSubmitting}
                         className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="imageOptionFile" className="ml-2 block text-sm text-gray-900">Upload File</label>
                </div>
             </div>

             {imageOption === 'url' && (
                 <div>
                    <label htmlFor="imageUrl" className="sr-only">Image URL</label>
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"> <LinkIcon size={16} /> </span>
                        <input
                            type="url"
                            id="imageUrl"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${formErrors.imageUrl ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300'}`}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                    {formErrors.imageUrl && <p className="mt-1 text-xs text-red-500">{formErrors.imageUrl[0]}</p>}
                 </div>
             )}

             {imageOption === 'file' && (
                 <div>
                    <label htmlFor="imageFile" className="sr-only">Upload Image File</label>
                     <div className="relative flex items-center border border-gray-300 rounded-md shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-500">
                         <span className="text-gray-400 mr-2"> <Upload size={16} /> </span>
                        <input
                            type="file"
                            id="imageFile"
                            name="imageFile"
                            accept="image/png, image/jpeg, image/gif, image/webp"
                            onChange={handleImageFileChange}
                            disabled={isSubmitting}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none"
                        />
                    </div>
                     {imageFile && <p className="mt-1 text-xs text-gray-600">Selected: {imageFile.name}</p>}
                     {formErrors.imageUrl && <p className="mt-1 text-xs text-red-500">{formErrors.imageUrl[0]}</p>}
                 </div>
             )}
          </fieldset>

          <div className="flex items-center justify-between border-t pt-4">
             <span className="text-sm font-medium text-gray-700 flex items-center">
                <Info size={16} className="mr-2 text-gray-500"/> Publish Status
             </span>
              <label htmlFor="isPublished" className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                    {formData.isPublished ? <span className="flex items-center text-green-600"><Eye size={16} className="mr-1"/>Published</span> : <span className="flex items-center text-gray-500"><EyeOff size={16} className="mr-1"/>Draft</span>}
                </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-3" /> Creating Post...
                </>
              ) : (
                <>
                  <Send size={18} className="mr-2" /> Create Blog Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogPage;

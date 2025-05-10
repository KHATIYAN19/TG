import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import BASE_URL from '../utils/Url';
import { Helmet } from 'react-helmet';

const portfolioSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  category: z.string().min(1, "Category is required").trim(),
  tags: z.string()
    .min(1, "Tags input is required")
    .transform(val => val.split(',').map(tag => tag.trim()).filter(tag => tag !== ''))
    .pipe(z.string().array().min(1, "At least one tag is required")),
  imageOption: z.enum(['url', 'file'], { required_error: "Please select an image source" }),
  imageUrl: z.string().optional(),
  imageFile: z.any().optional(),
  altText: z.string().trim().optional(),
  slug: z.string()
    .min(1, "Slug generation failed (requires title)")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Generated slug is invalid (check title for special characters)"),
  isPublished: z.boolean().default(false),
}).refine(data => {
  if (data.imageOption === 'url') {
    return !!data.imageUrl && z.string().url("Must be a valid URL").safeParse(data.imageUrl).success;
  }
  return true;
}, {
  message: "A valid Image URL is required when URL option is selected",
  path: ["imageUrl"],
})
  .refine(data => {
    if (data.imageOption === 'file') {
      return data.imageFile && data.imageFile.length > 0;
    }
    return true;
  }, {
    message: "Image file is required when File option is selected",
    path: ["imageFile"],
  });

const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};


function AddPortfolio() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset, setValue } = useForm({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      tags: '',
      imageOption: 'url',
      imageUrl: '',
      altText: '',
      slug: '',
      isPublished: false,
    },
    mode: 'onChange',
  });

  const watchedImageOption = watch('imageOption');
  const watchedTitle = watch('title');

  useEffect(() => {
    const generatedSlug = generateSlug(watchedTitle || '');
    setValue('slug', generatedSlug, { shouldValidate: true, shouldDirty: true });
  }, [watchedTitle, setValue]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmit = async (data) => {
    const loadingToastId = toast.loading('Creating portfolio item...');
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'tags' && Array.isArray(value)) {
        value.forEach(tag => formData.append('tags', tag));
      } else if (key === 'imageFile') {

      } else if (key === 'imageUrl' && data.imageOption === 'file') {

      } else if (key === 'imageOption') {

      } else if (typeof value === 'boolean') {
        formData.append(key, String(value));
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    if (data.imageOption === 'file' && data.imageFile && data.imageFile.length > 0) {
      formData.append('image', data.imageFile[0]);
    } else if (data.imageOption === 'url' && data.imageUrl) {
      formData.append('imageUrl', data.imageUrl);
    }

    try {
      const response = await axios.post(`${BASE_URL}/portfolio`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Portfolio item created successfully!', { id: loadingToastId });
      reset();

    } catch (error) {
      console.error("Error submitting portfolio item:", error);
      const backendMessage = error.response?.data?.message;
      const fieldError = error.response?.data?.field;
      let errorMessage = 'Failed to create portfolio item.';

      if (backendMessage) {
        errorMessage = backendMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { id: loadingToastId });
    }
  };
  const token = useSelector((state) => state.auth.token);
  return (
    <>
      <Helmet>
        <title>Add New Portfolio Item</title>
      </Helmet>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 w-full max-w-3xl border border-blue-100">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-700 mb-8 sm:mb-10">Add New Portfolio Item</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                id="title"
                type="text"
                {...register("title")}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-offset-1 ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} transition duration-150 ease-in-out shadow-sm hover:border-gray-400`}
                placeholder="Project Awesome"
                disabled={isSubmitting}
              />
              {errors.title && <p className="text-red-600 text-xs mt-1.5">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (auto-generated)</label>
              <input
                id="slug"
                type="text"
                {...register("slug")}
                readOnly
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-offset-1 ${errors.slug ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} transition duration-150 ease-in-out bg-gray-100 cursor-not-allowed shadow-sm`}
                placeholder="project-awesome"
              />
              {errors.slug && <p className="text-red-600 text-xs mt-1.5">{errors.slug.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                rows={4}
                {...register("description")}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-offset-1 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} transition duration-150 ease-in-out shadow-sm hover:border-gray-400`}
                placeholder="Describe the project..."
                disabled={isSubmitting}
              />
              {errors.description && <p className="text-red-600 text-xs mt-1.5">{errors.description.message}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                id="category"
                type="text"
                {...register("category")}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-offset-1 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} transition duration-150 ease-in-out shadow-sm hover:border-gray-400`}
                placeholder="Web Development"
                disabled={isSubmitting}
              />
              {errors.category && <p className="text-red-600 text-xs mt-1.5">{errors.category.message}</p>}
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                id="tags"
                type="text"
                {...register("tags")}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-offset-1 ${errors.tags ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} transition duration-150 ease-in-out shadow-sm hover:border-gray-400`}
                placeholder="React, Node.js, Tailwind CSS"
                disabled={isSubmitting}
              />
              {errors.tags && <p className="text-red-600 text-xs mt-1.5">{errors.tags.message}</p>}
            </div>

            <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50/50">
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <fieldset disabled={isSubmitting}>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      value="url"
                      {...register("imageOption")}
                      className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out border-gray-300 focus:ring-blue-500"
                      onChange={(e) => setValue('imageOption', e.target.value, { shouldValidate: true })}
                    />
                    <span className="ml-2 text-sm text-gray-600 group-hover:text-blue-700">Use URL</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      value="file"
                      {...register("imageOption")}
                      className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out border-gray-300 focus:ring-blue-500"
                      onChange={(e) => setValue('imageOption', e.target.value, { shouldValidate: true })}
                    />
                    <span className="ml-2 text-sm text-gray-600 group-hover:text-blue-700">Upload File</span>
                  </label>
                </div>
              </fieldset>
              {errors.imageOption && <p className="text-red-600 text-xs">{errors.imageOption.message}</p>}

              {watchedImageOption === 'url' && (
                <div className="pt-2">
                  <label htmlFor="imageUrl" className="sr-only">Image URL</label>
                  <input
                    id="imageUrl"
                    type="url"
                    {...register("imageUrl")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-offset-1 ${errors.imageUrl ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} transition duration-150 ease-in-out shadow-sm hover:border-gray-400`}
                    placeholder="https://example.com/image.jpg"
                    disabled={isSubmitting}
                  />
                  {errors.imageUrl && <p className="text-red-600 text-xs mt-1.5">{errors.imageUrl.message}</p>}
                </div>
              )}

              {watchedImageOption === 'file' && (
                <div className="pt-2">
                  <label htmlFor="imageFile" className="sr-only">Upload Image</label>
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    {...register("imageFile")}
                    className={`w-full text-sm text-gray-500 border rounded-lg file:transition-colors file:duration-150
                         file:mr-4 file:py-2.5 file:px-5 file:border-0 file:rounded-l-lg
                         file:text-sm file:font-semibold file:cursor-pointer
                         file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                         focus:outline-none focus:ring-2 focus:ring-offset-1 ${errors.imageFile ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} transition duration-150 ease-in-out shadow-sm`}
                    disabled={isSubmitting}
                  />
                  {errors.imageFile && <p className="text-red-600 text-xs mt-1.5">{errors.imageFile.message}</p>}
                </div>
              )}

              <div className="pt-2">
                <label htmlFor="altText" className="sr-only">Image Alt Text</label>
                <input
                  id="altText"
                  type="text"
                  {...register("altText")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-offset-1 ${errors.altText ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} transition duration-150 ease-in-out shadow-sm hover:border-gray-400`}
                  placeholder="Image alt text (optional, for accessibility)"
                  disabled={isSubmitting}
                />
                {errors.altText && <p className="text-red-600 text-xs mt-1.5">{errors.altText.message}</p>}
              </div>
            </div>


            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
              <span className="text-sm font-medium text-blue-800">Publish Status</span>
              <label htmlFor="isPublished" className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="isPublished"
                  {...register("isPublished")}
                  className="sr-only peer"
                  disabled={isSubmitting}
                />
                <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 ${isSubmitting ? 'bg-gray-200' : 'bg-gray-300 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600'}`}></div>
                <span className="ml-3 text-sm font-medium text-blue-900">
                  {watch('isPublished') ? 'Published' : 'Draft'}
                </span>
              </label>
            </div>
            {errors.isPublished && <p className="text-red-600 text-xs mt-1.5">{errors.isPublished.message}</p>}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'}`}
              >
                {isSubmitting ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Add Portfolio Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddPortfolio;

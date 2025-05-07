import React, { useState } from 'react';
import { z } from 'zod';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Link, Mail, Loader2, AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react';
import BASE_URL from '../utils/Url';
import { useSelector } from 'react-redux';
const emailSchema = z.string().email({ message: 'Please enter a valid email address.' });
const GenerateReviewLinkPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false); 
    const[token,setToken]=useState(useSelector((state)=>state.auth.token));
    const handleGenerateLink = async (e) => {
        e.preventDefault();
        setError('');
        setGeneratedLink('');
        setCopied(false); 
        setIsLoading(true);
        const toastId = toast.loading('Generating link...');

        const validationResult = emailSchema.safeParse(email);
        if (!validationResult.success) {
            const errorMessage = validationResult.error.errors[0]?.message || 'Invalid email.';
            setError(errorMessage);
            toast.error(errorMessage, { id: toastId });
            setIsLoading(false);
            return;
        }

        try {
          
            const response = await axios.post(
                `${BASE_URL}/admin/reviews/generate-link`,
                {
                  email: validationResult.data,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
            setGeneratedLink(response.data.link);
            toast.success(response.data.message || 'Link generated and sent!', { id: toastId });
            setEmail(''); 

        } catch (err) {
            console.error("Error generating link:", err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to generate link.';
            setError(errorMsg);
            toast.error(errorMsg, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

   
    const handleCopyLink = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink)
            .then(() => {
                setCopied(true);
                toast.success('Link copied to clipboard!');
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy link: ', err);
                toast.error('Failed to copy link.');
            });
    };


    return (
        <div className="pt-20 pb-16 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center px-4">
            <Toaster position="top-center" />
            <div className="w-full max-w-xl bg-white p-8 rounded-xl shadow-2xl border border-gray-200"> {/* Increased max-w slightly */}
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Generate Review Request Link</h1>
                <p className="text-center text-sm text-gray-500 mb-6">Enter the client's email address below. A unique link will be generated and sent (simulated) to them, allowing them to submit one review.</p>
                <form onSubmit={handleGenerateLink} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Client Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                                <Mail size={18} />
                            </span>
                            <input
                                type="text"
                                id="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError(''); 
                                }}
                                disabled={isLoading}
                                className={`w-full block pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${error ? 'border-red-500 focus:ring-red-300 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} transition duration-150 ease-in-out`}
                                placeholder="client@example.com"
                                
                            />
                        </div>
                        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                    </div>

                    <div className="pt-1">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                        >
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Link size={18} className="mr-2" />}
                            {isLoading ? 'Generating...' : 'Generate & Send Link'}
                        </button>
                    </div>
                </form>

                {generatedLink && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg text-sm shadow-sm">
                        <p className="font-medium text-green-800 mb-2">Generated Link (also sent to client):</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={generatedLink}
                                className="flex-grow p-2 bg-white border border-gray-300 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                onFocus={(e) => e.target.select()} // Select on focus for easy copy
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`btn btn-sm ${copied ? 'btn-success' : 'btn-ghost'} btn-square`}
                                title="Copy link"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateReviewLinkPage;

import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
 import { useSelector } from 'react-redux';
import { Eye, EyeOff, X, Check, Lock, User as UserIcon, Mail, Phone, Briefcase } from 'lucide-react';
import Base_url from "../utils/Url"; 


function UserProfile() {
  const token = useSelector((state) => state.auth.token); // Uncomment this line in your actual project
  const userData = useSelector((state) => state.auth.user); // Uncomment this line in your actual project



  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // In a real application, if Redux 'user' state is available, use it.
    // Otherwise, the initial dummy data will be used.
    // if (user) {
    //   setUserData(user);
    // }
    // For demonstration, simulating a fetch or direct Redux user assignment
    // Remove this timeout and uncomment Redux lines in a real app
    const fetchDummyUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      // If you were to fetch from an API:
      /*
      try {
        const response = await fetch(`${Base_url}/admin/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setUserData(data.user);
        } else {
          toast.error(data.message || 'Failed to fetch user profile');
        }
      } catch (err) {
        toast.error(`Error fetching profile: ${err.message}`);
      }
      */
    };
    fetchDummyUser();
  }, []); // Depend on 'user' from Redux if uncommented, otherwise empty array for initial load

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return '';
  };

  const handleChangePassword = async () => {
    toast.dismiss();
    const currentPasswordError = validatePassword(currentPassword);
    const newPasswordError = validatePassword(newPassword);

    if (currentPasswordError) {
      toast.error(`Current password: ${currentPasswordError}`);
      return;
    }
    if (newPasswordError) {
      toast.error(`New password: ${newPasswordError}`);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New password and confirm new password do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      toast.error('New password cannot be the same as the current password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${Base_url}/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowChangePasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (err) {
      toast.error(`Error changing password: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 font-sans flex flex-col items-center justify-center">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 w-full max-w-md transform transition-all duration-300 hover:scale-[1.01]">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-full shadow-lg mb-4">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">{userData.name}</h1>
          <p className="text-gray-600 text-lg text-center">{userData.role}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center text-gray-700">
            <Mail className="w-5 h-5 mr-3 text-indigo-500" />
            <span className="font-medium">Email:</span>
            <span className="ml-2 text-gray-800 break-all">{userData.email}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Phone className="w-5 h-5 mr-3 text-indigo-500" />
            <span className="font-medium">Mobile:</span>
            <span className="ml-2 text-gray-800">{userData.mobile}</span>
          </div>
        </div>

        <button
          onClick={() => setShowChangePasswordModal(true)}
          className="w-full text-indigo-600 text-lg font-semibold underline hover:text-indigo-800 transition-colors duration-200 block text-center mt-6"
        >
          Change Password
        </button>
      </div>

      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative transform transition-all duration-300 scale-95 animate-scale-in">
            <button
              onClick={() => setShowChangePasswordModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Change Your Password</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="current-password">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="new-password">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="confirm-new-password">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    id="confirm-new-password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-8">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors duration-200 flex items-center font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5 mr-2" /> Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Lock className="w-5 h-5 mr-2" />
                )}
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;

import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { User, Trash2, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';
import Base_url from "../utils/Url";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState(null);
  const [processingUserId, setProcessingUserId] = useState(null);
  const [processingModalConfirm, setProcessingModalConfirm] = useState(false);

  const token = useSelector((state) => state.auth.token);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${Base_url}/admin/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Failed to fetch users');
        toast.error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Error fetching users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId, currentBlockStatus) => {
    setProcessingUserId(userId);
    try {
      const response = await fetch(`${Base_url}/admin/${userId}/toggle-block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.dismiss();
        toast.success(data.message);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, block: !currentBlockStatus } : user
          )
        );
      } else {
        toast.dismiss();
        toast.error(data.message || 'Failed to toggle block status');
      }
    } catch (err) {
      toast.dismiss();
      toast.error(`Error toggling block status: ${err.message}`);
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setProcessingModalConfirm(true);
    setProcessingUserId(userToDelete._id);
    try {
      const response = await fetch(`${Base_url}/admin/${userToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.dismiss();
        toast.success(data.message);
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userToDelete._id));
      } else {
        toast.dismiss();
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (err) {
      toast.dismiss();
      toast.error(`Error deleting user: ${err.message}`);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
      setProcessingModalConfirm(false);
      setProcessingUserId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleResetPasswordClick = (user) => {
    setUserToResetPassword(user);
    setShowResetPasswordModal(true);
  };

  const handleConfirmResetPassword = async () => {
    if (!userToResetPassword) return;

    setProcessingModalConfirm(true);
    setProcessingUserId(userToResetPassword._id);
    try {
      const response = await fetch(`${Base_url}/admin/reset-password/${userToResetPassword._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.message) {
        toast.dismiss();
        toast.success(data.message);
      } else {
        toast.dismiss();
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (err) {
      toast.dismiss();
      toast.error(`Error resetting password: ${err.message}`);
    } finally {
      setShowResetPasswordModal(false);
      setUserToResetPassword(null);
      setProcessingModalConfirm(false);
      setProcessingUserId(null);
    }
  };

  const handleCancelResetPassword = () => {
    setShowResetPasswordModal(false);
    setUserToResetPassword(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 font-sans flex flex-col items-center mt-20">
      <Toaster position="top-center" reverseOrder={false} />

      <h1 className="text-4xl font-extrabold text-blue-800 mb-8 mt-4">User Management</h1>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-blue-600 text-lg">Loading users...</span>
        </div>
      )}

      {error && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg relative mb-4 w-full max-w-4xl" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="text-gray-600 text-lg py-10">No users found.</div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="w-full max-w-6xl overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  <User className="inline-block w-4 h-4 mr-2" /> Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Mobile
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-0">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.mobile}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleBlock(user._id, user.block)}
                        disabled={processingUserId === user._id}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                          user.block
                            ? 'bg-blue-700 text-white hover:bg-blue-800'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        } ${processingUserId === user._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label={user.block ? 'Unblock user' : 'Block user'}
                      >
                        {processingUserId === user._id ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : user.block ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        disabled={processingUserId === user._id}
                        className={`p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200 ${
                          processingUserId === user._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        aria-label="Delete user"
                      >
                        {processingUserId === user._id ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleResetPasswordClick(user)}
                        disabled={processingUserId === user._id}
                        className={`px-4 py-2 text-blue-700 hover:text-blue-900 transition-colors duration-200 text-sm ${
                          processingUserId === user._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        aria-label="Reset password"
                      >
                        {processingUserId === user._id ? (
                          <svg className="animate-spin h-5 w-5 text-blue-700 inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : null}
                        <span className={processingUserId === user._id ? '' : 'underline'}>Reset Password</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete user{' '}
              <span className="font-semibold text-blue-700">{userToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelDelete}
                disabled={processingModalConfirm}
                className={`px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center ${processingModalConfirm ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={processingModalConfirm}
                className={`px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center ${processingModalConfirm ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {processingModalConfirm ? (
                  <svg className="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : <Check className="w-4 h-4 mr-2" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetPasswordModal && userToResetPassword && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Password Reset</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset the password for user{' '}
              <span className="font-semibold text-blue-700">{userToResetPassword.name}</span>?
              A new temporary password will be generated and sent to their email.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelResetPassword}
                disabled={processingModalConfirm}
                className={`px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center ${processingModalConfirm ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </button>
              <button
                onClick={handleConfirmResetPassword}
                disabled={processingModalConfirm}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center ${processingModalConfirm ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {processingModalConfirm ? (
                  <svg className="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : <Check className="w-4 h-4 mr-2" />} Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;

import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Shield,
} from 'lucide-react';
import Base_url from "../utils/Url";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState(null);

  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${Base_url}/admin/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId, block) => {
    try {
      const res = await fetch(`${Base_url}/admin/${userId}/toggle-block`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, block: !block } : u
          )
        );
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`${Base_url}/admin/${userToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setUsers(users.filter((u) => u._id !== userToDelete._id));
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleConfirmResetPassword = async () => {
    try {
      const res = await fetch(
        `${Base_url}/admin/reset-password/${userToResetPassword._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShowResetPasswordModal(false);
    }
  };

  // Capitalize role
  const formatRole = (role) =>
    role ? role.charAt(0).toUpperCase() + role.slice(1) : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <Toaster />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="text-indigo-600" />
          Employee List
        </h1>
        <p className="text-gray-500 text-sm mt-1 mt-10">
          Manage all employees in your system
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center mt-20">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-red-500 text-center">{error}</div>
      )}

      {/* Table */}
      {!loading && users.length > 0 && (
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-indigo-50 text-gray-700">
              <tr>
                <th className="px-6 py-4 text-left">Employee</th>
                <th className="px-6 py-4 text-center">Employee ID</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-center">Mobile</th>
                <th className="px-6 py-4 text-center">Role</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  onClick={() => navigate(`/employee/${user.email}`)}
                  className="border-t hover:bg-indigo-50 cursor-pointer transition"
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </td>

                  <td className="px-6 py-4 text-center font-mono text-gray-600">
                    {user.employeeId || "—"}
                  </td>

                  <td className="px-6 py-4 text-left">
                    {user.email}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {user.mobile}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                      {formatRole(user.role)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    className="px-6 py-4 flex justify-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        handleToggleBlock(user._id, user.block)
                      }
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                      {user.block ? (
                        <ToggleRight className="text-red-500" />
                      ) : (
                        <ToggleLeft className="text-green-500" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setUserToDelete(user);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setUserToResetPassword(user);
                        setShowResetPasswordModal(true);
                      }}
                      className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-xs"
                    >
                      Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty */}
      {!loading && users.length === 0 && (
        <div className="text-center text-gray-500 mt-20">
          No users found 🚫
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96 text-center">
            <h2 className="text-lg font-semibold mb-4">
              Delete User?
            </h2>
            <p className="text-gray-600 mb-6">
              {userToDelete?.name}
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96 text-center">
            <h2 className="text-lg font-semibold mb-4">
              Reset Password?
            </h2>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmResetPassword}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
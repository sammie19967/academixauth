"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { 
  FiUsers, FiAlertCircle, FiUser, FiSettings, 
  FiLogOut, FiEye, FiEdit2, FiTrash2, 
  FiLoader, FiX, FiCheck, FiPlus 
} from "react-icons/fi";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userActionError, setUserActionError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const router = useRouter();

  // Fetch all users
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUserActionError("");
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/users/all", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUserActionError("Failed to fetch users.");
      }
    } catch (err) {
      setUserActionError("Error fetching users.");
    } finally {
      setUsersLoading(false);
    }
  };

  // Handlers
  const handleView = user => {
    setSelectedUser(user);
    setShowViewModal(true);
    setModalError("");
    setModalSuccess("");
  };

  const handleEdit = user => {
    setSelectedUser(user);
    setShowEditModal(true);
    setModalError("");
    setModalSuccess("");
  };

  const handleDelete = async user => {
    if (!window.confirm(`Delete user ${user.email}?`)) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/users?uid=${user.uid}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.uid !== user.uid));
      } else {
        setUserActionError("Failed to delete user.");
      }
    } catch (err) {
      setUserActionError("Error deleting user.");
    }
  };

  const handleLogout = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        await fetch('/api/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            uid: user.uid, 
            status: 'inactive' 
          })
        });
      } catch (error) {
        console.error('Error updating user status on logout:', error);
        // Continue with logout even if status update fails
      }
    }
    await auth.signOut();
    router.push("/auth/admin/login");
  };

  // Check admin status on mount
  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/auth/admin/login");
        return;
      }
      try {
        const tokenResult = await user.getIdTokenResult(true);
        if (tokenResult.claims.role === "admin") {
          setIsAdmin(true);
          setProfileLoading(true);
          const res = await fetch(`/api/users?uid=${user.uid}`);
          const data = await res.json();
          if (data.user) {
            setAdminName(data.user.displayName || `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim());
          }
          fetchUsers();
        } else {
          router.replace("/auth/admin/login");
        }
      } catch (err) {
        router.replace("/auth/admin/login");
      } finally {
        setLoading(false);
        setProfileLoading(false);
      }
    };
    checkAdmin();
  }, [router]);

  // Modal handlers
  const handleCreateUser = async (form) => {
    setModalLoading(true); 
    setModalError(""); 
    setModalSuccess("");
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setModalSuccess('User created successfully!');
        fetchUsers();
        setTimeout(() => { setShowCreateModal(false); setModalSuccess(""); }, 1000);
      } else {
        const data = await res.json(); 
        setModalError(data.error || 'Failed to create user.');
      }
    } catch {
      setModalError('Error creating user.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditUser = async (form) => {
    setModalLoading(true); 
    setModalError(""); 
    setModalSuccess("");
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setModalSuccess('User updated successfully!');
        fetchUsers();
        setTimeout(() => { setShowEditModal(false); setModalSuccess(""); }, 1000);
      } else {
        const data = await res.json(); 
        setModalError(data.error || 'Failed to update user.');
      }
    } catch {
      setModalError('Error updating user.');
    } finally {
      setModalLoading(false);
    }
  };

  // User Modal Component
  const UserModal = ({ mode, user, onClose, onSubmit, loading, error, success }) => {
    const [form, setForm] = useState(user || { 
      uid: '', 
      email: '', 
      firstName: '', 
      lastName: '', 
      role: 'user', 
      status: 'active' 
    });

    useEffect(() => { 
      setForm(user || { 
        uid: '', 
        email: '', 
        firstName: '', 
        lastName: '', 
        role: 'user', 
        status: 'active' 
      }); 
    }, [user]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
    const isView = mode === 'view';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
          {/* Modal Header */}
          <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              {mode === 'create' ? 'Create New User' : mode === 'edit' ? 'Edit User' : 'User Details'}
            </h3>
            <button 
              onClick={onClose}
              className="text-white hover:text-indigo-200 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          
          {/* Modal Body */}
          <div className="p-6">
            <form onSubmit={e => { e.preventDefault(); if (!isView) onSubmit(form); }}>
              <div className="space-y-4">
                {/* UID Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <input
                    name="uid"
                    value={form.uid}
                    onChange={handleChange}
                    disabled={isView || mode==='edit'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-gray-900"
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isView}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-gray-900"
                    required
                  />
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      disabled={isView}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      disabled={isView}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-gray-900"
                    />
                  </div>
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={isView}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-gray-900"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Status Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    disabled={isView}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-gray-900"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start">
                  <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-start">
                  <FiCheck className="flex-shrink-0 mt-0.5 mr-2" />
                  <span>{success}</span>
                </div>
              )}

              {/* Submit Button */}
              {!isView && (
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white ${
                      loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
                  >
                    {loading ? (
                      <>
                        <FiLoader className="animate-spin mr-2 h-4 w-4" />
                        {mode === 'create' ? 'Creating...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        {mode === 'create' ? (
                          <>
                            <FiPlus className="mr-2 h-4 w-4" />
                            Create User
                          </>
                        ) : 'Save Changes'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-indigo-600 text-4xl mb-4" />
          <div className="text-lg text-gray-600 font-medium">Verifying admin access...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            {adminName && (
              <p className="text-lg text-gray-600 mt-1">
                Welcome back, <span className="font-semibold text-indigo-600">{adminName}</span>
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <FiUsers className="text-xl" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <FiUser className="text-xl" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.status === 'active').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                <FiSettings className="text-xl" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Admin Users</h3>
                <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FiUsers className="mr-2 text-indigo-600" />
              User Management
            </h2>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Add New User
            </button>
          </div>
          
          {userActionError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center">
              <FiAlertCircle className="mr-2" />
              {userActionError}
            </div>
          )}

          <div className="overflow-x-auto">
            {usersLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                <FiLoader className="animate-spin text-3xl mb-4 text-indigo-600" />
                <p>Loading user data...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        <FiUsers className="mx-auto text-3xl mb-2" />
                        No users found in the system
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                              {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "No name"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.university || "No university"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.status || 'inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleView(user)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                              title="View"
                            >
                              <FiEye />
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-amber-600 hover:text-amber-900 p-2 rounded-full hover:bg-amber-50 transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          {users.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">{users.length}</span> users
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <UserModal
          mode="create"
          user={null}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
          loading={modalLoading}
          error={modalError}
          success={modalSuccess}
        />
      )}

      {showEditModal && (
        <UserModal
          mode="edit"
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditUser}
          loading={modalLoading}
          error={modalError}
          success={modalSuccess}
        />
      )}

      {showViewModal && (
        <UserModal
          mode="view"
          user={selectedUser}
          onClose={() => setShowViewModal(false)}
          onSubmit={() => {}}
          loading={false}
          error=""
          success=""
        />
      )}
    </div>
  );
}
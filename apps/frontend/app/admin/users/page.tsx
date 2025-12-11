'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ORG_ADMIN' | 'SUPER_ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  _count?: {
    enrollments: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/users/admin/all');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiClient.put(`/api/v1/users/admin/${userId}/role`, { role: newRole });
      setUsers(
        users.map((user) => (user.id === userId ? { ...user, role: newRole as any } : user)),
      );
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/api/v1/users/admin/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'students' && user.role === 'STUDENT') ||
      (filter === 'instructors' && user.role === 'INSTRUCTOR') ||
      (filter === 'admins' && (user.role === 'ORG_ADMIN' || user.role === 'SUPER_ADMIN'));

    const matchesSearch =
      searchTerm === '' ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'text-red-400 bg-red-950/50 border-red-900';
      case 'ORG_ADMIN':
        return 'text-orange-400 bg-orange-950/50 border-orange-900';
      case 'INSTRUCTOR':
        return 'text-blue-400 bg-blue-950/50 border-blue-900';
      case 'STUDENT':
        return 'text-emerald-400 bg-emerald-950/50 border-emerald-900';
      default:
        return 'text-zinc-400 bg-zinc-950/50 border-zinc-900';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-zinc-300">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">User Management</h1>
          <p className="mt-2 text-neutral-400">Manage user accounts, roles, and permissions</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-3 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
              }`}
            >
              👥 All ({users.length})
            </button>
            <button
              onClick={() => setFilter('students')}
              className={`px-4 py-3 rounded-lg font-medium transition ${
                filter === 'students'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
              }`}
            >
              🎓 Students ({users.filter((u) => u.role === 'STUDENT').length})
            </button>
            <button
              onClick={() => setFilter('instructors')}
              className={`px-4 py-3 rounded-lg font-medium transition ${
                filter === 'instructors'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
              }`}
            >
              👨‍🏫 Instructors ({users.filter((u) => u.role === 'INSTRUCTOR').length})
            </button>
            <button
              onClick={() => setFilter('admins')}
              className={`px-4 py-3 rounded-lg font-medium transition ${
                filter === 'admins'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
              }`}
            >
              👑 Admins (
              {users.filter((u) => u.role === 'ORG_ADMIN' || u.role === 'SUPER_ADMIN').length})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50 border-b border-zinc-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Enrollments
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-zinc-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`px-3 py-1 rounded text-xs font-medium border ${getRoleColor(user.role)} focus:ring-2 focus:ring-red-500`}
                      >
                        <option value="STUDENT">🎓 Student</option>
                        <option value="INSTRUCTOR">👨‍🏫 Instructor</option>
                        <option value="ORG_ADMIN">👑 Org Admin</option>
                        <option value="SUPER_ADMIN">🔧 Super Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${user.isEmailVerified ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                        ></div>
                        <span className="text-sm text-zinc-300">
                          {user.isEmailVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-300">{user._count?.enrollments || 0}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1 border border-red-600 text-red-400 rounded text-sm hover:bg-red-950/20 transition"
                          disabled={user.role === 'SUPER_ADMIN'}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
          <p className="text-neutral-400 mb-6">
            {searchTerm ? `No users matching "${searchTerm}"` : `No ${filter} users found`}
          </p>
        </div>
      )}
    </div>
  );
}

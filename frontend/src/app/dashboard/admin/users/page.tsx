"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { fetchList, fetchPaginated } from '@/lib/apiUtils';
import { usersAPI } from "@/lib/api";
import { UserCheck, ShieldCheck, Mail, ShieldAlert, UserX, UserMinus, Plus } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export default function AdminUsers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(s => s.addToast);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchUsers = async () => {
    console.log('Fetching users – API call start');
    setLoading(true);
    try {
      console.log('Invoking usersAPI.list() with pagination');
      const resp = await fetchPaginated(
        usersAPI.list({ page: currentPage, page_size: rowsPerPage }),
        'Users',
        addToast
      );
      if (resp) {
        const { results, count } = resp as any;
        console.log('API paginated response', resp);
        setData(results || []);
        setTotalCount(count || 0);
      }
    } catch {
      addToast('Unable to update the user list. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // Log state changes for debugging
  console.log('Data state changed, length:', data.length);
  // You can also inspect a sample record
  if (data.length) console.log('First record:', data[0]);
    fetchUsers();
  }, []);

  // ---------- CRUD helper functions ----------
  const handleApprove = async (id: number) => {
    try {
      await usersAPI.approve(id);
      addToast('User authorization successful.');
      fetchUsers();
    } catch {
      addToast('Authorization failed.', 'error');
    }
  };

  // Modal state for creating a user
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', phone: '' });
  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewUser, setViewUser] = useState<any>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // records per page
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter, dateFilter]);
  
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, roleFilter, statusFilter, dateFilter]);

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => { setShowCreateModal(false); setNewUser({ username: '', email: '', password: '', phone: '' }); };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, email, password, phone } = newUser;
    if (!username || !email || !password) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    try {
      await usersAPI.create({ username, email, password, phone });
      addToast('User created');
      fetchUsers();
      closeCreateModal();
    } catch {
      addToast('Could not create the user. Please check the information.', 'error');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await usersAPI.toggleStatus(id);
      addToast('User status updated.');
      fetchUsers();
    } catch {
      addToast('Status update failed.', 'error');
    }
  };

  const handleEdit = async (row: any) => {
    const newUsername = window.prompt('Edit username', row.username);
    const newEmail = window.prompt('Edit email', row.email);
    const newPhone = window.prompt('Edit phone', row.phone);
    if (newUsername && newEmail) {
      try {
        await usersAPI.update(row.id, { username: newUsername, email: newEmail, phone: newPhone });
        addToast('User updated successfully');
        fetchUsers();
      } catch {
        addToast('Could not update the user. Please try again.', 'error');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersAPI.delete(id);
      addToast('User deleted');
      fetchUsers();
    } catch {
      addToast('Could not delete the user. Please try again.', 'error');
    }
  };

  const handleView = (row: any) => {
    setViewUser(row);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewUser(null);
  };

  const handleResetPassword = async (id: number) => {
    const newPwd = window.prompt('Enter new password for the user');
    if (!newPwd) return;
    try {
      await usersAPI.resetPassword(id, { password: newPwd });
      addToast('Password reset successfully');
      fetchUsers();
    } catch {
      addToast('Could not reset the password. Please try again.', 'error');
    }
  };

  const handleChangeRole = async (row: any) => {
    const newRole = window.prompt('Enter new role (admin/teacher)', row.role);
    if (!newRole) return;
    try {
      await usersAPI.changeRole(row.id, { role: newRole });
      addToast('Role updated');
      fetchUsers();
    } catch {
      addToast('Could not change the role. Please try again.', 'error');
    }
  };

  const paginatedData = data;

return (
  <DashboardLayout>
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">Admin Users</h1>
      {/* Search Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by name, username, email, phone, or role"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border rounded px-3 py-1 focus:outline-none"
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border rounded px-2 py-1"
            title="Registration date (on or after)"
          />
          <button onClick={openCreateModal} className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition">
            <Plus className="w-4 h-4" /> Add User
          </button>
          {/* Records per page selector */}
          <select
            value={rowsPerPage}
            onChange={e => setRowsPerPage(Number(e.target.value))}
            className="border rounded px-2 py-1 ml-2"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
          {/* Total records */}
          <span className="ml-4 text-sm">Total: {totalCount}</span>
        </div>
    </div>

    <DataTable
      columns={[
        {
          key: "avatar",
          header: "Avatar",
          render: (_, row) => (
            row.avatar ? (
              <img src={row.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#001f3f] text-[#d4af37] flex items-center justify-center text-xs font-black">
                {row.username?.[0]?.toUpperCase() ?? "?"}
              </div>
            )
          ),
        },
        { key: "username", header: "Username", render: v => v },
        { key: "full_name", header: "Full Name", render: v => v },
        { key: "email", header: "Email Address", render: v => v },
        { key: "phone", header: "Phone Number", render: v => v },
        {
          key: "role",
          header: "System Role",
          render: r => (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              r === "admin"
                ? "bg-[#001f3f] text-[#d4af37] shadow-lg shadow-[#001f3f]/10"
                : r === "teacher"
                ? "bg-indigo-100 text-indigo-600"
                : "bg-slate-100 text-slate-500"
            }`}>
              {r}
            </span>
          ),
        },
        {
          key: "is_active",
          header: "Status",
          render: (a, row) => (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${a ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${a ? "text-emerald-600" : "text-red-600"}`}>
                {a ? "Active" : "Disabled"}
              </span>
            </div>
          ),
        },
        {
          key: "created_at",
          header: "Created Date",
          render: v => new Date(v).toLocaleDateString(),
        },
        {
          key: "actions",
          header: "Control",
          render: (_, row) => (
            <div className="flex items-center gap-2">
              {!row.is_verified && (
                <button onClick={() => handleApprove(row.id)} className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95">
                  <UserCheck className="w-3.5 h-3.5" /> Verify
                </button>
              )}
              <button onClick={() => handleToggleStatus(row.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${row.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                >
                {row.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                {row.is_active ? "Disable" : "Enable"}
              </button>
              <button onClick={() => handleView(row)} className="flex items-center gap-2 bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-all active:scale-95">
                View
              </button>
              <button onClick={() => handleResetPassword(row.id)} className="flex items-center gap-2 bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 transition-all active:scale-95">
                Reset PW
              </button>
              <button onClick={() => handleChangeRole(row)} className="flex items-center gap-2 bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600 transition-all active:scale-95">
                Change Role
              </button>
              <button onClick={() => handleEdit(row)} className="flex items-center gap-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-all active:scale-95">
                Edit
              </button>
              <button onClick={() => handleDelete(row.id)} className="flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-all active:scale-95">
                Delete
              </button>
            </div>
          ),
        },
      ]}
      data={paginatedData}
      isLoading={loading}
    />

    {/* Pagination Controls */}
    <div className="flex justify-center items-center gap-4 mt-4">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm font-medium">
        Page {currentPage} of {Math.ceil(totalCount / rowsPerPage) || 1}
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalCount / rowsPerPage)))}
        disabled={currentPage >= Math.ceil(totalCount / rowsPerPage)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>

    {/* Create User Modal */}
    {showCreateModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <h2 className="text-xl font-bold mb-4">Create New User</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <input type="text" placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="w-full border rounded px-3 py-2" required />
            <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full border rounded px-3 py-2" required />
            <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full border rounded px-3 py-2" required />
            <input type="text" placeholder="Phone (optional)" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} className="w-full border rounded px-3 py-2" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeCreateModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600">Create</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* View User Modal */}
    {showViewModal && viewUser && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <h2 className="text-xl font-bold mb-4">User Details</h2>
          <div className="space-y-2">
            <p><strong>Username:</strong> {viewUser.username}</p>
            <p><strong>Full Name:</strong> {viewUser.full_name}</p>
            <p><strong>Email:</strong> {viewUser.email}</p>
            <p><strong>Phone:</strong> {viewUser.phone}</p>
            <p><strong>Role:</strong> {viewUser.role}</p>
            <p><strong>Status:</strong> {viewUser.is_active ? 'Active' : 'Inactive'}</p>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={closeViewModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
          </div>
        </div>
      </div>
    )}
  </DashboardLayout>
);
}

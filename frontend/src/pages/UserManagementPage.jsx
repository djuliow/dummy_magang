import React, { useState, useEffect } from 'react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', role: 'pekerja' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing 
      ? `http://localhost:3000/api/admin/users/${editId}` 
      : 'http://localhost:3000/api/admin/users';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ email: '', password: '', full_name: '', role: 'pekerja' });
        setIsEditing(false);
        fetchUsers();
      }
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`http://localhost:3000/api/admin/users/${id}`, { method: 'DELETE' });
        if (res.ok) fetchUsers();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const openEdit = (user) => {
    setFormData({ email: user.email || '', password: '', full_name: user.full_name, role: user.role });
    setIsEditing(true);
    setEditId(user.id);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1c1c]">User Management</h1>
          <p className="text-[#40493d]">Manage employees and system access roles.</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setFormData({ email: '', password: '', full_name: '', role: 'pekerja' }); setShowModal(true); }}
          className="bg-[#0d631b] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#2e7d32] transition-all shadow-md"
        >
          <span className="material-symbols-outlined">person_add</span>
          Add New User
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-[#0d631b]/20 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-[#f3f3f3] border-b border-[#bfcaba]/30">
            <tr>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#40493d]">Full Name</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#40493d]">Role</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#40493d]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#bfcaba]/20">
            {loading ? (
              <tr><td colSpan="3" className="p-10 text-center text-[#40493d]">Loading users...</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-white/50 transition-colors">
                <td className="p-4 text-[#1a1c1c] font-medium">{user.full_name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'manajer' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 flex gap-3">
                  <button onClick={() => openEdit(user)} className="p-2 text-[#0d631b] hover:bg-[#0d631b]/10 rounded-lg"><span className="material-symbols-outlined">edit</span></button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined">delete</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-[#1a1c1c] mb-6">{isEditing ? 'Edit User' : 'Create New User'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#40493d] mb-1">Full Name</label>
                <input required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full p-3 rounded-lg border border-[#bfcaba] focus:border-[#0d631b] outline-none" placeholder="John Doe" />
              </div>
              {!isEditing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#40493d] mb-1">Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 rounded-lg border border-[#bfcaba] focus:border-[#0d631b] outline-none" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#40493d] mb-1">Password</label>
                    <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 rounded-lg border border-[#bfcaba] focus:border-[#0d631b] outline-none" placeholder="••••••••" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-[#40493d] mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-3 rounded-lg border border-[#bfcaba] focus:border-[#0d631b] outline-none appearance-none">
                  <option value="admin">Admin</option>
                  <option value="manajer">Manajer</option>
                  <option value="mandor">Mandor</option>
                  <option value="pekerja">Pekerja</option>
                </select>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-lg border border-[#bfcaba] text-[#40493d] font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-lg bg-[#0d631b] text-white font-semibold hover:bg-[#2e7d32]">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;

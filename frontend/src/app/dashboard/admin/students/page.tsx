"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState, useRef } from "react";
import { studentsAPI, classesAPI, usersAPI } from "@/lib/api";
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  Edit, 
  Filter,
  Download,
  Mail,
  Phone,
  X,
  Zap,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  KeyRound,
  ArrowUpCircle,
  FolderOpen,
  Calendar,
  CreditCard,
  FileText,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminStudents() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Filter, Sorting, Pagination States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Selection state for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals and Forms
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [viewingStudent, setViewingStudent] = useState<any | null>(null);
  
  // Auxiliary modals
  const [activeAuxModal, setActiveAuxModal] = useState<
    null | "reset-password" | "promote" | "transfer" | "attendance" | "results" | "fees"
  >(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  // Custom inputs for auxiliary modals
  const [newPassword, setNewPassword] = useState("");
  const [targetClassroom, setTargetClassroom] = useState("");

  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    first_name: "", 
    last_name: "", 
    phone: "", 
    password: "Student@12345", 
    classroom: "",
    admission_number: "",
    roll_number: ""
  });
  
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync / fetch data from backend with pagination, search, filters & sort
  const fetchData = async () => {
    setLoading(true);
    try {
      // Build query params
      const params: any = {
        search: debouncedSearch,
        ordering: sortOrder === "asc" ? sortBy : `-${sortBy}`
      };
      if (classFilter) params.classroom = classFilter;
      if (statusFilter) params.status = statusFilter;

      const [sRes, cRes] = await Promise.all([
        studentsAPI.list(params),
        classesAPI.list()
      ]);

      // Since we disabled pagination globally, sRes.data is a plain array. 
      // We will perform the pagination logic locally on the filtered array to support selector controls.
      let list = sRes.data || [];

      // Extra frontend filters that might not be in DB fields (like section)
      if (sectionFilter) {
        list = list.filter((s: any) => s.classroom_name?.toLowerCase().includes(`(${sectionFilter.toLowerCase()})`) || s.classroom_name?.toLowerCase().includes(`section ${sectionFilter.toLowerCase()}`));
      }

      setClasses(cRes.data || []);
      setTotalRecords(list.length);
      
      // Paginate locally
      const startIndex = (page - 1) * pageSize;
      const paginatedList = list.slice(startIndex, startIndex + pageSize);
      setData(paginatedList);
    } catch (err) {
      console.error("Failed to fetch students", err);
      addToast("Failed to sync student registry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, classFilter, sectionFilter, statusFilter, sortBy, sortOrder, page, pageSize]);

  // CRUD handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStudent) {
        await studentsAPI.update(editingStudent.id, {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          classroom: form.classroom,
          admission_number: form.admission_number,
          roll_number: form.roll_number
        });
        addToast("Student profile updated successfully!");
      } else {
        await studentsAPI.create(form);
        addToast("New student profile established.");
      }
      setIsAdding(false);
      setEditingStudent(null);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error("Submission failed", err);
      addToast(err.response?.data?.error || "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently remove this student profile?")) return;
    try {
      await studentsAPI.delete(id);
      setData(data.filter(s => s.id !== id));
      addToast("Profile archived.");
      fetchData();
    } catch {
      addToast("Action failed", "error");
    }
  };

  const resetForm = () => {
    setForm({ 
      username: "", 
      email: "", 
      first_name: "", 
      last_name: "", 
      phone: "", 
      password: "Student@12345", 
      classroom: "", 
      admission_number: "", 
      roll_number: "" 
    });
  };

  // Checkbox row selectors
  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(s => s.id));
    }
  };

  const toggleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Operations
  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected students?`)) return;
    try {
      await studentsAPI.bulkDelete(selectedIds);
      addToast(`${selectedIds.length} profiles successfully archived.`);
      setSelectedIds([]);
      fetchData();
    } catch {
      addToast("Bulk delete failed", "error");
    }
  };

  const handleBulkPromote = async (classroomId: number) => {
    if (!selectedIds.length) return;
    try {
      await studentsAPI.bulkPromote(selectedIds, classroomId);
      addToast(`${selectedIds.length} students promoted successfully.`);
      setSelectedIds([]);
      fetchData();
    } catch {
      addToast("Bulk promotion failed", "error");
    }
  };

  // Reset password handler
  const handleResetPassword = async () => {
    if (!selectedStudent || !newPassword) return;
    try {
      await usersAPI.resetPassword(selectedStudent.user_id || selectedStudent.user, { password: newPassword });
      addToast(`Password for ${selectedStudent.user_name} has been reset.`);
      setActiveAuxModal(null);
      setNewPassword("");
    } catch {
      addToast("Reset password failed.", "error");
    }
  };

  // Status switches
  const handleToggleStatus = async (student: any) => {
    const nextStatus = student.status === "active" ? "inactive" : "active";
    try {
      await studentsAPI.update(student.id, { status: nextStatus });
      addToast(`Student status updated to ${nextStatus}.`);
      fetchData();
    } catch {
      addToast("Status toggle failed.", "error");
    }
  };

  // Export handlers (PDF/Excel/CSV)
  const handleExport = (format: "csv" | "excel") => {
    if (!data.length) return;
    let headers = "UID,Name,Admission Number,Roll Number,Classroom,Status\n";
    let rows = data.map(s => `"${s.id}","${s.user_name}","${s.admission_number || ""}","${s.roll_number || ""}","${s.classroom_name || ""}","${s.status}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `student_registry_${Date.now()}.${format === "csv" ? "csv" : "xls"}`);
    a.click();
    addToast("Registry exported successfully.");
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
               <GraduationCap className="w-10 h-10 text-[#d4af37]" />
               Student Registry
            </h1>
            <p className="text-slate-500 font-medium mt-1">Institutional record of all enrolled scholars and their academic statuses.</p>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={() => { resetForm(); setIsAdding(true); }}
              className="bg-[#001f3f] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#001f3f]/20 hover:scale-105 transition-all active:scale-95"
             >
                <Plus className="w-4 h-4" /> Enroll Student
             </button>
             <button 
              onClick={() => handleExport("csv")}
              className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-[#001f3f] transition-all"
             >
                <Download className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Dynamic Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#001f3f]/5 shadow-sm">
             <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Total Enrolled</div>
             <div className="text-3xl font-black text-[#001f3f] mt-2">{totalRecords}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-[#001f3f]/5 shadow-sm">
             <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Active Scholars</div>
             <div className="text-3xl font-black text-emerald-600 mt-2">{data.filter(s => s.status === 'active').length}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-[#001f3f]/5 shadow-sm">
             <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Classes</div>
             <div className="text-3xl font-black text-[#d4af37] mt-2">{classes.length}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-[#001f3f]/5 shadow-sm">
             <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Suspended / Inactive</div>
             <div className="text-3xl font-black text-rose-500 mt-2">{data.filter(s => s.status !== 'active').length}</div>
          </div>
        </div>

        {/* Search, Filter, Sort and Bulk Operations Bar */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm space-y-6">
           <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 group w-full">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
                 <input 
                   placeholder="Search by name, ID, roll number, email, phone..."
                   className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#d4af37]/20 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#001f3f] outline-none transition-all"
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
                 <select 
                   value={classFilter} 
                   onChange={e => setClassFilter(e.target.value)}
                   className="px-4 py-3 bg-slate-50 text-xs font-black uppercase tracking-wider text-[#001f3f] rounded-xl border-none outline-none"
                 >
                    <option value="">Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
                 <select 
                   value={sectionFilter} 
                   onChange={e => setSectionFilter(e.target.value)}
                   className="px-4 py-3 bg-slate-50 text-xs font-black uppercase tracking-wider text-[#001f3f] rounded-xl border-none outline-none"
                 >
                    <option value="">Section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                 </select>
                 <select 
                   value={statusFilter} 
                   onChange={e => setStatusFilter(e.target.value)}
                   className="px-4 py-3 bg-slate-50 text-xs font-black uppercase tracking-wider text-[#001f3f] rounded-xl border-none outline-none"
                 >
                    <option value="">Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                 </select>
                 <select 
                   value={sortBy} 
                   onChange={e => setSortBy(e.target.value)}
                   className="px-4 py-3 bg-slate-50 text-xs font-black uppercase tracking-wider text-[#001f3f] rounded-xl border-none outline-none"
                 >
                    <option value="created_at">Date Joined</option>
                    <option value="user__first_name">Name</option>
                    <option value="admission_number">Enrollment ID</option>
                    <option value="roll_number">Roll No.</option>
                 </select>
              </div>
           </div>

           {/* Bulk Actions Gate */}
           {selectedIds.length > 0 && (
             <div className="flex items-center justify-between p-4 bg-[#001f3f]/5 rounded-2xl animate-fade-in">
                <span className="text-xs font-bold text-[#001f3f]">{selectedIds.length} scholars selected</span>
                <div className="flex items-center gap-3">
                   <select 
                     onChange={e => {
                       if (e.target.value) {
                         handleBulkPromote(Number(e.target.value));
                         e.target.value = "";
                       }
                     }}
                     className="px-3 py-2 bg-white text-[10px] font-black uppercase tracking-widest text-[#001f3f] rounded-xl border border-slate-200"
                   >
                      <option value="">Assign Class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                   <button 
                    onClick={handleBulkDelete}
                    className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-rose-600 transition-all"
                   >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Student Registry Directory */}
        <div className="bg-white rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-6 px-8 w-12">
                       <input 
                        type="checkbox" 
                        checked={selectedIds.length === data.length && data.length > 0} 
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-[#001f3f] focus:ring-[#001f3f]"
                       />
                    </th>
                    <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholar</th>
                    <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment ID</th>
                    <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classroom</th>
                    <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll No.</th>
                    <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="py-6 px-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Control</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {loading ? (
                   [1, 2, 3, 4].map(i => (
                     <tr key={i} className="animate-pulse">
                        <td colSpan={7} className="py-8 px-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                     </tr>
                   ))
                 ) : data.length === 0 ? (
                   <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400 font-medium italic">No scholars found.</td>
                   </tr>
                 ) : data.map((s) => (
                   <tr key={s.id} className="hover:bg-slate-50/30 transition-all">
                      <td className="py-6 px-8">
                         <input 
                          type="checkbox" 
                          checked={selectedIds.includes(s.id)} 
                          onChange={() => toggleSelectRow(s.id)}
                          className="rounded border-slate-300 text-[#001f3f] focus:ring-[#001f3f]"
                         />
                      </td>
                      <td className="py-6 px-4">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#001f3f]/5 rounded-xl flex items-center justify-center text-[#001f3f] font-black">
                               {(s.user_name?.[0] || "?").toUpperCase()}
                            </div>
                            <div>
                               <div className="font-bold text-[#001f3f]">{s.user_name}</div>
                               <div className="text-[10px] text-slate-400 font-medium">UID: #{s.id}</div>
                            </div>
                         </div>
                      </td>
                      <td className="py-6 px-4 font-mono text-xs font-black text-[#d4af37]">{s.admission_number}</td>
                      <td className="py-6 px-4 text-xs font-bold text-[#001f3f]">{s.classroom_name || "Unassigned"}</td>
                      <td className="py-6 px-4 text-xs font-bold text-slate-400">{s.roll_number || "-"}</td>
                      <td className="py-6 px-4">
                         <button 
                          onClick={() => handleToggleStatus(s)}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                          }`}
                         >
                            {s.status}
                         </button>
                      </td>
                      <td className="py-6 px-8">
                         <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setViewingStudent(s)}
                              className="p-2 bg-slate-50 text-slate-400 hover:text-[#001f3f] rounded-lg transition-all"
                            >
                               <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                const nameParts = (s.user_name || "").split(" ");
                                setEditingStudent(s);
                                setForm({
                                  username: s.username || s.email || "",
                                  email: s.email || "",
                                  first_name: nameParts[0] || "",
                                  last_name: nameParts.slice(1).join(" ") || "",
                                  phone: s.phone || "",
                                  password: "",
                                  classroom: s.classroom || "",
                                  admission_number: s.admission_number || "",
                                  roll_number: s.roll_number || ""
                                });
                              }}
                              className="p-2 bg-slate-50 text-slate-400 hover:text-[#d4af37] rounded-lg transition-all"
                            >
                               <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => { setSelectedStudent(s); setActiveAuxModal("reset-password"); }}
                              className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all animate-pulse"
                              title="Reset Password"
                            >
                               <KeyRound className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(s.id)}
                              className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>

           {/* Local Pagination Bar */}
           <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <span className="text-xs text-slate-400 font-medium">Page Size:</span>
                 <select 
                  value={pageSize} 
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="px-2 py-1 bg-slate-50 text-xs font-bold text-[#001f3f] rounded-lg border-none"
                 >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                 </select>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total records: {totalRecords}</span>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                  disabled={page === 1} 
                  onClick={() => setPage(page - 1)}
                  className="p-2 bg-slate-50 rounded-lg text-[#001f3f] disabled:opacity-40"
                 >
                    <ChevronLeft className="w-4 h-4" />
                 </button>
                 <span className="text-xs font-black text-[#001f3f]">Page {page} of {Math.ceil(totalRecords / pageSize) || 1}</span>
                 <button 
                  disabled={page >= Math.ceil(totalRecords / pageSize)} 
                  onClick={() => setPage(page + 1)}
                  className="p-2 bg-slate-50 rounded-lg text-[#001f3f] disabled:opacity-40"
                 >
                    <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>

        {/* Enrollment / Edit Modal */}
        <AnimatePresence>
          {(isAdding || editingStudent) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001f3f]/60 backdrop-blur-md">
               <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] p-12 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12"
               >
                  <div className="flex-1 space-y-8">
                     <div>
                        <h3 className="text-3xl font-black text-[#001f3f]">{editingStudent ? "Edit Scholar Profile" : "Scholastic Enrollment"}</h3>
                        <p className="text-slate-400 font-medium mt-1 italic">{editingStudent ? "Update credentials and classroom mapping for the scholar." : "Initiate a new student profile in the system."}</p>
                     </div>

                     <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {!editingStudent && (
                          <>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Username</label>
                               <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                                 value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</label>
                               <input required type="password" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                                 value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                            </div>
                          </>
                        )}
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</label>
                           <input required type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">First Name</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Last Name</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assigned Class</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={form.classroom} onChange={e => setForm({...form, classroom: e.target.value})}>
                              <option value="">-- Choose Class --</option>
                              {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Admission Number</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.admission_number} onChange={e => setForm({...form, admission_number: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Roll Number</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.roll_number} onChange={e => setForm({...form, roll_number: e.target.value})} />
                        </div>
                        <div className="md:col-span-2 pt-6 flex gap-4">
                           <button type="button" onClick={() => { setIsAdding(false); setEditingStudent(null); resetForm(); }} className="flex-1 py-4 font-black uppercase text-slate-300 text-xs tracking-widest">Cancel</button>
                           <button type="submit" disabled={submitting} className="flex-[2] bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#001f3f]/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
                              {submitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (editingStudent ? "Update Profile" : "Establish Profile")}
                           </button>
                        </div>
                     </form>
                  </div>

                  <div className="hidden md:block w-72 bg-[#001f3f] rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                     <div className="relative z-10 space-y-6">
                        <Zap className="w-12 h-12 text-[#d4af37]" />
                        <h4 className="text-2xl font-black italic">Security Notice</h4>
                        <p className="text-white/40 text-xs leading-relaxed font-medium">New student accounts are restricted until authorized by the academic head. Ensure all documents are verified before establishing the profile.</p>
                     </div>
                     <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
                  </div>

                  <button onClick={() => { setIsAdding(false); setEditingStudent(null); resetForm(); }} className="absolute top-8 right-8 text-slate-300 hover:text-[#001f3f] transition-all"><X className="w-6 h-6" /></button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Viewing Student Modal */}
        <AnimatePresence>
          {viewingStudent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001f3f]/60 backdrop-blur-md">
               <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden space-y-8"
               >
                  <div className="flex items-center gap-6 border-b border-slate-100 pb-6">
                     <div className="w-16 h-16 bg-[#001f3f] rounded-[1.25rem] flex items-center justify-center text-[#d4af37] font-black text-2xl">
                        {(viewingStudent.user_name?.[0] || "?").toUpperCase()}
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-[#001f3f]">{viewingStudent.user_name}</h3>
                        <span className="bg-[#d4af37]/10 text-[#d4af37] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{viewingStudent.status}</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 text-sm">
                     <div>
                        <div className="text-[10px] font-black uppercase text-slate-400">Enrollment ID</div>
                        <div className="font-mono font-bold text-[#001f3f] mt-1">{viewingStudent.admission_number}</div>
                     </div>
                     <div>
                        <div className="text-[10px] font-black uppercase text-slate-400">Assigned Classroom</div>
                        <div className="font-bold text-[#001f3f] mt-1">{viewingStudent.classroom_name || "Unassigned"}</div>
                     </div>
                     <div>
                        <div className="text-[10px] font-black uppercase text-slate-400">Roll Number</div>
                        <div className="font-bold text-[#001f3f] mt-1">{viewingStudent.roll_number || "-"}</div>
                     </div>
                     <div>
                        <div className="text-[10px] font-black uppercase text-slate-400">Email Address</div>
                        <div className="font-bold text-[#001f3f] mt-1">{viewingStudent.email || "No email"}</div>
                     </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                     <button onClick={() => setViewingStudent(null)} className="bg-[#001f3f] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl">Close Details</button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Auxiliary Modals */}
        <AnimatePresence>
          {activeAuxModal === "reset-password" && selectedStudent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001f3f]/60 backdrop-blur-md">
               <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl space-y-6"
               >
                  <div>
                     <h3 className="text-xl font-black text-[#001f3f]">Reset Password</h3>
                     <p className="text-slate-400 text-xs mt-1">Assign a new login password for {selectedStudent.user_name}.</p>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400">New Password</label>
                     <input required type="password" placeholder="Min 8 characters" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:border-[#d4af37]"
                       value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  <div className="flex gap-4 pt-2">
                     <button type="button" onClick={() => { setActiveAuxModal(null); setNewPassword(""); }} className="flex-1 py-3 text-xs font-black uppercase text-slate-400">Cancel</button>
                     <button type="button" onClick={handleResetPassword} className="flex-1 bg-[#001f3f] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Confirm Reset</button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

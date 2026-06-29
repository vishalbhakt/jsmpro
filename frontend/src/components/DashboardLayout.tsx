"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  LogOut,
  Menu,
  X,
  FileText,
  Video,
  CreditCard,
  BarChart3,
  Bell,
  MessageSquare,
  Trophy,
  Image as ImageIcon,
  UserCircle,
  School,
  ClipboardCheck,
  CalendarCheck,
  History,
  Send,
  StickyNote,
  Puzzle,
  Banknote,
  Megaphone,
  Activity,
  Layers,
  Library,
  Building2,
  Mail,
  MessageCircle,
  BarChart,
  Settings,
  ChevronRight,
  Search,
  Sun,
  Moon
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
  roles: string[];
  category?: string;
}

const sidebarItems: SidebarItem[] = [
  // Shared
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard", roles: ["admin", "teacher", "student"] },

  // Admin ERP Modules
  { icon: UserCircle, label: "Users", href: "/dashboard/admin/users", roles: ["admin"], category: "Management" },
  { icon: GraduationCap, label: "Students", href: "/dashboard/admin/students", roles: ["admin"], category: "Management" },
  { icon: Users, label: "Teachers", href: "/dashboard/admin/teachers", roles: ["admin"], category: "Management" },
  { icon: School, label: "Classes", href: "/dashboard/admin/academics", roles: ["admin"], category: "Academic" },
  { icon: BookOpen, label: "Subjects", href: "/dashboard/admin/subjects", roles: ["admin"], category: "Academic" },
  { icon: ClipboardCheck, label: "Assessments", href: "/dashboard/admin/assessments", roles: ["admin"], category: "Academic" },
  { icon: CalendarCheck, label: "Att. Sessions", href: "/dashboard/admin/attendance-sessions", roles: ["admin"], category: "Operations" },
  { icon: History, label: "Att. Records", href: "/dashboard/admin/attendance-records", roles: ["admin"], category: "Operations" },
  { icon: FileText, label: "Assignments", href: "/dashboard/admin/assignments", roles: ["admin"], category: "LMS" },
  { icon: Send, label: "Submissions", href: "/dashboard/admin/submissions", roles: ["admin"], category: "LMS" },
  { icon: StickyNote, label: "Notes", href: "/dashboard/admin/notes", roles: ["admin"], category: "LMS" },
  { icon: Video, label: "Videos", href: "/dashboard/admin/videos", roles: ["admin"], category: "LMS" },
  { icon: Puzzle, label: "Quizzes", href: "/dashboard/admin/quizzes", roles: ["admin"], category: "LMS" },
  { icon: Trophy, label: "Results", href: "/dashboard/admin/results", roles: ["admin"], category: "Academic" },
  { icon: Layers, label: "Fee Plans", href: "/dashboard/admin/fee-plans", roles: ["admin"], category: "Finance" },
  { icon: Banknote, label: "Payments", href: "/dashboard/admin/payments", roles: ["admin"], category: "Finance" },
  { icon: Megaphone, label: "Announcements", href: "/dashboard/admin/announcements", roles: ["admin"], category: "Comm." },
  { icon: Bell, label: "Notifications", href: "/dashboard/admin/notifications", roles: ["admin"], category: "Comm." },

  // CMS Modules
  { icon: Library, label: "Courses", href: "/dashboard/admin/courses", roles: ["admin"], category: "CMS" },
  { icon: Building2, label: "Facilities", href: "/dashboard/admin/facilities", roles: ["admin"], category: "CMS" },
  { icon: ImageIcon, label: "Gallery", href: "/dashboard/admin/gallery", roles: ["admin"], category: "CMS" },
  { icon: Mail, label: "Contact Messages", href: "/dashboard/admin/contact-messages", roles: ["admin"], category: "CMS" },
  { icon: MessageCircle, label: "Inquiries", href: "/dashboard/admin/enquiries", roles: ["admin"], category: "CMS" },


  // Teacher Modules
  { icon: Users, label: "Students", href: "/dashboard/teacher/students", roles: ["teacher"], category: "Classroom" },
  { icon: CalendarCheck, label: "Attendance", href: "/dashboard/teacher/attendance", roles: ["teacher"], category: "Classroom" },
  { icon: FileText, label: "Assignments", href: "/dashboard/teacher/assignments", roles: ["teacher"], category: "LMS" },
  { icon: StickyNote, label: "Notes", href: "/dashboard/teacher/notes", roles: ["teacher"], category: "LMS" },
  { icon: Video, label: "Videos", href: "/dashboard/teacher/videos", roles: ["teacher"], category: "LMS" },
  { icon: Trophy, label: "Results", href: "/dashboard/teacher/results", roles: ["teacher"], category: "Academic" },
  { icon: Megaphone, label: "Announcements", href: "/dashboard/teacher/announcements", roles: ["teacher"], category: "Comm." },
  { icon: Bell, label: "Notifications", href: "/dashboard/teacher/notifications", roles: ["teacher"], category: "Comm." },
  
  // Student Modules
  { icon: FileText, label: "Assignments", href: "/dashboard/student/assignments", roles: ["student"] },
  { icon: BookOpen, label: "Learning Hub", href: "/dashboard/student/learning", roles: ["student"] },
  { icon: Trophy, label: "My Results", href: "/dashboard/student/results", roles: ["student"] },
  { icon: Calendar, label: "Attendance", href: "/dashboard/student/attendance", roles: ["student"] },
  { icon: CreditCard, label: "Fees", href: "/dashboard/student/payments", roles: ["student"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Show loading spinner only after mount to avoid hydration errors
  if (!user) {
    return mounted ? (
      <div className="flex items-center justify-center h-screen bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading dashboard…</span>
        </div>
      </div>
    ) : null;
  }
  const [isOpen, setIsOpen] = useState(false);

  // If the user is not authenticated (e.g., session expired), redirect to login
  useEffect(() => {
    if (user && !user?.username) {
      router.push('/login');
    }
  }, [user, router]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-hide sidebar on mobile resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredItems = sidebarItems.filter(item => user && item.roles.includes(user.role.toLowerCase()));

  const categories = Array.from(new Set(filteredItems.map(i => i.category).filter(Boolean)));

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans antialiased text-slate-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] bg-[#001f3f] text-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:static lg:translate-x-0 shadow-2xl",
        isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "lg:w-20" : "lg:w-72"
      )}>
        <div className="h-full flex flex-col relative">
          {/* Collapse Toggle (Desktop) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[#d4af37] text-[#001f3f] rounded-full items-center justify-center shadow-lg border-2 border-white z-10 hover:scale-110 transition-all"
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", isCollapsed ? "" : "rotate-180")} />
          </button>

          {/* Branding */}
          <div className={cn(
              "p-4 border-b border-white/5 flex items-center gap-3 transition-all",
              isCollapsed && "px-4 justify-center"
            )}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-inner">
               <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="min-w-0">
                <div className="font-black text-[11px] uppercase tracking-tight truncate">JSM Shiksha Academy Portal</div>
                <div className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.2em] mt-0.5">Control Core</div>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {user?.role?.toLowerCase() === 'admin' && !isCollapsed ? (
              categories.map(cat => (
                <div key={cat} className="space-y-1">
                   <div className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">{cat}</div>
                   {filteredItems.filter(i => i.category === (cat as string)).map((item) => (
                     <SidebarLink key={item.href} item={item} isCollapsed={isCollapsed} active={pathname === item.href} onClick={() => setIsOpen(false)} />
                   ))}
                </div>
              ))
            ) : (
              <div className="space-y-1">
                 {filteredItems.map((item) => (
                   <SidebarLink key={item.href} item={item} isCollapsed={isCollapsed} active={pathname === item.href} onClick={() => setIsOpen(false)} />
                 ))}
              </div>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className={cn(
            "p-4 border-t border-white/5 bg-[#001429] space-y-2 transition-all",
            isCollapsed && "px-2"
          )}>
             <Link 
              href={`/dashboard/${user?.role.toLowerCase()}/profile`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest",
                pathname.includes('/profile') ? "bg-[#d4af37] text-[#001f3f]" : "text-white/40 hover:text-white hover:bg-white/5",
                isCollapsed && "px-0 justify-center"
              )}
            >
               <UserCircle className="w-5 h-5 shrink-0" />
               {!isCollapsed && <span>My Profile</span>}
            </Link>
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl w-full text-rose-400 hover:bg-rose-400/10 transition-all font-black text-xs uppercase tracking-widest",
                isCollapsed && "px-0 justify-center"
              )}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-4 md:px-6 lg:px-10 sticky top-0 z-[50]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(true)} 
              className="lg:hidden p-2 text-[#001f3f] bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Search */}
            <div className="hidden md:flex items-center gap-4 bg-slate-100/50 border border-slate-200 rounded-2xl px-4 py-2 group focus-within:bg-white focus-within:ring-2 focus-within:ring-[#d4af37]/20 transition-all">
               <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#001f3f]" />
               <input 
                 placeholder="Search dashboard..." 
                 className="bg-transparent outline-none text-sm font-bold text-[#001f3f] placeholder:text-slate-400 w-48"
               />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 pr-6 border-r border-slate-200">
               <button className="p-2.5 text-slate-400 hover:text-[#001f3f] hover:bg-slate-100 rounded-xl transition-all relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
               </button>
               <button className="p-2.5 text-slate-400 hover:text-[#001f3f] hover:bg-slate-100 rounded-xl transition-all">
                  <Settings className="w-5 h-5" />
               </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden xl:block min-w-[120px]">
                <div className="text-sm font-black text-[#001f3f] tracking-tight truncate">{user?.first_name} {user?.last_name}</div>
                <div className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest leading-none mt-1">{user?.role?.toLowerCase()}</div>
              </div>
              <div className="w-12 h-12 bg-[#001f3f] rounded-2xl flex items-center justify-center text-[#d4af37] font-black shadow-lg shadow-[#001f3f]/10 border-2 border-white ring-4 ring-[#001f3f]/5">
                {user?.username?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <main className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-10 py-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100">
           © 2026 JSM Shiksha Academy • Secure ERP Infrastructure v2.4.1
        </footer>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212,175,55,0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212,175,55,0.5);
        }
      `}</style>
    </div>
  );
}

function SidebarLink({ item, active, isCollapsed, onClick }: any) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
        active 
          ? "bg-[#d4af37] text-[#001f3f] shadow-lg shadow-[#d4af37]/20" 
          : "text-white/60 hover:text-white hover:bg-white/5",
        isCollapsed && "px-0 justify-center"
      )}
    >
      <item.icon className={cn("w-5 h-5 shrink-0", active ? "stroke-[3]" : "group-hover:scale-110 transition-transform")} />
      {!isCollapsed && (
        <span className={cn("text-xs font-black uppercase tracking-widest", active ? "font-black" : "font-bold")}>
          {item.label}
        </span>
      )}
      
      {/* Tooltip for collapsed mode */}
      {isCollapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl border border-white/10">
          {item.label}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-white/10"></div>
        </div>
      )}

      {active && !isCollapsed && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 w-1 h-6 bg-[#001f3f] rounded-r-full"
        />
      )}
    </Link>
  );
}

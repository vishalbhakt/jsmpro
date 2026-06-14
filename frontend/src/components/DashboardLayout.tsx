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
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  // Shared
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard", roles: ["ADMIN", "TEACHER", "STUDENT"] },

  // Admin Specific
  { icon: GraduationCap, label: "Academics", href: "/dashboard/admin/academics", roles: ["ADMIN"] },
  { icon: Users, label: "Faculty", href: "/dashboard/admin/teachers", roles: ["ADMIN"] },
  { icon: UserCheck, label: "Approvals", href: "/dashboard/admin/approvals", roles: ["ADMIN"] },
  { icon: Users, label: "Users", href: "/dashboard/admin/users", roles: ["ADMIN"] },
  { icon: MessageSquare, label: "Enquiries", href: "/dashboard/admin/enquiries", roles: ["ADMIN"] },
  { icon: CreditCard, label: "Payments", href: "/dashboard/admin/payments", roles: ["ADMIN"] },

  // Teacher Specific
  { icon: Users, label: "My Students", href: "/dashboard/teacher/students", roles: ["TEACHER"] },
  { icon: Calendar, label: "Attendance", href: "/dashboard/teacher/attendance", roles: ["TEACHER"] },
  { icon: FileText, label: "Assignments", href: "/dashboard/teacher/assignments", roles: ["TEACHER"] },
  { icon: BookOpen, label: "Study Notes", href: "/dashboard/teacher/notes", roles: ["TEACHER"] },
  { icon: Video, label: "Video Lessons", href: "/dashboard/teacher/videos", roles: ["TEACHER"] },
  
  // Student Specific
  { icon: FileText, label: "Assignments", href: "/dashboard/student/assignments", roles: ["STUDENT"] },
  { icon: BookOpen, label: "Learning Hub", href: "/dashboard/student/learning", roles: ["STUDENT"] },
  { icon: Trophy, label: "My Results", href: "/dashboard/student/results", roles: ["STUDENT"] },
  { icon: Calendar, label: "Attendance", href: "/dashboard/student/attendance", roles: ["STUDENT"] },
  { icon: CreditCard, label: "Fees", href: "/dashboard/student/payments", roles: ["STUDENT"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = sidebarItems.filter(item => user && item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-pearl flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-navy text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <img src="/logo.png" alt="JSM Logo" className="w-10 h-10 object-contain" />
            <div>
              <div className="font-bold text-sm">Shiksha Academy</div>
              <div className="text-[10px] text-gold uppercase tracking-widest font-bold">{user?.role} Portal</div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  pathname === item.href 
                    ? "bg-gold/10 text-gold shadow-sm" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-2">
            <Link 
              href={
                user?.role === 'ADMIN' ? '/dashboard/admin/profile' :
                user?.role === 'TEACHER' ? '/dashboard/teacher/profile' :
                '/dashboard/student/profile'
              }
              className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
            >
               <Users className="w-5 h-5" /> My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-400 hover:bg-red-400/10 transition-all font-bold text-sm"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-navy/5 flex items-center justify-between px-6 sticky top-0 z-40">
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 -ml-2 text-navy">
            {isOpen ? <X /> : <Menu />}
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-navy">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
            <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-gold font-bold">
              {user?.username?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

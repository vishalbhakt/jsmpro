"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import api, { subjectsAPI } from "@/lib/api";
import { Calendar } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";
import AttendanceManager from "@/components/AttendanceManager";

export default function TeacherAttendance() {
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(s => s.addToast);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectsAPI.list();
        setSubjects(res.data.data);
      } catch {
        addToast("Failed to load subjects", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div>
          <h1 className="text-4xl font-black text-navy tracking-tight">
            Roll Call
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Mark and manage daily attendance for your students.
          </p>
        </div>

        {loading ? (
          <div className="h-96 bg-white rounded-[3rem] animate-pulse border border-navy/5"></div>
        ) : (
          <AttendanceManager subjects={subjects} />
        )}
      </div>
    </DashboardLayout>
  );
}

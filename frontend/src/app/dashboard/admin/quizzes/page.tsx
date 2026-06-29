"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import QuizPortal from "@/components/QuizPortal";
import { subjectsAPI } from "@/lib/api";
import { fetchList } from "@/lib/apiUtils";
import { useToastStore } from "@/store/useToastStore";

export default function AdminQuizzes() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const addToast = useToastStore(s => s.addToast);

  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const list = await fetchList(subjectsAPI.list(), 'Subjects', addToast);
      setSubjects(list);
    } catch (err) {
      console.error('Failed to fetch subjects', err);
      addToast('Failed to load subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div>
          <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">Quizzes & Evaluations</h1>
          <p className="text-slate-500 font-medium mt-1">Configure and manage online periodic quizzes and interactive tests.</p>
        </div>
        <QuizPortal role="TEACHER" subjects={subjects} />
      </div>
    </DashboardLayout>
  );
}

"use client";
import React, { useEffect, useState } from 'react';
import PublicLayout from '@/components/PublicLayout';
import { cmsAPI } from '@/lib/api';
import { safeArray } from '@/lib/apiUtils';
import { Frown, BookOpen, GraduationCap, CheckCircle, ArrowRight } from 'lucide-react';

// Define the shape of a Course object
interface Course {
  id: number;
  title: string;
  description?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch courses from the backend API
    cmsAPI.courses.list()
      .then((res) => {
        const data = safeArray<Course>(res, 'Courses', (msg) => console.warn(msg));
        setCourses(data);
      })
      .catch((err) => {
        console.error('Error fetching courses:', err);
        setError('Unable to load courses at this time. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Render loading state
  if (loading) {
    return (
      <PublicLayout>
        <div className="text-center py-20 space-y-4">
          <BookOpen className="w-16 h-16 mx-auto text-navy/20" />
          <p className="text-slate-500 font-medium">Loading courses…</p>
        </div>
      </PublicLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <PublicLayout>
        <div className="text-center py-20 space-y-4">
          <Frown className="w-16 h-16 mx-auto text-navy/20" />
          <p className="text-slate-500 font-medium">{error}</p>
        </div>
      </PublicLayout>
    );
  }

  // Render empty‑state when there are no courses
  if (courses.length === 0) {
    return (
      <PublicLayout>
        <div className="text-center py-20 space-y-4">
          <BookOpen className="w-16 h-16 mx-auto text-navy/20" />
          <p className="text-slate-500 font-medium">No courses available at the moment.</p>
        </div>
      </PublicLayout>
    );
  }

  // Normal render of course cards
  return (
    <PublicLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {courses.map((c) => (
          <div
            key={c.id}
            className="bg-white p-10 rounded-[3rem] border border-navy/5 shadow-xl hover:border-gold/30 transition-all flex flex-col group"
          >
            <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-gold mb-8 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-navy mb-4">{c.title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-10 italic">
              {c.description || 'A dedicated program designed for the holistic development of students.'}
            </p>
            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-3 text-sm font-bold text-navy">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Comprehensive Subjects
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-navy">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Personalized Attention
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call‑to‑action banner */}
      <div className="max-w-4xl mx-auto bg-navy rounded-[3rem] p-12 md:p-16 flex flex-col md:flex-row items-center gap-10 text-white shadow-2xl relative overflow-hidden mt-20">
        <div className="space-y-4 relative z-10">
          <h2 className="text-3xl font-black">Interested in a specific course?</h2>
          <p className="text-white/60 font-medium">
            Download our detailed curriculum brochure to learn more about our methodology.
          </p>
        </div>
        <button className="btn-gold py-4 px-10 whitespace-nowrap relative z-10 flex items-center gap-2">
          Download PDF <ArrowRight className="w-4 h-4" />
        </button>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
      </div>
    </PublicLayout>
  );
}

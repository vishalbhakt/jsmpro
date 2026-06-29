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
  code?: string;
  description?: string;
  grade_range?: string;
  duration?: string;
  image?: string;
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
            className="bg-white p-8 rounded-[3.5rem] border border-navy/5 shadow-xl hover:border-gold/30 transition-all flex flex-col group overflow-hidden"
          >
            {c.image ? (
              <img src={c.image} alt={c.title} className="w-full h-48 object-cover rounded-3xl mb-8 group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-48 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center text-gold mb-8 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                <GraduationCap className="w-16 h-16 text-navy/30" />
              </div>
            )}
            
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full uppercase tracking-widest font-black">
                  {c.code || "Course"}
                </span>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-none">
                  {c.grade_range || "All Grades"}
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-navy leading-tight">{c.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed italic text-sm">
                {c.description || 'A dedicated program designed for the holistic development of students.'}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-navy">
                <span className="text-slate-400 uppercase tracking-widest">Duration</span>
                <span>{c.duration || "Full Term"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-navy pt-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Comprehensive Syllabus
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-navy">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Expert Faculty Support
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

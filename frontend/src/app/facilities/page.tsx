"use client";

import React, { useEffect, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { cmsAPI } from "@/lib/api";
import { safeArray } from "@/lib/apiUtils";
import * as Icons from "lucide-react";

interface Facility {
  id: number;
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cmsAPI.facilities.list()
      .then((res) => {
        const data = safeArray<Facility>(res, "Facilities", (msg) => console.warn(msg));
        setFacilities(data);
      })
      .catch((err) => {
        console.error("Error fetching facilities:", err);
        setError("Unable to load facilities at this time. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return Icons.Building2;
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Building2;
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="text-center py-20 space-y-4">
          <Icons.Building2 className="w-16 h-16 mx-auto text-navy/20 animate-pulse" />
          <p className="text-slate-500 font-medium">Loading facilities…</p>
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="text-center py-20 space-y-4">
          <Icons.Frown className="w-16 h-16 mx-auto text-navy/20" />
          <p className="text-slate-500 font-medium">{error}</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <div className="text-gold font-black uppercase tracking-[0.2em] text-xs">Infrastructure</div>
            <h1 className="text-5xl font-black text-navy leading-tight">World-Class Facilities</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              We provide a supportive and modern environment that allows students to focus on their growth and exploration.
            </p>
          </div>

          {facilities.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 font-medium">No facilities registered at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {facilities.map((f) => {
                const IconComponent = getIconComponent(f.icon);
                return (
                  <div key={f.id} className="bg-white p-10 rounded-[2.5rem] border border-navy/5 shadow-xl hover:border-gold/30 transition-all group flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-navy rounded-3xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform shadow-lg shadow-navy/10">
                      <IconComponent className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-navy">{f.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed text-sm">
                      {f.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

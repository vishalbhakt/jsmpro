"use client";

import PublicLayout from "@/components/PublicLayout";
import { useEffect, useState } from "react";
import { cmsAPI } from "@/lib/api";
import { fetchList } from "@/lib/apiUtils";
import { Camera, Maximize2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const categories = ["All", "events", "classroom", "sports", "competitions"];

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchList(cmsAPI.gallery.list(), "Gallery");
        setImages(list);
      } catch (err) {
        console.error("Gallery fetch failed", err);
        setError("Failed to load gallery images. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filteredImages = filter === "All" ? images : images.filter(img => img.category?.toLowerCase() === filter.toLowerCase());

  return (
    <PublicLayout>
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="#d4af37 font-black uppercase tracking-[0.2em] text-xs text-[#d4af37]">Student Gallery</div>
            <h1 className="text-5xl font-black text-[#001f3f] leading-tight">Capturing Moments</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              A glimpse into the vibrant life at JSM Shiksha Academy—from classroom learning to annual sports meets.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all capitalize ${
                  filter === cat ? "bg-[#001f3f] text-white shadow-xl shadow-[#001f3f]/10" : "bg-white text-[#001f3f]/40 hover:text-[#001f3f] border border-[#001f3f]/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-white rounded-3xl animate-pulse border border-[#001f3f]/5" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-red-100 shadow-sm">
              <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
              <p className="text-red-500 font-bold text-lg">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredImages.map((img, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className="group relative aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-[#001f3f]/5 cursor-pointer shadow-lg hover:shadow-2xl transition-all"
                >
                  <img src={img.image} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-[#001f3f]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                    <Maximize2 className="w-8 h-8 text-[#d4af37] mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform" />
                    <h4 className="text-white font-black text-lg">{img.title}</h4>
                    {img.caption && <p className="text-white/70 text-xs mt-2 line-clamp-2 px-4 font-medium italic">{img.caption}</p>}
                    <p className="text-[#d4af37] text-xs font-bold uppercase tracking-widest mt-2">{img.category}</p>
                  </div>
                </motion.div>
              ))}
              {!filteredImages.length && (
                <div className="col-span-full py-32 text-center text-slate-400 font-medium italic">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  No images found in this category yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[200] bg-[#001f3f]/95 backdrop-blur-xl p-10 flex items-center justify-center"
          >
            <div className="max-w-5xl w-full space-y-6">
              <img src={selectedImage.image} alt={selectedImage.title} className="w-full max-h-[70vh] object-contain rounded-3xl shadow-2xl" />
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-black text-white">{selectedImage.title}</h3>
                {selectedImage.caption && (
                  <p className="text-white/70 max-w-xl mx-auto text-sm font-medium italic">
                    {selectedImage.caption}
                  </p>
                )}
                <div className="flex justify-center items-center gap-4 text-xs font-black uppercase tracking-widest">
                  <span className="text-[#d4af37]">{selectedImage.category}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">
                    {selectedImage.created_at ? new Date(selectedImage.created_at).toLocaleDateString() : "Just now"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
}

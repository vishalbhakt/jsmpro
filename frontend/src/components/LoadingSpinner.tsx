"use client";

import { motion } from "framer-motion";

export default function LoadingSpinner({ size = "w-12 h-12" }: { size?: string }) {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`border-4 border-t-4 border-[#d4af37] border-t-transparent rounded-full ${size}`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
  );
}

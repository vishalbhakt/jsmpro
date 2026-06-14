"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Academics", href: "/academics" },
  { label: "Courses", href: "/courses" },
  { label: "Admission", href: "/admission" },
  { label: "Facilities", href: "/facilities" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-navy/5 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="JSM Logo" className="w-12 h-12 object-contain" />
          <div className="hidden sm:block">
            <div className="font-black text-navy leading-tight">JSM Shiksha</div>
            <div className="text-[10px] text-gold font-bold uppercase tracking-widest leading-tight">Academy</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-bold transition-all ${
                pathname === link.href ? "text-gold" : "text-navy/60 hover:text-navy"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="btn-primary py-2 text-sm px-5">
            Portal Login
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-navy">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-navy/5 p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-lg font-black ${
                pathname === link.href ? "text-gold" : "text-navy"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setIsOpen(false)} className="btn-primary w-full text-center py-4">
            Portal Login
          </Link>
        </div>
      )}
    </nav>
  );
}

import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/5 pb-16">
        {/* Branding */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center font-black text-navy text-sm shadow-lg shadow-gold/10">JSM</div>
            <div className="font-black text-xl leading-tight">JSM Shiksha <br/><span className="text-gold">Academy</span></div>
          </Link>
          <p className="text-white/60 text-sm leading-relaxed font-medium">
            Dedicated to nurturing young minds from Kindergarten to Grade 8 with a balanced approach to academic and personal excellence.
          </p>
          <div className="flex gap-4">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-gold hover:text-navy transition-all">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-gold font-black uppercase tracking-widest text-xs mb-8">Navigation</h4>
          <ul className="space-y-4">
            {['Home', 'About', 'Academic', 'Courses', 'Admission', 'Facilities', 'Gallery', 'Contact'].map(item => (
              <li key={item}>
                <Link href={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-sm font-bold text-white/60 hover:text-gold transition-all">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-gold font-black uppercase tracking-widest text-xs mb-8">Contact Us</h4>
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-gold shrink-0" />
              <span className="text-sm font-medium text-white/60 leading-relaxed">
                RZ-132, Nihal Vihar, 50 Feet Road, Near Hanuman Mandir, New Delhi
              </span>
            </li>
            <li className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-gold shrink-0" />
              <span className="text-sm font-medium text-white/60">+91 9871234567</span>
            </li>
            <li className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-gold shrink-0" />
              <span className="text-sm font-medium text-white/60">info@jsmacademy.com</span>
            </li>
          </ul>
        </div>

        {/* Working Hours */}
        <div>
          <h4 className="text-gold font-black uppercase tracking-widest text-xs mb-8">Working Hours</h4>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <div className="text-sm font-black mb-1 text-white">Mon – Sat</div>
            <div className="text-xs text-white/60 font-bold mb-4 italic">8:00 AM – 2:00 PM</div>
            <div className="text-sm font-black mb-1 text-red-400">Sunday</div>
            <div className="text-xs text-white/60 font-bold italic">Closed</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-white/40 uppercase tracking-widest">
        <div>© 2024 JSM Shiksha Academy. All Rights Reserved.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-gold transition-all">Privacy Policy</a>
          <a href="#" className="hover:text-gold transition-all">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

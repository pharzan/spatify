"use client";

import { SpatiCardPreview } from "@/components/SpatiCardPreview";
import { Download, Map, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { NewsletterPopup } from "@/components/NewsletterPopup";

export default function Home() {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NewsletterPopup isOpen={isNewsletterOpen} onClose={() => setIsNewsletterOpen(false)} />

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md z-50 border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <Image
              src="/spatify-splash-1.jpg"
              alt="Spatify Logo"
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
            Spatify
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <button onClick={() => setIsNewsletterOpen(true)} className="hover:text-white transition-colors">Join Waitlist</button>
          </div>
          <button onClick={() => setIsNewsletterOpen(true)} className="bg-white text-black px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
            Join Waiting List
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16 py-20">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-[#4CAF50] text-sm font-semibold mb-4 border border-green-100">
                <Sparkles className="w-4 h-4 mr-2" />
                Discover places that match your mood
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 text-balance">
                Find your perfect <span className="text-[#4CAF50]">Space</span>
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Whether you need a quiet corner to study, a vibrant cafe to energize, or a cozy spot for a date, Spatify helps you discover locations based on the vibe you want.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button onClick={() => setIsNewsletterOpen(true)} className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#4CAF50] text-white font-bold text-lg flex items-center justify-center hover:bg-[#43a047] transition-all shadow-xl shadow-green-200 hover:-translate-y-1">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Join Waiting List
                </button>
                <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-gray-700 font-bold text-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-all">
                  <Map className="w-5 h-5 mr-2" />
                  Explore Map
                </button>
              </div>


            </div>

            {/* Visual Feature - The SpatiCard */}
            <div className="flex-1 relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#4CAF50]/20 to-transparent rounded-full blur-3xl transform scale-110 opacity-60"></div>
              <div className="relative z-10 transform hover:rotate-2 transition-transform duration-500">
                <SpatiCardPreview />

                {/* Floating Elements */}
                <div className="absolute -right-8 top-20 bg-white p-4 rounded-2xl shadow-xl animate-bounce-slow" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤫</span>
                    <div>
                      <div className="text-xs text-gray-400 font-bold uppercase">Vibe</div>
                      <div className="font-bold text-gray-800">Quiet & Cozy</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-8 bottom-32 bg-white p-4 rounded-2xl shadow-xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <div className="text-xs text-gray-400 font-bold uppercase">Power</div>
                      <div className="font-bold text-gray-800">Plugs Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Spatify. All rights reserved.
      </footer>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Architecture from '@/components/home/Architecture';
import APIExample from '@/components/home/APIExample';
import Stats from '@/components/home/Stats';
import UseCases from '@/components/home/UseCases';
import CTASection from '@/components/home/CTASection';
import Footer from '@/components/home/Footer';
import Navbar from '@/components/home/Navbar';
import { isAuthenticated } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, redirect to dashboard (like big tech companies)
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  // If authenticated, don't render landing page (will redirect)
  if (isAuthenticated()) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white font-['Gellix']">
        <Hero />
        <Features />
        <Architecture />
        <APIExample />
        <Stats />
        <UseCases />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

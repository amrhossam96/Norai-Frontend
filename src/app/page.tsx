import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Architecture from '@/components/home/Architecture';
import APIExample from '@/components/home/APIExample';
import Stats from '@/components/home/Stats';
import UseCases from '@/components/home/UseCases';
import CTASection from '@/components/home/CTASection';
import type { Metadata } from 'next';
import Footer from '@/components/home/Footer';
import Navbar from '@/components/home/Navbar';

export const metadata: Metadata = {
  title: 'Norai - Behavioral Analysis & Recommendation Engine',
  description: 'Track user events, analyze behavior patterns, and generate intelligent recommendations with Norai. Simple SDK integration for iOS, with ML-powered personalization.',
  keywords: 'behavioral analytics, recommendation engine, user tracking, personalization, ML recommendations, iOS SDK',
};

export default function HomePage() {
  return (
    <>
    <Navbar />
      <main className="min-h-screen bg-black text-white font-['Gellix']">
        <Hero />
      </main>
      <Footer />
    </>
  );
}

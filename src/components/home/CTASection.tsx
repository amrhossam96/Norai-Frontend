import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full filter blur-[120px]" />
        </div>

        <div className="relative z-10 p-12 bg-amber-500/[0.03] backdrop-blur-2xl border border-white/10 rounded-[24px] overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-amber-500/[0.02]">
          {/* Glass highlight effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-100/[0.07] via-transparent to-transparent pointer-events-none"></div>

          {/* Subtle amber accent */}
          <div className="absolute -bottom-10 -right-10 w-[200px] h-[200px] bg-amber-500/[0.09] rounded-full filter blur-3xl"></div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Start Building Personalized Experiences Today</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join 1,000+ developers using Norai to understand user behavior and deliver intelligent recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/docs"
              className="px-8 py-3 bg-white text-black font-medium inline-flex items-center gap-2 rounded-md transition-all duration-300 hover:bg-amber-100 hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs"
              className="px-8 py-3 bg-transparent text-white border border-white/20 font-medium inline-flex items-center gap-2 rounded-md transition-all duration-300 hover:bg-white/5 hover:border-white/30 hover:-translate-y-0.5"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 
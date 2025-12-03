'use client'
import { ShoppingCart, BookOpen, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function UseCases() {
  const useCases = [
    {
      icon: <ShoppingCart className="w-8 h-8 text-amber-400" />,
      title: "E-Commerce Personalization",
      description: "Recommend products based on browsing history, cart additions, and purchase patterns. Increase conversion rates with intelligent product suggestions.",
      example: "Track product views → Generate recommendations → Display personalized suggestions",
      gradient: "from-amber-500/20 to-orange-500/10"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-blue-400" />,
      title: "Content Platforms",
      description: "Suggest articles, videos, or content based on user engagement, reading time, and interaction patterns.",
      example: "Track content engagement → Analyze patterns → Recommend similar content",
      gradient: "from-blue-500/20 to-purple-500/10"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-green-400" />,
      title: "Mobile App Analytics",
      description: "Track user journeys, screen views, and feature usage. Understand drop-off points and optimize user flows.",
      example: "Track screen views → Analyze user flows → Optimize engagement",
      gradient: "from-green-500/20 to-teal-500/10"
    }
  ];

  return (
    <section className="bg-black py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-white/5 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Built for Every Use Case
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From e-commerce to content platforms, Norai helps you understand your users and deliver personalized experiences.
          </p>
        </div>
        
        {/* Use case cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {useCases.map((useCase, index) => (
            <div 
              key={index} 
              className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-[24px] overflow-hidden transition-all duration-300 hover:border-white/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/5 group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className="p-8 relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-6">
                  {useCase.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">{useCase.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{useCase.description}</p>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-300 font-mono">{useCase.example}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* How It Works Section */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-10 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
          <h3 className="text-2xl font-bold text-white mb-10 text-center">
            How It Works: SDK vs API
          </h3>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-black/60 p-6 rounded-xl border border-white/10 hover:border-white/30 transition-all hover:shadow-md hover:shadow-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-amber-400 font-bold">1</span>
                </div>
                <h4 className="text-white font-semibold text-lg">Client-Side: SDK (Event Tracking)</h4>
              </div>
              <p className="text-gray-400 mb-4">Track user events from your iOS app with the Norai SDK. Android & React Native coming soon.</p>
              <div className="bg-black/60 rounded-lg p-3 font-mono text-xs text-gray-300">
                <span className="text-blue-300">Norai</span>.<span className="text-teal-300">shared</span>.<span className="text-green-300">trackEvent</span>()
              </div>
            </div>
            
            <div className="bg-black/60 p-6 rounded-xl border border-white/10 hover:border-white/30 transition-all hover:shadow-md hover:shadow-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 font-bold">2</span>
                </div>
                <h4 className="text-white font-semibold text-lg">Server-Side: API (Recommendations)</h4>
              </div>
              <p className="text-gray-400 mb-4">Fetch personalized recommendations from your backend via the Norai ML API.</p>
              <div className="bg-black/60 rounded-lg p-3 font-mono text-xs text-gray-300">
                <span className="text-purple-300">POST</span> /ml/generate-recommendations
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/docs" className="text-white hover:text-gray-300 transition-colors font-medium flex items-center justify-center gap-2 group">
              Learn more about the architecture
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


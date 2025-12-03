'use client'
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const plans = [
    {
      name: "Starter",
      description: "Perfect for small projects and individual developers",
      price: isAnnual ? 29 : 39,
      features: [
        { name: "Up to 10 domains", included: true },
        { name: "Basic DNS management", included: true },
        { name: "Email forwarding", included: true },
        { name: "API access (100 req/day)", included: true },
        { name: "Custom nameservers", included: false },
        { name: "White-label control panel", included: false },
        { name: "Priority support", included: false },
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      description: "Enhanced features for growing businesses and teams",
      price: isAnnual ? 79 : 99,
      features: [
        { name: "Up to 100 domains", included: true },
        { name: "Advanced DNS management", included: true },
        { name: "Email forwarding", included: true },
        { name: "API access (1,000 req/day)", included: true },
        { name: "Custom nameservers", included: true },
        { name: "White-label control panel", included: true },
        { name: "Priority support", included: false },
      ],
      cta: "Try Professional",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "Full-featured solution for large-scale domain management",
      price: isAnnual ? 199 : 249,
      features: [
        { name: "Unlimited domains", included: true },
        { name: "Advanced DNS management", included: true },
        { name: "Email forwarding", included: true },
        { name: "API access (unlimited)", included: true },
        { name: "Custom nameservers", included: true },
        { name: "White-label control panel", included: true },
        { name: "Priority support", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
    }
  ];
  
  const domainPricing = [
    { tld: ".com", price: 12.99 },
    { tld: ".net", price: 14.99 },
    { tld: ".org", price: 13.99 },
    { tld: ".io", price: 39.99 },
    { tld: ".dev", price: 19.99 },
    { tld: ".app", price: 18.99 }
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
            Transparent Pricing for Every Need
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose a plan that works for your business, with predictable pricing and no hidden fees.
          </p>
          
          {/* Billing toggle */}
          <div className="mt-8 flex justify-center">
            <div className="relative flex items-center p-1.5 bg-black/60 border border-white/20 rounded-full space-x-2">
              <button 
                className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all ${isAnnual ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setIsAnnual(true)}
              >
                Annual <span className="text-xs opacity-70">(Save 20%)</span>
              </button>
              <button 
                className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all ${!isAnnual ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>
        
        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative bg-black/40 backdrop-blur-xl border ${plan.popular ? 'border-white' : 'border-white/20'} rounded-[24px] overflow-hidden transition-all duration-300 hover:border-white/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/5 group`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-md">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6 h-12">{plan.description}</p>
                
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-extrabold text-white">${plan.price}</span>
                  <span className="text-gray-400 ml-2">/{isAnnual ? 'year' : 'month'}</span>
                </div>
                
                <Link
                  href={plan.popular ? "/register" : plan.name === "Enterprise" ? "/contact" : "/register"}
                  className={`block w-full text-center py-3.5 font-medium rounded-lg transition-all duration-300 mb-8 ${
                    plan.popular 
                      ? 'bg-white text-black hover:bg-gray-100 hover:shadow-md' 
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30'
                  }`}
                >
                  {plan.cta}
                </Link>
                
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-white flex-shrink-0 mr-3" />
                      ) : (
                        <X className="w-5 h-5 text-gray-500 flex-shrink-0 mr-3" />
                      )}
                      <span className={feature.included ? "text-gray-300" : "text-gray-500"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        {/* Domain pricing */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-10 mb-16 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
          <h3 className="text-2xl font-bold text-white mb-10 text-center">
            Domain Registration Pricing
          </h3>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {domainPricing.map((domain, index) => (
              <div key={index} className="flex flex-col items-center p-5 bg-black/60 rounded-xl border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-white/5">
                <span className="text-2xl font-bold text-white mb-2">{domain.tld}</span>
                <span className="text-gray-400">${domain.price}/year</span>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Link href="/domains/pricing" className="text-white hover:text-gray-300 transition-colors font-medium flex items-center justify-center gap-2 group">
              View pricing for all TLDs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        {/* FAQ */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-10 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
          <h3 className="text-2xl font-bold text-white mb-10 text-center">
            Frequently Asked Questions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-black/60 p-6 rounded-xl border border-white/10 hover:border-white/30 transition-all hover:shadow-md hover:shadow-white/5">
              <h4 className="text-white font-semibold text-lg mb-3">Can I upgrade my plan later?</h4>
              <p className="text-gray-400">Yes, you can upgrade your plan at any time. Your new features will be available immediately, and we'll prorate the cost.</p>
            </div>
            
            <div className="bg-black/60 p-6 rounded-xl border border-white/10 hover:border-white/30 transition-all hover:shadow-md hover:shadow-white/5">
              <h4 className="text-white font-semibold text-lg mb-3">What payment methods do you accept?</h4>
              <p className="text-gray-400">We accept all major credit cards, PayPal, and for annual plans, we also accept wire transfers.</p>
            </div>
            
            <div className="bg-black/60 p-6 rounded-xl border border-white/10 hover:border-white/30 transition-all hover:shadow-md hover:shadow-white/5">
              <h4 className="text-white font-semibold text-lg mb-3">Is there a setup fee?</h4>
              <p className="text-gray-400">No, there are no setup fees for any of our plans. You only pay the advertised price.</p>
            </div>
            
            <div className="bg-black/60 p-6 rounded-xl border border-white/10 hover:border-white/30 transition-all hover:shadow-md hover:shadow-white/5">
              <h4 className="text-white font-semibold text-lg mb-3">Do you offer refunds?</h4>
              <p className="text-gray-400">We offer a 14-day money-back guarantee if you're not satisfied with our service.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
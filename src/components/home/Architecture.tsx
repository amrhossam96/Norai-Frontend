'use client'
import { Smartphone, Server, ArrowRight } from 'lucide-react';

export default function Architecture() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How Norai Works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            SDK for event tracking on the client, API for recommendations from your server. Simple, secure, and scalable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Client Side - SDK */}
          <div className="relative bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-[24px] overflow-hidden transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="p-8 relative z-10">
              <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6">
                <Smartphone className="w-8 h-8 text-purple-400" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">Client-Side: SDK</h3>
              <p className="text-gray-400 mb-6">Track user events from your iOS app with the Norai SDK.</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2"></div>
                  <p className="text-gray-300 text-sm">Tracks user events (product views, clicks, etc.)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2"></div>
                  <p className="text-gray-300 text-sm">Identifies users across devices</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2"></div>
                  <p className="text-gray-300 text-sm">Sends events to Norai backend</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2"></div>
                  <p className="text-gray-300 text-sm line-through">Does NOT fetch recommendations</p>
                </div>
              </div>

              <div className="bg-black/60 rounded-lg p-4 border border-purple-500/20">
                <p className="text-xs text-gray-400 mb-2">Swift SDK</p>
                <code className="text-xs font-mono text-purple-300">
                  Norai.shared.trackEvent()
                </code>
              </div>

              <div className="mt-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-full border border-purple-500/30">
                  <span className="text-xs font-medium text-purple-300">✅ iOS SDK Available</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-500/20 rounded-full border border-gray-500/30 ml-2">
                  <span className="text-xs font-medium text-gray-400">🚧 Android & RN Coming Soon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Server Side - API */}
          <div className="relative bg-black/40 backdrop-blur-xl border border-blue-500/20 rounded-[24px] overflow-hidden transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="p-8 relative z-10">
              <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <Server className="w-8 h-8 text-blue-400" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">Server-Side: API</h3>
              <p className="text-gray-400 mb-6">Fetch recommendations from your backend via the Norai ML API.</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                  <p className="text-gray-300 text-sm">Fetches personalized recommendations</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                  <p className="text-gray-300 text-sm">Generates user segments</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                  <p className="text-gray-300 text-sm">Batch processing support</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2"></div>
                  <p className="text-gray-300 text-sm">API keys kept secure on server</p>
                </div>
              </div>

              <div className="bg-black/60 rounded-lg p-4 border border-blue-500/20">
                <p className="text-xs text-gray-400 mb-2">REST API</p>
                <code className="text-xs font-mono text-blue-300">
                  POST /ml/generate-recommendations
                </code>
              </div>

              <div className="mt-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-full border border-blue-500/30">
                  <span className="text-xs font-medium text-blue-300">Works with any backend language</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Flow */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-[24px] p-8 hover:border-white/30 transition-all duration-300">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Complete Flow</h3>
          
          <div className="grid md:grid-cols-5 gap-4 items-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📱</span>
              </div>
              <p className="text-sm text-gray-300 font-medium">User Action</p>
              <p className="text-xs text-gray-500 mt-1">in iOS App</p>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-600" />
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-sm text-gray-300 font-medium">SDK Tracks</p>
              <p className="text-xs text-gray-500 mt-1">Event stored</p>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-600" />
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🧠</span>
              </div>
              <p className="text-sm text-gray-300 font-medium">ML Analyzes</p>
              <p className="text-xs text-gray-500 mt-1">Patterns learned</p>
            </div>
          </div>

          <div className="my-6 border-t border-white/10"></div>

          <div className="grid md:grid-cols-5 gap-4 items-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💻</span>
              </div>
              <p className="text-sm text-gray-300 font-medium">Your Backend</p>
              <p className="text-xs text-gray-500 mt-1">Requests recs</p>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-600" />
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚀</span>
              </div>
              <p className="text-sm text-gray-300 font-medium">Norai API</p>
              <p className="text-xs text-gray-500 mt-1">Generates recs</p>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-600" />
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✨</span>
              </div>
              <p className="text-sm text-gray-300 font-medium">Personalized</p>
              <p className="text-xs text-gray-500 mt-1">For each user</p>
            </div>
          </div>
        </div>

        {/* Why This Architecture */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          {[
            { icon: '🔒', title: 'Security', desc: 'API keys never exposed to client' },
            { icon: '⚡', title: 'Performance', desc: 'Server-side caching & optimization' },
            { icon: '🎯', title: 'Flexibility', desc: 'Your backend controls when/how' },
            { icon: '📈', title: 'Scalability', desc: 'Handle millions of requests' }
          ].map((item, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h4 className="text-white font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


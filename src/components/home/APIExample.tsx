import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CodeHighlighter } from '@/components/code-highlighter';

export default function APIExample() {
  const apiExampleCode = `# Request personalized recommendations
curl -X POST https://api.norai.com/ml/generate-recommendations \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": "your-project-id",
    "external_user_id": "user_123",
    "limit": 10
  }'

# Response
{
  "project_id": "your-project-id",
  "external_user_id": "user_123",
  "recommendations": [
    {
      "id": "1f0a5266-6ef9-47d7-bfad-9d5e07b136d9",
      "external_id": "prod_123",
      "score": 0.95,
      "reason": "Ranked by global engagement"
    }
  ],
  "generated_at": "2025-12-01T08:11:26.113470Z"
}`;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black relative">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full filter blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full filter blur-3xl" />
      </div>
      <div className="max-w-5xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-white">
          Get Personalized Recommendations
        </h2>
        <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
          Generate intelligent recommendations for each user with a simple API call. Cached for performance with sub-100ms response times.
        </p>

        <div className="rounded-xl overflow-hidden border border-white/20 bg-black/40 backdrop-blur-xl relative transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:shadow-white/5 group">
          <div className="flex items-center px-4 py-3 bg-black/60 border-b border-white/10">
            <div className="flex space-x-2 mr-4">
              <div className="w-3 h-3 bg-[#ff5f56] rounded-full"></div>
              <div className="w-3 h-3 bg-[#ffbd2e] rounded-full"></div>
              <div className="w-3 h-3 bg-[#27c93f] rounded-full"></div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">POST</span>
              <span className="text-gray-400">/ml/generate-recommendations</span>
            </div>
          </div>
          <div className="p-4">
            <CodeHighlighter code={apiExampleCode} language="bash" showLineNumbers={false} customStyle={{ backgroundColor: "transparent" }} />
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/docs"
            className="inline-flex items-center text-white hover:text-gray-300 font-medium gap-2 group transition-colors"
          >
            View full documentation
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
} 
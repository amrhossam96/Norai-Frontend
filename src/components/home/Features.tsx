import { Activity, Users, Sparkles, BarChart3, Zap, Server } from 'lucide-react';

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgClass: string;
  iconColor: string;
};

function FeatureCard({ icon, title, description, iconBgClass, iconColor }: FeatureCardProps) {
  return (
    <div className="bg-white/20 dark:bg-white/[0.03] backdrop-blur-xl border border-amber-500/20 dark:border-amber-500/10 rounded-[24px] p-6 transition-all duration-300 hover:bg-white/30 dark:hover:bg-white/[0.05] hover:border-amber-500/30 dark:hover:border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/5 dark:hover:shadow-amber-500/5 hover:-translate-y-1 group overflow-hidden relative">
      {/* Glass highlight effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent dark:from-amber-500/5 dark:via-transparent dark:to-transparent rounded-[24px] pointer-events-none"></div>

      <div className={`w-12 h-12 ${iconBgClass} rounded-lg flex items-center justify-center mb-4 relative backdrop-blur-md`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-[#9ca3af]">{description}</p>
    </div>
  );
}

export default function Features() {
  const features = [
    {
      icon: <Activity className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      title: "Event Tracking",
      description: "Capture every user interaction with a simple SDK call. Track product views, clicks, purchases, and custom events—all automatically stored and analyzed.",
      iconBgClass: "bg-amber-500/10 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400"
    },
    {
      icon: <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
      title: "User Identification",
      description: "Seamlessly connect anonymous device IDs to user accounts. Norai automatically handles multi-device users and maintains a unified user profile.",
      iconBgClass: "bg-orange-500/10 dark:bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
      title: "Intelligent Recommendations",
      description: "Generate personalized recommendations for each user based on their behavior, interactions, and preferences. Powered by ML models that learn from your data.",
      iconBgClass: "bg-yellow-500/10 dark:bg-yellow-500/10",
      iconColor: "text-yellow-600 dark:text-yellow-400"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: "User Segmentation",
      description: "Automatically segment users based on behavior patterns, engagement levels, and traits. Use segments for targeted campaigns and A/B testing.",
      iconBgClass: "bg-purple-500/10 dark:bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: "Real-Time Analytics",
      description: "View comprehensive dashboards showing user behavior, event trends, conversion funnels, and engagement metrics—all in real-time.",
      iconBgClass: "bg-blue-500/10 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: <Server className="w-6 h-6 text-green-600 dark:text-green-400" />,
      title: "Built for Scale",
      description: "Handle millions of events and users with async processing, intelligent caching, and horizontal scaling. Your app grows without worrying about infrastructure.",
      iconBgClass: "bg-green-500/10 dark:bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-[#ffffff] dark:to-[#a3a3a3]">
          Everything You Need to Understand and Personalize
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              iconBgClass={feature.iconBgClass}
              iconColor={feature.iconColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 
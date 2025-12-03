interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="group">
      <div className="relative h-full">
        {/* Floating effect wrapper */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/10 dark:from-amber-500/10 dark:to-orange-500/5 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 transform group-hover:translate-x-1 group-hover:-translate-y-1"></div>

        {/* Main card */}
        <div className="p-8 bg-white/20 dark:bg-white/[0.03] backdrop-blur-xl border border-amber-500/20 dark:border-amber-500/10 rounded-[24px] relative overflow-hidden h-full transform transition-all duration-300 group-hover:border-amber-500/30 dark:group-hover:border-amber-500/20 group-hover:shadow-xl group-hover:shadow-amber-500/5 dark:group-hover:shadow-amber-500/5">

          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/5 dark:via-transparent dark:to-transparent rounded-[24px] pointer-events-none"></div>

          {/* Circle decoration */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-500/5 dark:to-orange-500/3 rounded-full"></div>

          <div className="relative">
            {icon}
            <div className="counter-value text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2 group-hover:scale-110 transition-transform duration-300">{value}</div>
            <p className="text-gray-600 dark:text-[#9ca3af] text-lg">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Stats() {
  const stats = [
    {
      icon: (
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 dark:from-amber-500/10 dark:to-yellow-500/5 rounded-full mb-6 mx-auto">
          <span className="text-amber-600 dark:text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.95 49.95 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.009 50.009 0 0 0 1.745 10.06a.75.75 0 0 1-.23-1.338A60.65 60.65 0 0 1 11.7 2.805Z" />
              <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.71 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.88.575 2.873.8 1.247.284 2.544.461 3.867.528 1.323-.067 2.62-.244 3.867-.528.989-.224 1.943-.493 2.86-.795v-.001Z" />
            </svg>
          </span>
        </div>
      ),
      value: "100M+",
      label: "Events Tracked"
    },
    {
      icon: (
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500/20 to-amber-500/10 dark:from-orange-500/10 dark:to-amber-500/5 rounded-full mb-6 mx-auto">
          <span className="text-orange-600 dark:text-orange-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      ),
      value: "<100ms",
      label: "Recommendation Speed"
    },
    {
      icon: (
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 dark:from-yellow-500/10 dark:to-amber-500/5 rounded-full mb-6 mx-auto">
          <span className="text-yellow-600 dark:text-yellow-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
            </svg>
          </span>
        </div>
      ),
      value: "1,000+",
      label: "Active Developers"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-[#ffffff] dark:to-[#a3a3a3]">
          Built for Scale, Trusted by Developers
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 
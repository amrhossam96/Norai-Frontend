'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  Filter, 
  TrendingUp, 
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import NoraiLogo from '@/components/ui/NoraiLogo';
import { removeAuthToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Activity, label: 'Events', href: '/dashboard/events' },
  { icon: Users, label: 'Users', href: '/dashboard/users' },
  { icon: Filter, label: 'Funnels', href: '/dashboard/funnels' },
  { icon: TrendingUp, label: 'Journeys', href: '/dashboard/journeys' },
  { icon: Sparkles, label: 'Recommendations', href: '/dashboard/recommendations' },
  { icon: Users, label: 'Segments', href: '/dashboard/segments' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all cursor-pointer"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-64 bg-black border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          flex flex-col h-screen
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <NoraiLogo size="md" showText={true} />
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Fix: Check if pathname exactly matches or starts with the href
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section - Always visible, fixed at bottom */}
        <div className="p-4 border-t border-white/10 space-y-1 flex-shrink-0 bg-black">
          <Link
            href="/dashboard/settings"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              transition-all duration-200 cursor-pointer
              ${
                pathname === '/dashboard/settings'
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Calendar, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { getUsers, getUserSummary } from '@/lib/api-client';
import { useDashboard } from '@/contexts/DashboardContext';
import { toast } from 'sonner';
import DatePicker from '@/components/ui/date-picker';

export default function UsersPage() {
  const { selectedProjectId } = useDashboard();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userSummary, setUserSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      if (!selectedProjectId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const offset = (page - 1) * limit;
        const response = await getUsers(selectedProjectId, {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          limit,
          offset,
        });

        // Handle both wrapped and unwrapped responses
        let usersData: any[] = [];
        let totalCount = 0;

        if (Array.isArray(response)) {
          usersData = response;
          totalCount = response.length;
        } else if (response && typeof response === 'object') {
          // Try different possible response structures
          usersData = response.data || response.users || response.results || [];
          totalCount = response.total || response.count || response.total_count || usersData.length;
        }

        // Ensure usersData is always an array
        if (!Array.isArray(usersData)) {
          usersData = [];
        }

        setUsers(usersData);
        setTotal(totalCount);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load users');
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [selectedProjectId, page, startDate, endDate]);

  useEffect(() => {
    const loadUserSummary = async () => {
      if (!selectedProjectId || !selectedUser) {
        setUserSummary(null);
        return;
      }

      try {
        setIsLoadingSummary(true);
        const summary = await getUserSummary(
          selectedProjectId,
          selectedUser,
          startDate || undefined,
          endDate || undefined
        );
        setUserSummary(summary.summary || summary);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load user summary');
        setUserSummary(null);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    loadUserSummary();
  }, [selectedProjectId, selectedUser, startDate, endDate]);

  const filteredUsers = Array.isArray(users)
    ? (searchQuery
        ? users.filter(
            (user) =>
              user.external_user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.anonymous_id?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : users)
    : [];

  const totalPages = Math.ceil(total / limit);

  if (!selectedProjectId) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
        <p className="text-gray-400">Please select a project to view users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Users</h1>
        <p className="text-gray-400">Manage and analyze user data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="flex flex-col gap-4">
              {/* Search bar with icon as placeholder */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by User ID or Anonymous ID"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-text"
                />
              </div>

              {/* Date filters in horizontal row */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                  />
                </div>

                <div className="flex-1">
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                Users ({(total || 0).toLocaleString()})
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading users...</div>
              </div>
            ) : !Array.isArray(filteredUsers) || filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-2">No users found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {Array.isArray(filteredUsers) && filteredUsers.map((user, index) => (
                    <div
                      key={user.external_user_id || user.anonymous_id || index}
                      onClick={() => setSelectedUser(user.external_user_id || user.anonymous_id)}
                      className={`p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all cursor-pointer ${
                        selectedUser === (user.external_user_id || user.anonymous_id)
                          ? 'bg-white/10 border-white/20'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.external_user_id || 'Anonymous User'}
                            </div>
                            {user.anonymous_id && (
                              <div className="text-xs text-gray-500 font-mono">
                                {user.anonymous_id.substring(0, 16)}...
                              </div>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                    <div className="text-sm text-gray-400">
                      Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total || 0)} of {(total || 0).toLocaleString()} users
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-400 px-4">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* User Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">User Summary</h2>
            {!selectedUser ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                <p className="text-sm text-gray-400">Select a user to view details</p>
              </div>
            ) : isLoadingSummary ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading summary...</div>
              </div>
            ) : userSummary ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">User ID</div>
                  <div className="font-medium text-sm break-all">{selectedUser}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Total Events</div>
                    <div className="text-lg font-bold">
                      {userSummary.total_events?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Sessions</div>
                    <div className="text-lg font-bold">
                      {userSummary.total_sessions?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">First Seen</div>
                    <div className="text-sm text-gray-300">
                      {userSummary.first_seen
                        ? new Date(userSummary.first_seen).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Last Seen</div>
                    <div className="text-sm text-gray-300">
                      {userSummary.last_seen
                        ? new Date(userSummary.last_seen).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                {userSummary.top_events && userSummary.top_events.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-xs text-gray-500 mb-2">Top Events</div>
                    <div className="space-y-2">
                      {userSummary.top_events.slice(0, 5).map((event: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{event.event_type || event.name}</span>
                          <span className="text-gray-500">{event.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">No summary data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

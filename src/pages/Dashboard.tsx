import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ChevronRight, TrendingUp, Truck, BarChart2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { getBusLogsByDriver } from '../utils/localStorage';
import { BusLog } from '../types/database.types';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentEntries, setRecentEntries] = useState<BusLog[]>([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalDistance: 0,
    activeBuses: 0,
    avgTripTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = () => {
      if (!user) return;
      
      try {
        const entries = getBusLogsByDriver(user.id);
        const recentLogs = entries.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5);
        
        setRecentEntries(recentLogs);

        const trips = entries.length;
        const totalDist = entries.reduce((sum, entry) => sum + (entry.end_km - entry.start_km), 0);
        const uniqueBuses = new Set(entries.map(entry => entry.bus_number));

        let totalMinutes = 0;
        entries.forEach(entry => {
          const startTime = new Date(`2000-01-01T${entry.start_time}`);
          const endTime = new Date(`2000-01-01T${entry.end_time}`);
          if (endTime > startTime) {
            totalMinutes += (endTime.getTime() - startTime.getTime()) / (1000 * 60);
          } else {
            const endTimeNextDay = new Date(`2000-01-02T${entry.end_time}`);
            totalMinutes += (endTimeNextDay.getTime() - startTime.getTime()) / (1000 * 60);
          }
        });

        const avgTime = trips > 0 ? Math.round(totalMinutes / trips) : 0;
        
        setStats({
          totalTrips: trips,
          totalDistance: Math.round(totalDist),
          activeBuses: uniqueBuses.size,
          avgTripTime: avgTime
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user?.email?.split('@')[0] || 'Driver'}
          </p>
        </div>
        <Link
          to="/new-entry"
          className="btn btn-primary mt-4 md:mt-0 flex items-center"
        >
          <PlusCircle size={18} className="mr-2" />
          New Trip Entry
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-4">
                <TrendingUp className="h-6 w-6 text-blue-800" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Trips</p>
                <p className="text-2xl font-bold text-slate-800">
                  {loading ? '...' : stats.totalTrips}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 mr-4">
                <BarChart2 className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Distance</p>
                <p className="text-2xl font-bold text-slate-800">
                  {loading ? '...' : `${stats.totalDistance} km`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-amber-100 mr-4">
                <Truck className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Active Buses</p>
                <p className="text-2xl font-bold text-slate-800">
                  {loading ? '...' : stats.activeBuses}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 mr-4">
                <Clock className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Avg Trip Time</p>
                <p className="text-2xl font-bold text-slate-800">
                  {loading ? '...' : formatDuration(stats.avgTripTime)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-slate-800">Recent Trip Entries</h2>
            <Link to="/view-entries" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 border-4 border-slate-200 border-t-blue-800 rounded-full animate-spin"></div>
              <p className="mt-2 text-slate-500">Loading recent entries...</p>
            </div>
          ) : recentEntries.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">No entries found. Start by creating a new trip entry.</p>
              <Link to="/new-entry" className="btn btn-primary mt-4 inline-flex">
                <PlusCircle size={18} className="mr-2" />
                Create First Entry
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Shift</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {recentEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {format(new Date(entry.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {entry.bus_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {entry.start_location} → {entry.end_location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {entry.end_km - entry.start_km} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.shift_type === 'pickup' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {entry.shift_type === 'pickup' ? 'Pickup' : 'Drop'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Filter, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBusLogsByDriver } from '../utils/localStorage';
import { BusLog } from '../types/database.types';

const ViewEntries = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<BusLog[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<BusLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [buses, setBuses] = useState<string[]>([]);

  useEffect(() => {
    const fetchEntries = () => {
      if (!user) return;
      
      try {
        const data = getBusLogsByDriver(user.id);
        setEntries(data);
        setFilteredEntries(data);
        
        const uniqueBuses = [...new Set(data.map(entry => entry.bus_number))];
        setBuses(uniqueBuses);
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEntries();
  }, [user]);
  
  useEffect(() => {
    let result = entries;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(entry => 
        entry.bus_number.toLowerCase().includes(term) ||
        entry.purpose.toLowerCase().includes(term) ||
        entry.start_location.toLowerCase().includes(term) ||
        entry.end_location.toLowerCase().includes(term)
      );
    }
    
    if (selectedDate) {
      result = result.filter(entry => entry.date === selectedDate);
    }
    
    if (selectedBus) {
      result = result.filter(entry => entry.bus_number === selectedBus);
    }
    
    if (selectedShift) {
      result = result.filter(entry => entry.shift_type === selectedShift);
    }
    
    setFilteredEntries(result);
  }, [entries, searchTerm, selectedDate, selectedBus, selectedShift]);
  
  const exportToCSV = () => {
    if (filteredEntries.length === 0) return;
    
    const headers = ['Date', 'Bus', 'Purpose', 'From', 'To', 'Start KM', 'End KM', 'Distance', 'Start Time', 'End Time', 'Shift', 'Passengers'];
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        entry.date,
        entry.bus_number,
        `"${entry.purpose.replace(/"/g, '""')}"`,
        `"${entry.start_location.replace(/"/g, '""')}"`,
        `"${entry.end_location.replace(/"/g, '""')}"`,
        entry.start_km,
        entry.end_km,
        entry.end_km - entry.start_km,
        entry.start_time,
        entry.end_time,
        entry.shift_type,
        entry.passenger_count
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bus_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
    setSelectedBus('');
    setSelectedShift('');
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Trip Entries</h1>
        <p className="text-slate-500 mt-1">View and manage your trip logs</p>
      </div>
      
      <div className="card mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search trips by bus, purpose or location..."
                className="form-input pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters {showFilters ? '−' : '+'}
              </button>
              
              <button
                type="button"
                onClick={exportToCSV}
                disabled={filteredEntries.length === 0}
                className="btn btn-secondary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 animate-fade-in">
              <div>
                <label htmlFor="date-filter" className="form-label">Date</label>
                <input
                  type="date"
                  id="date-filter"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div>
                <label htmlFor="bus-filter" className="form-label">Bus</label>
                <select
                  id="bus-filter"
                  value={selectedBus}
                  onChange={(e) => setSelectedBus(e.target.value)}
                  className="form-select"
                >
                  <option value="">All Buses</option>
                  {buses.map((bus) => (
                    <option key={bus} value={bus}>{bus}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="shift-filter" className="form-label">Shift Type</label>
                <select
                  id="shift-filter"
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="form-select"
                >
                  <option value="">All Shifts</option>
                  <option value="pickup">Pickup</option>
                  <option value="drop">Drop</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-secondary"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="card">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 border-4 border-slate-200 border-t-blue-800 rounded-full animate-spin"></div>
            <p className="mt-2 text-slate-500">Loading trip entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center">
            {entries.length === 0 ? (
              <p className="text-slate-500">No entries found. Start by recording your first trip.</p>
            ) : (
              <p className="text-slate-500">No entries match your search criteria.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Shift</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Passengers</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {format(new Date(entry.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                      {entry.bus_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {entry.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {entry.start_location} → {entry.end_location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {(entry.end_km - entry.start_km).toFixed(1)} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {entry.start_time} - {entry.end_time}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {entry.passenger_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewEntries;
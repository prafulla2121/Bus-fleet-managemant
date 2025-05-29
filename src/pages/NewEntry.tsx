import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { saveBusLog } from '../utils/localStorage';

const BUSES = Array.from({ length: 100 }, (_, i) => ({
  id: `BUS${(i + 1).toString().padStart(3, '0')}`,
  name: `Bus ${i + 1}`,
  status: Math.random() > 0.2 ? 'available' : 'maintenance'
}));

const SHIFT_TYPES = [
  { id: 'pickup', label: 'Pickup' },
  { id: 'drop', label: 'Drop' }
];

const COMMON_LOCATIONS = [
  'Bus Depot',
  'City Center',
  'Airport',
  'Railway Station',
  'Shopping Mall',
  'School Zone',
  'Industrial Area',
  'Residential Complex'
];

const NewEntry = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [showStartLocations, setShowStartLocations] = useState(false);
  const [showEndLocations, setShowEndLocations] = useState(false);
  
  const [formData, setFormData] = useState({
    bus_number: '',
    purpose: '',
    start_location: '',
    end_location: '',
    start_km: '',
    end_km: '',
    start_time: '',
    end_time: '',
    shift_type: 'pickup',
    passenger_count: '',
    date: new Date().toISOString().split('T')[0],
  });

  const filteredBuses = searchTerm 
    ? BUSES.filter(bus => 
        (bus.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        bus.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        bus.status === 'available'
      )
    : BUSES.filter(bus => bus.status === 'available');

  const filterLocations = (input: string) => {
    return COMMON_LOCATIONS.filter(loc => 
      loc.toLowerCase().includes(input.toLowerCase())
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'start_km' || name === 'end_km') {
      const startKm = name === 'start_km' ? parseFloat(value) : parseFloat(formData.start_km);
      const endKm = name === 'end_km' ? parseFloat(value) : parseFloat(formData.end_km);
      
      if (!isNaN(startKm) && !isNaN(endKm)) {
        const distance = endKm - startKm;
        setCalculatedDistance(distance >= 0 ? distance : null);
      } else {
        setCalculatedDistance(null);
      }
    }

    if (name === 'start_location') {
      setShowStartLocations(true);
    } else if (name === 'end_location') {
      setShowEndLocations(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (parseFloat(formData.end_km) <= parseFloat(formData.start_km)) {
      toast.error('End kilometer reading must be greater than start kilometer reading');
      setIsLoading(false);
      return;
    }
    
    if (formData.end_time <= formData.start_time) {
      toast.error('End time must be after start time');
      setIsLoading(false);
      return;
    }

    const passengerCount = parseInt(formData.passenger_count, 10);
    if (isNaN(passengerCount) || passengerCount < 0) {
      toast.error('Please enter a valid passenger count');
      setIsLoading(false);
      return;
    }
    
    try {
      saveBusLog({
        ...formData,
        start_km: parseFloat(formData.start_km),
        end_km: parseFloat(formData.end_km),
        passenger_count: parseInt(formData.passenger_count, 10),
        driver_id: user!.id,
      });
      
      toast.success('Trip entry saved successfully!');
      navigate('/view-entries');
    } catch (error: any) {
      console.error('Error saving entry:', error);
      toast.error(error.message || 'Failed to save trip entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location: string, type: 'start' | 'end') => {
    setFormData(prev => ({
      ...prev,
      [type === 'start' ? 'start_location' : 'end_location']: location
    }));
    if (type === 'start') {
      setShowStartLocations(false);
    } else {
      setShowEndLocations(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">New Trip Entry</h1>
        <p className="text-slate-500 mt-1">Record details of a new bus trip</p>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bus_number" className="form-label">
                Bus Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="bus_number"
                  name="bus_number"
                  value={formData.bus_number}
                  onChange={handleChange}
                  placeholder="Search bus by ID or name"
                  className="form-input"
                  onFocus={() => setSearchTerm(formData.bus_number)}
                  onBlur={() => setTimeout(() => setSearchTerm(''), 200)}
                  required
                />
                {searchTerm && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredBuses.map((bus) => (
                      <div
                        key={bus.id}
                        className="px-4 py-2 cursor-pointer hover:bg-slate-100"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, bus_number: bus.id }));
                          setSearchTerm('');
                        }}
                      >
                        <div className="font-medium">{bus.id}</div>
                        <div className="text-sm text-slate-500">{bus.name}</div>
                        <div className={`text-xs ${
                          bus.status === 'available' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {bus.status === 'available' ? 'Available' : 'In Maintenance'}
                        </div>
                      </div>
                    ))}
                    {filteredBuses.length === 0 && (
                      <div className="px-4 py-2 text-sm text-slate-500">
                        No available buses found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="purpose" className="form-label">
                Purpose <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="E.g., School route, City tour"
                className="form-input"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_location" className="form-label">
                Starting Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="start_location"
                  name="start_location"
                  value={formData.start_location}
                  onChange={handleChange}
                  onFocus={() => setShowStartLocations(true)}
                  placeholder="E.g., Bus Depot"
                  className="form-input"
                  required
                />
                {showStartLocations && formData.start_location && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filterLocations(formData.start_location).map((location) => (
                      <div
                        key={location}
                        className="px-4 py-2 cursor-pointer hover:bg-slate-100"
                        onClick={() => handleLocationSelect(location, 'start')}
                      >
                        {location}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="end_location" className="form-label">
                Ending Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="end_location"
                  name="end_location"
                  value={formData.end_location}
                  onChange={handleChange}
                  onFocus={() => setShowEndLocations(true)}
                  placeholder="E.g., City Center"
                  className="form-input"
                  required
                />
                {showEndLocations && formData.end_location && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filterLocations(formData.end_location).map((location) => (
                      <div
                        key={location}
                        className="px-4 py-2 cursor-pointer hover:bg-slate-100"
                        onClick={() => handleLocationSelect(location, 'end')}
                      >
                        {location}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="start_km" className="form-label">
                Starting KM <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="start_km"
                name="start_km"
                value={formData.start_km}
                onChange={handleChange}
                placeholder="Odometer reading at start"
                className="form-input"
                min="0"
                step="0.1"
                required
              />
            </div>
            
            <div>
              <label htmlFor="end_km" className="form-label">
                Ending KM <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="end_km"
                name="end_km"
                value={formData.end_km}
                onChange={handleChange}
                placeholder="Odometer reading at end"
                className="form-input"
                min="0"
                step="0.1"
                required
              />
            </div>
            
            <div>
              <label className="form-label">Distance Traveled</label>
              <div className={`h-10 px-3 py-2 border rounded-md shadow-sm ${
                calculatedDistance !== null
                  ? calculatedDistance >= 0
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-red-300 bg-red-50 text-red-700'
                  : 'border-slate-300 bg-slate-50 text-slate-700'
              }`}>
                {calculatedDistance !== null
                  ? `${calculatedDistance.toFixed(1)} km`
                  : '—'
                }
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="start_time" className="form-label">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div>
              <label htmlFor="end_time" className="form-label">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div>
              <label htmlFor="shift_type" className="form-label">
                Shift Type <span className="text-red-500">*</span>
              </label>
              <select
                id="shift_type"
                name="shift_type"
                value={formData.shift_type}
                onChange={handleChange}
                className="form-select"
                required
              >
                {SHIFT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="date" className="form-label">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="passenger_count" className="form-label">
                Number of Passengers <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="passenger_count"
                name="passenger_count"
                value={formData.passenger_count}
                onChange={handleChange}
                placeholder="Number of passengers"
                className="form-input"
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary min-w-[120px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                'Save Trip Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEntry;
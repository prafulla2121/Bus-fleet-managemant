import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const Profile = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const [name, setName] = useState('');
  const [driverId, setDriverId] = useState('');
  
  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setProfile(data);
          setName(data.name || '');
          setDriverId(data.driver_id || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getProfile();
  }, [user]);
  
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setUpdating(true);
    
    try {
      const updates = {
        id: user.id,
        name,
        driver_id: driverId,
        email: user.email,
        role: 'driver',
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' });
      
      if (error) throw error;
      
      toast.success('Profile updated successfully!');
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Your Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account information</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card md:col-span-1">
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UserCircle className="h-16 w-16 text-blue-800" />
            </div>
            
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-slate-800">
                  {profile?.name || user?.email?.split('@')[0] || 'Driver'}
                </h2>
                <p className="text-slate-500 mt-1">{user?.email}</p>
                
                {profile?.driver_id && (
                  <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                    <User className="h-4 w-4 mr-1" />
                    Driver ID: {profile.driver_id}
                  </div>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="btn btn-secondary mt-6 w-full"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Profile Edit Form */}
        <div className="card md:col-span-2">
          <div className="card-header">
            <h3 className="text-lg font-medium text-slate-800">Profile Information</h3>
          </div>
          
          <form onSubmit={updateProfile} className="p-6 space-y-6">
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                className="form-input bg-slate-50"
                disabled
              />
              <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
            </div>
            
            <div>
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="form-input"
                required
              />
            </div>
            
            <div>
              <label htmlFor="driver_id" className="form-label">
                Driver ID
              </label>
              <input
                type="text"
                id="driver_id"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                placeholder="Your driver identification number"
                className="form-input"
                required
              />
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? (
                  <>
                    <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
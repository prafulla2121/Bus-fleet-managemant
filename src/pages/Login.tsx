import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        throw error;
      }
      toast.success('Login successful');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <Bus className="h-12 w-12 text-blue-800 mx-auto" />
            <h1 className="mt-4 text-2xl font-bold text-slate-800">Bus Fleet Management System</h1>
            <p className="mt-2 text-slate-600">Sign in to access your driver portal</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="driver@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <button
                type="submit"
                className="btn btn-primary w-full flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-600">
            <p>For demo purposes, use: driver@example.com / password123</p>
            <p className="mt-1">Contact admin for account issues</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
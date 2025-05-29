import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, PlusCircle, Settings, X } from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: <Home size={20} /> 
    },
    { 
      path: '/new-entry', 
      label: 'New Entry', 
      icon: <PlusCircle size={20} /> 
    },
    { 
      path: '/view-entries', 
      label: 'View Entries', 
      icon: <ClipboardList size={20} /> 
    },
    { 
      path: '/profile', 
      label: 'Profile', 
      icon: <Settings size={20} /> 
    }
  ];
  
  return (
    <div className="h-full bg-white border-r border-slate-200">
      {/* Mobile close button */}
      {onClose && (
        <div className="flex justify-end p-4 lg:hidden">
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100"
          >
            <X size={24} />
          </button>
        </div>
      )}
      
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors group ${
              isActive(item.path)
                ? 'bg-blue-50 text-blue-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className={`mr-3 ${isActive(item.path) ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Megaphone, 
  Package, 
  LogOut, 
  Menu,
  X,
  Hammer
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Quotes', href: '/quotes', icon: FileText },
    { name: 'Marketing', href: '/marketing', icon: Megaphone },
    { name: 'Inventory', href: '/inventory', icon: Package },
  ];

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-slate-950 border-b border-red-700">
          <div className="flex items-center gap-3">
            <div className="bg-red-700 p-2 rounded shadow-lg shadow-red-900/20">
              <Hammer className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-2xl font-bold text-white uppercase tracking-tighter font-heading leading-none">American</span>
              <span className="text-xl font-bold text-red-600 uppercase tracking-widest font-heading leading-none">Iron</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col justify-between h-[calc(100vh-5rem)]">
          <nav className="p-4 space-y-2 mt-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  flex items-center px-4 py-3.5 text-sm font-bold uppercase tracking-wider rounded-md transition-all duration-200 group
                  ${isActive 
                    ? 'bg-red-700 text-white shadow-lg translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}
                `}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${ ({ isActive }) => isActive ? 'text-white' : 'text-slate-500 group-hover:text-red-500' }`} />
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <div className="flex items-center px-4 py-3 mb-3 rounded-lg bg-slate-900 border border-slate-800 shadow-inner">
              <div className="flex-shrink-0">
                 <div className="w-10 h-10 rounded bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold border border-slate-600 shadow text-lg">
                    {user.email.charAt(0).toUpperCase()}
                 </div>
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-bold text-white truncate font-heading tracking-wide">{user.email}</p>
                <p className="text-xs text-red-500 font-semibold uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex w-full items-center justify-center px-4 py-2.5 text-sm font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-red-700 rounded-lg transition-all duration-200 uppercase tracking-wider group border border-transparent hover:border-red-600"
            >
              <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-100">
        {/* Mobile Header */}
        <header className="lg:hidden bg-slate-900 border-b-2 border-red-700 h-16 flex items-center justify-between px-4 shadow-md">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-slate-300 hover:text-white focus:outline-none mr-4"
            >
              <Menu size={28} />
            </button>
            <span className="text-xl font-bold text-white uppercase font-heading tracking-tight">American <span className="text-red-600">Iron</span></span>
          </div>
           <div className="bg-red-700 p-1.5 rounded shadow">
              <Hammer className="text-white w-5 h-5" />
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
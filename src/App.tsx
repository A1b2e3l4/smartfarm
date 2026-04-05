import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Sprout, 
  Camera, 
  User, 
  Bell, 
  Calendar, 
  ChevronRight, 
  Search, 
  Filter, 
  LogOut, 
  ShieldCheck, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  MessageSquare,
  Send,
  Trash2,
  Edit,
  Lock,
  Unlock,
  Settings,
  DollarSign,
  FileText,
  Activity,
  MoreVertical,
  Flag,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  Bug
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { cn } from './lib/utils';

// --- TYPES ---
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'farmer' | 'buyer';
  location: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

// --- CONTEXT ---
const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- COMPONENTS ---

const Button = ({ className, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }) => {
  const variants = {
    primary: 'bg-[#39FF14] text-black hover:bg-[#32e612] shadow-[0_0_15px_rgba(57,255,20,0.3)]',
    secondary: 'bg-white text-black hover:bg-gray-100 border border-gray-200',
    outline: 'bg-transparent border-2 border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14]/10',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };
  return (
    <button 
      className={cn('px-4 py-2 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50', variants[variant], className)} 
      {...props} 
    />
  );
};

const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cn('bg-white rounded-2xl p-4 shadow-sm border border-gray-100', className)} {...props}>
    {children}
  </div>
);

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className={cn('w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14] transition-all', className)} 
    {...props} 
  />
);

// --- SCREENS ---

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAdminRegister, setShowAdminRegister] = useState(false);

  const handleKenyaClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount + 1 >= 5) {
      setShowAdminRegister(true);
      setClickCount(0);
    }
  };

  const handleAdminQuickLogin = () => {
    setEmail('abelmuturi04@gmail.com');
    setPassword('@Muturi123#');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#39FF14] rounded-3xl mb-4 shadow-lg">
            <Sprout size={40} className="text-black" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">SmartFarm</h1>
          <p className="text-gray-500 mt-2">
            Empowering Agriculture in <span onClick={handleKenyaClick} className="cursor-default select-none">Kenya</span>
          </p>
        </div>

        <Card className="p-8">
          {showAdminRegister && (
            <div className="mb-6 p-4 bg-black rounded-2xl text-white space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <p className="text-xs font-bold text-[#39FF14] uppercase tracking-widest">Admin Access</p>
              <div className="flex gap-2">
                <Button variant="primary" className="flex-1 text-xs py-2" onClick={handleAdminQuickLogin}>Quick Login</Button>
                <Button variant="outline" className="flex-1 text-xs py-2 border-white text-white" onClick={() => navigate('/register?admin=true')}>Create Admin</Button>
              </div>
              <button onClick={() => setShowAdminRegister(false)} className="w-full text-[10px] text-gray-500 hover:text-white">Close</button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-500 rounded-lg text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
                <button 
                  type="button" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full py-4 text-lg">Sign In</Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account? <Link to="/register" className="text-[#39FF14] font-bold">Register</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

const kenyanCounties = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta', 'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', "Murang'a", 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '', location: '', role: 'farmer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [counties, setCounties] = useState<string[]>(kenyanCounties);
  const [error, setError] = useState('');
  const location = useLocation();
  const isAdminMode = new URLSearchParams(location.search).get('admin') === 'true';

  useEffect(() => {
    axios.get('/api/counties').then(res => {
      if (res.data && res.data.length > 0) {
        setCounties(res.data);
      }
    }).catch(() => {
      // Keep fallback counties if API fails
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const { confirmPassword, ...data } = formData;
      await axios.post('/api/auth/register', data);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Join SmartFarm</h1>
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-500 rounded-lg text-sm">{error}</div>}
            <Input placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <Input placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            <Input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
              />
              <button 
                type="button" 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <Input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirm Password" 
                value={formData.confirmPassword} 
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                required 
              />
              <button 
                type="button" 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14] bg-white"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              required
            >
              <option value="">Select County</option>
              {counties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setFormData({...formData, role: 'farmer'})}
                className={cn("flex-1 py-3 rounded-xl border-2 transition-all text-xs", formData.role === 'farmer' ? "border-[#39FF14] bg-[#39FF14]/10 text-black font-bold" : "border-gray-100 text-gray-500")}
              >Farmer</button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, role: 'buyer'})}
                className={cn("flex-1 py-3 rounded-xl border-2 transition-all text-xs", formData.role === 'buyer' ? "border-[#39FF14] bg-[#39FF14]/10 text-black font-bold" : "border-gray-100 text-gray-500")}
              >Buyer</button>
              {isAdminMode && (
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, role: 'admin'})}
                  className={cn("flex-1 py-3 rounded-xl border-2 transition-all text-xs", formData.role === 'admin' ? "border-[#39FF14] bg-[#39FF14]/10 text-black font-bold" : "border-gray-100 text-gray-500")}
                >Admin</button>
              )}
            </div>
            <Button type="submit" className="w-full py-4">Register</Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account? <Link to="/login" className="text-[#39FF14] font-bold">Sign In</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prices, setPrices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/market-prices').then(res => setPrices(res.data.slice(0, 4)));
    axios.get('/api/alerts').then(res => setAlerts(res.data.slice(0, 3)));
  }, []);

  return (
    <div className="pb-24">
      <header className="p-6 pt-12 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name}</h1>
            <p className="text-gray-500">{user?.location}, Kenya</p>
          </div>
          <div className="relative">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Bell size={24} className="text-gray-600" />
            </div>
            <span className="absolute top-0 right-0 w-3 h-3 bg-[#39FF14] border-2 border-white rounded-full"></span>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Weather Widget */}
        <section className="bg-gradient-to-br from-[#39FF14] to-[#32e612] p-6 rounded-3xl text-black shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium opacity-80">Current Weather</p>
              <h2 className="text-4xl font-bold">24°C</h2>
              <p className="font-medium">Sunny Day in {user?.location}</p>
            </div>
            <div className="text-6xl">☀️</div>
          </div>
        </section>

        {/* Farmer Actions */}
        {user?.role === 'farmer' && (
          <section>
            <Card className="p-6 bg-black text-white border-none relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Sell Your Produce</h3>
                <p className="text-gray-400 text-sm mb-4">List your crops on the marketplace and reach thousands of buyers.</p>
                <Button onClick={() => navigate('/admin?tab=crops')} className="bg-[#39FF14] text-black border-none font-bold">
                  List New Crop
                </Button>
              </div>
              <Sprout className="absolute -right-4 -bottom-4 text-[#39FF14]/10" size={120} />
            </Card>
          </section>
        )}

        {/* Crop Health Check */}
        <section>
          <Card className="p-6 bg-[#39FF14]/5 border-2 border-dashed border-[#39FF14]/30 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Crop Health Check</h3>
              <p className="text-gray-600 text-sm mb-4">Take a photo of a pest or disease to get instant AI diagnosis and solutions.</p>
              <Button onClick={() => navigate('/detect')} className="bg-black text-[#39FF14] border-none font-bold">
                Start Diagnosis
              </Button>
            </div>
            <Bug className="absolute -right-4 -bottom-4 text-[#39FF14]/10" size={120} />
          </Card>
        </section>

        {/* Market Prices */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Market Prices</h3>
            <Link to="/marketplace" className="text-[#39FF14] font-bold text-sm">View All</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {prices.map((p, i) => (
              <Card key={i} className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                  <Package size={20} className="text-[#39FF14]" />
                </div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{p.crop_name}</p>
                <p className="text-lg font-bold">KES {p.price}</p>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full mt-1", p.trend === 'up' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                  {p.trend === 'up' ? '↑ Rising' : '↓ Falling'}
                </span>
              </Card>
            ))}
          </div>
        </section>

        {/* Alerts */}
        <section>
          <h3 className="text-lg font-bold mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", a.type === 'warning' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500")}>
                  {a.type === 'warning' ? <AlertTriangle size={24} /> : <Bell size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{a.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-1">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const Marketplace = () => {
  const [crops, setCrops] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['Grains', 'Vegetables', 'Fruits', 'Tubers', 'Legumes', 'Livestock'];

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/crops?search=${search}&category=${category}`).then(res => {
      setCrops(res.data);
      setLoading(false);
    });
  }, [search, category]);

  return (
    <div className="pb-24 p-6">
      <h1 className="text-2xl font-bold mb-6">Marketplace</h1>
      
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input 
          placeholder="Search crops or farmers..." 
          className="pl-12" 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        <button 
          onClick={() => setCategory('')}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
            category === '' ? "bg-[#39FF14] text-black shadow-lg" : "bg-white text-gray-500 border border-gray-100"
          )}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
              category === cat ? "bg-[#39FF14] text-black shadow-lg" : "bg-white text-gray-500 border border-gray-100"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39FF14]"></div></div>
        ) : crops.length > 0 ? (
          crops.map((c, i) => (
            <Card key={i} className="overflow-hidden p-0 flex flex-col">
              <div className="h-48 bg-gray-200 relative">
                <img src={c.image_url || `https://picsum.photos/seed/${c.name}/800/600`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-black">
                  {c.county}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold">{c.name}</h3>
                    <p className="text-sm text-gray-500">by {c.farmer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#39FF14]">KES {c.price}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {c.category === 'Livestock' ? `Age: ${c.unit}` : `per ${c.unit}`}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{c.description}</p>
                <Button 
                  className="w-full"
                  onClick={async () => {
                    try {
                      await axios.post('/api/orders', {
                        crop_id: c.id,
                        quantity: 1, // Default quantity
                        total_price: c.price
                      });
                      alert('Order placed successfully!');
                    } catch (err) {
                      alert('Failed to place order');
                    }
                  }}
                >
                  Place Order
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center p-12 text-gray-500">No crops found matching your search.</div>
        )}
      </div>
    </div>
  );
};

const CropDetection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [environment, setEnvironment] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const res = await axios.post('/api/detect-problem', { 
        image: base64,
        symptoms,
        environment
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 p-6">
      <h1 className="text-2xl font-bold mb-6">Crop Health</h1>
      
      {!image ? (
        <div className="aspect-square bg-gray-100 rounded-3xl border-4 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Camera size={40} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-lg mb-2">Identify Crop Issues & Pests</h3>
          <p className="text-gray-500 text-sm mb-8">Take a photo of your crop or a pest to detect issues and get expert solutions.</p>
          <label className="bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-bold cursor-pointer shadow-lg active:scale-95 transition-all">
            Open Camera
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-lg">
            <img src={image} className="w-full h-full object-cover" />
          </div>
          
          {!result ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Describe Symptoms</label>
                  <textarea 
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#39FF14] outline-none text-sm"
                    placeholder="e.g., Yellow spots on leaves, wilting stems, holes in fruit..."
                    rows={3}
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Environmental Conditions</label>
                  <input 
                    type="text"
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#39FF14] outline-none text-sm"
                    placeholder="e.g., High humidity, heavy rain recently, sandy soil..."
                    value={environment}
                    onChange={e => setEnvironment(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="secondary" className="flex-1" onClick={() => { setImage(null); setSymptoms(''); setEnvironment(''); }}>Retake</Button>
                <Button className="flex-1" onClick={analyze} disabled={loading}>
                  {loading ? 'Analyzing...' : 'Analyze Photo'}
                </Button>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-2 border-[#39FF14]">
                <div className="flex items-center gap-2 text-[#39FF14] mb-4">
                  <CheckCircle2 size={24} />
                  <h3 className="font-bold text-lg">Analysis Result</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Diagnosis</p>
                    <p className="text-gray-900 font-medium">{result.diagnosis}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Recommended Solution</p>
                    <p className="text-gray-700">{result.solution}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-6" onClick={() => { setImage(null); setResult(null); }}>Start New Scan</Button>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

const Guidance = () => {
  const [guides, setGuides] = useState<any[]>([]);
  const [category, setCategory] = useState('crop');

  useEffect(() => {
    axios.get(`/api/guidance?category=${category}`).then(res => setGuides(res.data));
  }, [category]);

  return (
    <div className="pb-24 p-6">
      <h1 className="text-2xl font-bold mb-6">Farming Guidance</h1>
      
      <div className="flex gap-2 mb-8">
        <button 
          onClick={() => setCategory('crop')}
          className={cn("flex-1 py-3 rounded-2xl font-bold transition-all", category === 'crop' ? "bg-[#39FF14] text-black shadow-lg" : "bg-white text-gray-500")}
        >Crops</button>
        <button 
          onClick={() => setCategory('livestock')}
          className={cn("flex-1 py-3 rounded-2xl font-bold transition-all", category === 'livestock' ? "bg-[#39FF14] text-black shadow-lg" : "bg-white text-gray-500")}
        >Livestock</button>
      </div>

      <div className="space-y-4">
        {guides.map((g, i) => (
          <Card key={i} className="p-0 overflow-hidden">
            <div className="flex">
              <div className="w-32 h-32 bg-gray-100 shrink-0">
                <img src={g.image_url || `https://picsum.photos/seed/${g.title}/300/300`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-4 flex flex-col justify-center">
                <h3 className="font-bold text-gray-900 mb-1">{g.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{g.content}</p>
                <button className="text-[#39FF14] text-xs font-bold mt-2 flex items-center">Read Guide <ChevronRight size={14} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Messages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMessages = () => {
    axios.get('/api/messages').then(res => setMessages(res.data));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setLoading(true);
    try {
      await axios.post('/api/messages', { message: newMessage });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pb-24 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Support Messages</h1>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
            <p>No messages yet. Need help? Send a message to the admin.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-[#39FF14] text-black p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                <p className="text-sm">{m.message}</p>
                <p className="text-[10px] opacity-50 mt-1">{new Date(m.created_at).toLocaleString()}</p>
              </div>
            </div>
            {m.reply && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm">
                  <p className="text-xs font-bold text-[#39FF14] mb-1">Admin Reply</p>
                  <p className="text-sm text-gray-700">{m.reply}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(m.replied_at).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="relative">
        <input 
          type="text" 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14] pr-16 shadow-lg"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-black text-[#39FF14] rounded-xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

const AdminPanel = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [aiLogs, setAiLogs] = useState<any[]>([]);
  const [alertsList, setAlertsList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [guidanceList, setGuidanceList] = useState<any[]>([]);
  const [marketPricesList, setMarketPricesList] = useState<any[]>([]);
  const [tab, setTab] = useState('dashboard');
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('');
  const categories = ['Grains', 'Vegetables', 'Fruits', 'Tubers', 'Legumes', 'Livestock'];
  const [formCategory, setFormCategory] = useState('Grains');
  const [formImage, setFormImage] = useState('');
  const [alertImage, setAlertImage] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [guidanceImage, setGuidanceImage] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = () => {
    axios.get('/api/admin/stats').then(res => setStats(res.data));
    axios.get('/api/admin/users').then(res => setUsers(res.data));
    axios.get('/api/admin/crops').then(res => setCrops(res.data));
    axios.get('/api/admin/orders').then(res => setOrders(res.data));
    axios.get('/api/admin/messages').then(res => setMessages(res.data));
    axios.get('/api/admin/logs').then(res => setLogs(res.data));
    axios.get('/api/admin/payments').then(res => setPayments(res.data));
    axios.get('/api/admin/ai-logs').then(res => setAiLogs(res.data));
    axios.get('/api/alerts').then(res => setAlertsList(res.data));
    axios.get('/api/events').then(res => setEventsList(res.data));
    axios.get('/api/guidance').then(res => setGuidanceList(res.data));
    axios.get('/api/market-prices').then(res => setMarketPricesList(res.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReply = async (id: number) => {
    if (!replyText[id]) return;
    try {
      await axios.post(`/api/admin/messages/${id}/reply`, { reply: replyText[id] });
      setReplyText({ ...replyText, [id]: '' });
      fetchData();
    } catch (err) {
      alert('Failed to send reply');
    }
  };

  const toggleSuspend = async (id: number, current: boolean) => {
    await axios.post(`/api/admin/users/${id}/suspend`, { suspend: !current });
    fetchData();
  };

  const updateCropStatus = async (id: number, status: string) => {
    await axios.post(`/api/admin/crops/${id}/status`, { status });
    fetchData();
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ['#39FF14', '#000000', '#888888', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row relative">
      {/* Mobile Header */}
      <header className="lg:hidden bg-black text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#39FF14] rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-black" size={18} />
          </div>
          <h2 className="font-bold text-lg">Admin Hub</h2>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-[#39FF14]">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <div className={cn(
        "fixed inset-0 z-40 lg:relative lg:z-0 lg:flex w-64 bg-black text-white flex-col p-6 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="hidden lg:flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#39FF14] rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-black" />
          </div>
          <h2 className="font-bold text-xl">Admin Hub</h2>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'crops', icon: Package, label: 'Crops' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders' },
            { id: 'payments', icon: DollarSign, label: 'Payments' },
            { id: 'messages', icon: MessageSquare, label: 'Messages' },
            { id: 'market', icon: TrendingUp, label: 'Market Prices' },
            { id: 'alerts', icon: AlertCircle, label: 'Alerts' },
            { id: 'events', icon: Calendar, label: 'Events' },
            { id: 'guidance', icon: Sprout, label: 'Guidance' },
            { id: 'ai-logs', icon: Camera, label: 'AI Logs' },
            { id: 'logs', icon: Activity, label: 'Audit Logs' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
                tab === item.id ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all font-bold text-sm">
            <ArrowUpRight size={18} />
            Back to App
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all font-bold text-sm">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-10 pb-24 overflow-x-hidden">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{tab.replace('-', ' ')}</h1>
            <p className="text-gray-500">Manage your SmartFarm platform</p>
          </div>
          <div className="lg:hidden flex justify-between items-center w-full">
             <h1 className="text-2xl font-bold text-gray-900 capitalize">{tab.replace('-', ' ')}</h1>
             <button onClick={fetchData} className="p-2 rounded-xl bg-gray-100">
               <Activity size={18} />
             </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14] w-full md:w-64"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={fetchData} className="hidden lg:block p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all">
              <Activity size={20} />
            </button>
            <button 
              onClick={() => {
                if (tab === 'users') exportToCSV(users, 'users_report');
                else if (tab === 'crops') exportToCSV(crops, 'crops_report');
                else if (tab === 'orders') exportToCSV(orders, 'orders_report');
                else if (tab === 'payments') exportToCSV(payments, 'payments_report');
                else alert('Export not available for this tab');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
            >
              <FileText size={18} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        {tab === 'dashboard' && stats && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-black text-white border-none">
                <Users className="text-[#39FF14] mb-4" size={32} />
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Total Users</p>
                <h2 className="text-4xl font-bold mt-1">{stats.users.reduce((acc: any, curr: any) => acc + parseInt(curr.total), 0)}</h2>
              </Card>
              <Card className="p-6 bg-black text-white border-none">
                <Package className="text-[#39FF14] mb-4" size={32} />
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Active Crops</p>
                <h2 className="text-4xl font-bold mt-1">{stats.crops.find((c: any) => c.status === 'approved')?.total || 0}</h2>
              </Card>
              <Card className="p-6 bg-black text-white border-none">
                <DollarSign className="text-[#39FF14] mb-4" size={32} />
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Total Revenue</p>
                <h2 className="text-4xl font-bold mt-1">KSh {stats.revenue.toLocaleString()}</h2>
              </Card>
              <Card className="p-6 bg-black text-white border-none">
                <TrendingUp className="text-[#39FF14] mb-4" size={32} />
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Total Orders</p>
                <h2 className="text-4xl font-bold mt-1">{stats.orders.reduce((acc: any, curr: any) => acc + parseInt(curr.total), 0)}</h2>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-6">Orders Over Time</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.graphs.ordersByTime}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#39FF14" strokeWidth={3} dot={{ r: 6, fill: '#39FF14' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-6">Users by County</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.graphs.usersByCounty}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="county" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Users Content */}
        {tab === 'users' && (
          <div className="space-y-8">
            <Card className="p-8 max-w-2xl">
              <h3 className="font-bold text-xl mb-6">Register New User</h3>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = {
                  name: (form.elements.namedItem('name') as HTMLInputElement).value,
                  email: (form.elements.namedItem('email') as HTMLInputElement).value,
                  phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
                  password: (form.elements.namedItem('password') as HTMLInputElement).value,
                  location: (form.elements.namedItem('location') as HTMLInputElement).value,
                  role: (form.elements.namedItem('role') as HTMLSelectElement).value
                };
                try {
                  await axios.post('/api/register', data);
                  form.reset();
                  alert('User registered successfully!');
                  fetchData();
                } catch (err) {
                  alert('Failed to register user');
                }
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="name" placeholder="Full Name" required />
                  <Input name="email" type="email" placeholder="Email Address" required />
                  <Input name="phone" placeholder="Phone Number" required />
                  <Input name="password" type="password" placeholder="Password" required />
                  <Input name="location" placeholder="Location (e.g. Nairobi)" required />
                  <select name="role" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14] bg-white">
                    <option value="buyer">Buyer</option>
                    <option value="farmer">Farmer (Seller)</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button type="submit" className="w-full py-4">Create User Account</Button>
              </form>
            </Card>

            <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">User</th>
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Role</th>
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Location</th>
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Status</th>
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-bold uppercase">{u.role}</span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{u.location}</td>
                      <td className="py-4 px-4">
                        <span className={cn("px-2 py-1 rounded-lg text-xs font-bold uppercase", u.is_suspended ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
                          {u.is_suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => toggleSuspend(u.id, u.is_suspended)} className="p-2 rounded-lg hover:bg-gray-100 transition-all">
                            {u.is_suspended ? <Unlock size={18} className="text-green-500" /> : <Lock size={18} className="text-red-500" />}
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-all text-gray-400">
                            <Edit size={18} />
                          </button>
                          <button onClick={async () => {
                            if(confirm('Are you sure you want to delete this user?')) {
                              await axios.delete(`/api/admin/users/${u.id}`);
                              fetchData();
                            }
                          }} className="p-2 rounded-lg hover:bg-red-50 transition-all text-red-400">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}

        {/* Crops Content */}
        {tab === 'crops' && (
          <div className="space-y-8">
            <Card className="p-8 max-w-2xl">
              <h3 className="font-bold text-xl mb-6">List New Produce</h3>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = {
                  name: (form.elements.namedItem('name') as HTMLInputElement).value,
                  category: (form.elements.namedItem('category') as HTMLSelectElement).value,
                  price: (form.elements.namedItem('price') as HTMLInputElement).value,
                  unit: (form.elements.namedItem('unit') as HTMLInputElement).value,
                  description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
                  image_url: formImage || (form.elements.namedItem('image_url') as HTMLInputElement).value,
                  county: (form.elements.namedItem('county') as HTMLInputElement).value
                };
                try {
                  await axios.post('/api/crops', data);
                  form.reset();
                  setFormImage('');
                  alert('Produce listed successfully!');
                  fetchData();
                } catch (err) {
                  alert('Failed to list produce');
                }
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="name" placeholder={formCategory === 'Livestock' ? "Animal Name (e.g. Cow, Goat)" : "Produce Name (e.g. Maize, Tomatoes)"} required />
                  <select 
                    name="category" 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14] bg-white"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <Input name="price" type="number" placeholder={formCategory === 'Livestock' ? "Price (KSh)" : "Price per Unit (KSh)"} required />
                  <Input name="unit" placeholder={formCategory === 'Livestock' ? "Age (e.g. 2 years, 6 months)" : "Unit (e.g. kg, bag)"} required />
                  <Input name="county" placeholder="County" required />
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Produce Photo</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold cursor-pointer transition-all text-center text-sm border border-dashed border-gray-300 flex items-center justify-center gap-2">
                        <Camera size={18} />
                        Take Photo / Upload
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setFormImage(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {formImage && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                          <img src={formImage} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <Input name="image_url" placeholder="Or Image URL" value={formImage} onChange={(e) => setFormImage(e.target.value)} />
                  </div>
                </div>
                <textarea name="description" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14]" placeholder="Description" rows={3} required />
                <Button type="submit" className="w-full py-4">List Produce</Button>
              </form>
            </Card>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <h3 className="font-bold text-xl">Existing Listings</h3>
                <div className="flex gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      placeholder="Search..." 
                      className="pl-10" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14] bg-white text-sm font-bold"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops
                  .filter(c => 
                    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.farmer_name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    (categoryFilter === '' || c.category === categoryFilter)
                  )
                  .map((c, i) => (
                  <Card key={i} className="p-0 overflow-hidden group relative">
                    <button 
                      onClick={async () => {
                        if(confirm('Delete this listing?')) {
                          await axios.delete(`/api/admin/crops/${c.id}`);
                          fetchData();
                        }
                      }}
                      className="absolute top-2 left-2 z-10 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="h-48 bg-gray-100 relative">
                    <img src={c.image_url || `https://picsum.photos/seed/${c.name}/400/300`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 left-4 bg-black/80 text-[#39FF14] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                      {c.category || 'Uncategorized'}
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg", 
                        c.status === 'approved' ? "bg-[#39FF14] text-black" : 
                        c.status === 'pending' ? "bg-yellow-400 text-black" : "bg-red-500 text-white"
                      )}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{c.name}</h3>
                        <p className="text-sm text-gray-500">By {c.farmer_name} • {c.county}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#39FF14] bg-black px-3 py-1 rounded-lg">KSh {c.price}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                          {c.category === 'Livestock' ? `Age: ${c.unit}` : `per ${c.unit}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {c.status === 'pending' && (
                        <>
                          <Button onClick={() => updateCropStatus(c.id, 'approved')} className="flex-1 bg-[#39FF14] text-black border-none">Approve</Button>
                          <Button onClick={() => updateCropStatus(c.id, 'rejected')} variant="danger" className="flex-1">Reject</Button>
                        </>
                      )}
                      {c.status !== 'pending' && (
                        <Button variant="outline" className="w-full">Edit Details</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Orders Content */}
        {tab === 'orders' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Order ID</th>
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Buyer</th>
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Crop</th>
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Amount</th>
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                      <td className="py-4 px-4 font-mono text-sm">#ORD-{o.id}</td>
                      <td className="py-4 px-4 font-bold">{o.buyer_name}</td>
                      <td className="py-4 px-4 text-sm">{o.crop_name}</td>
                      <td className="py-4 px-4 font-bold">KSh {o.total_price}</td>
                      <td className="py-4 px-4">
                        <span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase", 
                          o.status === 'delivered' ? "bg-green-100 text-green-600" : 
                          o.status === 'cancelled' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages Content */}
        {tab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {messages.map((m, i) => (
              <Card key={i} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900">{m.sender_name}</h4>
                    <p className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                  {!m.reply && <span className="bg-red-100 text-red-500 text-[10px] px-2 py-0.5 rounded-full font-bold">New</span>}
                </div>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-2xl italic mb-6">"{m.message}"</p>
                
                {m.reply ? (
                  <div className="bg-[#39FF14]/5 p-4 rounded-2xl border border-[#39FF14]/20">
                    <p className="text-[10px] font-bold text-[#39FF14] uppercase mb-1">Your Reply</p>
                    <p className="text-sm text-gray-600">{m.reply}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type your reply..." 
                      className="py-2 text-sm"
                      value={replyText[m.id] || ''}
                      onChange={e => setReplyText({ ...replyText, [m.id]: e.target.value })}
                    />
                    <Button onClick={() => handleReply(m.id)}>Reply</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Payments Content */}
        {tab === 'payments' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Transaction ID</th>
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Order ID</th>
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Amount</th>
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Status</th>
                    <th className="py-4 px-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                      <td className="py-4 px-4 font-mono text-sm">{p.transaction_ref || `#PAY-${p.id}`}</td>
                      <td className="py-4 px-4 text-sm">#ORD-{p.order_id}</td>
                      <td className="py-4 px-4 font-bold">KSh {p.amount}</td>
                      <td className="py-4 px-4">
                        <span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase", 
                          p.status === 'completed' ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                        )}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Logs Content */}
        {tab === 'ai-logs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiLogs.map((l, i) => (
              <Card key={i} className="p-6">
                <div className="flex gap-4 mb-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                    {l.image_url && l.image_url !== 'base64_stored' ? (
                      <img src={l.image_url} className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform" referrerPolicy="no-referrer" onClick={() => window.open(l.image_url, '_blank')} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] text-center p-2">No photo stored</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 leading-tight mb-1">{l.diagnosis}</h4>
                    <p className="text-[10px] text-gray-500 mb-2 uppercase font-bold tracking-wider">User ID: {l.user_id} • {new Date(l.created_at).toLocaleString()}</p>
                    <div className="space-y-2">
                      {l.symptoms && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Symptoms</p>
                          <p className="text-xs text-gray-600 line-clamp-2 italic">"{l.symptoms}"</p>
                        </div>
                      )}
                      {l.environment && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Environment</p>
                          <p className="text-xs text-gray-600 line-clamp-2 italic">"{l.environment}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">AI Solution</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{l.solution}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs py-2">Correct Result</Button>
                  <Button className="flex-1 text-xs py-2">Add Treatment</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Audit Logs */}
        {tab === 'logs' && (
          <div className="space-y-4">
            {logs.map((l, i) => (
              <Card key={i} className="p-4 flex items-center justify-between border-l-4 border-l-[#39FF14]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black text-[#39FF14] rounded-xl flex items-center justify-center">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">
                      <span className="text-[#39FF14]">{l.admin_name}</span> {l.action_type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      Target: {l.target_type} #{l.target_id} • {new Date(l.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded-lg max-w-xs truncate">
                  {JSON.stringify(l.details)}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Market Prices */}
        {tab === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-8 lg:col-span-1 h-fit sticky top-10">
              <h3 className="font-bold text-xl mb-6">Update Market Prices</h3>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = {
                  crop_name: (form.elements.namedItem('crop_name') as HTMLInputElement).value,
                  price: (form.elements.namedItem('price') as HTMLInputElement).value,
                  unit: (form.elements.namedItem('unit') as HTMLInputElement).value,
                  trend: (form.elements.namedItem('trend') as HTMLSelectElement).value
                };
                try {
                  await axios.post('/api/admin/market-prices', data);
                  form.reset();
                  alert('Price updated successfully!');
                  fetchData();
                } catch (err) {
                  alert('Failed to update price');
                }
              }}>
                <Input name="crop_name" placeholder="Crop Name (e.g. Maize)" required />
                <Input name="price" type="number" placeholder="Price (KSh)" required />
                <Input name="unit" placeholder="Unit (e.g. 90kg bag)" required />
                <select name="trend" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14] bg-white">
                  <option value="up">Trending Up</option>
                  <option value="down">Trending Down</option>
                  <option value="stable">Stable</option>
                </select>
                <Button type="submit" className="w-full py-4">Broadcast Price Update</Button>
              </form>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-xl mb-4">Current Market Prices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketPricesList.map((p, i) => (
                  <Card key={i} className="p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                        <Package className="text-[#39FF14]" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{p.crop_name}</p>
                        <p className="text-xs text-gray-500">KSh {p.price} per {p.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", p.trend === 'up' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                        {p.trend.toUpperCase()}
                      </span>
                      <button 
                        onClick={async () => {
                          if(confirm('Delete this price?')) {
                            await axios.delete(`/api/admin/market-prices/${p.id}`);
                            fetchData();
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {tab === 'alerts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-8 lg:col-span-1 h-fit sticky top-10">
              <h3 className="font-bold text-xl mb-6">Broadcast New Alert</h3>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = {
                  title: (form.elements.namedItem('title') as HTMLInputElement).value,
                  message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
                  type: (form.elements.namedItem('type') as HTMLSelectElement).value,
                  image_url: alertImage || (form.elements.namedItem('image_url') as HTMLInputElement).value
                };
                try {
                  await axios.post('/api/admin/alerts', data);
                  form.reset();
                  setAlertImage('');
                  alert('Alert broadcasted successfully!');
                  fetchData();
                } catch (err) {
                  alert('Failed to broadcast alert');
                }
              }}>
                <Input name="title" placeholder="Alert Title" required />
                <textarea name="message" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14]" placeholder="Alert Message" rows={4} required />
                <select name="type" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14] bg-white">
                  <option value="general">General</option>
                  <option value="warning">Warning</option>
                  <option value="market">Market Update</option>
                  <option value="weather">Weather Alert</option>
                  <option value="emergency">Emergency</option>
                </select>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Alert Photo</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold cursor-pointer transition-all text-center text-sm border border-dashed border-gray-300 flex items-center justify-center gap-2">
                      <Camera size={18} />
                      Take Photo / Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setAlertImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {alertImage && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                        <img src={alertImage} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <Input name="image_url" placeholder="Or Image URL" value={alertImage} onChange={(e) => setAlertImage(e.target.value)} />
                </div>
                <Button type="submit" className="w-full py-4">Send Broadcast</Button>
              </form>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-xl mb-4">Active Alerts</h3>
              <div className="space-y-3">
                {alertsList.map((a, i) => (
                  <Card key={i} className="p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden", a.type === 'warning' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500")}>
                        {a.image_url ? (
                          <img src={a.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          a.type === 'warning' ? <AlertTriangle size={24} /> : <Bell size={24} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{a.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{a.message}</p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        if(confirm('Delete this alert?')) {
                          await axios.delete(`/api/admin/alerts/${a.id}`);
                          fetchData();
                        }
                      }}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Events */}
        {tab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-8 lg:col-span-1 h-fit sticky top-10">
              <h3 className="font-bold text-xl mb-6">Create Agricultural Event</h3>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = {
                  title: (form.elements.namedItem('title') as HTMLInputElement).value,
                  description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
                  event_date: (form.elements.namedItem('date') as HTMLInputElement).value,
                  location: (form.elements.namedItem('location') as HTMLInputElement).value,
                  image_url: eventImage || (form.elements.namedItem('image_url') as HTMLInputElement).value
                };
                try {
                  await axios.post('/api/admin/events', data);
                  form.reset();
                  setEventImage('');
                  alert('Event created successfully!');
                  fetchData();
                } catch (err) {
                  alert('Failed to create event');
                }
              }}>
                <Input name="title" placeholder="Event Title" required />
                <textarea name="description" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14]" placeholder="Event Description" rows={4} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="date" type="datetime-local" required />
                  <Input name="location" placeholder="Event Location" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Event Photo</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold cursor-pointer transition-all text-center text-sm border border-dashed border-gray-300 flex items-center justify-center gap-2">
                      <Camera size={18} />
                      Take Photo / Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setEventImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {eventImage && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                        <img src={eventImage} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <Input name="image_url" placeholder="Or Image URL" value={eventImage} onChange={(e) => setEventImage(e.target.value)} />
                </div>
                <Button type="submit" className="w-full py-4">Create Event</Button>
              </form>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-xl mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {eventsList.map((ev, i) => (
                  <Card key={i} className="p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                        {ev.image_url ? (
                          <img src={ev.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Calendar className="text-[#39FF14]" size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{ev.title}</p>
                        <p className="text-xs text-gray-500">{new Date(ev.event_date).toLocaleDateString()} • {ev.location}</p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        if(confirm('Delete this event?')) {
                          await axios.delete(`/api/admin/events/${ev.id}`);
                          fetchData();
                        }
                      }}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Guidance */}
        {tab === 'guidance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-8 lg:col-span-1 h-fit sticky top-10">
              <h3 className="font-bold text-xl mb-6">Add Farming Guidance</h3>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = {
                  title: (form.elements.namedItem('title') as HTMLInputElement).value,
                  category: (form.elements.namedItem('category') as HTMLSelectElement).value,
                  content: (form.elements.namedItem('content') as HTMLTextAreaElement).value,
                  image_url: guidanceImage || (form.elements.namedItem('image_url') as HTMLInputElement).value
                };
                try {
                  await axios.post('/api/admin/guidance', data);
                  form.reset();
                  setGuidanceImage('');
                  alert('Guide added successfully!');
                  fetchData();
                } catch (err) {
                  alert('Failed to add guide');
                }
              }}>
                <Input name="title" placeholder="Guide Title" required />
                <select name="category" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14] bg-white">
                  <option value="crop">Crop Farming</option>
                  <option value="livestock">Livestock Keeping</option>
                  <option value="market">Market Tips</option>
                </select>
                <textarea name="content" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#39FF14]" placeholder="Guide Content" rows={6} required />
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Guide Photo</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold cursor-pointer transition-all text-center text-sm border border-dashed border-gray-300 flex items-center justify-center gap-2">
                      <Camera size={18} />
                      Take Photo / Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setGuidanceImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {guidanceImage && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                        <img src={guidanceImage} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <Input name="image_url" placeholder="Or Image URL" value={guidanceImage} onChange={(e) => setGuidanceImage(e.target.value)} />
                </div>
                <Button type="submit" className="w-full py-4">Publish Guide</Button>
              </form>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-xl mb-4">Existing Guides</h3>
              <div className="space-y-3">
                {guidanceList.map((g, i) => (
                  <Card key={i} className="p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        {g.image_url ? (
                          <img src={g.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Sprout className="text-[#39FF14]" size={24} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{g.title}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">{g.category}</p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        if(confirm('Delete this guide?')) {
                          await axios.delete(`/api/admin/guidance/${g.id}`);
                          fetchData();
                        }
                      }}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8">
              <h3 className="font-bold text-xl mb-6">Platform Branding</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Platform Name</label>
                  <Input defaultValue="SmartFarm Kenya" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-[#39FF14] rounded-lg border border-gray-200"></div>
                    <Input defaultValue="#39FF14" />
                  </div>
                </div>
                <Button className="w-full">Save Branding</Button>
              </div>
            </Card>
            <Card className="p-8">
              <h3 className="font-bold text-xl mb-6">System Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">Maintenance Mode</p>
                    <p className="text-xs text-gray-500">Disable platform for users</p>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">Commission Rate</p>
                    <p className="text-xs text-gray-500">Platform fee per order</p>
                  </div>
                  <div className="w-16">
                    <Input defaultValue="5%" className="py-1 px-2 text-center" />
                  </div>
                </div>
                <Button variant="outline" className="w-full">Update Settings</Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Nav - Bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-black text-white p-4 flex justify-around items-center z-50 border-t border-white/10">
        <button onClick={() => setTab('dashboard')} className={cn("p-2 rounded-xl", tab === 'dashboard' ? "text-[#39FF14]" : "text-gray-400")}>
          <LayoutDashboard size={24} />
        </button>
        <button onClick={() => setTab('users')} className={cn("p-2 rounded-xl", tab === 'users' ? "text-[#39FF14]" : "text-gray-400")}>
          <Users size={24} />
        </button>
        <button onClick={() => setTab('crops')} className={cn("p-2 rounded-xl", tab === 'crops' ? "text-[#39FF14]" : "text-gray-400")}>
          <Package size={24} />
        </button>
        <button onClick={() => setTab('messages')} className={cn("p-2 rounded-xl", tab === 'messages' ? "text-[#39FF14]" : "text-gray-400")}>
          <MessageSquare size={24} />
        </button>
        <button onClick={() => setTab('settings')} className={cn("p-2 rounded-xl", tab === 'settings' ? "text-[#39FF14]" : "text-gray-400")}>
          <Settings size={24} />
        </button>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-4 border-[#39FF14] p-1">
          <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} className="w-full h-full" />
          </div>
        </div>
        <h2 className="text-xl font-bold">{user?.name}</h2>
        <p className="text-gray-500">{user?.email}</p>
        <span className="bg-[#39FF14]/10 text-[#39FF14] px-3 py-1 rounded-full text-xs font-bold mt-2 uppercase tracking-widest">{user?.role}</span>
      </div>

      <div className="space-y-4">
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><User size={20} /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Location</p>
              <p className="font-medium">{user?.location}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Calendar size={20} /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Order History</p>
              <p className="font-medium">12 Completed Orders</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </Card>
        <Button variant="danger" className="w-full mt-8 py-4 flex items-center justify-center gap-2" onClick={logout}>
          <LogOut size={20} /> Sign Out
        </Button>
      </div>
    </div>
  );
};

// --- LAYOUT ---

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
    { icon: ShoppingBag, label: 'Market', path: '/marketplace' },
    { icon: MessageSquare, label: 'Support', path: '/messages' },
    { icon: Sprout, label: 'Guides', path: '/guidance' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  if (user?.role === 'admin') {
    navItems.splice(4, 0, { icon: ShieldCheck, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative shadow-2xl">
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={i} to={item.path} className="flex flex-col items-center gap-1">
              <div className={cn("p-2 rounded-xl transition-all", isActive ? "bg-[#39FF14] text-black shadow-[0_0_10px_rgba(57,255,20,0.4)]" : "text-gray-400 hover:text-gray-600")}>
                <item.icon size={20} />
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-tighter", isActive ? "text-black" : "text-gray-400")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

// --- AUTH PROVIDER ---

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  
  // Admin Panel gets its own full-screen layout
  if (location.pathname === '/admin') {
    return <>{children}</>;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

// --- APP ---

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/detect" element={<ProtectedRoute><CropDetection /></ProtectedRoute>} />
          <Route path="/guidance" element={<ProtectedRoute><Guidance /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

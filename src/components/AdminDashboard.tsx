import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  ChevronRight,
  Users,
  Eye,
  EyeOff,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Search,
  ArrowLeft,
  Menu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp,
  getDocs,
  where,
  limit
} from 'firebase/firestore';
import { db, auth, storage } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Project, Message, WebsiteContent, VisitorStat } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { format } from 'date-fns';

// --- Sub-components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
          <TrendingUp size={16} />
          {trend}
        </div>
      )}
    </div>
    <p className="text-slate-400 text-sm mb-1">{label}</p>
    <h3 className="text-2xl font-bold text-white">{value}</h3>
  </div>
);

// --- Main Dashboard Component ---

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [stats, setStats] = useState<VisitorStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize default settings if they don't exist
    const initSettings = async () => {
      const settingsRef = doc(db, 'settings', 'global');
      const settingsSnap = await getDocs(query(collection(db, 'settings'), limit(1)));
      
      if (settingsSnap.empty) {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(settingsRef, {
          hero: {
            name: 'Musoxon Maxmudov',
            title: 'Full-Stack Software Developer',
            subtitle: 'Crafting digital experiences with precision and passion.',
            logo: ''
          },
          about: {
            title: 'About Me',
            content: 'I am Musoxon Maxmudov, a strong developer...',
            experience: '2+',
            completed: '10+',
            image: ''
          },
          skills: {
            title: 'Skills'
          },
          education: {
            title: 'Education'
          },
          projects: {
            title: 'Projects',
            viewAll: 'View All',
            viewProject: 'View Project'
          },
          contact: {
            title: 'Contact Me',
            intro: 'Let\'s work together.',
            email: 'musoxonmaxmudov37@gmail.com',
            phone: '+998 91 051 50 31',
            location: 'Namangan, Uzbekistan',
            name: 'Name',
            message: 'Message',
            send: 'Send',
            placeholderName: 'Your Name',
            placeholderEmail: 'Your Email',
            placeholderMessage: 'Your Message',
            github: 'https://github.com/Maxmudovv-Dev',
            linkedin: 'https://www.linkedin.com/in/musoxon-maxmudov-1a1479381/',
            telegram: 'https://t.me/Maxmudovv_Dev'
          },
          footer: {
            rights: '© 2026 Musoxon Maxmudov. All rights reserved.',
            privacy: 'Privacy Policy',
            terms: 'Terms of Service'
          },
          seo: {
            title: 'Musoxon Maxmudov | Portfolio',
            description: 'Full-Stack Software Developer'
          }
        });
      }
    };

    initSettings();

    const unsubProjects = onSnapshot(query(collection(db, 'projects'), orderBy('createdAt', 'desc')), (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
    });

    const unsubMessages = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });

    const unsubContent = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) setContent(snap.data() as WebsiteContent);
    });

    const unsubStats = onSnapshot(query(collection(db, 'stats'), orderBy('date', 'asc')), (snap) => {
      setStats(snap.docs.map(d => d.data() as VisitorStat));
    });

    return () => {
      unsubProjects();
      unsubMessages();
      unsubContent();
      unsubStats();
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut(auth);
    setIsLoggingOut(false);
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col gap-8 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto`}>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={FileText} 
            label="Content" 
            active={activeTab === 'content'} 
            onClick={() => { setActiveTab('content'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={Briefcase} 
            label="Projects" 
            active={activeTab === 'projects'} 
            onClick={() => { setActiveTab('projects'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={MessageSquare} 
            label="Messages" 
            active={activeTab === 'messages'} 
            onClick={() => { setActiveTab('messages'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} 
          />
        </nav>

        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors mt-auto disabled:opacity-50"
        >
          <LogOut size={20} />
          <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white capitalize">{activeTab}</h2>
              <p className="text-slate-400 text-sm md:text-base">Welcome back, Musoxon.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
              <img src={content?.about?.image || "/profile.png"} alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab stats={stats} projects={projects} messages={messages} />}
            {activeTab === 'content' && <ContentTab content={content} />}
            {activeTab === 'projects' && <ProjectsTab projects={projects} />}
            {activeTab === 'messages' && <MessagesTab messages={messages} />}
            {activeTab === 'settings' && <SettingsTab content={content} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Tabs ---

function OverviewTab({ stats, projects, messages }: any) {
  const unreadMessages = messages.filter((m: any) => m.status === 'unread').length;
  
  const totalVisitors = stats.reduce((sum: number, stat: any) => sum + stat.count, 0);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
  
  const todayStats = stats.find((s: any) => s.date === today)?.count || 0;
  const yesterdayStats = stats.find((s: any) => s.date === yesterday)?.count || 0;
  
  const visitorTrend = yesterdayStats > 0 
    ? Math.round(((todayStats - yesterdayStats) / yesterdayStats) * 100) 
    : 0;
  
  const trendText = visitorTrend > 0 ? `+${visitorTrend}%` : `${visitorTrend}%`;
  
  // For the chart, show up to the last 14 days
  const chartData = stats.slice(-14);
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Eye} 
          label="Total Visitors" 
          value={totalVisitors} 
          trend={trendText} 
          color="bg-blue-500/10 text-blue-500" 
        />
        <StatCard 
          icon={Briefcase} 
          label="Total Projects" 
          value={projects.length} 
          trend={projects.length > 0 ? "Active" : "None"} 
          color="bg-purple-500/10 text-purple-500" 
        />
        <StatCard 
          icon={MessageSquare} 
          label="New Messages" 
          value={unreadMessages} 
          trend={unreadMessages > 0 ? "Action needed" : "All caught up"} 
          color="bg-amber-500/10 text-amber-500" 
        />
        <StatCard 
          icon={Users} 
          label="Today's Visitors" 
          value={todayStats} 
          trend={todayStats >= yesterdayStats ? "Growing" : "Stable"} 
          color="bg-emerald-500/10 text-emerald-500" 
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Visitor Statistics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="count" stroke="#2563eb" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Recent Messages</h3>
          <div className="space-y-4">
            {messages.slice(0, 4).map((msg: any) => (
              <div key={msg.id} className="flex items-center gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="font-bold">{msg.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{msg.name}</h4>
                  <p className="text-slate-500 text-sm truncate">{msg.message}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-xs">{msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'MMM d') : 'Just now'}</p>
                  {msg.status === 'unread' && <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto mt-1" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageUploadInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;

        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = () => {
            setUploadProgress(60);
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_SIZE = 1024;

            if (width > height && width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            } else if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            // Compress to JPEG
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            
            // Check size (Firestore limit is 1MB)
            const sizeInBytes = Math.round((compressedBase64.length * 3) / 4);
            if (sizeInBytes > 900000) {
              setErrorMsg('Rasm hajmi juda katta. Kichikroq rasm tanlang.');
              setIsUploading(false);
              return;
            }

            onChange(compressedBase64);
            setUploadProgress(100);
            setTimeout(() => {
              setIsUploading(false);
              setUploadProgress(0);
            }, 1000);
          };
          img.src = base64String;
        } else {
          // For PDF or other files
          const sizeInBytes = Math.round((base64String.length * 3) / 4);
          if (sizeInBytes > 900000) {
            setErrorMsg('Fayl hajmi 800KB dan oshmasligi kerak (Ma\'lumotlar bazasi cheklovi).');
            setIsUploading(false);
            return;
          }
          onChange(base64String);
          setUploadProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 1000);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMsg('Fayl yuklashda xatolik yuz berdi.');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-400">{label}</label>
      <div className="flex gap-4 items-center">
        <input 
          type="text" 
          placeholder={placeholder || "URL or upload file..."}
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
        />
        <div className="relative">
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/webp, application/pdf" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <button 
            type="button"
            disabled={isUploading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <ImageIcon size={18} />
            {isUploading ? `${Math.round(uploadProgress)}%` : 'Upload'}
          </button>
        </div>
      </div>
      {errorMsg && <p className="text-red-500 text-sm mt-1">{errorMsg}</p>}
    </div>
  );
}

function ContentTab({ content }: any) {
  const [formData, setFormData] = useState(content || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'settings', 'global'), formData);
      alert('Content updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Error updating content.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-white">Hero Section</h3>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Full Name</label>
            <input 
              type="text" 
              value={formData.hero?.name || ''} 
              onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, name: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Professional Title</label>
            <input 
              type="text" 
              value={formData.hero?.title || ''} 
              onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, title: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Hero Subtitle</label>
            <textarea 
              rows={3}
              value={formData.hero?.subtitle || ''} 
              onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, subtitle: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 resize-none"
            />
          </div>
          <ImageUploadInput 
            label="Logo Image URL" 
            placeholder="/logo.png or https://..."
            value={formData.hero?.logo || ''} 
            onChange={(val) => setFormData({ ...formData, hero: { ...formData.hero, logo: val } })}
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-8">About Section</h3>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">About Title</label>
            <input 
              type="text" 
              value={formData.about?.title || ''} 
              onChange={(e) => setFormData({ ...formData, about: { ...formData.about, title: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">About Content</label>
            <textarea 
              rows={6}
              value={formData.about?.content || ''} 
              onChange={(e) => setFormData({ ...formData, about: { ...formData.about, content: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Experience Label</label>
              <input 
                type="text" 
                value={formData.about?.experience || ''} 
                onChange={(e) => setFormData({ ...formData, about: { ...formData.about, experience: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Projects Label</label>
              <input 
                type="text" 
                value={formData.about?.completed || ''} 
                onChange={(e) => setFormData({ ...formData, about: { ...formData.about, completed: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
          <ImageUploadInput 
            label="Profile Image URL" 
            placeholder="profile.png or https://..."
            value={formData.about?.image || ''} 
            onChange={(val) => setFormData({ ...formData, about: { ...formData.about, image: val } })}
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-8">Skills Section</h3>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Skills Title</label>
            <input 
              type="text" 
              value={formData.skills?.title || ''} 
              onChange={(e) => setFormData({ ...formData, skills: { ...formData.skills, title: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-8">Education Section</h3>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Education Title</label>
            <input 
              type="text" 
              value={formData.education?.title || ''} 
              onChange={(e) => setFormData({ ...formData, education: { ...formData.education, title: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-8">Projects Section</h3>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Projects Title</label>
            <input 
              type="text" 
              value={formData.projects?.title || ''} 
              onChange={(e) => setFormData({ ...formData, projects: { ...formData.projects, title: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">View All Button</label>
              <input 
                type="text" 
                value={formData.projects?.viewAll || ''} 
                onChange={(e) => setFormData({ ...formData, projects: { ...formData.projects, viewAll: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">View Project Button</label>
              <input 
                type="text" 
                value={formData.projects?.viewProject || ''} 
                onChange={(e) => setFormData({ ...formData, projects: { ...formData.projects, viewProject: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-8">Contact Section</h3>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Contact Title</label>
            <input 
              type="text" 
              value={formData.contact?.title || ''} 
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, title: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Contact Intro</label>
            <textarea 
              rows={3}
              value={formData.contact?.intro || ''} 
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, intro: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Email</label>
              <input 
                type="text" 
                value={formData.contact?.email || ''} 
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Phone</label>
              <input 
                type="text" 
                value={formData.contact?.phone || ''} 
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Location</label>
              <input 
                type="text" 
                value={formData.contact?.location || ''} 
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, location: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Placeholder Name</label>
              <input 
                type="text" 
                value={formData.contact?.placeholderName || ''} 
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, placeholderName: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Placeholder Email</label>
              <input 
                type="text" 
                value={formData.contact?.placeholderEmail || ''} 
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, placeholderEmail: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Placeholder Message</label>
              <input 
                type="text" 
                value={formData.contact?.placeholderMessage || ''} 
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, placeholderMessage: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">GitHub Link</label>
              <input 
                type="text" 
                value={formData.contact?.github || ''} 
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, github: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">LinkedIn Link</label>
              <input 
                type="text" 
                value={formData.contact?.linkedin || ''} 
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, linkedin: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Telegram Link</label>
              <input 
                type="text" 
                value={formData.contact?.telegram || ''} 
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, telegram: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Name Label</label>
              <input 
                type="text" 
                value={formData.contact?.name || ''} 
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, name: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Message Label</label>
              <input 
                type="text" 
                value={formData.contact?.message || ''} 
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, message: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Send Button</label>
            <input 
              type="text" 
              value={formData.contact?.send || ''} 
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, send: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-8">Footer Section</h3>
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Copyright Text</label>
              <input 
                type="text" 
                value={formData.footer?.rights || ''} 
                onChange={(e) => setFormData({ ...formData, footer: { ...formData.footer, rights: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Privacy Policy</label>
              <input 
                type="text" 
                value={formData.footer?.privacy || ''} 
                onChange={(e) => setFormData({ ...formData, footer: { ...formData.footer, privacy: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Terms of Service</label>
              <input 
                type="text" 
                value={formData.footer?.terms || ''} 
                onChange={(e) => setFormData({ ...formData, footer: { ...formData.footer, terms: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-8">SEO Section</h3>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">SEO Title</label>
            <input 
              type="text" 
              value={formData.seo?.title || ''} 
              onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">SEO Description</label>
            <textarea 
              rows={3}
              value={formData.seo?.description || ''} 
              onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, description: e.target.value } })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsTab({ projects }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteDoc(doc(db, 'projects', id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <p className="text-slate-400">Manage your portfolio projects.</p>
        <button 
          onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all font-bold"
        >
          <Plus size={20} />
          Add Project
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: any) => (
          <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group">
            <div className="aspect-video relative overflow-hidden">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  onClick={() => { setEditingProject(project); setIsModalOpen(true); }}
                  className="p-3 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform"
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(project.id)}
                  className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-lg font-bold text-white mb-2">{project.title}</h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies?.map((tech: string) => (
                  <span key={tech} className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold uppercase text-slate-500">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <ProjectModal 
          project={editingProject} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}

function ProjectModal({ project, onClose }: any) {
  const [formData, setFormData] = useState(project || {
    title: '',
    description: '',
    image: '',
    gallery: [],
    technologies: '',
    github: '',
    demo: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const data = {
      ...formData,
      technologies: typeof formData.technologies === 'string' 
        ? formData.technologies.split(',').map((s: string) => s.trim()) 
        : formData.technologies,
      gallery: formData.gallery || [],
      createdAt: project ? project.createdAt : serverTimestamp()
    };

    try {
      if (project) {
        await updateDoc(doc(db, 'projects', project.id), data);
      } else {
        await addDoc(collection(db, 'projects'), data);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error saving project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGalleryImage = (url: string) => {
    if (!url) return;
    setFormData({ ...formData, gallery: [...(formData.gallery || []), url] });
  };

  const handleRemoveGalleryImage = (index: number) => {
    const newGallery = [...(formData.gallery || [])];
    newGallery.splice(index, 1);
    setFormData({ ...formData, gallery: newGallery });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2rem] p-8 relative z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-white">{project ? 'Edit Project' : 'New Project'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <ImageUploadInput 
              label="Image URL" 
              placeholder="https://..."
              value={formData.image} 
              onChange={(val) => setFormData({ ...formData, image: val })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Description</label>
            <textarea 
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Gallery Images (Qo'shimcha rasmlar)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {formData.gallery?.map((img: string, idx: number) => (
                <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-800">
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            <ImageUploadInput 
              label="Add Gallery Image" 
              placeholder="Upload additional image..."
              value="" 
              onChange={(val) => handleAddGalleryImage(val)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Technologies (comma separated)</label>
            <input 
              type="text" 
              value={Array.isArray(formData.technologies) ? formData.technologies.join(', ') : formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">GitHub Link</label>
              <input 
                type="text" 
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Demo Link</label>
              <input 
                type="text" 
                value={formData.demo}
                onChange={(e) => setFormData({ ...formData, demo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Project'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function MessagesTab({ messages }: any) {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'messages', id), { status: 'read' });
  };

  const deleteMessage = async (id: string) => {
    if (confirm('Delete this message?')) {
      await deleteDoc(doc(db, 'messages', id));
      setSelectedMessage(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col max-h-[70vh]">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-bold text-white">Inbox</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.map((msg: any) => (
            <button
              key={msg.id}
              onClick={() => { setSelectedMessage(msg); markAsRead(msg.id); }}
              className={`w-full p-4 text-left border-b border-slate-800 transition-colors flex gap-4 ${
                selectedMessage?.id === msg.id ? 'bg-blue-600/10' : 'hover:bg-slate-800'
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${msg.status === 'unread' ? 'bg-blue-600' : 'bg-transparent'}`} />
              <div className="min-w-0">
                <h4 className={`text-sm font-bold truncate ${msg.status === 'unread' ? 'text-white' : 'text-slate-400'}`}>
                  {msg.name}
                </h4>
                <p className="text-xs text-slate-500 truncate mb-1">{msg.email}</p>
                <p className="text-xs text-slate-400 truncate">{msg.message}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 min-h-[500px] flex flex-col">
        {selectedMessage ? (
          <>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{selectedMessage.name}</h3>
                <p className="text-blue-400 font-medium">{selectedMessage.email}</p>
                <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                  <Clock size={14} />
                  {selectedMessage.createdAt?.toDate ? format(selectedMessage.createdAt.toDate(), 'PPP p') : 'Just now'}
                </p>
              </div>
              <button 
                onClick={() => deleteMessage(selectedMessage.id)}
                className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex-1">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </p>
            </div>
            <div className="mt-8">
              <a 
                href={`mailto:${selectedMessage.email}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                Reply via Email
                <ChevronRight size={18} />
              </a>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
            <MessageSquare size={64} className="opacity-20" />
            <p className="font-medium">Select a message to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsTab({ content }: any) {
  const [formData, setFormData] = useState(content?.contact || {});
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'settings', 'global'), { contact: formData });
      alert('Settings updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Error updating settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return;
    setIsChangingPassword(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        alert('Password updated successfully!');
        setNewPassword('');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating password. You might need to re-authenticate.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-white">Contact Information</h3>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Save' : 'Save'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Email Address</label>
            <input 
              type="email" 
              value={formData.email || ''} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Phone Number</label>
            <input 
              type="text" 
              value={formData.phone || ''} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Location</label>
            <input 
              type="text" 
              value={formData.location || ''} 
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">GitHub URL</label>
              <input 
                type="text" 
                value={formData.github || ''} 
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">LinkedIn URL</label>
              <input 
                type="text" 
                value={formData.linkedin || ''} 
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // For this specific requirement, we use admin/123
    // But we'll use Firebase Auth for the session.
    // We'll map admin/123 to a specific firebase user if possible, 
    // or just use a dedicated admin email.
    // The user requested: Username: admin or email, Password: musoxon
    
    if ((username === 'admin' || username === 'musoxonmaxmudov37@gmail.com') && password === 'musoxon') {
      try {
        console.log('Attempting sign-in for:', 'musoxonmaxmudov37@gmail.com');
        // Try to sign in first
        await signInWithEmailAndPassword(auth, 'musoxonmaxmudov37@gmail.com', 'musoxon');
        console.log('Sign-in successful');
      } catch (err: any) {
        console.error('Login error code:', err.code);
        console.error('Login error message:', err.message);
        
        // Always show invalid credentials for simplicity and security
        setError('Invalid username or password.');
      }
    } else {
      setError('Invalid username or password.');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, 'musoxonmaxmudov37@gmail.com');
      setError('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError('Failed to send password reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <Link 
          to="/" 
          className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        
        <div className="text-center mb-10 mt-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
            <LayoutDashboard className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-slate-400">Enter your credentials to access the dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 focus:outline-none focus:border-blue-600 transition-colors text-white"
              placeholder="admin"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 focus:outline-none focus:border-blue-600 transition-colors text-white pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-blue-500 hover:text-blue-400 ml-1"
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Login to Dashboard'}
            {!isLoading && <ChevronRight size={20} />}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8">
          Secure access for Musoxon Maxmudov
        </p>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  Linkedin, 
  Instagram, 
  Send, 
  Phone, 
  Mail, 
  ChevronRight, 
  ChevronLeft,
  Code2, 
  Palette, 
  Globe, 
  Cpu,
  Menu,
  X,
  ExternalLink,
  Languages,
  Sun,
  Moon,
  MapPin,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations, Language } from '../translations';
import ThreeSphere from './ThreeSphere';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, getDoc, updateDoc, setDoc, increment } from 'firebase/firestore';
import { Project, WebsiteContent } from '../types';
import { format } from 'date-fns';

// --- Components ---

const Navbar = ({ lang, setLang, theme, toggleTheme, content }: { 
  lang: Language, 
  setLang: (l: Language) => void,
  theme: 'light' | 'dark',
  toggleTheme: () => void,
  content: WebsiteContent | null
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[lang].nav;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.about, href: '#about' },
    { name: t.skills, href: '#skills' },
    { name: t.education, href: '#education' },
    { name: t.projects, href: '#projects' },
    { name: t.contact, href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <motion.a 
          href="#" 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-gradient flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 relative">
            <Code2 className="absolute text-brand-accent-cyan opacity-50" size={20} />
            <img 
              src={content?.hero?.logo || "/logo.png"} 
              alt="MusoDev Logo" 
              className="w-full h-full object-cover relative z-10"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0';
              }}
            />
          </div>
          MusoDev
        </motion.a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-xs lg:text-sm font-medium text-slate-900 dark:text-slate-400 hover:text-brand-accent-cyan transition-colors"
            >
              {link.name}
            </motion.a>
          ))}
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full glass glass-hover text-brand-accent-cyan"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} lg:size={18} /> : <Sun size={16} lg:size={18} />}
            </button>

            <div className="flex items-center gap-1 lg:gap-2 glass rounded-full px-2 lg:px-3 py-1">
              <Languages size={14} lg:size={16} className="text-brand-accent-cyan" />
              {(['en', 'ru', 'uz'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-[10px] lg:text-xs font-bold uppercase px-1 transition-colors ${lang === l ? 'text-brand-accent-cyan' : 'text-slate-900 dark:text-slate-500 hover:text-slate-400'}`}
                >
                  {l}
                </button>
              ))}
            </div>

            <Link
              to="/admin"
              className="p-2 rounded-full glass glass-hover text-brand-accent-cyan"
              title="Admin Panel"
            >
              <Shield size={16} lg:size={18} />
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-slate-900 dark:text-slate-200" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t-0 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-slate-900 dark:text-slate-300 hover:text-brand-accent-cyan"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                <div className="flex gap-4">
                  {(['en', 'ru', 'uz'] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setIsMobileMenuOpen(false); }}
                      className={`text-sm font-bold uppercase ${lang === l ? 'text-brand-accent-cyan' : 'text-slate-900 dark:text-slate-500'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to="/admin"
                    className="p-2 rounded-full glass text-brand-accent-cyan"
                    title="Admin Panel"
                  >
                    <Shield size={18} />
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full glass text-brand-accent-cyan"
                  >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ lang, content }: { lang: Language, content: WebsiteContent | null }) => {
  const t = translations[lang].hero;
  const hero = {
    name: content?.hero?.name || 'Musoxon Maxmudov',
    title: content?.hero?.title || t.subtitle,
    subtitle: content?.hero?.subtitle || t.intro
  };
  
  return (
    <section className="relative py-24 md:min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-accent-cyan/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-accent-blue/10 rounded-full blur-[120px]" />
      
      <div className="max-w-7xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-brand-accent-cyan font-mono text-sm tracking-widest uppercase mb-4">
            {hero.title}
          </h2>
          <motion.h1 
            className="text-5xl md:text-8xl font-bold mb-6 tracking-tight flex flex-wrap justify-center gap-x-4 cursor-pointer"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {hero.name.split(' ').map((word, i) => (
              <span key={i} className="text-gradient">{word}</span>
            ))}
          </motion.h1>
          <p className="max-w-2xl mx-auto text-slate-900 dark:text-slate-400 text-lg md:text-xl mb-10 leading-relaxed">
            {hero.subtitle}
          </p>
          
          <div className="flex justify-center gap-6">
            {[
              { icon: <Send size={20} />, href: content?.contact.telegram || 'https://t.me/Maxmudovv_Dev', label: 'Telegram' },
              { icon: <Instagram size={20} />, href: 'https://instagram.com/musoxon_maxmudov_', label: 'Instagram' },
              { icon: <Linkedin size={20} />, href: content?.contact.linkedin || 'https://www.linkedin.com/in/musoxon-maxmudov-1a1479381/', label: 'LinkedIn' },
              { icon: <Github size={20} />, href: content?.contact.github || 'https://github.com/musoxonmaxmudov37-wq', label: 'GitHub' },
            ].map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="w-12 h-12 glass rounded-full flex items-center justify-center text-slate-900 dark:text-slate-400 hover:text-brand-accent-cyan hover:border-brand-accent-cyan/50 transition-all"
                title={social.label}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const About = ({ lang, content }: { lang: Language, content: WebsiteContent | null }) => {
  const t = translations[lang].about;
  const about = content?.about || { title: t.title, content: t.content, experience: '2+', completed: '10+', image: '' };
  
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="flex justify-center">
              <div className="w-3/4 aspect-square rounded-3xl overflow-hidden glass p-4">
                <img 
                  src={about.image || "profile.png"} 
                  alt="Musoxon Maxmudov" 
                  className="w-full h-full object-cover rounded-2xl hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/musoxon/800/800';
                  }}
                />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-accent-blue/20 rounded-full blur-3xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-brand-text mb-6">
              {about.title}
            </h2>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                {about.content}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-brand-accent-cyan font-bold text-2xl mb-1">{about.experience}</h4>
                  <p className="text-slate-900 dark:text-slate-500 text-sm uppercase tracking-wider">{t.experience}</p>
                </div>
                <div>
                  <h4 className="text-brand-accent-blue font-bold text-2xl mb-1">{about.completed}</h4>
                  <p className="text-slate-900 dark:text-slate-500 text-sm uppercase tracking-wider">{t.completed}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Skills = ({ lang, content }: { lang: Language, content: WebsiteContent | null }) => {
  const t = translations[lang].skills;
  const skills = content?.skills || { title: t.title };
  
  const skillGroups = [
    { name: 'Frontend', icon: <Globe />, skills: ['HTML', 'CSS', 'JavaScript'], color: 'cyan' },
    { name: 'Backend', icon: <Cpu />, skills: ['Python', 'Node.JS', 'PostgreSQL'], color: 'blue' },
    { name: 'Design', icon: <Palette />, skills: ['Figma', 'UI/UX', '3D Modelling', 'Branding'], color: 'cyan' },
    { name: 'Tools', icon: <Code2 />, skills: ['Git', 'Microsoft Office', 'Vercel', '3DsMAX', 'AutoCad', 'Twinmotion', 'Lumion'], color: 'blue' },
  ];

  return (
    <section id="skills" className="py-24 bg-slate-100/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-brand-text mb-16">{skills.title}</h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillGroups.map((group, i) => (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${group.color === 'cyan' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                {group.icon}
              </div>
              <h3 className="text-xl font-bold text-brand-text mb-4 text-left">{group.name}</h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-slate-200/50 dark:bg-white/5 rounded-full text-xs text-slate-900 dark:text-slate-400 border border-slate-300 dark:border-white/5">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Education = ({ lang, content }: { lang: Language, content: WebsiteContent | null }) => {
  const t = translations[lang].education;
  const education = content?.education || { title: t.title };
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItem = t.items[activeIndex] || t.items[0];

  return (
    <section id="education" className="py-16 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-32 h-32 md:w-64 md:h-64 bg-brand-accent-blue/5 rounded-full blur-[60px] md:blur-[100px] -z-10" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text flex items-center gap-4">
            {education.title} <span className="w-12 h-[2px] bg-brand-accent-blue/30" />
          </h2>
        </div>

        <div className="space-y-4">
          {t.items.map((item, i) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === i ? -1 : i)}
                className="w-full px-6 py-5 text-left flex justify-between items-center font-bold text-lg text-slate-900 dark:text-white"
              >
                {item.institution}
                <ChevronRight className={`transition-transform ${activeIndex === i ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>
                {activeIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="h-[1px] w-8 bg-brand-accent-blue" />
                      <p className="text-brand-accent-blue font-bold text-sm uppercase tracking-wider">
                        {item.specialization}
                      </p>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Projects = ({ lang, projects, content }: { lang: Language, projects: Project[], content: WebsiteContent | null }) => {
  const t = translations[lang].projects;
  const projectsContent = content?.projects || { title: t.title, viewAll: t.viewAll, viewProject: t.viewProject };
  const [lightbox, setLightbox] = useState<{images: string[], index: number} | null>(null);
  
  const displayProjects = projects.length > 0 ? projects : t.items.map((p: any, i) => ({
    id: `fallback-${i}`,
    title: p.title,
    description: p.description,
    image: `https://picsum.photos/seed/project${i}/600/400`,
    gallery: [],
    technologies: [],
    github: p.github || '#',
    demo: p.demo || '#',
    createdAt: new Date()
  }));

  const openLightbox = (project: Project, startIndex: number) => {
    const images = [project.image, ...(project.gallery || [])];
    setLightbox({ images, index: startIndex });
  };
  
  return (
    <section id="projects" className="py-16 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-text">{projectsContent.title}</h2>
          </div>
          <a href="#" className="text-brand-accent-cyan flex items-center gap-2 font-bold hover:gap-3 transition-all">
            {projectsContent.viewAll} <ChevronRight size={20} />
          </a>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displayProjects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <div 
                className="aspect-video overflow-hidden relative cursor-pointer"
                onClick={() => openLightbox(project, 0)}
              >
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <a href={project.demo} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-4 bg-white text-brand-bg rounded-full glow-white hover:scale-110 transition-transform">
                      <ExternalLink size={24} />
                   </a>
                   <a href={project.github} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-4 bg-white text-brand-bg rounded-full glow-white hover:scale-110 transition-transform">
                      <Github size={24} />
                   </a>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{project.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
                
                {project.gallery && project.gallery.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-4 mb-4 snap-x">
                    {project.gallery.map((img: string, idx: number) => (
                      <button 
                        key={idx} 
                        onClick={() => openLightbox(project, idx + 1)}
                        className="flex-shrink-0 snap-center focus:outline-none"
                      >
                        <img 
                          src={img} 
                          alt={`${project.title} gallery ${idx + 1}`} 
                          className="h-16 w-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies?.map((tech: string) => (
                    <span key={tech} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {tech}
                    </span>
                  ))}
                </div>
                <a href={project.demo} target="_blank" rel="noreferrer" className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-xl text-slate-900 dark:text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                  {projectsContent.viewProject}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button 
              onClick={() => setLightbox(null)} 
              className="absolute top-6 right-6 text-white/70 hover:text-white z-[101] bg-black/50 p-2 rounded-full"
            >
              <X size={24} />
            </button>
            
            {lightbox.images.length > 1 && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length });
                }}
                className="absolute left-4 md:left-8 text-white/70 hover:text-white z-[101] bg-black/50 p-3 rounded-full"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            <img 
              src={lightbox.images[lightbox.index]} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg" 
              alt="Gallery" 
              onClick={(e) => e.stopPropagation()}
            />

            {lightbox.images.length > 1 && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length });
                }}
                className="absolute right-4 md:right-8 text-white/70 hover:text-white z-[101] bg-black/50 p-3 rounded-full"
              >
                <ChevronRight size={32} />
              </button>
            )}
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 bg-black/50 px-4 py-2 rounded-full text-sm font-medium">
              {lightbox.index + 1} / {lightbox.images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Contact = ({ lang, content }: { lang: Language, content: WebsiteContent | null }) => {
  const t = translations[lang].contact;
  const contactContent = {
    title: content?.contact?.title || t.title,
    intro: content?.contact?.intro || t.intro,
    email: content?.contact?.email || 'musoxonmaxmudov37@gmail.com',
    phone: content?.contact?.phone || '+998 91 051 50 31',
    location: content?.contact?.location || 'Namangan, O\'zbekiston',
    name: content?.contact?.name || t.name,
    message: content?.contact?.message || t.message,
    send: content?.contact?.send || t.send,
    placeholderName: content?.contact?.placeholderName || t.placeholderName,
    placeholderEmail: content?.contact?.placeholderEmail || t.placeholderEmail,
    placeholderMessage: content?.contact?.placeholderMessage || t.placeholderMessage,
    github: content?.contact?.github || 'https://github.com/Maxmudovv-Dev',
    linkedin: content?.contact?.linkedin || '#',
    telegram: content?.contact?.telegram || 'https://t.me/Maxmudovv_Dev'
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <section id="contact" className="py-16 bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                {t.title}
              </span>
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
              {(contactContent.intro || '').split('.')[0]}.
            </h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-md leading-relaxed font-light">
              {(contactContent.intro || '').split('.').slice(1).join('.')}
            </p>
            
            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{t.email}</p>
                  <a href={`mailto:${contactContent.email}`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                    {contactContent.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{t.phone}</p>
                  <a href={`tel:${contactContent.phone}`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                    {contactContent.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{t.location}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {contactContent.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {[
                { icon: <Github size={20} />, href: contactContent.github, label: 'GitHub' },
                { icon: <Linkedin size={20} />, href: contactContent.linkedin, label: 'LinkedIn' },
                { icon: <Send size={20} />, href: contactContent.telegram, label: 'Telegram' }
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-md"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 bg-white dark:bg-slate-900 p-6 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative"
          >
            <form className="space-y-8" onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const email = formData.get('email') as string;
              const message = formData.get('message') as string;

              try {
                await addDoc(collection(db, 'messages'), {
                  name,
                  email,
                  message,
                  status: 'unread',
                  createdAt: serverTimestamp()
                });
                alert(t.success);
                (e.target as HTMLFormElement).reset();
              } catch (error) {
                console.error(error);
                alert(t.error);
              } finally {
                setIsSubmitting(false);
              }
            }}>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-200 ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  {contactContent.name}
                </label>
                <input 
                  name="name"
                  type="text" 
                  required
                  placeholder={contactContent.placeholderName}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-200 ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  {contactContent.email}
                </label>
                <input 
                  name="email"
                  type="email" 
                  required
                  placeholder={contactContent.placeholderEmail}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-200 ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  {contactContent.message}
                </label>
                <textarea 
                  name="message"
                  rows={4}
                  required
                  placeholder={contactContent.placeholderMessage}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-slate-900 dark:text-white resize-none placeholder:text-slate-400 font-medium"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 text-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Sending...' : contactContent.send} 
                <Send size={20} className={isSubmitting ? 'animate-pulse' : ''} />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ lang, content }: { lang: Language, content: WebsiteContent | null }) => {
  const t = content?.footer || translations[lang].footer;
  return (
    <footer className="py-12 border-t border-black/5 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          © {new Date().getFullYear()} Musoxon Maxmudov. {t.rights}
        </p>
        <div className="flex gap-6 text-sm">
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.privacy}</a>
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.terms}</a>
        </div>
      </div>
    </footer>
  );
};

export default function Portfolio() {
  const [lang, setLang] = useState<Language>('uz');
  const [hasEntered, setHasEntered] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Track visitor
    const trackVisitor = async () => {
      if (sessionStorage.getItem('hasVisited')) return;
      
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const statRef = doc(db, 'stats', today);
        await setDoc(statRef, { date: today, count: increment(1) }, { merge: true });
        sessionStorage.setItem('hasVisited', 'true');
      } catch (e) {
        console.error("Failed to track visitor:", e);
      }
    };
    trackVisitor();

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    // Fetch Projects
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projs);
    });

    // Fetch Content
    const unsubscribeContent = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setContent(doc.data() as WebsiteContent);
      }
    });

    return () => {
      unsubscribeProjects();
      unsubscribeContent();
    };
  }, []);

  useEffect(() => {
    if (projects !== null && content !== null) {
      setIsLoading(false);
    }
  }, [projects, content]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-accent-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <AnimatePresence mode="wait">
        {!hasEntered ? (
          <ThreeSphere key="landing" lang={lang} onEnter={() => setHasEntered(true)} />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <Navbar lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} content={content} />
            <Hero lang={lang} content={content} />
            <About lang={lang} content={content} />
            <Skills lang={lang} content={content} />
            <Education lang={lang} content={content} />
            <Projects lang={lang} projects={projects || []} content={content} />
            <Contact lang={lang} content={content} />
            <Footer lang={lang} content={content} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

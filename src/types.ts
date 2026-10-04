export interface Project {
  id?: string;
  title: string;
  description: string;
  image: string;
  gallery?: string[];
  technologies: string[];
  github: string;
  demo: string;
  createdAt: any;
}

export interface Message {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
  status: 'read' | 'unread';
}

export interface WebsiteContent {
  hero: {
    name: string;
    title: string;
    subtitle: string;
    logo?: string;
  };
  about: {
    title: string;
    content: string;
    experience: string;
    completed: string;
    image?: string;
  };
  skills: {
    title: string;
  };
  education: {
    title: string;
  };
  projects: {
    title: string;
    viewAll: string;
    viewProject: string;
  };
  contact: {
    title: string;
    intro: string;
    email: string;
    phone: string;
    location: string;
    name: string;
    message: string;
    send: string;
    placeholderName: string;
    placeholderEmail: string;
    placeholderMessage: string;
    github: string;
    linkedin: string;
    telegram: string;
  };
  footer: {
    rights: string;
    privacy: string;
    terms: string;
  };
  seo: {
    title: string;
    description: string;
  };
}

export interface VisitorStat {
  date: string;
  count: number;
}

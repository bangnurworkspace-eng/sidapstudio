export interface Project {
  id: string;
  title: string;
  category: string;
  location: string;
  image: string;
  year: string;
  description?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: any;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
}

export interface Article {
  id: string;
  title: string;
  date: string;
  category: string;
  image: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  quote?: string;
  image: string;
  order: number;
  specialties?: string[];
  socials?: {
    instagram?: string;
    linkedin?: string;
    email?: string;
    portfolio?: string;
  };
}

export interface GalleryItem {
  id: string;
  url: string;
  name?: string;
  title?: string;
  category?: 'Architecture' | 'Interior' | string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}


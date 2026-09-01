/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SmoothScroll } from './components/ui/SmoothScroll';
import { ScrollProgress } from './components/ui/ScrollProgress';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { BackgroundAtmosphere } from './components/ui/BackgroundAtmosphere';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy loaded routes
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const AdminLayout = lazy(() => import('./admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const Dashboard = lazy(() => import('./admin/Dashboard').then(m => ({ default: m.Dashboard })));
const ProjectsAdmin = lazy(() => import('./admin/ProjectsAdmin').then(m => ({ default: m.ProjectsAdmin })));
const HeroAdmin = lazy(() => import('./admin/HeroAdmin').then(m => ({ default: m.HeroAdmin })));
const AboutAdmin = lazy(() => import('./admin/AboutAdmin').then(m => ({ default: m.AboutAdmin })));
const ServicesAdmin = lazy(() => import('./admin/ServicesAdmin').then(m => ({ default: m.ServicesAdmin })));
const TestimonialsAdmin = lazy(() => import('./admin/TestimonialsAdmin').then(m => ({ default: m.TestimonialsAdmin })));
const ContactAdmin = lazy(() => import('./admin/ContactAdmin').then(m => ({ default: m.ContactAdmin })));
const FAQAdmin = lazy(() => import('./admin/FAQAdmin').then(m => ({ default: m.FAQAdmin })));
const GalleryAdmin = lazy(() => import('./admin/GalleryAdmin').then(m => ({ default: m.GalleryAdmin })));
const TeamAdmin = lazy(() => import('./admin/TeamAdmin').then(m => ({ default: m.TeamAdmin })));
const FooterAdmin = lazy(() => import('./admin/FooterAdmin').then(m => ({ default: m.FooterAdmin })));
const WebsiteSettings = lazy(() => import('./admin/WebsiteSettings').then(m => ({ default: m.WebsiteSettings })));
const NewsAdmin = lazy(() => import('./admin/NewsAdmin').then(m => ({ default: m.NewsAdmin })));
const News = lazy(() => import('./pages/News').then(m => ({ default: m.News })));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const ProjectsList = lazy(() => import('./pages/Projects').then(m => ({ default: m.Projects })));
const ProjectCategory = lazy(() => import('./pages/ProjectCategory').then(m => ({ default: m.ProjectCategory })));
const NotFound = lazy(() => import('./pages/NotFound'));
const Maintenance = lazy(() => import('./pages/Maintenance'));

export default function App() {
  // Feature flag for maintenance mode
  const isMaintenanceMode = false;

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <SmoothScroll>
            <ScrollProgress />
            <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-[#222222] dark:text-[#F8F8F8] selection:bg-light-accent dark:selection:bg-dark-accent selection:text-white dark:selection:text-black transition-colors duration-500">
              <BackgroundAtmosphere />
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {isMaintenanceMode ? (
                    <Route path="*" element={<Maintenance />} />
                  ) : (
                    <>
                      <Route path="/" element={<Home />} />
                      <Route path="/news" element={<News />} />
                      <Route path="/news/:id" element={<ProjectDetail />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/project/:id" element={<ProjectDetail />} />
                      <Route path="/projects" element={<ProjectsList />} />
                      <Route path="/projects/:category" element={<ProjectCategory />} />
                      
                      <Route path="/admin" element={<ProtectedRoute />}>
                        <Route element={<AdminLayout />}>
                          <Route index element={<Dashboard />} />
                          <Route path="hero" element={<HeroAdmin />} />
                          <Route path="about" element={<AboutAdmin />} />
                          <Route path="services" element={<ServicesAdmin />} />
                          <Route path="projects" element={<ProjectsAdmin />} />
                          <Route path="news" element={<NewsAdmin />} />
                          <Route path="testimonials" element={<TestimonialsAdmin />} />
                          <Route path="contact" element={<ContactAdmin />} />
                          <Route path="faq" element={<FAQAdmin />} />
                          <Route path="gallery" element={<GalleryAdmin />} />
                          <Route path="team" element={<TeamAdmin />} />
                          <Route path="footer" element={<FooterAdmin />} />
                          <Route path="settings" element={<WebsiteSettings />} />
                          <Route path="*" element={<div className="p-8 text-center text-gray-500"><h2 className="text-2xl font-bold mb-2">Coming Soon</h2><p>This module is under construction.</p></div>} />
                        </Route>
                      </Route>
                      
                      <Route path="*" element={<NotFound />} />
                    </>
                  )}
                </Routes>
              </Suspense>
            </div>
          </SmoothScroll>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

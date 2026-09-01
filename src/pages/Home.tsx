import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProjectShowcase } from '../components/ProjectShowcase';
import { Projects } from '../components/Projects';
import { NewsSection } from '../components/NewsSection';
import { Gallery } from '../components/Gallery';
import { About } from '../components/About';
import { ManBehindProject } from '../components/ManBehindProject';
import { Services } from '../components/Services';
import { Testimonials } from '../components/Testimonials';
import { Contact } from '../components/Contact';
import { Footer } from '../components/Footer';
import { BackToTop } from '../components/ui/BackToTop';

export function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProjectShowcase />
        <About />
        <Projects />
        <NewsSection />
        <Gallery />
        <ManBehindProject />
        <Services />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}

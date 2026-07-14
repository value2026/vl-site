import Hero from '../components/Hero';
import FeaturedSimulation from '../components/FeaturedSimulation';
import CTASection from '../components/CTASection';
import SponsorsSection from '../components/SponsorsSection';
import LabCategories from '../components/LabCategories';
import NewsSection from '../components/NewsSection';
import MediaSection from '../components/MediaSection';

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedSimulation />
      <CTASection />
      <SponsorsSection />
      <LabCategories />
      <NewsSection />
      <MediaSection />
    </main>
  );
}

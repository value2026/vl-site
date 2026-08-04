import Hero               from './Hero';
import FeaturedSimulation  from './FeaturedSimulation';
import CTASection          from './CTASection';
import SponsorsSection     from './SponsorsSection';
import LabCategories       from './LabCategories';
import NewsSection         from './NewsSection';
import MediaSection        from './MediaSection';
import AdBanner            from './AdBanner';

const SECTION_MAP = {
  hero:                Hero,
  featured_simulation: FeaturedSimulation,
  cta:                 CTASection,
  sponsors:            SponsorsSection,
  lab_categories:      LabCategories,
  news:                NewsSection,
  media:               MediaSection,
  ad_banner:           AdBanner,
};

/**
 * Renders a home page section from a PageSection DB record.
 * Falls back gracefully if the sectionKey is unknown.
 */
export default function SectionRenderer({ section, allSections }) {
  const Component = SECTION_MAP[section.sectionKey];
  if (!Component) return null;

  return (
    <Component
      key={section.id}
      sectionTitle={section.title}
      sectionSubtitle={section.subtitle}
      content={section.content ?? {}}
      allSections={allSections}
    />
  );
}

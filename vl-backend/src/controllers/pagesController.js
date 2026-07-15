const { PrismaClient } = require('../generated/client');
const prisma = new PrismaClient();

// Default section data for the home page
const HOME_DEFAULTS = [
  {
    sectionKey: 'hero',
    label: 'Hero Section',
    order: 0,
    title: 'Learn Science Without Limits',
    subtitle: 'Access 1,800+ virtual experiments across 700 labs from IITs, NITs, and leading institutions — free, anywhere, anytime.',
    content: {
      badge: 'Ministry of Education Initiative · NMEICT',
      heading: 'Learn Science Without Limits',
      subheading: 'Access <strong>1,800+ virtual experiments</strong> across 700 labs from IITs, NITs, and leading institutions — free, anywhere, anytime.',
      ctaPrimaryLabel: 'Explore Labs',
      ctaPrimaryHref: '/labs/biotechnology',
      ctaSecondaryLabel: 'Watch Demo',
      ctaSecondaryHref: 'https://www.youtube.com/watch?v=ViqHtlZSOjM',
      stats: [
        { n: '700+', label: 'Virtual Labs' },
        { n: '1,800+', label: 'Experiments' },
        { n: '14', label: 'Partner IITs/NITs' },
        { n: '5M+', label: 'Students' },
      ],
    },
  },
  {
    sectionKey: 'featured_simulation',
    label: 'Featured Simulation',
    order: 1,
    title: 'Featured Simulation',
    subtitle: 'Hand-picked by our academic council for exceptional learning outcomes.',
    content: {
      tag: 'Physics',
      category: 'Mechanics',
      title: 'Simple Pendulum Simulation',
      description: 'Explore the physics of oscillatory motion with our interactive pendulum simulation. Adjust parameters like length, mass, and gravity to observe real-time changes.',
      institution: 'IIT Bombay',
      duration: '45 min',
      difficulty: 'Intermediate',
      experiments: 12,
      href: '/simulations/pendulum',
    },
  },
  {
    sectionKey: 'cta',
    label: 'Call to Action',
    order: 2,
    title: 'Take the Next Step',
    subtitle: "Whether you're a student, faculty, or institution — Virtual Labs has something for you.",
    content: {
      sectionTag: 'Get Involved',
      cards: [
        {
          id: 'brochure',
          icon: 'Download',
          title: 'Download Brochure',
          description: 'Get the complete guide to Virtual Labs including lab list, institution details, and usage instructions.',
          action: 'Download PDF',
          href: '#',
          gradient: 'from-primary-800 to-primary-900',
        },
        {
          id: 'nodal',
          icon: 'MapPin',
          title: 'Become a Nodal Centre',
          description: 'Bring Virtual Labs to your institution. Apply to become a registered nodal centre and enable your students.',
          action: 'Apply Now',
          href: '/nodal-centres/apply',
          gradient: 'from-accent-500 to-blue-700',
        },
        {
          id: 'demo',
          icon: 'MonitorPlay',
          title: 'Register for Free Demo',
          description: 'Book a live online demonstration of Virtual Labs for your faculty and students — completely free of charge.',
          action: 'Register Free',
          href: '/nodal-centres/demo',
          gradient: 'from-secondary-500 to-orange-500',
        },
      ],
    },
  },
  {
    sectionKey: 'sponsors',
    label: 'Partners & Sponsors',
    order: 3,
    title: "Backed by India's Premier Institutions",
    subtitle: 'Virtual Labs is a collaborative project supported by IITs, NITs, and the Ministry of Education under the National Mission on Education through ICT.',
    content: {
      sectionTag: 'Our Partners',
      footerNote: '🇮🇳 A Government of India initiative to democratize quality STEM education',
      sponsors: [
        { id: 'moe', name: 'Ministry of Education', acronym: 'MoE', description: 'Government of India', color: 'from-orange-500 to-red-500' },
        { id: 'iit-bombay', name: 'IIT Bombay', acronym: 'IITB', description: 'Lead Institute', color: 'from-blue-600 to-blue-800' },
        { id: 'nmeict', name: 'NMEICT', acronym: 'NMEICT', description: 'National Mission', color: 'from-green-600 to-teal-700' },
        { id: 'iit-delhi', name: 'IIT Delhi', acronym: 'IITD', description: 'Partner Institute', color: 'from-purple-600 to-indigo-700' },
        { id: 'iit-madras', name: 'IIT Madras', acronym: 'IITM', description: 'Partner Institute', color: 'from-yellow-500 to-orange-600' },
      ],
    },
  },
  {
    sectionKey: 'ad_banner',
    label: 'Advertisement Banner',
    order: 4,
    title: 'Admissions Open 2026',
    subtitle: 'Amrita Vishwa Vidyapeetham',
    content: {
      heading: 'PhD Admissions 2026',
      institution: 'Amrita Vishwa Vidyapeetham',
      description: 'Join one of India\'s premier research universities. Fully funded PhD fellowships are available in engineering, biotechnology, physical sciences, and computing. Apply now to collaborate on cutting-edge Virtual Labs initiatives.',
      buttonLabel: 'Apply Now',
      buttonHref: 'https://amrita.edu/admissions',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop',
    },
  },
  {
    sectionKey: 'lab_categories',
    label: 'Lab Categories',
    order: 5,
    title: 'Explore by Discipline',
    subtitle: 'From quantum physics to molecular biology — our labs span every branch of science and engineering.',
    content: {
      sectionTag: 'Lab Categories',
    },
  },
  {
    sectionKey: 'news',
    label: 'News & Events',
    order: 6,
    title: 'News & Events',
    subtitle: 'Latest updates from Virtual Labs',
    content: {
      sectionTag: 'Latest Updates',
      viewAllHref: '/news',
      items: [
        {
          id: '1',
          title: 'Virtual Labs Reaches 5 Million Students Milestone',
          excerpt: 'The platform celebrates a major milestone as student registrations surpass 5 million across India, marking significant growth in digital education adoption.',
          date: 'June 28, 2025',
          category: 'Milestone',
          href: '/news/5-million-milestone',
        },
        {
          id: '2',
          title: 'New Physics Lab Collaboration with IIT Madras',
          excerpt: 'A groundbreaking partnership brings 24 new quantum mechanics experiments to the platform.',
          date: 'June 15, 2025',
          category: 'Partnership',
          href: '/news/iit-madras-physics',
        },
        {
          id: '3',
          title: 'Annual Workshop on Virtual Lab Integration',
          excerpt: '300+ educators participate in the annual workshop on integrating virtual labs into curricula.',
          date: 'June 3, 2025',
          category: 'Workshop',
          href: '/news/annual-workshop-2025',
        },
        {
          id: '4',
          title: 'Mobile App Beta Launch for Android',
          excerpt: 'Virtual Labs launches its first mobile application, bringing experiments to smartphones.',
          date: 'May 20, 2025',
          category: 'Technology',
          href: '/news/mobile-app-beta',
        },
      ],
    },
  },
  {
    sectionKey: 'media',
    label: 'Media & Gallery',
    order: 7,
    title: 'See It in Action',
    subtitle: 'Explore how students and educators are transforming STEM learning with Virtual Labs.',
    content: {
      sectionTag: 'Media',
      videos: [
        {
          id: 'v1',
          title: 'Amrita VALUE Virtual Labs Introduction',
          duration: '3:05 · Official Overview',
          videoUrl: 'https://www.youtube.com/watch?v=ViqHtlZSOjM',
          thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
        },
        {
          id: 'v2',
          title: 'Virtual Labs: A Virtual Learning Environment',
          duration: '6:58 · Demonstration',
          videoUrl: 'https://www.youtube.com/watch?v=IwxOpEUXm6A',
          thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60'
        }
      ],
    },
  },
];

// ── GET /api/pages/:slug/sections ─────────────────────────────
// Public — no auth needed. Returns all sections for a page slug.
async function getSections(req, res) {
  try {
    const { slug } = req.params;

    let page = await prisma.page.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Auto-seed if page doesn't exist yet
    if (!page) {
      if (slug === 'home') {
        page = await seedHomePage();
      } else {
        return res.status(404).json({ message: 'Page not found' });
      }
    }

    res.json(page.sections);
  } catch (err) {
    console.error('getSections error:', err);
    res.status(500).json({ message: 'Failed to fetch sections' });
  }
}

// ── PUT /api/pages/:slug/sections/:id ─────────────────────────
// Admin only. Update a section's content.
async function updateSection(req, res) {
  try {
    const { id } = req.params;
    const { title, subtitle, content, isVisible } = req.body;

    const section = await prisma.pageSection.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(content !== undefined && { content }),
        ...(isVisible !== undefined && { isVisible }),
        updatedAt: new Date(),
      },
    });

    res.json(section);
  } catch (err) {
    console.error('updateSection error:', err);
    res.status(500).json({ message: 'Failed to update section' });
  }
}

// ── PATCH /api/pages/:slug/sections/:id/visibility ────────────
// Admin only. Toggle visibility of a section.
async function toggleVisibility(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.pageSection.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Section not found' });

    const updated = await prisma.pageSection.update({
      where: { id },
      data: { isVisible: !existing.isVisible, updatedAt: new Date() },
    });

    res.json(updated);
  } catch (err) {
    console.error('toggleVisibility error:', err);
    res.status(500).json({ message: 'Failed to toggle visibility' });
  }
}

// ── PUT /api/pages/:slug/sections/reorder ─────────────────────
// Admin only. Accepts [{id, order}, ...] array.
async function reorderSections(req, res) {
  try {
    const { items } = req.body; // [{ id: string, order: number }]
    if (!Array.isArray(items)) return res.status(400).json({ message: 'items must be an array' });

    await Promise.all(
      items.map(({ id, order }) =>
        prisma.pageSection.update({
          where: { id },
          data: { order, updatedAt: new Date() },
        })
      )
    );

    res.json({ success: true });
  } catch (err) {
    console.error('reorderSections error:', err);
    res.status(500).json({ message: 'Failed to reorder sections' });
  }
}

// ── POST /api/pages/:slug/seed ────────────────────────────────
// Admin only. Re-seed the page with defaults.
async function seedPage(req, res) {
  try {
    const { slug } = req.params;
    if (slug !== 'home') return res.status(400).json({ message: 'Only home page seeding is supported' });

    const page = await seedHomePage();
    res.json(page.sections);
  } catch (err) {
    console.error('seedPage error:', err);
    res.status(500).json({ message: 'Failed to seed page' });
  }
}

// ── Internal helper ───────────────────────────────────────────
async function seedHomePage() {
  // Upsert the page record
  const page = await prisma.page.upsert({
    where: { slug: 'home' },
    update: { title: 'Home' },
    create: { slug: 'home', title: 'Home' },
  });

  // Upsert each section
  for (const sec of HOME_DEFAULTS) {
    await prisma.pageSection.upsert({
      where: { pageId_sectionKey: { pageId: page.id, sectionKey: sec.sectionKey } },
      update: {},  // Don't overwrite existing edits on re-seed
      create: {
        pageId: page.id,
        sectionKey: sec.sectionKey,
        label: sec.label,
        title: sec.title,
        subtitle: sec.subtitle,
        content: sec.content,
        isVisible: true,
        order: sec.order,
      },
    });
  }

  return prisma.page.findUnique({
    where: { slug: 'home' },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
}

module.exports = {
  getSections,
  updateSection,
  toggleVisibility,
  reorderSections,
  seedPage,
};

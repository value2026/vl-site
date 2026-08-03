const { PrismaClient } = require('../generated/client');
const prisma = new PrismaClient();
const { sendHostWorkshopRequestEmail } = require('../utils/mailer');

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
      heading: 'Build Your Future with\n*Emerging Technologies*\nand Create Impact.',
      subheading: 'Access <strong class="text-white">1,800+ virtual experiments</strong> across 700 labs from IITs, NITs, and leading institutions — free, anywhere, anytime.',
      ctaPrimaryLabel: 'Explore Labs',
      ctaPrimaryHref: '#labs-heading',
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
    title: "Sponsors of Virtual Labs",
    subtitle: 'This project is an initiative of Ministry of Human Resource Department under National Mission on Education through ICT. These experiments and labs will be hosted for open access through the main project website www.vlab.co.in.',
    content: {
      sectionTag: 'Our Sponsors',
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
    title: 'Explore Virtual Labs',
    subtitle: 'Discover interactive virtual laboratories across science, engineering, and emerging technologies. Explore experiments, strengthen practical skills, and learn through immersive, hands-on experiences.',
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

    // Auto-seed if page doesn't exist yet or is missing sections
    let needsSeed = false;
    if (!page) {
      needsSeed = true;
    } else {
      // Check if newly added sections are missing
      if (slug === 'nodal-centres' && page.sections.length < 5) needsSeed = true;
      if (slug === 'home' && page.sections.length < 7) needsSeed = true;
      if (slug === 'project' && page.sections.length < 4) needsSeed = true;
    }

    if (needsSeed) {
      if (slug === 'home') {
        page = await seedHomePage();
      } else if (slug === 'publications') {
        page = await seedPublicationsPage();
      } else if (slug === 'project') {
        page = await seedProjectPage();
      } else if (slug === 'nodal-centres') {
        page = await seedNodalCentresPage();
      } else if (slug === 'student-survey') {
        page = await seedStudentSurveyPage();
      } else if (slug === 'faculty-survey') {
        page = await seedFacultySurveyPage();
      } else if (slug === 'nodal-centre-request') {
        page = await seedNodalCentreRequestPage();
      } else if (slug === 'contact') {
        // Create an empty page for contact messages so it doesn't 404
        page = await prisma.page.upsert({
          where: { slug: 'contact' },
          update: {},
          create: { slug: 'contact', title: 'Contact Messages' }
        });
        page.sections = [];
      } else {
        return res.status(404).json({ message: 'Page not found' });
      }
    }

    res.json(page.sections || []);
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
    if (!['home', 'publications', 'project', 'nodal-centres', 'student-survey', 'faculty-survey'].includes(slug)) {
      return res.status(400).json({ message: 'Page seeding is not supported for this slug' });
    }

    let page;
    if (slug === 'home') page = await seedHomePage();
    else if (slug === 'publications') page = await seedPublicationsPage();
    else if (slug === 'project') page = await seedProjectPage();
    else if (slug === 'nodal-centres') page = await seedNodalCentresPage();
    else if (slug === 'student-survey') page = await seedStudentSurveyPage();
    else if (slug === 'faculty-survey') page = await seedFacultySurveyPage();
    else if (slug === 'nodal-centre-request') page = await seedNodalCentreRequestPage();
    
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
      update: {
        title: sec.title,
        subtitle: sec.subtitle,
        content: sec.content,
      },
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

async function seedPublicationsPage() {
  const page = await prisma.page.upsert({
    where: { slug: 'publications' },
    update: { title: 'Publications' },
    create: { slug: 'publications', title: 'Publications' },
  });

  const pubsSection = {
    sectionKey: 'publications_list',
    label: 'Publications List',
    order: 0,
    title: 'Research Publications',
    subtitle: 'Academic papers and research findings from the Virtual Labs initiative.',
    content: {
      items: [
        {
          id: 'p1',
          year: '2024',
          title: 'Impact of Virtual Labs on Student Learning Outcomes in Engineering Education',
          authors: 'Sharma, R., Verma, A., & Kumar, S.',
          journal: 'Journal of Engineering Education, Vol. 113(2)',
          doi: '#',
        },
        {
          id: 'p2',
          year: '2023',
          title: 'Remote Laboratory Access for Developing Nations: A Case Study',
          authors: 'Nair, P., Iyer, M., & Singh, D.',
          journal: 'IEEE Transactions on Education, Vol. 66(4)',
          doi: '#',
        }
      ]
    }
  };

  await prisma.pageSection.upsert({
    where: { pageId_sectionKey: { pageId: page.id, sectionKey: pubsSection.sectionKey } },
    update: {},
    create: {
      pageId: page.id,
      sectionKey: pubsSection.sectionKey,
      label: pubsSection.label,
      title: pubsSection.title,
      subtitle: pubsSection.subtitle,
      content: pubsSection.content,
      isVisible: true,
      order: pubsSection.order,
    },
  });

  return prisma.page.findUnique({
    where: { slug: 'publications' },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
}

async function seedProjectPage() {
  const page = await prisma.page.upsert({
    where: { slug: 'project' },
    update: { title: 'Project' },
    create: { slug: 'project', title: 'Project' },
  });

  const timelineSection = {
    sectionKey: 'project_timeline',
    label: 'Project Timeline',
    order: 0,
    title: 'Project Timeline',
    content: {
      items: [
        { year: '2009', title: 'Project Inception', desc: 'Virtual Labs launched under NMEICT Phase I with 5 partner institutions.' },
        { year: '2011', title: 'First 100 Labs', desc: 'Milestone of 100 virtual labs across engineering and science disciplines.' },
        { year: '2014', title: 'Phase II Expansion', desc: 'Expanded to 14 IITs and NITs; introduced remote-triggered labs.' },
        { year: '2017', title: 'Nodal Centre Network', desc: 'Over 800 nodal centres established across India.' },
        { year: '2021', title: 'New Platform Launch', desc: 'Revamped platform with improved UX, accessibility, and mobile support.' },
        { year: '2025', title: '5 Million Students', desc: 'Crossed 5 million experiment completions and 1,800+ experiments.' },
      ]
    }
  };

  const objectivesSection = {
    sectionKey: 'project_objectives',
    label: 'Project Objectives',
    order: 1,
    title: 'Project Objectives',
    content: {
      items: [
        { text: 'Provide remote access to labs in science and engineering disciplines' },
        { text: 'Develop a complete learning management system for virtual labs' },
        { text: 'Train students, researchers, and educators on the platform' },
        { text: 'Create a repository of open-access lab content' },
        { text: 'Foster collaboration between top institutions' },
        { text: 'Democratize quality STEM education for Tier-2 and Tier-3 cities' },
      ]
    }
  };

  const heroSection = {
    sectionKey: 'project_hero',
    label: 'Project Hero',
    order: -2,
    title: 'The Virtual Labs Project',
    subtitle: 'A Ministry of Education initiative to provide remote access to labs in science and engineering disciplines through a web-based platform — free for all students in India.',
    content: {
      tag: 'About the Project'
    }
  };

  const overviewSection = {
    sectionKey: 'project_overview',
    label: 'Project Overview',
    order: -1,
    title: 'What is Amrita Virtual Labs?',
    content: {
      tag: 'Overview',
      paragraph1: 'Amrita Virtual Labs is a major initiative by Amrita Vishwa Vidyapeetham funded by the Ministry of Education under the National Mission on Education through ICT (NMEICT). It provides interactive simulation-based online experiment environments across engineering and sciences.',
      paragraph2: 'The platform provides students access to over 700 virtual labs and 1,800+ experiments spanning core science and engineering disciplines — accessible anytime, anywhere without requiring physical lab equipment.'
    }
  };

  for (const sec of [heroSection, overviewSection, timelineSection, objectivesSection]) {
    await prisma.pageSection.upsert({
      where: { pageId_sectionKey: { pageId: page.id, sectionKey: sec.sectionKey } },
      update: {},
      create: {
        pageId: page.id,
        sectionKey: sec.sectionKey,
        label: sec.label,
        title: sec.title,
        content: sec.content,
        isVisible: true,
        order: sec.order,
      },
    });
  }

  return prisma.page.findUnique({
    where: { slug: 'project' },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
}



async function seedNodalCentresPage() {
  const page = await prisma.page.upsert({
    where: { slug: 'nodal-centres' },
    update: { title: 'Nodal Centres' },
    create: { slug: 'nodal-centres', title: 'Nodal Centres' },
  });

  const benefitsSection = {
    sectionKey: 'nc_benefits',
    label: 'Nodal Centre Benefits',
    order: 0,
    title: 'Benefits of Becoming a Nodal Centre',
    content: {
      items: [
        { text: 'Free access to all 700+ virtual labs for your institution' },
        { text: 'Priority support and technical assistance' },
        { text: 'Dedicated workshops and faculty training sessions' },
        { text: 'Certificate of recognition from Ministry of Education' },
        { text: 'Usage analytics and progress tracking dashboard' },
        { text: 'Promotion on Virtual Labs official website' },
      ]
    }
  };

  const listSection = {
    sectionKey: 'nc_list',
    label: 'Registered Nodal Centres',
    order: 1,
    title: 'Registered Nodal Centres',
    content: {
      items: [
        { name: 'BITS Pilani', location: 'Pilani, Rajasthan', category: 'Engineering', active: true },
        { name: 'VIT University', location: 'Vellore, Tamil Nadu', category: 'Engineering', active: true },
        { name: 'Amrita University', location: 'Coimbatore, Tamil Nadu', category: 'Science', active: true },
        { name: 'Jadavpur University', location: 'Kolkata, West Bengal', category: 'Engineering', active: true },
      ]
    }
  };

  const heroSection = {
    sectionKey: 'nc_hero',
    label: 'Nodal Centres Hero',
    order: -1,
    title: 'Join the Virtual Labs Network',
    subtitle: 'Become a nodal centre and bring world-class virtual lab experiences to your students. Sponsored by MHRD (NME-ICT) — no registration fees, no hidden costs.',
    content: { tag: 'Nodal Centres' }
  };

  const inaugSection = {
    sectionKey: 'nc_inaugurations',
    label: 'Inaugurations',
    order: 2,
    title: 'Nodal Centre Inaugurations',
    subtitle: 'Celebrating the launch of new nodal centres across India. Each inauguration marks a milestone in expanding quality STEM education.',
    content: {
      tag: 'Events',
      items: [
        { year: '2024', title: 'Nodal Centre Inauguration – Amrita Coimbatore', location: 'Coimbatore, Tamil Nadu', description: 'Launch of Virtual Labs Nodal Centre at the School of Engineering, Amrita Vishwa Vidyapeetham.', attendees: '200+', status: 'Completed' },
        { year: '2023', title: 'Virtual Labs Expansion – Southern Consortium', location: 'Bengaluru, Karnataka', description: 'Formal inauguration ceremony for the southern consortium nodal centres, expanding access to 12 new institutions.', attendees: '350+', status: 'Completed' },
        { year: '2023', title: 'NMEICT Nodal Centre Drive', location: 'New Delhi', description: 'National launch event for the 2023 wave of nodal centre registrations under the MHRD NMEICT initiative.', attendees: '500+', status: 'Completed' },
        { year: '2022', title: 'North India Expansion Launch', location: 'Lucknow, Uttar Pradesh', description: 'Inauguration of 8 new nodal centres across Uttar Pradesh, Bihar, and Madhya Pradesh.', attendees: '280+', status: 'Completed' },
      ]
    }
  };

  const uniqueIdSection = {
    sectionKey: 'nc_unique_id',
    label: 'Unique Login ID',
    order: 3,
    title: 'Unique Login ID',
    subtitle: 'Registered Nodal Centres receive a unique institutional login ID granting access to exclusive faculty features, progress tracking, and lab management tools.',
    content: {
      tag: 'Access',
      instructions: 'Nodal coordinator can submit the list of students and faculty members for obtaining the unique login id in the prescribed format to virtual_labs@am.amrita.edu with the subject line - Login ID request - your institute name.',
      templateLink: '/login_id_template.xlsx',
      templateLabel: 'Click Here To Download Login ID Template',
      features: [
        { icon: 'KeyRound', title: 'Institutional Login', desc: 'A dedicated login ID tied to your institution for centralized access management.' },
        { icon: 'ClipboardList', title: 'Lab Exam Setup', desc: 'Set up, schedule, and monitor online virtual lab exams directly from your dashboard.' },
        { icon: 'Users', title: 'Student Enrollment', desc: 'Enroll students under your nodal centre and track their experiment completions and scores.' },
        { icon: 'Award', title: 'Results Reporting', desc: 'Generate and export detailed performance reports for students and faculty.' },
      ]
    }
  };

  for (const sec of [heroSection, benefitsSection, listSection, inaugSection, uniqueIdSection]) {
    await prisma.pageSection.upsert({
      where: { pageId_sectionKey: { pageId: page.id, sectionKey: sec.sectionKey } },
      update: {},
      create: {
        pageId: page.id,
        sectionKey: sec.sectionKey,
        label: sec.label,
        title: sec.title,
        content: sec.content,
        isVisible: true,
        order: sec.order,
      },
    });
  }

  return prisma.page.findUnique({
    where: { slug: 'nodal-centres' },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
}

async function seedStudentSurveyPage() {
  const page = await prisma.page.upsert({
    where: { slug: 'student-survey' },
    update: { title: 'Student Survey' },
    create: { slug: 'student-survey', title: 'Student Survey' },
  });

  const heroSection = {
    sectionKey: 'hero',
    label: 'Survey Hero',
    order: 0,
    title: 'Student Survey',
    subtitle: 'Help us improve the Virtual Labs platform. Share your learning experience!',
    content: {
      heading: 'Student Survey',
      subheading: 'Help us improve the Virtual Labs platform. Share your learning experience!',
      cardHeading: 'Amrita Virtual Labs Workshop - Student Survey',
      cardText: 'Dear Friends,\n\nWe want to thank you for participating in the Virtual Labs workshop. We would like to request a few minutes of your time to take this detailed survey to allow us use this information in enhancing the experience of using virtual labs for other faculties and students.\n\nSincerely,\n\nThe Virtual Labs Team',
      cardButtonLabel: 'Start Survey',
      formUrl: '',
      questions: [
        { id: 'q_email', type: 'text', label: 'Email', required: true },
        { id: 'q_name', type: 'text', label: 'Full Name', required: true },
        { id: 'q_age', type: 'text', label: 'Age', required: true },
        { id: 'q_gender', type: 'radio', label: 'Gender', options: ['Female', 'Male', 'Prefer not to say'], required: true },
        { id: 'q_inst', type: 'text', label: 'Institute Name', required: true },
        { id: 'q_dept', type: 'text', label: 'Department', required: true },
        { id: 'q_year', type: 'text', label: 'Year of join', required: true },
        { id: 'q_r1', type: 'radio', label: 'Using Virtual Labs will improve the quality of my studies.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r2', type: 'radio', label: 'Virtual Labs will make it easier to do my studies', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r3', type: 'radio', label: 'Virtual Labs provides higher level of engagement in my studies.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r4', type: 'radio', label: 'Virtual Labs helps me remember the concepts better.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r5', type: 'radio', label: 'I prefer to use Physical Labs before using Virtual Labs.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r6', type: 'radio', label: 'Overall, I would find using Virtual Labs to be advantageous in my studies.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r7', type: 'radio', label: 'Using Virtual Labs will fit into my study style.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r8', type: 'radio', label: 'I think that using Virtual Labs will fit well with the way I like to study.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r9', type: 'radio', label: 'Virtual Labs requires more of my study time.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r10', type: 'radio', label: 'My interaction with Virtual Labs is clear and understandable.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r11', type: 'radio', label: 'Using Virtual Labs will require a lot of training.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r12', type: 'radio', label: 'I believe that it is easy to get Virtual Labs to do what I want it to do.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r13', type: 'radio', label: 'Overall, I believe that Virtual Labs will be easy for me.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r14', type: 'radio', label: 'I have seen what others do using Virtual Labs.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true },
        { id: 'q_r15', type: 'radio', label: 'It is easy for me to observe others using Virtual Labs.', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], required: true }
      ]
    }
  };

  await prisma.pageSection.upsert({
    where: { pageId_sectionKey: { pageId: page.id, sectionKey: heroSection.sectionKey } },
    update: {
      title: heroSection.title,
      subtitle: heroSection.subtitle,
      content: heroSection.content
    },
    create: {
      pageId: page.id,
      sectionKey: heroSection.sectionKey,
      label: heroSection.label,
      title: heroSection.title,
      subtitle: heroSection.subtitle,
      content: heroSection.content,
      isVisible: true,
      order: heroSection.order,
    },
  });

  return prisma.page.findUnique({
    where: { slug: 'student-survey' },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
}

async function seedFacultySurveyPage() {
  const page = await prisma.page.upsert({
    where: { slug: 'faculty-survey' },
    update: { title: 'Faculty Survey' },
    create: { slug: 'faculty-survey', title: 'Faculty Survey' },
  });

  const heroSection = {
    sectionKey: 'hero',
    label: 'Survey Hero',
    order: 0,
    title: 'Faculty Survey',
    subtitle: 'Share your feedback on using Virtual Labs as a teaching tool.',
    content: {
      heading: 'Faculty Survey',
      subheading: 'Share your feedback on using Virtual Labs as a teaching tool.',
      cardHeading: 'Workshop Feedback',
      cardText: 'Dear Participants,\nWe want to thank you for participating in the Virtual Labs workshop. We would like to request a few minutes of your time to take this detailed survey to allow us use this information in enhancing the experience of using virtual labs.',
      cardButtonLabel: 'Start Survey',
      formUrl: '',
      questions: [
        { id: 'q_email', type: 'text', label: 'Email', required: true },
        { id: 'q_title', type: 'radio', label: 'Title', options: ['Prof.', 'Dr.', 'Mr.', 'Ms.'], required: true },
        { id: 'q_name', type: 'text', label: 'Full Name', required: true },
        { id: 'q_age', type: 'text', label: 'Age', required: true },
        { id: 'q_gender', type: 'radio', label: 'Gender', options: ['Female', 'Male', 'Prefer not to say'], required: false },
        { id: 'q_dept', type: 'text', label: 'Department', required: true },
        { id: 'q_inst', type: 'text', label: 'Institute Name', required: true },
        { id: 'q_address', type: 'textarea', label: 'Institute Address', required: true },
        { id: 'q_designation', type: 'text', label: 'Designation', required: true },
        { id: 'q_exp', type: 'radio', label: 'Years of experience', options: ['< 5 years', '6 - 10 years', '11 - 15 years', '16 - 20 years', '21+ years'], required: true },
        { id: 'q_contact', type: 'text', label: 'Contact Number', required: false }
      ]
    }
  };

  await prisma.pageSection.upsert({
    where: { pageId_sectionKey: { pageId: page.id, sectionKey: heroSection.sectionKey } },
    update: {
      title: heroSection.title,
      subtitle: heroSection.subtitle,
      content: heroSection.content
    },
    create: {
      pageId: page.id,
      sectionKey: heroSection.sectionKey,
      label: heroSection.label,
      title: heroSection.title,
      subtitle: heroSection.subtitle,
      content: heroSection.content,
      isVisible: true,
      order: heroSection.order,
    },
  });

  return prisma.page.findUnique({
    where: { slug: 'faculty-survey' },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
}

async function seedNodalCentreRequestPage() {
  const page = await prisma.page.upsert({
    where: { slug: 'nodal-centre-request' },
    update: { title: 'Nodal Centre Request' },
    create: { slug: 'nodal-centre-request', title: 'Nodal Centre Request' },
  });

  const formSection = {
    sectionKey: 'formSchema',
    label: 'Request Form Schema',
    order: 0,
    title: 'Nodal Centre Request Form',
    content: {
      questions: [
        { id: '1', text: 'Email', type: 'email', required: true, options: [] },
        { id: '2', text: 'Name of the nodal centre (Note: If your institute is not listed, you must apply to become a nodal centre first)', type: 'text', required: true, options: [] },
        { id: '3', text: 'Name of the faculty member', type: 'text', required: true, options: [] },
        { id: '4', text: 'Designation', type: 'text', required: true, options: [] },
        { id: '5', text: 'Department', type: 'text', required: true, options: [] },
        { id: '6', text: 'Contact number', type: 'text', required: true, options: [] },
        { id: '7', text: 'Select the department(s) those who are attending the workshop', type: 'checkbox', required: true, options: [
          'Physics', 'Chemistry', 'Biotechnology', 'Mechanical Engineering', 'Civil Engineering', 'Computer Science', 'Electronics and communications', 'Electrical Engineering', 'Other'
        ]},
        { id: '8', text: 'Expected number of participants (including students and faculty members)', type: 'text', required: true, options: [] },
        { id: '9', text: 'Select the mode of training', type: 'radio', required: true, options: ['Online', 'Offline'] },
        { id: '10', text: 'Proposed Date for the training program', type: 'date', required: true, options: [] },
        { id: '11', text: 'Proposed Time for the training program', type: 'time', required: true, options: [] }
      ]
    }
  };

  await prisma.pageSection.upsert({
    where: { pageId_sectionKey: { pageId: page.id, sectionKey: formSection.sectionKey } },
    update: {},
    create: {
      pageId: page.id,
      sectionKey: formSection.sectionKey,
      label: formSection.label,
      title: formSection.title,
      content: formSection.content,
      isVisible: true,
      order: formSection.order,
    },
  });

  return prisma.page.findUnique({
    where: { slug: 'nodal-centre-request' },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
}

const submitSurveyResponse = async (req, res) => {
  const { slug } = req.params;
  const data = req.body;
  try {
    const response = await prisma.surveyResponse.create({
      data: {
        pageSlug: slug,
        data,
      }
    });

    if (slug === 'nodal-centre-request') {
      const managers = await prisma.user.findMany({
        where: {
          role: { in: ['admin', 'vl_manager'] },
          isActive: true,
        },
        select: { email: true }
      });
      const managerEmails = managers.map(m => m.email).filter(Boolean);
      if (managerEmails.length > 0) {
        let mappedData = data;
        try {
          const page = await prisma.page.findUnique({
            where: { slug: 'nodal-centre-request' },
            include: { sections: { where: { sectionKey: 'formSchema' } } }
          });
          if (page && page.sections && page.sections.length > 0) {
            const schema = page.sections[0].content;
            if (schema && schema.questions) {
              mappedData = {};
              const qMap = {};
              schema.questions.forEach(q => { qMap[q.id] = q.text; });
              Object.keys(data).forEach(k => {
                mappedData[qMap[k] || k] = data[k];
              });
            }
          }
        } catch (err) {
          console.error("Error mapping survey data:", err);
        }

        sendHostWorkshopRequestEmail(managerEmails, mappedData).catch(console.error);
      }
    }

    res.json({ success: true, id: response.id });
  } catch (error) {
    console.error('Failed to submit survey:', error);
    res.status(500).json({ error: 'Failed to submit survey' });
  }
};

const getSurveyResponses = async (req, res) => {
  const { slug } = req.params;
  try {
    const responses = await prisma.surveyResponse.findMany({
      where: { pageSlug: slug },
      orderBy: { createdAt: 'desc' }
    });
    
    // Remove the 404 error block so that it simply returns the empty array
    if (req.query.format === 'csv') {
      // Convert JSON data to CSV
      const allKeys = new Set();
      responses.forEach(r => {
        if (r.data) Object.keys(r.data).forEach(k => allKeys.add(k));
      });
      const headers = ['Timestamp', ...Array.from(allKeys)];
      
      let csv = headers.join(',') + '\n';
      responses.forEach(r => {
        const row = [r.createdAt.toISOString()];
        Array.from(allKeys).forEach(k => {
          let val = r.data[k] || '';
          if (typeof val === 'string') {
            val = val.replace(/"/g, '""');
            if (val.includes(',') || val.includes('\n')) {
              val = `"${val}"`;
            }
          }
          row.push(val);
        });
        csv += row.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${slug}-responses.csv"`);
      return res.send(csv);
    }

    // Default: return JSON
    return res.json(responses);
  } catch (error) {
    console.error('Failed to get survey responses:', error);
    res.status(500).json({ error: 'Failed to download responses' });
  }
};

const deleteSurveyResponse = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.surveyResponse.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Response deleted' });
  } catch (error) {
    console.error('Failed to delete survey response:', error);
    res.status(500).json({ error: 'Failed to delete response' });
  }
};

module.exports = {
  getSections,
  updateSection,
  toggleVisibility,
  reorderSections,
  seedPage,
  submitSurveyResponse,
  getSurveyResponses,
  deleteSurveyResponse,
};

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Project', href: '/project' },
  { label: 'Workshop', href: '/workshop' },
  {
    label: 'Nodal Centres',
    href: '/nodal-centres',
    children: [
      { label: 'Overview',           href: '/nodal-centres' },
      { label: 'Apply for Program',  href: '/nodal-centres?tab=apply' },
      { label: 'Free Online Demo',   href: '/nodal-centres?tab=demo' },
      { label: 'Inaugurations',      href: '/nodal-centres?tab=inaugurations' },
      { label: 'Unique Login ID',    href: '/nodal-centres?tab=login' },
    ],
  },
  { label: 'News & Events', href: '/news' },
  { label: 'Publications', href: '/publications' },
  {
    label: 'Survey',
    href: '/survey',
    children: [
      { label: 'Faculty Survey', href: '/survey/faculty' },
      { label: 'Student Survey', href: '/survey/student' },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Project', href: '/project' },
  { label: 'Workshop', href: '/workshop' },
  {
    label: 'Nodal Centres',
    href: '/nodal-centres',
    children: [
      { label: 'Apply as Nodal Centre', href: '/nodal-centres/apply' },
      { label: 'List of Nodal Centres', href: '/nodal-centres/list' },
      { label: 'Request a Demo', href: '/nodal-centres/demo' },
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

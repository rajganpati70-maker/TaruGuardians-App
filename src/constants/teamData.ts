// =====================================================
// ULTRA PREMIUM TEAM DATA
// Comprehensive team members for scrolling - 80+ Members
// Extended with detailed profiles, stats, filters
// =====================================================

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  email: string;
  skills: string[];
  projects: string[];
  github?: string;
  linkedin?: string;
  achievements: string[];
  department: string;
  joinDate: string;
  location: string;
  availability: 'Available' | 'Busy' | 'Away' | 'Offline';
  status: 'Active' | 'On Leave' | 'Remote';
  performance: number;
  completedProjects: number;
  rating: number;
  responseTime: string;
  expertise: string[];
  languages: string[];
  certifications: string[];
  education: string;
  experience: string;
  hobbies: string[];
  favoriteTech: string[];
  funFact: string;
  quote: string;
  mentor?: string;
  teamLead?: string;
  reportsTo?: string;
  directReports?: number;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const generateExtendedBio = (name: string, role: string): string => {
  const bios = [
    `${name} is a passionate ${role} with extensive experience in building scalable solutions. Known for innovative problem-solving and collaborative leadership. Has successfully delivered multiple high-impact projects and mentored junior team members.`,
    `As a dedicated ${role}, ${name} brings creative energy and technical excellence to every project. Committed to pushing boundaries and delivering exceptional results. Known for exceptional communication skills and ability to translate complex concepts into actionable solutions.`,
    `${name} excels as a ${role}, combining deep technical knowledge with outstanding communication skills. A true team player who inspires excellence in everyone around them. Has led numerous successful initiatives and consistently exceeds expectations.`,
    `With years of experience as a ${role}, ${name} has proven track record of delivering complex projects on time and under budget. Known for attention to detail and strategic thinking. Passionate about building high-performing teams and fostering innovation.`,
    `${name} is an accomplished ${role} who consistently exceeds expectations. Passionate about mentoring and building high-performing teams. Brings diverse perspective and creative problem-solving to every challenge. Expert in stakeholder management and cross-functional collaboration.`,
    `${name} stands out as a ${role} with unique blend of technical expertise and business acumen. Has demonstrated exceptional ability to drive results while maintaining team culture and morale. Known for innovative approaches and data-driven decision making.`,
    `As a ${role}, ${name} has transformed multiple departments through strategic initiatives and operational excellence. Demonstrates strong commitment to continuous improvement and professional development. A natural leader who empowers others to achieve their best.`,
    `${name} brings extensive experience as a ${role}, having worked with Fortune 500 companies and startups alike. Excels in fast-paced environments and thrives on complex challenges. Known for building lasting relationships and delivering measurable business value.`,
  ];
  return bios[Math.floor(Math.random() * bios.length)];
};

// =====================================================
// CONSTANTS AND CONFIGURATIONS
// =====================================================

export const departments = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Operations',
  'Research',
  'Finance',
  'HR',
  'Legal',
  'Support',
];

export const getDepartmentColor = (dept: string): string => {
  const colors: Record<string, string> = {
    Engineering: '#00D4FF',
    Design: '#D4AF37',
    Product: '#00FF88',
    Marketing: '#FF6B6B',
    Operations: '#9B59B6',
    Research: '#3498DB',
    Finance: '#2ECC71',
    HR: '#E74C3C',
    Legal: '#F39C12',
    Support: '#1ABC9C',
  };
  return colors[dept] || '#00D4FF';
};

export const getRoleColor = (role: string): string => {
  const roleLower = role.toLowerCase();
  if (roleLower.includes('lead') || roleLower.includes('head') || roleLower.includes('chief') || roleLower.includes('vp')) {
    return '#D4AF37';
  }
  if (roleLower.includes('senior') || roleLower.includes('architect')) {
    return '#00D4FF';
  }
  if (roleLower.includes('engineer') || roleLower.includes('developer') || roleLower.includes('scientist')) {
    return '#00FF88';
  }
  if (roleLower.includes('designer') || roleLower.includes('artist') || roleLower.includes('director')) {
    return '#FF6B6B';
  }
  if (roleLower.includes('manager') || roleLower.includes('coordinator') || roleLower.includes('analyst')) {
    return '#9B59B6';
  }
  return '#3498DB';
};

export const getAvailabilityColor = (status: string): string => {
  const colors: Record<string, string> = {
    Available: '#00FF88',
    Busy: '#FF6B6B',
    Away: '#F39C12',
    Offline: '#95A5A6',
  };
  return colors[status] || '#95A5A6';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Active: '#00FF88',
    'On Leave': '#F39C12',
    Remote: '#3498DB',
  };
  return colors[status] || '#95A5A6';
};

// Name arrays for generating diverse members
const firstNames = [
  'Alexandra', 'Marcus', 'Sofia', 'David', 'Emma', 'James', 'Aisha', 'Ryan',
  'Olivia', 'Noah', 'Isabella', 'Ethan', 'Mia', 'Liam', 'Chloe', 'Benjamin',
  'Charlotte', 'Alexander', 'Victoria', 'Daniel', 'Sophie', 'Matthew', 'Emily',
  'Christopher', 'Hannah', 'William', 'Jessica', 'Andrew', 'Samantha', 'Michael',
  'Ashley', 'Joshua', 'Amanda', 'Stephanie', 'Kevin', 'Jennifer', 'Brandon',
  'Melissa', 'Jason', 'Nicole', 'Justin', 'Rachel', 'Brian', 'Laura', 'Steven',
  'Michelle', 'Eric', 'Kimberly', 'Patrick', 'Amy', 'Jeffrey', 'Angela', 'Scott',
  'Rebecca', 'Derek', 'Catherine', 'Aaron', 'Christina', 'Jonathan', 'Heather',
  'Nicholas', 'Timothy', 'Sarah', 'Katherine', 'Tiffany', 'Jordan', 'Lauren',
  'Austin', 'Maria', 'Adam', 'Jeremy', 'Brittany', 'Tyler', 'Megan', 'Zachary',
  'Cameron', 'Kelly', 'Dylan', 'Savannah', 'Cole', 'Kayla', 'Grace', 'Nathan',
  'Hannah', 'Brendan', 'Claire', 'Jake', 'Megan', 'Shawn', 'Katherine', 'Travis',
];

const lastNames = [
  'Chen', 'Johnson', 'Rodriguez', 'Park', 'Wilson', 'Liu', 'Patel', 'Thompson',
  'Martinez', 'Kim', 'Brown', 'Davis', 'Garcia', 'Anderson', 'Wang', 'Lee',
  'Taylor', 'White', 'Scott', 'Miller', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Perez', 'Thompson',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
  'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner',
  'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
];

// Roles by department
const rolesByDepartment: Record<string, string[]> = {
  Engineering: [
    'Lead Developer', 'Senior Software Engineer', 'Backend Developer', 'Frontend Developer',
    'Full Stack Developer', 'Mobile Developer', 'DevOps Engineer', 'Cloud Engineer',
    'Security Engineer', 'Systems Architect', 'Database Engineer', 'QA Engineer',
    'Automation Engineer', 'Game Developer', 'Blockchain Developer', 'ML Engineer',
    'Data Engineer', 'API Developer', 'Platform Engineer', 'Infrastructure Engineer',
    'Site Reliability Engineer', 'Network Engineer', 'Embedded Systems Engineer',
  ],
  Design: [
    'UI/UX Designer', 'Product Designer', 'Visual Designer', 'Brand Designer',
    'Motion Designer', 'Illustrator', 'Graphic Designer', 'Design Lead',
    'UX Researcher', 'Design Systems Lead', 'Interaction Designer', '3D Artist',
    'Animation Director', 'Creative Director', 'Art Director', 'Web Designer',
    'UX Writer', 'Design Strategist', 'Design Operations Manager',
  ],
  Product: [
    'Product Manager', 'Senior Product Manager', 'Technical Product Manager',
    'Product Owner', 'Scrum Master', 'Project Manager', 'Program Manager',
    'Product Analyst', 'Strategy Manager', 'Innovation Lead', 'VP of Product',
    'Head of Product', 'Chief Product Officer', 'Associate Product Manager',
    'Director of Product', 'Product Operations Manager',
  ],
  Marketing: [
    'Marketing Lead', 'Digital Marketer', 'Content Strategist', 'SEO Specialist',
    'Social Media Manager', 'Brand Manager', 'Growth Hacker', 'Marketing Analyst',
    'PR Manager', 'Communications Lead', 'Creative Director', 'Copywriter',
    'Performance Marketer', 'Email Marketing Specialist', 'Influencer Manager',
    'Marketing Automation Specialist', 'Content Marketing Manager', 'Demand Generation Manager',
  ],
  Operations: [
    'Operations Manager', 'Operations Lead', 'Project Coordinator', 'Office Manager',
    'Facilities Manager', 'Logistics Coordinator', 'Supply Chain Manager',
    'Business Analyst', 'Process Analyst', 'Quality Assurance Manager',
    'Operations Analyst', 'Strategy Operations Manager', 'Chief Operating Officer',
  ],
  Research: [
    'Research Scientist', 'Data Scientist', 'Research Lead', 'Chief Scientist',
    'Research Analyst', 'Lab Director', 'Innovation Researcher', 'AI Researcher',
    'Research Engineer', 'Applied Scientist', 'Principal Researcher',
  ],
  Finance: [
    'Finance Manager', 'Financial Analyst', 'Accountant', 'Controller',
    'CFO', 'Budget Analyst', 'Investment Analyst', 'Risk Analyst',
    'Finance Director', 'VP of Finance', 'Chief Financial Officer',
    'Tax Specialist', 'Treasury Manager', 'Revenue Analyst',
  ],
  HR: [
    'HR Coordinator', 'HR Manager', 'Recruiter', 'Talent Acquisition',
    'People Operations', 'HR Business Partner', 'Chief People Officer',
    'Learning & Development', 'HR Director', 'Talent Manager',
    'Compensation Analyst', 'Benefits Administrator', 'People Success Manager',
  ],
  Legal: [
    'Legal Counsel', 'General Counsel', 'Compliance Officer', 'Contract Manager',
    'IP Attorney', 'Corporate Attorney', 'Legal Operations Manager',
    'Chief Legal Officer', 'Staff Attorney', 'Paralegal',
  ],
  Support: [
    'Customer Success Manager', 'Support Lead', 'Technical Support Engineer',
    'Customer Experience Lead', 'Support Specialist', 'Community Manager',
    'Customer Support Manager', 'Support Operations Manager', 'Escalation Specialist',
  ],
};

// Projects available
const projects = [
  'Mobile App v2.0', 'Web Dashboard', 'API Gateway', 'Cloud Infrastructure',
  'AI Analytics System', 'Design System', 'Brand Redesign', 'Marketing Campaign',
  'Security Audit', 'Database Optimization', 'Performance Improvements',
  'User Research Study', 'Mobile App Launch', 'Platform Migration',
  'Feature Development', 'Bug Fixes', 'Documentation Portal', 'Testing Framework',
  'DevOps Pipeline', 'Monitoring System', 'Data Pipeline', 'ML Model Training',
  'Blockchain Integration', 'NFT Marketplace', 'DAO Implementation',
  'User Onboarding Flow', 'Payment Integration', 'Search Optimization',
  'Accessibility Improvements', 'Internationalization', 'Analytics Dashboard',
  'Notification System', 'Real-time Updates', 'Content Management System',
  'E-commerce Platform', 'Customer Portal', 'Internal Tools', 'API Documentation',
];

// Skills by department
const skillsByDepartment: Record<string, string[]> = {
  Engineering: [
    'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Java', 'AWS', 'GCP',
    'Docker', 'Kubernetes', 'GraphQL', 'REST API', 'PostgreSQL', 'MongoDB',
    'Redis', 'CI/CD', 'Terraform', 'Linux', 'Security', 'Testing',
    'Microservices', 'System Design', 'Performance Optimization', 'AWS Lambda',
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Rust', 'C++',
  ],
  Design: [
    'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'After Effects',
    'Principle', 'Framer', 'InVision', 'Zeplin', 'Webflow', 'UI Design',
    'UX Design', 'Motion Design', 'Brand Design', 'Design Systems',
    'Prototyping', 'User Testing', 'Accessibility', 'Design Thinking',
    'Information Architecture', 'Interaction Design', '3D Modeling', 'Blender',
  ],
  Product: [
    'Product Strategy', 'Roadmapping', 'Agile', 'Scrum', 'Jira', 'Confluence',
    'User Research', 'Data Analysis', 'A/B Testing', 'Market Analysis',
    'Stakeholder Management', 'Prioritization', 'OKRs', 'KPI Tracking',
    'Product Analytics', 'User Stories', 'Feature Specifications', 'Wireframing',
  ],
  Marketing: [
    'Digital Marketing', 'SEO', 'SEM', 'Content Strategy', 'Social Media',
    'Email Marketing', 'Analytics', 'Growth Hacking', 'Brand Strategy',
    'Copywriting', 'Campaign Management', 'Influencer Marketing',
    'Google Analytics', 'HubSpot', 'Mailchimp', 'Contentful', 'Hootsuite',
  ],
  Operations: [
    'Project Management', 'Process Improvement', 'Vendor Management',
    'Budgeting', 'Resource Planning', 'Risk Management', 'Stakeholder Management',
    'Asana', 'Monday.com', 'Notion', 'AirTable', 'Smartsheet', 'Tableau',
  ],
  Research: [
    'Data Analysis', 'Machine Learning', 'Statistical Modeling', 'Research Methods',
    'Python', 'R', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
    'Jupyter', 'Pandas', 'NumPy', 'Scikit-learn', 'Data Visualization',
  ],
  Finance: [
    'Financial Modeling', 'Budgeting', 'Forecasting', 'Excel', 'SAP', 'QuickBooks',
    'Risk Assessment', 'Investment Analysis', 'Auditing', 'Tax Planning',
    'NetSuite', 'Xero', 'Financial Analysis', 'SQL', 'PowerBI',
  ],
  HR: [
    'Recruiting', 'Onboarding', 'Employee Relations', 'Performance Management',
    'HRIS', 'Compensation', 'Benefits', 'Training', 'Culture Building',
    'Workday', 'BambooHR', 'Greenhouse', 'Lever', 'Culture Amp',
  ],
  Legal: [
    'Contract Law', 'Compliance', 'IP Law', 'Corporate Law', 'GDPR',
    'Risk Assessment', 'Legal Research', 'Negotiation', 'Contract Management',
    'LegalTech', 'Due Diligence', 'Litigation', 'Employment Law',
  ],
  Support: [
    'Customer Success', 'Technical Support', 'Zendesk', 'Intercom', 'Communication',
    'Problem Solving', 'Escalation Management', 'Customer Experience',
    'Salesforce', 'Freshdesk', 'HelpScout', 'Knowledge Base Management',
  ],
};

// Achievements list
const achievementsList = [
  'Best Team Player Award', 'Innovation Champion', 'Performance Excellence',
  'Customer Satisfaction Award', 'Technical Achievement', 'Leadership Award',
  'Rising Star', 'Most Valuable Contributor', 'Quality Champion',
  'Efficiency Expert', 'Creative Mind Award', 'Problem Solver Extraordinaire',
  'Mentor of the Year', 'Community Builder', 'Impact Award',
  'Outstanding Performance', 'Exceptional Leadership', 'Customer Hero',
  'Innovation Pioneer', 'Technical Excellence', 'Collaboration Award',
  'Speed Demon', 'Bug Hunter', 'Documentation Wizard', 'Security Champion',
];

// Locations
const locations = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA',
  'Los Angeles, CA', 'Boston, MA', 'Chicago, IL', 'Denver, CO',
  'Remote', 'London, UK', 'Berlin, Germany', 'Toronto, Canada',
  'Singapore', 'Sydney, Australia', 'Amsterdam, Netherlands',
];

// Education
const universities = [
  'MIT', 'Stanford', 'UC Berkeley', 'Carnegie Mellon', 'Georgia Tech',
  'University of Michigan', 'University of Texas', 'USC', 'Cornell',
  'University of Washington', 'UCLA', 'Princeton', 'Harvard', 'Yale',
  'Columbia', 'Northwestern', 'Duke', 'Brown', 'Dartmouth', 'Johns Hopkins',
];

// Certifications
const certifications = [
  'AWS Certified Solutions Architect', 'Google Cloud Professional',
  'Meta Certified', 'Scrum Master', 'PMP', 'CISSP', 'Kubernetes Certified',
  'Google Analytics Certified', 'HubSpot Inbound Marketing', 'Figma Certified',
  'TensorFlow Developer Certificate', 'Meta Front-End Developer',
  'Certified Kubernetes Administrator', 'AWS Developer Associate',
  'Google Cloud Developer', 'Meta Back-End Developer',
];

// Hobbies
const hobbiesList = [
  'Building side projects', 'Contributing to open source', 'Learning new frameworks',
  'Mentoring junior developers', 'Writing technical blogs', 'Playing video games',
  'Rock climbing', 'Brewing craft beer', 'Hiking', 'Photography',
  'Playing guitar', 'Running marathons', 'Cooking exotic cuisines',
  'Playing chess', 'Bird watching', 'Meditation', 'Yoga', 'Pottery',
  'Wine tasting', 'Traveling to new places', 'Watching documentaries',
];

// Favorite tech
const favoriteTechList = [
  'React', 'Python', 'Go', 'AWS', 'Docker', 'Kubernetes', 'TensorFlow',
  'GraphQL', 'Rust', 'TypeScript', 'Flutter', 'Swift', 'PostgreSQL',
  'Redis', 'MongoDB', 'Firebase', 'AWS Lambda', 'Next.js', 'Vue.js',
];

// Fun facts
const funFactsList = [
  'In their spare time, they enjoy building side projects',
  'They have contributed to over 50 open source projects',
  'They are learning three new frameworks this year',
  'They mentor five junior developers every week',
  'They run a popular technical blog with 10K+ subscribers',
  'They have climbed 20+ mountains in the past year',
  'They brew their own craft beer as a hobby',
  'They have visited 30+ countries around the world',
  'They are an avid chess player with a rating of 1800+',
  'They have published three research papers in top conferences',
  'They speak four languages fluently',
  'They have built apps with over 1M downloads',
  'They have given talks at 10+ international conferences',
  'They have been featured in three tech magazines',
  'They volunteer at coding bootcamps on weekends',
];

// Quotes
const quotesList = [
  'Code is like humor. When you have to explain it, it\'s bad.',
  'The best error message is the one that never shows up.',
  'Simplicity is the ultimate sophistication.',
  'First, solve the problem. Then, write the code.',
  'Any fool can write code that a computer can understand. Good code reads like poetry.',
  'The most disastrous thing that you can ever learn is your first programming language.',
  'Programming isn\'t about what you know; it\'s about what you can figure out.',
  'The only way to learn a new programming language is by writing programs in it.',
  'Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging.',
  'Experience is the name everyone gives to their mistakes.',
  'In the world of software, the best way to predict the future is to invent it.',
  'The best code is no code at all.',
  'Premature optimization is the root of all evil.',
  'Debugging is twice as hard as writing the code in the first place.',
  'Any program is only as good as it is useful.',
];

// =====================================================
// TEAM MEMBER GENERATION
// =====================================================

const generateRandomSkills = (dept: string): string[] => {
  const allSkills = skillsByDepartment[dept] || [];
  const numSkills = 5 + Math.floor(Math.random() * 5);
  const shuffled = [...allSkills].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numSkills);
};

const generateRandomProjects = (): string[] => {
  const numProjects = 3 + Math.floor(Math.random() * 3);
  const shuffled = [...projects].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numProjects);
};

const generateRandomAchievements = (): string[] => {
  const numAchievements = 2 + Math.floor(Math.random() * 3);
  const shuffled = [...achievementsList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numAchievements);
};

const generateRandomHobbies = (): string[] => {
  const numHobbies = 3 + Math.floor(Math.random() * 3);
  const shuffled = [...hobbiesList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numHobbies);
};

const generateRandomFavoriteTech = (): string[] => {
  const numTech = 3 + Math.floor(Math.random() * 3);
  const shuffled = [...favoriteTechList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTech);
};

const generateRandomCertifications = (): string[] => {
  const numCerts = 2 + Math.floor(Math.random() * 3);
  const shuffled = [...certifications].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numCerts);
};

const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// Generate 80 team members
export const teamMembers: TeamMember[] = Array.from({ length: 80 }, (_, i) => {
  const dept = departments[i % departments.length];
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  const role = getRandomElement(rolesByDepartment[dept]);
  
  const availabilityOptions: TeamMember['availability'][] = ['Available', 'Busy', 'Away', 'Offline'];
  const statusOptions: TeamMember['status'][] = ['Active', 'On Leave', 'Remote'];
  
  return {
    id: String(i + 1),
    name: `${firstName} ${lastName}`,
    role,
    image: `https://i.pravatar.cc/300?img=${(i % 70) + 1}`,
    bio: generateExtendedBio(firstName, role),
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@taruguardians.org`,
    skills: generateRandomSkills(dept),
    projects: generateRandomProjects(),
    github: `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    linkedin: `${firstName.toLowerCase()}${lastName.toLowerCase()}-dev`,
    achievements: generateRandomAchievements(),
    department: dept,
    joinDate: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    location: getRandomElement(locations),
    availability: getRandomElement(availabilityOptions),
    status: getRandomElement(statusOptions),
    performance: Math.floor(Math.random() * 20) + 80,
    completedProjects: Math.floor(Math.random() * 30) + 5,
    rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
    responseTime: getRandomElement(['< 1 hour', '1-2 hours', '2-4 hours', 'Same day']),
    expertise: skillsByDepartment[dept].slice(0, 3 + Math.floor(Math.random() * 3)),
    languages: ['English', 'Spanish', 'Mandarin', 'French', 'German', 'Japanese', 'Hindi'].slice(0, 2 + Math.floor(Math.random() * 3)),
    certifications: generateRandomCertifications(),
    education: getRandomElement(universities),
    experience: `${Math.floor(Math.random() * 10) + 1} years`,
    hobbies: generateRandomHobbies(),
    favoriteTech: generateRandomFavoriteTech(),
    funFact: getRandomElement(funFactsList),
    quote: getRandomElement(quotesList),
  };
});

// =====================================================
// TEAM STATISTICS
// =====================================================

export const teamStats = {
  totalMembers: teamMembers.length,
  departments: departments.length,
  activeProjects: 47,
  completedProjects: 234,
  avgPerformance: Math.round(teamMembers.reduce((acc, m) => acc + m.performance, 0) / teamMembers.length),
  totalSkills: new Set(teamMembers.flatMap(m => m.skills)).size,
  avgExperience: '4.5 years',
  remoteWorkers: teamMembers.filter(m => m.location === 'Remote').length,
  avgRating: Math.round((teamMembers.reduce((acc, m) => acc + m.rating, 0) / teamMembers.length) * 10) / 10,
  totalProjects: teamMembers.reduce((acc, m) => acc + m.completedProjects, 0),
  availableMembers: teamMembers.filter(m => m.availability === 'Available').length,
};

// Department statistics
export const departmentStats = departments.map(dept => ({
  name: dept,
  count: teamMembers.filter(m => m.department === dept).length,
  color: getDepartmentColor(dept),
  avgPerformance: Math.round(teamMembers.filter(m => m.department === dept).reduce((acc, m) => acc + m.performance, 0) / teamMembers.filter(m => m.department === dept).length),
  totalProjects: teamMembers.filter(m => m.department === dept).reduce((acc, m) => acc + m.completedProjects, 0),
}));

// Location statistics
export const locationStats = locations.map(loc => ({
  location: loc,
  count: teamMembers.filter(m => m.location === loc).length,
})).filter(loc => loc.count > 0).sort((a, b) => b.count - a.count);

// Role statistics
export const roleStats = [...new Set(teamMembers.map(m => m.role))].map(role => ({
  role,
  count: teamMembers.filter(m => m.role === role).length,
  department: teamMembers.find(m => m.role === role)?.department || 'Unknown',
})).sort((a, b) => b.count - a.count);

// =====================================================
// FILTER OPTIONS
// =====================================================

export const filterOptions = {
  departments,
  roles: [...new Set(teamMembers.map(m => m.role))],
  locations: [...new Set(teamMembers.map(m => m.location))],
  availability: ['Available', 'Busy', 'Away', 'Offline'] as const,
  status: ['Active', 'On Leave', 'Remote'] as const,
};

// =====================================================
// SEARCH AND FILTER UTILITIES
// =====================================================

export const searchMembers = (query: string): TeamMember[] => {
  const lowerQuery = query.toLowerCase();
  return teamMembers.filter(member =>
    member.name.toLowerCase().includes(lowerQuery) ||
    member.role.toLowerCase().includes(lowerQuery) ||
    member.department.toLowerCase().includes(lowerQuery) ||
    member.skills.some(skill => skill.toLowerCase().includes(lowerQuery)) ||
    member.email.toLowerCase().includes(lowerQuery)
  );
};

export const filterByDepartment = (department: string): TeamMember[] => {
  return teamMembers.filter(member => member.department === department);
};

export const filterByRole = (role: string): TeamMember[] => {
  return teamMembers.filter(member => member.role === role);
};

export const filterByLocation = (location: string): TeamMember[] => {
  return teamMembers.filter(member => member.location === location);
};

export const filterByAvailability = (availability: TeamMember['availability']): TeamMember[] => {
  return teamMembers.filter(member => member.availability === availability);
};

export const filterByStatus = (status: TeamMember['status']): TeamMember[] => {
  return teamMembers.filter(member => member.status === status);
};

export const sortByName = (ascending: boolean = true): TeamMember[] => {
  return [...teamMembers].sort((a, b) => 
    ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );
};

export const sortByPerformance = (ascending: boolean = false): TeamMember[] => {
  return [...teamMembers].sort((a, b) => 
    ascending ? a.performance - b.performance : b.performance - a.performance
  );
};

export const sortByRating = (ascending: boolean = false): TeamMember[] => {
  return [...teamMembers].sort((a, b) => 
    ascending ? a.rating - b.rating : b.rating - a.rating
  );
};

export const sortByProjects = (ascending: boolean = false): TeamMember[] => {
  return [...teamMembers].sort((a, b) => 
    ascending ? a.completedProjects - b.completedProjects : b.completedProjects - a.completedProjects
  );
};

export const getTopPerformers = (limit: number = 10): TeamMember[] => {
  return sortByPerformance(false).slice(0, limit);
};

export const getMostActive = (limit: number = 10): TeamMember[] => {
  return sortByProjects(false).slice(0, limit);
};

export const getHighestRated = (limit: number = 10): TeamMember[] => {
  return sortByRating(false).slice(0, limit);
};

export const getAvailableMembers = (): TeamMember[] => {
  return teamMembers.filter(m => m.availability === 'Available');
};

export const getRemoteMembers = (): TeamMember[] => {
  return teamMembers.filter(m => m.status === 'Remote');
};

export const getOnLeaveMembers = (): TeamMember[] => {
  return teamMembers.filter(m => m.status === 'On Leave');
};

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default {
  teamMembers,
  departments,
  teamStats,
  departmentStats,
  locationStats,
  roleStats,
  filterOptions,
  searchMembers,
  getTopPerformers,
  getMostActive,
  getHighestRated,
  getAvailableMembers,
  getRemoteMembers,
  getOnLeaveMembers,
  getDepartmentColor,
  getRoleColor,
  getAvailabilityColor,
  getStatusColor,
};
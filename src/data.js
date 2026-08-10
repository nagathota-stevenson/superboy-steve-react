export const skillGroups = [
  { name: 'Frontend', items: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Three.js', 'Astro', 'HTML5/CSS3'] },
  { name: 'Backend', items: ['.NET/C#', 'Node.js', 'Express.js', 'FastEndpoints', 'REST APIs', 'MVC Architecture', 'Flask', 'Azure Functions'] },
  { name: 'Databases', items: ['SQL Server', 'PostgreSQL', 'MongoDB', 'Firebase', 'Stored Procedures', 'Data Modeling', 'Query Optimization'] },
  { name: 'Cloud & DevOps', items: ['Azure DevOps', 'CI/CD Pipelines', 'Firebase', 'AWS Lambda', 'Vercel', 'Cloudflare', 'Application Insights'] },
  { name: 'Data & AI', items: ['Python', 'TensorFlow', 'Deep Learning', 'LLM Integration', 'Pandas', 'Tableau', 'Power BI', 'R'] },
  { name: 'Tools & Collaboration', items: ['Git', 'Jira', 'Agile Scrum', 'SharePoint', 'Power Automate', 'Postman', 'SheetJS', 'jsPDF'] },
];

export const experience = [
  {
    role: 'Full Stack Developer',
    company: 'World Bank Group',
    date: 'March 2024 – Present',
    desc: 'Developing and enhancing enterprise-grade full stack applications used across the World Bank. Building scalable React applications and architecting backend services using .NET, REST APIs, and SQL Server.',
    tags: ['React.js', '.NET', 'SQL Server', 'Azure DevOps', 'SharePoint', 'Power Automate'],
  },
  {
    role: 'IT Analyst Intern',
    company: 'Vene',
    date: '2023 – 2024',
    desc: 'Contributed to development of the company website using React.js and Next.js. Led implementation of secure payment systems including PayPal and Stripe integrations.',
    tags: ['React.js', 'Next.js', 'Firebase', 'AWS Lambda', 'Payment Integration'],
  },
  {
    role: 'Graduate Research Assistant',
    company: 'The University of Findlay',
    date: '2023 – 2024',
    desc: 'Conducted research on AI technologies impact on workforce. Developed resume parser and job-matching tool using Python, spaCy, and Pandas for intelligent keyword extraction.',
    tags: ['Python', 'spaCy', 'Pandas', 'Machine Learning', 'NLP'],
  },
  {
    role: 'Product Compliance Senior Associate',
    company: 'Amazon Development Center',
    date: '2021 – 2022',
    desc: 'Conducted compliance reviews using regulatory databases. Audited product listings to ensure adherence to international legal and safety standards.',
    tags: ['Compliance', 'Process Optimization', 'Documentation'],
  },
  {
    role: 'Junior Software Engineer',
    company: 'BlueSapience',
    date: '2020 – 2021',
    desc: 'Collaborated on redesigning and developing web applications using React.js and Vue.js. Built interactive frontend features focused on customer engagement.',
    tags: ['React.js', 'Vue.js', 'Firebase', 'Browser Extensions'],
  },
];

export const projects = [
  {
    mark: 'WD',
    name: 'Worship Department Platform',
    featured: true,
    desc: 'Spearheaded development of a responsive worship management platform with scalable frontend architecture and secure backend integrations. Currently migrating to Astro for improved performance and SEO.',
    highlight: 'Enterprise-level platform serving multiple organizations',
    tags: ['Astro', 'React.js', 'Firebase', 'Responsive Design'],
  },
  {
    mark: 'AI',
    name: 'AI Generated Image Detection',
    desc: 'Trained and evaluated deep learning models including MobileNetV3, EfficientNet, VGG16, and DenseNet121 for AI-generated image detection. Deployed machine learning workflows using AWS Lambda.',
    highlight: 'High-accuracy detection system with scalable deployment',
    tags: ['Python', 'TensorFlow', 'AWS Lambda', 'Deep Learning', 'CNN'],
  },
  {
    mark: 'TF',
    name: 'Testifyth',
    desc: 'Designed and developed a real-time platform allowing users to share prayer requests and testimonies. Implemented Firebase authentication and database integrations for seamless user experience.',
    highlight: 'Community platform connecting thousands of users',
    tags: ['Next.js', 'Tailwind CSS', 'Firebase', 'Vercel', 'Real-time Database'],
  },
  {
    mark: 'LC',
    name: 'Lifeline Church Website',
    desc: 'Developed and deployed a responsive church website using Flutter. Integrated Amazon S3 for secure media storage and optimized content delivery.',
    highlight: 'Modern web presence for religious organization',
    tags: ['Flutter', 'AWS S3', 'Firebase', 'Cross-platform'],
  },
  {
    mark: 'FX',
    name: 'Fexown Mobile Application',
    desc: 'Led development of a mobile application enabling users to locate mechanics and schedule services. Integrated VIN verification APIs and Google Maps services with Apple TestFlight deployment.',
    highlight: 'On-demand service platform with 100+ active users',
    tags: ['Flutter', 'Firebase', 'Google Maps API', 'VIN Verification'],
  },
];

import { RESUME_DATA_PATCH_ID } from './resumeData.patch.id.js'

/**
 * Keys must match editorLabel on 3D objects (Farmhouse, Barn, Coop, etc.).
 */
export const RESUME_DATA_EN = {
  Farmhouse: {
    icon: '🏠',
    title: 'Summary',
    subtitle: 'Senior Frontend Engineer · Jakarta, Indonesia',
    accent: '#4caf82',
    sections: [
      {
        heading: 'Senior Frontend Engineer',
        body: 'Senior Frontend Engineer with 6+ years of experience delivering scalable web applications for B2C, B2B, and enterprise environments. Specialized in Angular, Vue, and React ecosystems, micro-frontend architecture, reusable component systems, performance optimization, and technical SEO. Strong track record building trading platforms, operational dashboards, and high-traffic websites with maintainable architecture and consistent UX quality improvements.',
      },
      {
        heading: 'Freelance services',
        body:
          'Freelance frontend (Angular, Vue, React): dashboards, SPAs, components, performance & SEO. Jakarta-based, remote OK.\n\nEmail or LinkedIn for scope and rates.',
        tags: ['Freelance', 'Contract', 'Remote', 'Jakarta'],
      },
      {
        heading: 'Contact',
        body: 'Jakarta, Indonesia\n(+62) 813-8678-6880\nalexsanderjeffry@gmail.com',
        tags: ['Jakarta, Indonesia'],
      },
    ],
    links: [
      { label: '📧 Email', url: 'mailto:alexsanderjeffry@gmail.com' },
      { label: '💼 LinkedIn', url: 'https://www.linkedin.com/in/jeffry-alexander-g-534b5b224/' },
      { label: '🐙 GitHub', url: 'https://github.com/alxjeff182/porto' },
      { label: '🌐 Portfolio', url: 'https://jeff-interactive-resume.vercel.app' },
    ],
  },

  Barn: {
    icon: '🐄',
    title: 'Employment',
    subtitle: 'Professional Experience',
    accent: '#e8834a',
    sections: [
      {
        heading: 'Darmawan Aryansyah Group | Senior Frontend Engineer',
        body: 'Oct 2025 - Present\n\n- Own end-to-end frontend delivery across multiple business-critical products as the primary frontend engineer.\n- Architect and implement micro-frontend patterns with reusable shared modules, including search and trading chart components used across financial web applications.\n- Build production-grade applications using Angular, Vue 3, React, and Next.js with strong focus on modularity and long-term maintainability.\n- Deliver trading systems, operational dashboards, and company profile websites using PrimeVue and Tailwind CSS with emphasis on performance, SEO, and responsive UX.\n- Integrate frontend systems with REST API, WebSocket, and microservices-based backend services for real-time workflows.\n- Improve Lighthouse quality, rendering performance, and frontend stability through iterative optimization and reusable implementation patterns.\n- Handle deployment and runtime setup using Docker, Nginx, AWS (S3, WAF), GCP, and Firebase.',
        tags: ['Angular', 'Vue 3', 'React', 'Next.js', 'PrimeVue', 'Tailwind CSS', 'REST API', 'WebSocket', 'Docker', 'Nginx', 'AWS', 'GCP', 'Firebase'],
      },
      {
        heading: 'Farmaku.com | Senior Software Engineer',
        body: 'Feb 2019 - Aug 2025\nPromoted from Software Engineer\n\n- Develop and maintain high-traffic user-facing features using Angular, TypeScript, and PHP in production environments.\n- Build reusable UI components and internal frontend libraries that accelerate feature development across teams.\n- Optimize page performance across browsers and devices to improve speed, responsiveness, and user interaction quality.\n- Partner with product, design, and backend teams to deliver scalable and reliable frontend releases.\n- Lead technical SEO implementation to improve search visibility, crawlability, and organic performance.\n- Contribute to multiple production systems, including B2C, B2B, and POS applications.\n- Perform code reviews and enforce frontend best practices for consistency, quality, and maintainability.',
        tags: ['Angular', 'PHP', 'TypeScript', 'SEO', 'B2C', 'B2B', 'POS'],
      },
      {
        heading: 'Wave Consulting Indonesia | Software Engineer (Short-Term Contract)',
        body: 'Jan 2019 - Feb 2019\n\n- Short-term post-graduation engagement focused on building custom websites and web applications based on client requirements.\n- Worked in an agile delivery environment using Jira and TFS.',
        tags: ['Web Applications', 'Agile', 'Jira', 'TFS'],
      },
    ],
    links: [],
  },

  Coop: {
    icon: '🐓',
    title: 'Projects',
    subtitle: 'Selected Frontend Projects',
    accent: '#e8c94a',
    sections: [
      {
        heading: 'Financial & Trading',
        body: '- IGExchange Company Profile - PT Indonesia Global Exchange - Corporate website for financial exchange platform.\n  Stack: Next.js, React, TypeScript, Tailwind CSS.\n  UI Kit: Custom UI + Tailwind component system.\n- IGExchange Dashboard - PT Indonesia Global Exchange - Trading and monitoring dashboard.\n  Stack: Next.js, React, TypeScript, Tailwind CSS.\n  UI Kit: Custom UI + Tailwind component system.\n- IGClearing Company Profile - PT Indonesia Global Clearing - Corporate website for clearing services.\n  Stack: Next.js, React, TypeScript, Tailwind CSS.\n  UI Kit: Custom UI + Tailwind component system.\n- IGClearing Dashboard - PT Indonesia Global Clearing - Financial clearing operations dashboard.\n  Stack: Next.js, React, TypeScript, Tailwind CSS.\n  UI Kit: Custom UI + Tailwind component system.\n- IGCustody Company Profile - PT Indonesia Global Custody - Corporate website for custody services.\n  Stack: Next.js, React, TypeScript, Tailwind CSS.\n  UI Kit: Custom UI + Tailwind component system.\n- IGCustody Dashboard - PT Indonesia Global Custody - Asset management dashboard.\n  Stack: Next.js, React, TypeScript, Tailwind CSS.\n  UI Kit: Custom UI + Tailwind component system.\n- IndoBursa Exchange Dashboard - PT Indo Bursa Karisma Berjangka - Exchange monitoring interface.\n  Stack: Vue 3, TypeScript, Vite, PrimeVue, Tailwind CSS, Pinia.\n  UI Kit: PrimeVue.\n- IndoBursa Broker Dashboard - PT Indo Bursa Karisma Berjangka - Broker operations dashboard.\n  Stack: Vue 3, TypeScript, Vite, PrimeVue, Tailwind CSS, Pinia.\n  UI Kit: PrimeVue.\n- IndoBursa Trading Apps - PT Indo Bursa Karisma Berjangka - Web-based trading frontend.\n  Stack: React, TypeScript, Vite, React Router.\n  UI Kit: Custom component library.\n- Astal Admin Report - PT ASET INSTRUMEN DIGITAL - Internal reporting dashboard for digital asset operations.\n  Stack: Vue 3, TypeScript, Vite, PrimeVue, Tailwind CSS.\n  UI Kit: PrimeVue.\n- Kliring Company Profile - Corporate website for clearing and exchange ecosystem.\n  Stack: Next.js, React, TypeScript, Tailwind CSS.\n  UI Kit: Custom UI + Tailwind component system.\n- Kliring Dashboard - Internal dashboard for clearing operations and reporting.\n  Stack: Vue 3, TypeScript, Vite, PrimeVue, Tailwind CSS, Pinia.\n  UI Kit: PrimeVue.',
        tags: ['Trading', 'Dashboard', 'Finance'],
      },
      {
        heading: 'Product, Commerce & Enterprise',
        body: '- Farmaku.com - PT Solusi Sarana Sehat - E-commerce healthcare platform with SEO-focused frontend architecture.\n  Stack: Angular, Ionic, Capacitor, TypeScript, JavaScript, SCSS.\n  UI Kit: Ionic UI.\n- Farmaku Article - PT Solusi Sarana Sehat (WordPress) - Content platform optimized for SEO and page performance.\n  Stack: WordPress, PHP, JavaScript, SEO.\n  UI Kit: Theme-based WordPress UI components.\n- Manajemen Kos Ecommerce - ManajemenKos - Property rental marketplace frontend.\n  Stack: Nuxt.js, Vue.js, JavaScript, CSS.\n  UI Kit: Custom Vue components.\n- Manajemen Kos Dashboard - ManajemenKos - Tenant and property management dashboard.\n  Stack: Vue 3, TypeScript, Vite, PrimeVue, Tailwind CSS.\n  UI Kit: PrimeVue.\n- CDI Facility Services - PT Catur Dharma Integritas - Corporate frontend system.\n  Stack: PHP, JavaScript, Vue (legacy frontend).\n  UI Kit: Custom component set.\n- MyStock (SecureRx) - PT Solusi Sarana Sehat - Inventory management interface.\n  Stack: Angular, TypeScript.\n  UI Kit: Material-UI.\n- SecureRx POS - PT Solusi Sarana Sehat - Frontend for pharmacy point-of-sale workflows.\n  Stack: Angular, TypeScript.\n  UI Kit: ngx-bootstrap.\n- SecureRx Platform - PT Solusi Sarana Sehat - Healthcare platform frontend ecosystem.\n  Stack: Angular, TypeScript.\n  UI Kit: PrimeNG.\n- HRM (SecureRx) - PT Solusi Sarana Sehat - Human resource management interface.\n  Stack: Angular, TypeScript.\n  UI Kit: PrimeNG.\n- Mentari Express - Logistics platform frontend.\n  Stack: Angular, TypeScript, CodeIgniter, JavaScript.\n  UI Kit: PrimeNG.\n- Deli Metropolitan Group (Internal System) - Enterprise internal dashboard.\n  Stack: Angular, TypeScript.\n  UI Kit: PrimeNG.\n- Intersys Car Audio - Company profile and business website frontend.\n  Stack: HTML5, CSS3, JavaScript.\n  UI Kit: Bootstrap.\n- Media Audio - Company profile and business website frontend.\n  Stack: HTML5, CSS3, JavaScript.\n  UI Kit: Bootstrap.\n- Massindo Mentari - Company profile and business website frontend.\n  Stack: HTML5, CSS3, JavaScript.\n  UI Kit: Bootstrap.\n- Nexindo Audio Nugraha - Company profile and business website frontend.\n  Stack: HTML5, CSS3, JavaScript.\n  UI Kit: Bootstrap.\n- Alamipac.co.id - PT Amanja Mega Persada (WordPress) - Company profile and business website frontend.\n  Stack: HTML5, CSS3, JavaScript, WordPress (Alamipac).\n  UI Kit: WordPress theme components.\n- Toyota Manufacturing Reporting System - PT Toyota Motor Manufacturing Indonesia - Internal analytics and reporting frontend.\n  Stack: CodeIgniter, JavaScript, HTML5, CSS3.\n  UI Kit: Bootstrap.\n- Inni Zheng He Carbon - PT Inni Zheng He Carbon - Company profile website.\n  Stack: Laravel, HTML5, CSS3, JavaScript.\n  UI Kit: Bootstrap.\n- Begja Autotronics - PT Filsound Utama Indonesia - Company profile website.\n  Stack: Laravel, HTML5, CSS3, JavaScript.\n  UI Kit: Bootstrap.\n- Nadeak Website - Frontend website project for Nadeak organization.\n  Stack: CodeIgniter, JavaScript.\n  UI Kit: Bootstrap.',
        tags: ['E-commerce', 'Healthcare', 'Enterprise', 'WordPress'],
      },
    ],
    links: [],
  },

  University: {
    icon: '🎓',
    title: 'Education',
    subtitle: 'Academic Background',
    accent: '#6b9de8',
    sections: [
      {
        heading: 'Gunadarma University',
        body: 'Bachelor of Information Systems (GPA: 3.37)\nSep 2014 - Dec 2018',
        tags: ['Information Systems'],
      },
    ],
    links: [],
  },

  Well: {
    icon: '⚙️',
    title: 'Skills',
    subtitle: 'Technical Expertise',
    accent: '#c84fe8',
    sections: [
      {
        heading: 'Frontend Core',
        tags: ['Angular', 'Vue 3', 'Nuxt.js', 'React', 'Vite', 'Pinia', 'Zustand', 'PrimeVue', 'PrimeReact', 'PrimeNG', 'Material UI'],
      },
      {
        heading: 'Architecture & Engineering',
        tags: ['Micro-frontend Architecture', 'Reusable Component Systems', 'Frontend Performance Optimization', 'SEO Technical Implementation'],
      },
      {
        heading: 'Web & Integration',
        tags: ['HTML5', 'CSS3', 'SCSS', 'Tailwind CSS', 'REST API', 'WebSocket', 'WordPress (frontend customization)'],
      },
      {
        heading: 'Testing & Quality',
        tags: ['Vitest', 'Jest', 'Playwright', 'ESLint', 'Prettier'],
      },
      {
        heading: 'Cloud, DevOps & Tools',
        tags: ['Docker', 'Docker Compose', 'Nginx', 'AWS (S3, WAF)', 'GCP', 'Firebase', 'PostCSS', 'Autoprefixer', 'Git', 'Trello', 'ClickUp', 'Google Analytics (GA4)'],
      },
      {
        heading: 'Other',
        tags: ['Three.js', 'Web3', 'AI / LLM Integration', 'Python (supporting automation/integration)'],
      },
    ],
    links: [],
  },

  Pond: {
    icon: '🎣',
    title: 'Contact',
    subtitle: 'Resume PDF & links',
    accent: '#4ab8e8',
    sections: [
      {
        heading: 'Freelance',
        body:
          'Frontend freelance & consulting. Hourly or milestone.\n\nEmail or LinkedIn to discuss.',
        tags: ['Angular', 'Vue', 'React', 'Remote'],
      },
      {
        heading: null,
        body: 'JEFFRY ALEXANDER G\nJakarta, Indonesia\n(+62) 813-8678-6880\nalexsanderjeffry@gmail.com',
        tags: ['LinkedIn', 'Portfolio'],
      },
    ],
    links: [
      { label: '💼 LinkedIn', url: 'https://www.linkedin.com/in/jeffry-alexander-g-534b5b224/' },
      { label: '🐙 GitHub', url: 'https://github.com/alxjeff182/porto' },
      { label: '🌐 Portfolio', url: 'https://jeff-interactive-resume.vercel.app' },
      {
        label: '📄 ATS resume',
        url: '/jeff-resume-ats.pdf',
        download: 'Jeffry-Alexander-G-Resume-ATS.pdf',
      },
      {
        label: '🎨 Creative resume',
        url: '/jeff-resume-creative.pdf',
        download: 'Jeffry-Alexander-G-Resume-Creative.pdf',
      },
    ],
  },
}

function mergeResumeLocale(en, patch) {
  const out = globalThis.structuredClone(en)
  for (const key of Object.keys(patch)) {
    if (!out[key]) continue
    const p = patch[key]
    const base = out[key]
    const merged = { ...base, ...p }
    if (p.sections && base.sections) {
      merged.sections = base.sections.map((sec, i) =>
        p.sections[i] ? { ...sec, ...p.sections[i] } : sec,
      )
    }
    out[key] = merged
  }
  return out
}

/** @param {'en' | 'id'} locale */
export function getResumeData(locale) {
  if (locale !== 'id') return RESUME_DATA_EN
  return mergeResumeLocale(RESUME_DATA_EN, RESUME_DATA_PATCH_ID)
}

/** Accent keys stable across locales */
export const RESUME_DATA = RESUME_DATA_EN

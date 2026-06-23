import styles from "./page.module.css";
import ContactSection from "../components/ContactSection";
import ScrollNavigation from "../components/ScrollNavigation";

import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import AwardsCarousel from "../components/AwardsCarousel";

// Fallback data
const fallbackProfile = {
  name: "Le Diep Trong Toan",
  title: "Full Stack Digital Marketer",
  bio: [
    {
      type: 'paragraph',
      children: [
        { type: 'text', text: 'With nearly a decade of experience in digital marketing, I specialize in full-funnel marketing strategies that drive measurable business impact. As a ' },
        { type: 'text', text: 'Senior Digital Performance Manager at RED² Digital', bold: true },
        { type: 'text', text: ', I lead high-impact digital campaigns across ' },
        { type: 'text', text: 'B2B and B2C industries', bold: true },
        { type: 'text', text: ', delivering strong results in ' },
        { type: 'text', text: 'brand awareness, lead generation, and revenue growth', bold: true },
        { type: 'text', text: '.' }
      ]
    }
  ],
  email: "s3068128@gmail.com",
  linkedin: "https://www.linkedin.com/in/toan-le-diep-trong/",
  facebook: "https://www.facebook.com/timothy.lai.7370",
  blogUrl: "https://lp.ledieptrongtoan.id.vn/",
};

const fallbackExperience = [
  { company: "RED 2 Square", role: "Senior Media Performance Manager", period: "Recent" },
  { company: "YOOSE - Location Based Marketing Agency", role: "Senior Media Performance Manager", period: "Previous" },
  { company: "Viet Trang Handicraft", role: "Digital Marketing Manager", period: "Previous" },
  { company: "California Fitness & Yoga", role: "Digital Marketing Team Leader", period: "Previous" }
];

const fallbackSkills = [
  { name: "Digital Marketing", percent: 85 },
  { name: "Hubspot", percent: 80 },
  { name: "Paid Media", percent: 80 },
  { name: "Active Campaign", percent: 85 },
  { name: "Performance Marketing", percent: 80 },
  { name: "SEO", percent: 75 }
];

const fallbackProjects = [
  {
    title: "Global E-commerce Campaign",
    category: "Performance Marketing",
    slug: "global-e-commerce-campaign",
    description: "Scaled revenue by 150% in 3 months using data-driven media buying and targeted funnel optimization.",
    metric: "+150%",
    metricLabel: "Revenue",
    spanClass: "span2",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "B2B Lead Generation",
    category: "Demand Gen",
    slug: "b2b-lead-generation",
    description: "Automated workflows and increased lead quality by 40%.",
    metric: "+40%",
    metricLabel: "Lead Quality",
    spanClass: "span1",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Brand Repositioning",
    category: "Strategy",
    slug: "brand-repositioning",
    description: "Achieved top 3 rankings for high-volume keywords.",
    metric: "Top 3",
    metricLabel: "Rankings",
    spanClass: "span1",
    image: "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "App Launch Strategy",
    category: "Go-to-Market",
    slug: "app-launch-strategy",
    description: "Coordinated cross-platform campaign reaching 5M+ potential customers.",
    metric: "5M+",
    metricLabel: "Reach",
    spanClass: "span2",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop"
  }
];

const fallbackAwards = [
  { title: "Top Digital Marketing Companies", organization: "Clutch", year: "2023", image: "https://www.red2digital.com/wp-content/uploads/2023/04/5.png" },
  { title: "Best Digital Marketing Company", organization: "DesignRush", year: "2022", image: "https://www.red2digital.com/wp-content/uploads/2023/04/Layer-11.png" },
  { title: "Digital Marketing Company", organization: "GoodFirms", year: "2023", image: "https://www.red2digital.com/wp-content/uploads/2023/04/4.png" },
  { title: "Digital Marketing Agency Services", organization: "UpCity", year: "2021", image: "https://www.red2digital.com/wp-content/uploads/2023/04/2.png" }
];

const fallbackNavigation = [
  { label: "Intro", sectionId: "hero" },
  { label: "Working History", sectionId: "experience" },
  { label: "Skillset", sectionId: "skills" },
  { label: "Team Awards", sectionId: "awards" },
  { label: "Worked Projects", sectionId: "projects" },
  { label: "Contact", sectionId: "contact" }
];

const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

async function getProfileData() {
  try {
    const res = await fetch(`${apiUrl}/api/profile?populate=*`, { next: { revalidate: 10 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

async function getExperienceData() {
  try {
    const res = await fetch(`${apiUrl}/api/experiences?populate=*&sort=order:asc`, { next: { revalidate: 10 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

async function getSkillsData() {
  try {
    const res = await fetch(`${apiUrl}/api/skills?sort=order:asc`, { next: { revalidate: 10 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

async function getProjectsData() {
  try {
    const res = await fetch(`${apiUrl}/api/projects?populate=image&sort=order:asc`, { next: { revalidate: 10 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

async function getAwardsData() {
  try {
    const res = await fetch(`${apiUrl}/api/awards?populate=image&sort=order:asc`, { next: { revalidate: 10 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

export default async function Home() {
  const profileRes = await getProfileData();
  const experienceRes = await getExperienceData();
  const skillsRes = await getSkillsData();
  const projectsRes = await getProjectsData();
  const awardsRes = await getAwardsData();

  const profileData = profileRes ? profileRes : fallbackProfile;
  const workingHistory = experienceRes && experienceRes.length > 0 ? experienceRes : fallbackExperience;
  const skillsData = skillsRes && skillsRes.length > 0 ? skillsRes : fallbackSkills;
  const projectsData = projectsRes && projectsRes.length > 0 ? projectsRes : fallbackProjects;
  const awardsData = awardsRes && awardsRes.length > 0 ? awardsRes : fallbackAwards;

  // Resolve avatar URL
  let avatarUrl = "/profile-placeholder.jpg";
  if (profileData.avatar?.url) {
    avatarUrl = profileData.avatar.url.startsWith('http') 
      ? profileData.avatar.url 
      : `${apiUrl}${profileData.avatar.url}`;
  }

  const navItems = (profileData.navigation && profileData.navigation.length > 0 ? profileData.navigation : fallbackNavigation)
    .filter((item: any) => item.sectionId !== "awards");

  return (
    <div className="animate-fade-in">
      <ScrollNavigation items={navItems} />
      
      {/* Hero Section */}
      <section className={styles.hero} id="hero">
        <h1 className={styles.heroTitle}>
          {profileData.name}
        </h1>
        <div className={styles.titleWrapper}>
          <h2 className={styles.heroSubtitle}>{profileData.title}</h2>
        </div>
        
        <div className={styles.profileImageWrapper}>
          <img src={avatarUrl} alt={profileData.name} className={styles.profileImage} />
        </div>

        <div className={styles.heroBio}>
          {Array.isArray(profileData.bio) ? (
            <BlocksRenderer content={profileData.bio} />
          ) : null}
        </div>

        <div className={styles.contactLinks}>
          {profileData.email && (
            <a href={`mailto:${profileData.email}`} className={styles.contactLink}>
              Email Me
            </a>
          )}
          {profileData.linkedin && (
            <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
              LinkedIn
            </a>
          )}
          {profileData.blogUrl && (
            <a href={profileData.blogUrl} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
              My Blog
            </a>
          )}
          {profileData.facebook && (
            <a href={profileData.facebook} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
              Facebook
            </a>
          )}
        </div>
      </section>

      {/* Working History */}
      <section className={styles.section} id="experience">
        <h2 className={styles.sectionTitle}>Working History</h2>
        <div className={styles.timeline}>
          {workingHistory.map((job: any, index: number) => {
            let logoUrl = null;
            if (job.logo?.url) {
              logoUrl = job.logo.url.startsWith('http') ? job.logo.url : `${apiUrl}${job.logo.url}`;
            }
            
            return (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.timelineLogo}>
                  {logoUrl ? (
                    <img src={logoUrl} alt={job.company} />
                  ) : (
                    <div style={{ fontSize: '10px', color: '#999', textAlign: 'center' }}>{job.company.substring(0, 2).toUpperCase()}</div>
                  )}
                </div>
                
                <div className={`glass-panel ${styles.card}`}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{job.company}</h3>
                    <div className={styles.cardSubtitle}>{job.role}</div>
                    {job.period && <div className={styles.cardPeriod}>{job.period}</div>}
                  </div>
                  
                  {job.description && Array.isArray(job.description) && (
                    <div className={styles.cardContent}>
                      <BlocksRenderer content={job.description} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* My Skillset */}
      <section className={styles.section} id="skills">
        <h2 className={styles.sectionTitle}>My Skillset</h2>
        <div className={styles.skillGrid}>
          {skillsData.map((skill: any, index: number) => (
            <div key={index} className={styles.skillItem}>
              <div className={styles.skillHeader}>
                <span>{skill.name}</span>
                <span>{skill.percent}%</span>
              </div>
              <div className={styles.skillBar}>
                <div 
                  className={styles.skillProgress} 
                  style={{ '--progress-width': `${skill.percent}%` } as React.CSSProperties}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Awards - Tạm ẩn theo yêu cầu */}
      {/*
      <section className={styles.section} id="awards">
        <h2 className={styles.sectionTitle}>Team Awards</h2>
        <AwardsCarousel awardsData={awardsData} />
      </section>
      */}

      {/* Worked Projects - Bento Grid */}
      <section className={styles.section} id="projects">
        <h2 className={styles.sectionTitle}>Worked Projects</h2>
        <div className={styles.bentoGrid}>
          {projectsData.map((project: any, index: number) => {
            const spanClass = project.spanClass ? styles[project.spanClass] : styles.span1;
            let imageUrl = "/profile-placeholder.jpg";
            if (typeof project.image === 'string') {
              imageUrl = project.image;
            } else if (project.image?.url) {
              imageUrl = project.image.url.startsWith('http') ? project.image.url : `${apiUrl}${project.image.url}`;
            }

            return (
              <a href={`/projects/${project.slug || '#'}`} key={index} className={`${styles.bentoItem} ${spanClass}`}>
                <div className={styles.bentoImageWrapper}>
                  <img src={imageUrl} alt={project.title} className={styles.bentoImage} />
                </div>
                <div className={styles.bentoContent}>
                  <div className={styles.bentoCategory}>{project.category}</div>
                  <h3 className={styles.bentoTitle}>{project.title}</h3>
                  <div className={styles.bentoReveal}><div>
                    <p className={styles.bentoDescription}>{project.description}</p>
                    <div className={styles.bentoFoot}>
                      {project.metric && (
                        <span className={styles.bentoMetric}>
                          <span className={styles.num}>{project.metric}</span>
                          {project.metricLabel && <span className={styles.lbl}>{project.metricLabel}</span>}
                        </span>
                      )}
                      <span className={styles.bentoArrow}>→</span>
                    </div>
                  </div></div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection profileData={profileData} />
    </div>
  );
}

import "./projectDetail.css";
import ProjectDetailEffects from "./ProjectDetailEffects";

const STRAPI = "http://127.0.0.1:1337";

// ---------- Fallback (placeholder) ----------
const fallbackProject = {
  title: "Global E-commerce Campaign",
  eyebrow: "Performance Marketing · 2024",
  summary:
    "A comprehensive digital transformation that scaled a global e-commerce brand to record-breaking growth and market penetration.",
  overview: [
    { k: "01", title: "Challenge", body: "A fragmented funnel and rising acquisition costs were capping growth across both B2B and B2C segments." },
    { k: "02", title: "Solution", body: "Rebuilt the media mix around full-funnel attribution, with creative testing and automated nurture workflows." },
    { k: "03", title: "Results", body: "Record-breaking performance — revenue, lead quality and reach all hit new highs within the first quarter." },
  ],
  metrics: [
    { prefix: "+", count: 200, suffix: "%", label: "ROI", ring: 89 },
    { prefix: "", count: 50, suffix: "k+", label: "Leads", ring: 70 },
    { prefix: "$", count: 10, suffix: "M+", label: "Revenue", ring: 83 },
    { prefix: "", count: 2, suffix: ".5M", label: "Reach", ring: 60 },
  ],
  phases: [
    { step: "Phase 01", title: "Audit & Re-architect", body: "A full audit mapped every touchpoint from first impression to repeat purchase, then we rebuilt the <strong>media buying strategy</strong> around incremental value.", image: null, imageLabel: "funnel audit dashboard" },
    { step: "Phase 02", title: "Creative as a Growth Lever", body: "A structured testing cadence fed winning concepts into scaled campaigns, while <strong>marketing automation</strong> nurtured leads with behaviour-based messaging.", image: null, imageLabel: "creative testing matrix" },
    { step: "Phase 03", title: "Compounding Engine", body: "The result was a repeatable, <strong>data-driven engine</strong> that compounded performance month over month.", image: null, imageLabel: "growth report" },
  ],
  assets: [
    { category: "Social", name: "Launch Hero Ad", description: "Primary launch creative used across Meta & TikTok placements.", size: "tall", image: null, imageLabel: "social ad — hero creative" },
    { category: "Web", name: "Campaign Landing Page", description: "Conversion-optimised landing experience.", size: "normal", image: null, imageLabel: "landing page" },
    { category: "Lifecycle", name: "Nurture Email Flow", description: "Behaviour-triggered automation series.", size: "normal", image: null, imageLabel: "email flow" },
    { category: "Display", name: "Programmatic Banners", description: "Responsive banner set for the GDN.", size: "normal", image: null, imageLabel: "display banner set" },
    { category: "Brand", name: "Results Deck", description: "Executive summary presented to stakeholders.", size: "tall", image: null, imageLabel: "case study deck" },
    { category: "Video", name: "UGC Edit", description: "Short-form creator content for paid social.", size: "normal", image: null, imageLabel: "ugc edit" },
  ],
  nextProject: { title: "B2B Lead Generation", slug: "#" },
};

const fallbackProfile = {
  name: "Toan Le Diep Trong",
  role: "Full Stack Digital Marketer",
  avatar: "/profile-placeholder.jpg",
  email: "s3068128@gmail.com",
  linkedin: "https://www.linkedin.com/in/toan-le-diep-trong/",
  blog: "https://lp.ledieptrongtoan.id.vn/",
};

async function getProfileData() {
  try {
    const res = await fetch(`${STRAPI}/api/profile?populate=avatar`, { next: { revalidate: 10 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

const mediaUrl = (m: any) =>
  typeof m === "string" ? m : m?.url ? `${STRAPI}${m.url}` : null;

// ---------- Fetch một project theo slug ----------
async function getProject(slug: string) {
  try {
    const populate =
      "populate[image]=true&populate[phases][populate]=image&populate[assets][populate]=image&populate[metrics]=true&populate[overview]=true";
    const res = await fetch(
      `${STRAPI}/api/projects?filters[slug][$eq]=${slug}&${populate}`,
      { next: { revalidate: 10 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0] || null;
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [projectData, profileData] = await Promise.all([
    getProject(slug),
    getProfileData(),
  ]);
  const data = projectData ?? fallbackProject;

  let avatarUrl = fallbackProfile.avatar;
  if (profileData?.avatar?.url) {
    avatarUrl = `${STRAPI}${profileData.avatar.url}`;
  }
  
  const profile = {
    name: profileData?.name || fallbackProfile.name,
    role: profileData?.role || fallbackProfile.role,
    avatar: avatarUrl,
    email: profileData?.email || fallbackProfile.email,
    linkedin: profileData?.linkedin || fallbackProfile.linkedin,
    blog: profileData?.blog || fallbackProfile.blog,
  };

  // chuẩn hoá field (Strapi v5 trả phẳng); fallback đã đúng shape sẵn
  const p = {
    title: data.title ?? fallbackProject.title,
    eyebrow: data.eyebrow ?? fallbackProject.eyebrow,
    summary: data.summary ?? fallbackProject.summary,
    overview: data.overview?.length ? data.overview : fallbackProject.overview,
    metrics: data.metrics?.length ? data.metrics : fallbackProject.metrics,
    phases: data.phases?.length ? data.phases : fallbackProject.phases,
    assets: data.assets?.length ? data.assets : fallbackProject.assets,
    nextProject: data.nextProject ?? fallbackProject.nextProject,
  };

  return (
    <div className="pd-page">
      {/* Header */}
      <header className="pd-head">
        <div className="pd-name">{profile.name}</div>
        <div className="pd-role">{profile.role}</div>
        <div className="pd-avatar"><img src={profile.avatar} alt={profile.name} /></div>
        <div className="pd-actions">
          <a className="pd-pill" href={`mailto:${profile.email}`}>Email Me</a>
          <a className="pd-pill pd-ghost" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="pd-pill pd-ghost" href={profile.blog} target="_blank" rel="noreferrer">My Blog</a>
        </div>
      </header>

      {/* Hero */}
      <section className="pd-hero">
        <div className="pd-bg" /><div className="pd-grain" />
        <div className="pd-hero-inner">
          <span className="pd-eyebrow">{p.eyebrow}</span>
          <h1>{p.title}</h1>
          <p>{p.summary}</p>
        </div>
        <div className="pd-cue">Scroll</div>
      </section>

      {/* Overview */}
      <section className="pd-sec">
        <h2 className="pd-title">Project Overview</h2>
        <div className="pd-ov">
          {p.overview.map((o: any, i: number) => (
            <div className="pd-ov-card pd-reveal" data-d={i} key={i}>
              <div className="pd-k">{o.k}</div>
              <h3>{o.title}</h3>
              <p>{o.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics — rings */}
      <section className="pd-sec">
        <h2 className="pd-title">Key Metrics</h2>
        <div className="pd-mx">
          {p.metrics.map((m: any, i: number) => (
            <div className="pd-ring-wrap pd-reveal" data-d={i} key={i}>
              <div className="pd-ring" style={{ ["--deg-target" as any]: `${m.ring * 3.6}deg` }}>
                <div className="pd-hole">
                  <span className="pd-num" data-count={m.count} data-prefix={m.prefix} data-suffix={m.suffix}>
                    {m.prefix}0{m.suffix}
                  </span>
                </div>
              </div>
              <div className="pd-ring-lbl">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Strategy — alternating */}
      <section className="pd-sec">
        <h2 className="pd-title">Strategy &amp; Execution</h2>
        {p.phases.map((ph: any, i: number) => (
          <div className="pd-st-row pd-reveal" key={i}>
            <div className="pd-st-txt">
              <div className="pd-step">{ph.step}</div>
              <h3>{ph.title}</h3>
              <p dangerouslySetInnerHTML={{ __html: ph.body }} />
            </div>
            <div className="pd-st-img">
              {mediaUrl(ph.image)
                ? <img src={mediaUrl(ph.image)!} alt={ph.title} />
                : <div className="pd-ph" data-label={ph.imageLabel || "image"} />}
            </div>
          </div>
        ))}
      </section>

      {/* Creative Assets — bento reveal */}
      <section className="pd-sec">
        <h2 className="pd-title">Creative Assets</h2>
        <div className="pd-ca">
          {p.assets.map((a: any, i: number) => (
            <a className={`pd-ca-item pd-reveal${a.size === "tall" ? " pd-tall" : ""}`} data-d={i % 3} href="#" key={i}>
              {mediaUrl(a.image)
                ? <img src={mediaUrl(a.image)!} alt={a.name} />
                : <div className="pd-ph" data-label={a.imageLabel || a.name} />}
              <div className="pd-ca-body">
                <div className="pd-ca-cat">{a.category}</div>
                <div className="pd-ca-name">{a.name}</div>
                <div className="pd-ca-rev"><div><p>{a.description}</p></div></div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Footer nav */}
      <footer className="pd-foot">
        <div className="pd-foot-nav">
          <a className="pd-pill pd-ghost" href="/">← Back to Home</a>
          {p.nextProject && (
            <a className="pd-pill" href={`/projects/${p.nextProject.slug}`}>
              Next Project: {p.nextProject.title} →
            </a>
          )}
        </div>
        <div className="pd-copyright">© 2025 {profile.name}. All rights reserved.</div>
      </footer>

      <ProjectDetailEffects />
    </div>
  );
}

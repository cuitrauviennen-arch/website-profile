# Handoff — Trang chi tiết dự án (Project Detail Page)

> Mục tiêu: Thêm trang **chi tiết dự án** cho portfolio Next.js + Strapi hiện có.
> Khi bấm vào một project ở trang chủ sẽ mở route `/projects/<slug>` hiển thị trang này.
> Theme: **navy + gold** (đã có sẵn trong `globals.css`). Giữ nguyên biến màu, font Merriweather/Inter.
> Hướng thiết kế: hero full-bleed có hiệu ứng, số liệu dạng **progress ring** đếm tăng, Strategy bố cục xen kẽ, **Creative Assets dạng bento reveal** (ảnh hover zoom + lớp phủ + mô tả trượt mở).

---

## 0. Giả định về codebase
- Next.js **App Router** (`src/app/...`), TypeScript.
- Strapi chạy ở `http://127.0.0.1:1337`, đã có collection **Project** (`/api/projects`).
- Đã cài `@strapi/blocks-react-renderer` (dùng cho rich text — tuỳ chọn).
- Trang chủ `src/app/page.tsx` đang map `projectsData` ra các card.

Tất cả code dưới đây **chạy được ngay với dữ liệu fallback** (không cần Strapi), giống pattern fallback đang dùng ở `page.tsx`. Sau đó nối Strapi ở mục 5.

---

## 1. Các file cần tạo / sửa

**Tạo mới:**
1. `src/app/projects/[slug]/page.tsx` — trang server component (fetch + fallback + markup)
2. `src/app/projects/[slug]/ProjectDetailEffects.tsx` — client component (reveal, count-up, ring)
3. `src/app/projects/[slug]/projectDetail.css` — toàn bộ CSS (đã prefix `pd-` để không đụng style khác)

**Sửa:**
4. `src/app/page.tsx` — đổi link card project trỏ sang `/projects/<slug>`

> Lưu ý: trang này nằm trong `<main className="container">` của `RootLayout` nên đã có max-width + padding sẵn. CSS dưới đây không tự đặt max-width.

---

## 2. `src/app/projects/[slug]/projectDetail.css`

```css
/* ===== Project Detail — scoped under .pd-page (prefix pd-) ===== */
@property --deg { syntax: '<angle>'; inherits: false; initial-value: 0deg; }

.pd-page { --ease: cubic-bezier(.2,.8,.2,1); color: var(--text-primary); }
.pd-page * { box-sizing: border-box; }
.pd-page img { display: block; max-width: 100%; }

/* placeholder (xoá khi đã có ảnh thật) */
.pd-ph{
  position:relative;width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;
  background:
    repeating-linear-gradient(135deg,rgba(255,255,255,.025) 0 10px,rgba(255,255,255,0) 10px 20px),
    linear-gradient(160deg,#0e1a33,#070d1c);
}
.pd-ph::after{content:attr(data-label);font-family:ui-monospace,Menlo,Consolas,monospace;
  font-size:.7rem;letter-spacing:.08em;color:var(--text-faint,#64748b);text-transform:uppercase;text-align:center;padding:0 1rem;}

/* header */
.pd-head{padding:2.5rem 0 1.5rem;text-align:center;}
.pd-name{font-family:var(--font-serif);font-weight:900;font-size:1.9rem;letter-spacing:.12em;color:var(--accent-light);text-transform:uppercase;}
.pd-role{font-size:.72rem;letter-spacing:.32em;text-transform:uppercase;color:var(--text-secondary);margin-top:.4rem;}
.pd-avatar{width:96px;height:96px;border-radius:50%;margin:1.6rem auto 1.2rem;border:2px solid var(--accent-color);padding:4px;
  box-shadow:0 8px 22px rgba(212,175,55,.18);transition:transform .4s var(--ease),box-shadow .4s var(--ease);overflow:hidden;}
.pd-avatar:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 12px 30px rgba(212,175,55,.4);}
.pd-avatar img,.pd-avatar .pd-ph{width:100%;height:100%;border-radius:50%;object-fit:cover;}
.pd-actions{display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;}

/* buttons */
.pd-pill{display:inline-flex;align-items:center;gap:.5rem;padding:.55rem 1.5rem;border-radius:99px;font-size:.85rem;font-weight:700;
  background:var(--accent-gradient);color:#1a1a1a;border:1px solid transparent;text-decoration:none;
  transition:transform .3s var(--ease),box-shadow .3s var(--ease);}
.pd-pill:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(212,175,55,.4);color:#1a1a1a;}
.pd-pill.pd-ghost{background:transparent;color:var(--text-primary);border-color:var(--glass-border);}
.pd-pill.pd-ghost:hover{border-color:var(--accent-color);color:var(--accent-light);box-shadow:none;}

/* section + heading */
.pd-sec{padding:3.2rem 0;}
.pd-title{font-family:var(--font-serif);font-size:1.8rem;font-weight:700;display:inline-block;position:relative;margin-bottom:2.2rem;}
.pd-title::after{content:'';position:absolute;bottom:-8px;left:0;width:40px;height:3px;background:var(--accent-color);border-radius:2px;}
.pd-eyebrow{font-size:.74rem;letter-spacing:.22em;text-transform:uppercase;font-weight:700;color:var(--accent-color);}

/* hero (full-bleed immersive) */
.pd-hero{position:relative;min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;margin:1.5rem 0 0;border-radius:24px;overflow:hidden;padding:4rem 2rem;border:1px solid rgba(212,175,55,.2);}
.pd-hero .pd-bg{position:absolute;inset:0;z-index:0;background:
  radial-gradient(60% 50% at 50% 8%,rgba(212,175,55,.22),transparent 60%),
  radial-gradient(80% 60% at 20% 100%,rgba(120,90,20,.25),transparent 60%),
  radial-gradient(70% 60% at 90% 80%,rgba(212,175,55,.12),transparent 60%),
  linear-gradient(180deg,#0a0f1f,#05080f);}
.pd-hero .pd-grain{position:absolute;inset:0;z-index:0;opacity:.5;
  background:repeating-linear-gradient(125deg,rgba(212,175,55,.05) 0 2px,transparent 2px 32px);animation:pd-drift 18s linear infinite;}
@keyframes pd-drift{to{background-position:600px 0;}}
.pd-hero-inner{position:relative;z-index:1;}
.pd-hero .pd-eyebrow{display:inline-block;margin-bottom:1.4rem;}
.pd-hero h1{font-family:var(--font-serif);font-weight:900;font-size:clamp(2.4rem,6vw,4.2rem);line-height:1.05;
  color:var(--accent-light);max-width:14ch;margin:0 auto 1.5rem;text-shadow:0 4px 40px rgba(212,175,55,.25);}
.pd-hero p{color:var(--text-primary);max-width:56ch;margin:0 auto;font-size:1.1rem;font-weight:300;}
.pd-cue{position:absolute;bottom:1.6rem;left:50%;transform:translateX(-50%);z-index:1;font-size:.7rem;letter-spacing:.22em;
  text-transform:uppercase;color:var(--text-secondary);display:flex;flex-direction:column;align-items:center;gap:.5rem;}
.pd-cue::after{content:'';width:1px;height:26px;background:linear-gradient(var(--accent-color),transparent);animation:pd-cue 1.8s ease-in-out infinite;}
@keyframes pd-cue{0%,100%{transform:scaleY(.4);opacity:.4;}50%{transform:scaleY(1);opacity:1;}}

/* overview cards (gold top border on hover) */
.pd-ov{display:grid;grid-template-columns:repeat(3,1fr);gap:1.4rem;}
.pd-ov-card{position:relative;padding:2rem 1.7rem;border-radius:16px;overflow:hidden;background:var(--glass-bg);
  border:1px solid var(--glass-border);transition:transform .5s var(--ease),border-color .5s ease,background .5s ease;}
.pd-ov-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--accent-gradient);
  transform:scaleX(0);transform-origin:left;transition:transform .6s var(--ease);}
.pd-ov-card:hover{transform:translateY(-6px);border-color:rgba(212,175,55,.35);background:rgba(255,255,255,.05);}
.pd-ov-card:hover::before{transform:scaleX(1);}
.pd-ov-card .pd-k{font-family:var(--font-serif);font-weight:900;color:rgba(212,175,55,.5);font-size:1rem;margin-bottom:.8rem;}
.pd-ov-card h3{font-size:1.2rem;color:#fff;margin-bottom:.6rem;font-weight:700;}
.pd-ov-card p{color:var(--text-secondary);font-size:.92rem;}

/* metrics — progress rings */
.pd-mx{display:grid;grid-template-columns:repeat(4,1fr);gap:1.4rem;}
.pd-ring-wrap{display:flex;flex-direction:column;align-items:center;gap:1rem;}
.pd-ring{--deg:0deg;width:140px;height:140px;border-radius:50%;display:grid;place-items:center;
  background:conic-gradient(var(--accent-color) var(--deg),rgba(212,175,55,.12) 0deg);transition:--deg 1.5s var(--ease);}
.pd-ring.in{--deg:var(--deg-target);}
.pd-ring .pd-hole{width:112px;height:112px;border-radius:50%;background:#070d1c;display:grid;place-items:center;border:1px solid var(--glass-border);}
.pd-ring .pd-num{font-family:var(--font-serif);font-weight:900;font-size:1.5rem;color:var(--accent-light);}
.pd-ring-lbl{font-size:.76rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-secondary);}

/* strategy — alternating rows */
.pd-st-row{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:center;margin-bottom:2.5rem;}
.pd-st-row:nth-child(even) .pd-st-img{order:-1;}
.pd-st-img{height:300px;border-radius:16px;overflow:hidden;border:1px solid var(--glass-border);box-shadow:var(--glass-shadow);}
.pd-st-img img,.pd-st-img .pd-ph{width:100%;height:100%;object-fit:cover;transition:transform 1s var(--ease);}
.pd-st-img:hover img,.pd-st-img:hover .pd-ph{transform:scale(1.06);}
.pd-st-txt .pd-step{font-family:var(--font-serif);font-weight:900;color:rgba(212,175,55,.45);font-size:.95rem;margin-bottom:.6rem;}
.pd-st-txt h3{font-size:1.5rem;font-family:var(--font-serif);color:#fff;margin-bottom:.7rem;}
.pd-st-txt p{color:var(--text-secondary);font-size:.96rem;}
.pd-st-txt p strong{color:var(--accent-light);font-weight:600;}

/* creative assets — bento reveal */
.pd-ca{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:260px;gap:1.3rem;}
.pd-ca-item{position:relative;border-radius:18px;overflow:hidden;cursor:pointer;isolation:isolate;text-decoration:none;
  border:1px solid var(--glass-border);box-shadow:var(--glass-shadow);
  transition:transform .5s var(--ease),border-color .5s ease,box-shadow .5s ease;}
.pd-ca-item.pd-tall{grid-row:span 2;}
.pd-ca-item .pd-ph,.pd-ca-item img{position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover;transition:transform .9s var(--ease);}
.pd-ca-item::before{content:'';position:absolute;inset:0;z-index:1;
  background:linear-gradient(180deg,rgba(5,10,20,.1) 0%,rgba(5,10,20,.35) 50%,rgba(5,10,20,.9) 100%);transition:background .6s ease;}
.pd-ca-body{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:1.3rem 1.4rem;}
.pd-ca-cat{font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--accent-color);margin-bottom:.35rem;}
.pd-ca-name{font-family:var(--font-serif);font-weight:700;color:#fff;font-size:1.1rem;line-height:1.25;}
.pd-ca-rev{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .55s var(--ease),opacity .4s ease;}
.pd-ca-rev>div{overflow:hidden;}
.pd-ca-rev p{color:var(--text-secondary);font-size:.86rem;margin-top:.5rem;}
.pd-ca-item:hover{transform:translateY(-6px);border-color:rgba(212,175,55,.45);box-shadow:0 22px 44px rgba(0,0,0,.55);}
.pd-ca-item:hover .pd-ph,.pd-ca-item:hover img{transform:scale(1.08);}
.pd-ca-item:hover::before{background:linear-gradient(180deg,rgba(5,10,20,.15) 0%,rgba(5,10,20,.55) 45%,rgba(5,10,20,.95) 100%);}
.pd-ca-item:hover .pd-ca-rev{grid-template-rows:1fr;opacity:1;}

/* footer */
.pd-foot{padding:4rem 0 2rem;text-align:center;}
.pd-foot-nav{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:2.5rem;}
.pd-copyright{font-size:.74rem;letter-spacing:.18em;text-transform:uppercase;color:var(--text-faint,#64748b);
  border-top:1px solid var(--glass-border);padding-top:1.8rem;}

/* scroll reveal */
.pd-reveal{opacity:0;transform:translateY(26px);transition:opacity .7s var(--ease),transform .7s var(--ease);}
.pd-reveal.in{opacity:1;transform:none;}
.pd-reveal[data-d="1"]{transition-delay:.08s;}
.pd-reveal[data-d="2"]{transition-delay:.16s;}
.pd-reveal[data-d="3"]{transition-delay:.24s;}

@media (prefers-reduced-motion: reduce){
  .pd-reveal{opacity:1;transform:none;transition:none;}
  .pd-hero .pd-grain,.pd-cue::after{animation:none;}
  .pd-ring{--deg:var(--deg-target);transition:none;}
}
@media(max-width:820px){
  .pd-ov,.pd-mx{grid-template-columns:repeat(2,1fr);}
  .pd-st-row{grid-template-columns:1fr;gap:1.2rem;}
  .pd-st-row:nth-child(even) .pd-st-img{order:0;}
  .pd-ca{grid-template-columns:repeat(2,1fr);}
}
@media(max-width:560px){
  .pd-ov,.pd-mx{grid-template-columns:1fr;}
  .pd-ca{grid-template-columns:1fr;}
  .pd-ca-item.pd-tall{grid-row:span 1;}
  .pd-name{font-size:1.45rem;}
}
```

---

## 3. `src/app/projects/[slug]/ProjectDetailEffects.tsx`

Client component chạy reveal + đếm số + fill ring. Render `null`, chỉ gắn 1 lần trong page.

```tsx
"use client";
import { useEffect } from "react";

export default function ProjectDetailEffects() {
  useEffect(() => {
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    // count-up
    const runCount = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.count || "0");
      const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
      const dur = 1500, start = performance.now();
      const id = setInterval(() => {
        const p = Math.min((performance.now() - start) / dur, 1);
        el.textContent = pre + Math.round(target * easeOut(p)) + suf;
        if (p >= 1) { clearInterval(id); el.textContent = pre + target + suf; }
      }, 1000 / 30);
    };

    let reveals = Array.from(document.querySelectorAll<HTMLElement>(".pd-reveal"));
    let counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    let rings = Array.from(document.querySelectorAll<HTMLElement>(".pd-ring"));

    const check = () => {
      const vh = window.innerHeight;
      reveals = reveals.filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) { el.classList.add("in"); return false; }
        return true;
      });
      counters = counters.filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { runCount(el); return false; }
        return true;
      });
      rings = rings.filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.85 && r.bottom > 0) { el.classList.add("in"); return false; }
        return true;
      });
    };

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
    // an toàn: hiện hết sau 2.5s nếu vì lý do gì đó chưa trigger
    const t = setTimeout(() => {
      reveals.forEach((el) => el.classList.add("in"));
      counters.forEach(runCount);
      rings.forEach((el) => el.classList.add("in"));
    }, 2500);

    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      clearTimeout(t);
    };
  }, []);

  return null;
}
```

---

## 4. `src/app/projects/[slug]/page.tsx`

Server component. Có **fallback data** để render ngay. `ring` = phần trăm (0–100) → góc fill = `ring*3.6deg`.

```tsx
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

const profile = {
  name: "Toan Le Diep Trong",
  role: "Full Stack Digital Marketer",
  avatar: "/profile-placeholder.jpg",
  email: "s3068128@gmail.com",
  linkedin: "https://www.linkedin.com/in/toan-le-diep-trong/",
  blog: "https://lp.ledieptrongtoan.id.vn/",
};

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
  const data = (await getProject(slug)) ?? fallbackProject;

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
```

> **Lưu ý kỹ thuật**
> - `params` là `Promise` ở Next.js 15 (App Router) — đã `await`. Nếu dự án dùng Next ≤14, đổi thành `{ params }: { params: { slug: string } }` và bỏ `await`.
> - `dangerouslySetInnerHTML` chỉ dùng cho `phases[].body` (cho phép `<strong>`). Nếu dùng rich text Strapi (blocks), thay bằng `<BlocksRenderer content={ph.body} />`.
> - Ảnh đang dùng `<img>` cho khớp code hiện tại. Nếu muốn `next/image`, thêm `127.0.0.1` vào `images.remotePatterns` trong `next.config.ts`.

---

## 5. Strapi — field cần thêm vào content-type **Project**

| Field | Kiểu | Ghi chú |
|---|---|---|
| `slug` | UID (target: title) | dùng cho URL `/projects/<slug>` |
| `eyebrow` | Text | vd "Performance Marketing · 2024" |
| `summary` | Text (long) | đoạn mô tả ở hero |
| `overview` | Component (repeatable) `overview-item` | fields: `k` (text), `title` (text), `body` (long text) |
| `metrics` | Component (repeatable) `metric` | fields: `prefix` (text), `count` (number), `suffix` (text), `label` (text), `ring` (number 0–100) |
| `phases` | Component (repeatable) `phase` | fields: `step` (text), `title` (text), `body` (rich/long text), `image` (media) |
| `assets` | Component (repeatable) `creative-asset` | fields: `category` (text), `name` (text), `description` (text), `size` (enum: `normal` \| `tall`), `image` (media) |
| `nextProject` | Relation (Project) hoặc Component {title, slug} | nút "Next Project" |

> Đảm bảo bật **public read** cho các collection/route cần thiết (Settings → Roles → Public → `find`/`findOne`).
> Query populate đã viết sẵn trong `getProject()` (mục 4).

---

## 6. Sửa link ở trang chủ — `src/app/page.tsx`

Trong phần map `projectsData`, đổi `href` của card sang trang chi tiết:

```tsx
// CŨ:
<a href={project.link || "#"} key={index} className={`${styles.bentoItem} ...`}>

// MỚI:
<a href={`/projects/${project.slug}`} key={index} className={`${styles.bentoItem} ...`}>
```

(Thêm `slug` vào `fallbackProjects` nếu muốn test bằng dữ liệu giả.)

---

## 7. Checklist nghiệm thu
- [ ] Mở `/projects/global-e-commerce-campaign` (hoặc bất kỳ slug nào) → trang render đầy đủ kể cả khi Strapi tắt (dùng fallback).
- [ ] Hero full-bleed có nền gold + chữ serif vàng + chỉ báo "Scroll".
- [ ] Cuộn xuống: các section **fade-in**, số liệu **đếm tăng**, vòng tròn **fill dần**.
- [ ] Hover card Creative Assets: ảnh zoom + lớp phủ đậm + mô tả trượt mở; 2 card `tall` cao gấp đôi.
- [ ] Strategy: hàng lẻ ảnh phải, hàng chẵn ảnh trái.
- [ ] Responsive: 820px → 2 cột; 560px → 1 cột.
- [ ] Click project ở trang chủ → vào đúng `/projects/<slug>`.
- [ ] Nối Strapi: thêm field ở mục 5, nhập dữ liệu thật, ảnh hiển thị thay placeholder.

---

*Bản thiết kế tham chiếu: `project-detail/Project Detail - Final (C + A gallery).html`.*

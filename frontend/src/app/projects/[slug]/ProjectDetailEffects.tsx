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

"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ScrollNavigation.module.css';

export interface NavItem {
  id?: number;
  label: string;
  sectionId: string;
}

interface ScrollNavigationProps {
  items: NavItem[];
}

export default function ScrollNavigation({ items }: ScrollNavigationProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // If no items, do nothing
    if (!items || items.length === 0) return;

    // Set initial active section to the first item if none is set
    if (!activeSection) {
      setActiveSection(items[0].sectionId);
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      let currentSection = items[0].sectionId;
      
      for (const item of items) {
        const element = document.getElementById(item.sectionId);
        if (element && element.offsetTop <= scrollPosition) {
          currentSection = item.sectionId;
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [items, activeSection]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  if (!mounted || !items || items.length === 0) return null;

  const getIconForSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        // User icon
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
      case 'experience':
        // Briefcase icon
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
      case 'skills':
        // Zap / Lightning icon
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
      case 'projects':
        // Layout grid icon
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
      case 'contact':
        // Mail icon
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
      case 'awards':
        // Trophy icon
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>;
      default:
        // Circle default
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>;
    }
  };

  return createPortal(
    <div className={styles.navContainer}>
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className={`${styles.navItem} ${activeSection === item.sectionId ? styles.active : ''}`}
          onClick={() => scrollToSection(item.sectionId)}
          title={item.label}
        >
          <span className={styles.navLabel}>{item.label}</span>
          <div className={styles.navDot}>
            {getIconForSection(item.sectionId)}
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
}

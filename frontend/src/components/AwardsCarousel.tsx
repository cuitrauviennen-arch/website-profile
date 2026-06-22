"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from '../app/page.module.css';

export default function AwardsCarousel({ awardsData }: { awardsData: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  // Responsive logic
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 650) setCardsPerView(1);
      else if (window.innerWidth < 950) setCardsPerView(2);
      else setCardsPerView(3);
    };
    updateCardsPerView(); // Initial check
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const totalGroups = Math.max(1, awardsData.length - cardsPerView + 1);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalGroups);
  }, [totalGroups]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carouselViewport}>
        <div 
          className={styles.carouselTrack}
          style={{ transform: `translateX(calc(-${currentIndex} * (100% / ${cardsPerView})))` }}
        >
          {awardsData.map((award: any, index: number) => {
            let imageUrl = "/profile-placeholder.jpg";
            if (typeof award.image === 'string') {
              imageUrl = award.image;
            } else if (award.image?.url) {
              imageUrl = `http://127.0.0.1:1337${award.image.url}`;
            }

            return (
            <div key={index} className={styles.carouselSlide} style={{ width: `calc(100% / ${cardsPerView})` }}>
              <div className={`glass-panel ${styles.awardCard}`}>
                <div className={styles.awardImageWrapper}>
                  <img src={imageUrl} alt={award.title} className={styles.awardImage} />
                </div>
                <div className={styles.awardInfo}>
                  <div className={styles.awardYear}>{award.year}</div>
                  <h3 className={styles.awardTitle}>{award.title}</h3>
                  <div className={styles.awardOrganization}>{award.organization}</div>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
      
      {/* Pagination Dots */}
      {totalGroups > 1 && (
        <div className={styles.carouselDots}>
          {Array.from({ length: totalGroups }).map((_, index) => (
            <button
              key={index}
              className={`${styles.carouselDot} ${index === currentIndex ? styles.carouselDotActive : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

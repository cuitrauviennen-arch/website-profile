"use client";

import React, { useState } from 'react';
import styles from '../app/page.module.css';

interface ProfileData {
  contactTitle?: string;
  contactDescription?: string;
  email?: string;
  linkedin?: string;
  facebook?: string;
  blogUrl?: string;
}

export default function ContactSection({ profileData }: { profileData: ProfileData }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
      const response = await fetch(`${apiUrl}/api/contact-submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
          }
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('An error occurred while sending your message. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while sending your message. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const title = profileData?.contactTitle || "Let's Connect";
  const desc = profileData?.contactDescription || "I'm always open to exploring new challenges and collaborations. Whether you have a project in mind or just want to chat, feel free to drop me a message!";

  return (
    <section className={styles.section} id="contact" style={{ marginBottom: 0, paddingBottom: '5rem' }}>
      <div className={styles.contactSplit}>
        <div className={styles.contactSplitLeft}>
          <h2 className={styles.contactSplitHeadline}>{title}</h2>
          <p className={styles.contactSplitDesc}>{desc}</p>
          <div className={styles.contactSocials}>
            {profileData?.email && (
              <a href={`mailto:${profileData.email}`} className={styles.contactSocialLink} title="Email">E</a>
            )}
            {profileData?.linkedin && (
              <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className={styles.contactSocialLink} title="LinkedIn">in</a>
            )}
            {profileData?.facebook && (
              <a href={profileData.facebook} target="_blank" rel="noopener noreferrer" className={styles.contactSocialLink} title="Facebook">f</a>
            )}
            {profileData?.blogUrl && (
              <a href={profileData.blogUrl} target="_blank" rel="noopener noreferrer" className={styles.contactSocialLink} title="Blog">B</a>
            )}
          </div>
        </div>
        <div className={styles.contactSplitRight}>
          {isSubmitted ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}>✓</div>
              <h3 className={styles.successTitle}>Message Sent Successfully!</h3>
              <p className={styles.successText}>
                Thank you for reaching out. I have received your message and will get back to you as soon as possible.
              </p>
              <button 
                type="button"
                className={styles.submitButton}
                onClick={() => setIsSubmitted(false)}
                style={{ marginTop: '2rem' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="name">Name</label>
              <input 
                type="text" 
                id="name" 
                className={styles.inputField} 
                placeholder="John Doe" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                className={styles.inputField} 
                placeholder="john@example.com" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="subject">Subject</label>
              <input 
                type="text" 
                id="subject" 
                className={styles.inputField} 
                placeholder="How can I help you?" 
                required 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="message">Message</label>
              <textarea 
                id="message" 
                className={styles.inputField} 
                placeholder="Your message here..." 
                rows={4} 
                required 
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>

            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Message'}
            </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

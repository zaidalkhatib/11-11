"use client";
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { Illustration } from '../components/brand/Illustration';
import { openAppDownload } from '../packages/domain/app-store';
import { tokens } from '../packages/design-tokens';
import { experiences } from '../packages/domain';

type Panel = 'how' | null;
const brandStyle = { ...Object.fromEntries(Object.entries(tokens.color).map(([key, value]) => [`--${key}`, value])), '--radius-card': `${tokens.radius.card}px`, '--radius-pill': `${tokens.radius.pill}px`, '--duration-reveal': `${tokens.motion.reveal}ms`, '--minimum-target': `${tokens.accessibility.minimumTarget}px` } as CSSProperties;

function subscribeToMotion(callback: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
const getMotionPreference = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getServerMotionPreference = () => true;

function PhoneIcon() {
  return (
    <svg className="phone-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="17.5" r="1" fill="currentColor" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="instagram-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export default function Home() {
  const [panel, setPanel] = useState<Panel>(null);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, getMotionPreference, getServerMotionPreference);
  const dialog = useRef<HTMLDialogElement>(null);
  const experience = experiences[0];

  useEffect(() => {
    if (panel) dialog.current?.showModal();
    else dialog.current?.close();
  }, [panel]);

  const close = () => setPanel(null);
  const onDownload = () => {
    openAppDownload();
  };

  return <div className="site-shell" style={brandStyle} data-motion={reducedMotion ? 'paused' : 'playing'}>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="grain" aria-hidden="true" />
    <header className="site-header">
      <a className="wordmark" href="#main" aria-label="11:11 home">11<span>:</span>11<span className="brand-star" aria-hidden="true">✧</span></a>
      <nav aria-label="Main navigation">
        <button type="button" onClick={() => setPanel('how')}>how it works</button>
        <a
          className="instagram-link"
          href="https://www.instagram.com/1111dates/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="11:11 on Instagram"
        >
          <InstagramIcon />
        </a>
      </nav>
    </header>
    <main id="main" className="hero" tabIndex={-1}>
      <div className="connection">
        <h1>Two people.<br className="mobile-break"/> One blind date.<span className="sr-only"> A personality-led blind dinner date.</span></h1>
        <div className="moment-line" aria-hidden="true">
          <div className="moment" key={experience.id}>
            <span className="moment-lead">over</span>
            <span className="moment-pill"><Illustration kind={experience.id}/><span>dinner</span></span>
          </div>
        </div>
      </div>
    </main>
    <div className="hero-actions landing-actions">
      <Link href="/signup" className="primary-cta signup-cta">Sign up</Link>
      <button type="button" className="secondary-cta" onClick={onDownload}>
        <PhoneIcon /> Download our app
      </button>
    </div>
    <dialog ref={dialog} className="panel" aria-labelledby="panel-title" onCancel={close} onClose={close} onClick={event => {
      if (event.target === event.currentTarget) {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
      }
    }}>
      <button className="close-button" onClick={close} aria-label="Close dialog">×</button>
      {panel === 'how' && <>
        <p className="eyebrow">HOW IT WORKS</p>
        <h2 id="panel-title">A blind date.<br/><em>Thoughtfully planned.</em></h2>
        <ol className="steps">
          <li><span>01</span><div><h3>Start with who you are.</h3><p>Your personality, what matters to you, and the evenings you enjoy.</p></div></li>
          <li><span>02</span><div><h3>Meet your blind date.</h3><p>A personality-led blind date. Always one person meeting one person.</p></div></li>
          <li><span>03</span><div><h3>Let dinner do the rest.</h3><p>A table for two. The plan is taken care of, so you can be present.</p></div></li>
        </ol>
        <p className="how-footnote">* More experiences may come later.</p>
      </>}
    </dialog>
  </div>;
}

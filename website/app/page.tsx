"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { Illustration } from '../components/brand/Illustration';
import { SignupExperience, AppDownloadPreview } from '../components/signup/SignupExperience';
import { tokens } from '../packages/design-tokens';
import { experiences } from '../packages/domain';

type Panel = 'how' | 'signup' | 'download' | null;
const moments = [
  { lead: 'over', title: 'dinner for two' },
  { lead: 'on', title: 'a little adventure' },
  { lead: 'through', title: 'something creative' },
] as const;
const brandStyle = { ...Object.fromEntries(Object.entries(tokens.color).map(([key, value]) => [`--${key}`, value])), '--radius-card': `${tokens.radius.card}px`, '--radius-pill': `${tokens.radius.pill}px`, '--duration-reveal': `${tokens.motion.reveal}ms`, '--minimum-target': `${tokens.accessibility.minimumTarget}px` } as CSSProperties;

function subscribeToMotion(callback: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
const getMotionPreference = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getServerMotionPreference = () => true;

export default function Home() {
  const [selected, setSelected] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, getMotionPreference, getServerMotionPreference);
  const dialog = useRef<HTMLDialogElement>(null);
  const experience = experiences[selected];
  const moment = moments[selected];

  useEffect(() => {
    if (panel) dialog.current?.showModal();
    else dialog.current?.close();
  }, [panel]);
  useEffect(() => {
    if (reducedMotion || panel) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setSelected(current => (current + 1) % experiences.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [reducedMotion, panel, selected]);

  const close = () => setPanel(null);
  return <div className="site-shell" style={brandStyle} data-motion={reducedMotion ? 'paused' : 'playing'}>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="grain" aria-hidden="true" />
    <header className="site-header">
      <a className="wordmark" href="#main" aria-label="11:11 home">11<span>:</span>11<span className="brand-star" aria-hidden="true">✧</span></a>
      <nav aria-label="Main navigation"><button onClick={() => setPanel('how')}>how it works <span aria-hidden="true">↗</span></button></nav>
    </header>
    <main id="main" className="hero" tabIndex={-1}>
      <div className="connection">
        <h1>Two people.<br className="mobile-break"/> One blind date.<span className="sr-only"> Through a personality-led blind date, with dinner, a little adventure or something creative.</span></h1>
        <div className="moment-line" aria-hidden="true">
          <div className="moment" key={experience.id}>
            <span className="moment-lead">{moment.lead}</span>
            <span className="moment-pill"><Illustration kind={experience.id}/><span>{moment.title}</span></span>
          </div>
        </div>
        <div className="possibilities" role="group" aria-label="Explore experience concepts">
          {experiences.map((item, index) => <button key={item.id} aria-pressed={index === selected} onClick={() => setSelected(index)}><span className="choice-dot" aria-hidden="true"/>{item.short}</button>)}
        </div>
      </div>
    </main>
    <div className="hero-actions landing-actions"><button className="primary-cta signup-cta" onClick={() => setPanel('signup')}>Sign up <span aria-hidden="true">↗</span></button><button className="secondary-cta" onClick={() => setPanel('download')}><span className="phone-icon" aria-hidden="true">▯</span> Download our app</button></div>
    <dialog ref={dialog} className={`panel ${panel === 'signup' ? 'signup-panel' : ''}`} aria-labelledby="panel-title" onCancel={close} onClose={close} onClick={event => {
      if (event.target === event.currentTarget) {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
      }
    }}>
      <button className="close-button" onClick={close} aria-label="Close dialog">×</button>
      {panel === 'signup' && <SignupExperience paused={reducedMotion}/>}
      {panel === 'download' && <AppDownloadPreview onSignup={() => setPanel('signup')}/>}
      {panel === 'how' && <>
        <p className="eyebrow">HOW IT WORKS</p>
        <h2 id="panel-title">A blind date.<br/><em>Thoughtfully planned.</em></h2>
        <ol className="steps">
          <li><span>01</span><div><h3>Start with who you are.</h3><p>Your personality, what matters to you, and the moments you enjoy.</p></div></li>
          <li><span>02</span><div><h3>Meet your blind date.</h3><p>A personality-led blind date. Always one person meeting one person.</p></div></li>
          <li><span>03</span><div><h3>Let the experience do the rest.</h3><p>A dinner, a little adventure or something creative. The plan is taken care of, so you can be present.</p></div></li>
        </ol>
      </>}
    </dialog>
  </div>;
}

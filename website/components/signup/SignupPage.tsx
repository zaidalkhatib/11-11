'use client';

import Link from 'next/link';
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { callingCodes, validatePreviewPhone, type CountryId } from '../../packages/domain/signup';
import { tokens } from '../../packages/design-tokens';

type Segment = { text: string; bold?: boolean };

const WELCOME_TITLE = 'welcome to 11:11.';
const WELCOME_BODY: Segment[] = [
  { text: 'where ' },
  { text: 'two people', bold: true },
  { text: ' meet on ' },
  { text: 'one blind date', bold: true },
  { text: ' — thoughtfully planned.' },
];

const CHAR_MS = 32;
const TITLE_PAUSE_MS = 380;
const BODY_PAUSE_MS = 480;

const brandStyle = {
  ...Object.fromEntries(Object.entries(tokens.color).map(([key, value]) => [`--${key}`, value])),
  '--radius-card': `${tokens.radius.card}px`,
  '--radius-pill': `${tokens.radius.pill}px`,
  '--duration-reveal': `${tokens.motion.reveal}ms`,
  '--minimum-target': `${tokens.accessibility.minimumTarget}px`,
} as CSSProperties;

function subscribeToMotion(callback: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
const getMotionPreference = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getServerMotionPreference = () => false;

function flattenBody(segments: Segment[]) {
  return segments.map((s) => s.text).join('');
}

function renderTypedBody(segments: Segment[], typedCount: number) {
  let remaining = typedCount;
  const nodes: ReactNode[] = [];
  segments.forEach((segment, index) => {
    if (remaining <= 0) return;
    const take = Math.min(segment.text.length, remaining);
    const slice = segment.text.slice(0, take);
    remaining -= take;
    nodes.push(
      segment.bold ? (
        <strong key={index}>{slice}</strong>
      ) : (
        <span key={index}>{slice}</span>
      ),
    );
  });
  return nodes;
}

export function SignupPage() {
  const reducedMotion = useSyncExternalStore(subscribeToMotion, getMotionPreference, getServerMotionPreference);
  const bodyFull = useMemo(() => flattenBody(WELCOME_BODY), []);
  const [titleTyped, setTitleTyped] = useState(0);
  const [bodyTyped, setBodyTyped] = useState(0);
  const [stage, setStage] = useState<'intro' | 'phone'>('intro');
  const [country, setCountry] = useState<CountryId>('US');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const titleDone = titleTyped >= WELCOME_TITLE.length;
  const bodyDone = bodyTyped >= bodyFull.length;

  useEffect(() => {
    if (reducedMotion) {
      setTitleTyped(WELCOME_TITLE.length);
      setBodyTyped(bodyFull.length);
      setStage('phone');
      return;
    }

    setTitleTyped(0);
    setBodyTyped(0);
    setStage('intro');

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let i = 0;

    const typeTitle = () => {
      if (cancelled) return;
      if (i <= WELCOME_TITLE.length) {
        setTitleTyped(i);
        i += 1;
        timer = setTimeout(typeTitle, CHAR_MS);
        return;
      }
      timer = setTimeout(() => {
        let j = 0;
        const typeBody = () => {
          if (cancelled) return;
          if (j <= bodyFull.length) {
            setBodyTyped(j);
            j += 1;
            timer = setTimeout(typeBody, CHAR_MS);
            return;
          }
          timer = setTimeout(() => {
            if (!cancelled) setStage('phone');
          }, BODY_PAUSE_MS);
        };
        typeBody();
      }, TITLE_PAUSE_MS);
    };

    typeTitle();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [reducedMotion, bodyFull.length]);

  useEffect(() => {
    if (stage === 'phone') phoneRef.current?.focus();
  }, [stage]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const issue = validatePreviewPhone(phone, country);
    setError(issue);
    if (issue) {
      phoneRef.current?.focus();
      return;
    }
    setDone(true);
  }

  return (
    <div className="site-shell signup-shell" style={brandStyle} data-motion={reducedMotion ? 'paused' : 'playing'}>
      <a className="skip-link" href="#signup-main">Skip to content</a>
      <div className="grain" aria-hidden="true" />
      <header className="site-header signup-header">
        <Link className="wordmark" href="/" aria-label="11:11 home">
          11<span>:</span>11<span className="brand-star" aria-hidden="true">✧</span>
        </Link>
        <nav aria-label="Signup navigation">
          <Link href="/" className="signup-back">back</Link>
        </nav>
      </header>

      <main id="signup-main" className="signup-page" tabIndex={-1}>
        <div className="signup-copy">
          <h1 className="signup-title" aria-label={WELCOME_TITLE}>
            {WELCOME_TITLE.slice(0, titleTyped)}
            {!titleDone && !reducedMotion ? <span className="signup-caret" aria-hidden="true" /> : null}
          </h1>

          {titleDone ? (
            <p className="signup-body" aria-label={bodyFull}>
              {renderTypedBody(WELCOME_BODY, bodyTyped)}
              {!bodyDone && !reducedMotion ? <span className="signup-caret" aria-hidden="true" /> : null}
            </p>
          ) : null}

          {stage === 'phone' ? (
            <div className="signup-phone-block">
              {!done ? (
                <>
                  <p className="signup-prompt">enter your phone number to get started.</p>
                  <form className="signup-phone-form" onSubmit={onSubmit} noValidate>
                    <div className={`signup-phone-pill ${error ? 'has-error' : ''}`}>
                      <label className="sr-only" htmlFor="signup-country">Country calling code</label>
                      <select
                        id="signup-country"
                        value={country}
                        onChange={(e) => {
                          setCountry(e.target.value as CountryId);
                          setError(null);
                        }}
                      >
                        {callingCodes.map((code) => (
                          <option key={code.id} value={code.id}>
                            {code.id} {code.prefix}
                          </option>
                        ))}
                      </select>
                      <label className="sr-only" htmlFor="signup-phone">Phone number</label>
                      <input
                        ref={phoneRef}
                        id="signup-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(415) 555-0100"
                        value={phone}
                        maxLength={24}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setError(null);
                        }}
                        aria-invalid={!!error}
                        aria-describedby={error ? 'signup-phone-error' : undefined}
                      />
                    </div>
                    {error ? (
                      <p id="signup-phone-error" className="field-error" role="alert">
                        {error}
                      </p>
                    ) : null}
                    <button type="submit" className="primary-cta signup-continue">
                      Continue
                    </button>
                  </form>
                </>
              ) : (
                <div className="signup-done">
                  <p className="signup-prompt">you’re in.</p>
                  <p className="signup-done-copy">We’ll text you when the app is ready for your number.</p>
                  <Link href="/" className="primary-cta signup-continue">
                    Back to 11:11
                  </Link>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

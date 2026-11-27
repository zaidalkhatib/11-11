'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Illustration } from '../brand/Illustration';
import { experiences, type ExperienceId, getExperience } from '../../packages/domain';
import { callingCodes, samplePhone, validatePreviewPhone, canPreviewMessage, type CountryId } from '../../packages/domain/signup';

type Message = { id: number; text: string };
export function SignupExperience({paused}: {paused: boolean}) {
  const [stage, setStage] = useState<'phone' | 'chat'>('phone');
  const [country, setCountry] = useState<CountryId>('US');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ExperienceId | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [details, setDetails] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const phoneField = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const event = getExperience(selected ?? 'dinner');
  useEffect(() => { heading.current?.focus(); }, [stage]);
  useEffect(() => { if (stage === 'chat') bottom.current?.scrollIntoView({behavior:paused ? 'instant' : 'smooth',block:'nearest'}); }, [selected, accepted, details, messages, stage, paused]);
  function enterChat(e: FormEvent) {
    e.preventDefault();
    const issue = validatePreviewPhone(phone, country);
    setError(issue);
    if (issue) { phoneField.current?.focus(); return; }
    setStage('chat');
  }
  function choose(id: ExperienceId) { setSelected(id); setAccepted(false); setDetails(false); }
  function send(e: FormEvent) {
    e.preventDefault();
    if (!canPreviewMessage(draft)) return;
    setMessages(previous => [...previous, {id:previous.length + 1,text:draft.trim()}]);
    setDraft('');
  }
  function restart() { setStage('phone'); setPhone(''); setError(null); setSelected(null); setAccepted(false); setDetails(false); setDraft(''); setMessages([]); }
  if (stage === 'phone') return <div className="signup-welcome">
    <span className="signup-brand" aria-hidden="true">11:11<span>✧</span></span>
    <p className="eyebrow">A NEW WAY TO MEET</p>
    <h2 ref={heading} tabIndex={-1} id="panel-title">Welcome to 11:11.<br/><em>Let’s start with hello.</em></h2>
    <p>Someone new. A thoughtful plan.<br/>A connection that starts with who you are.</p>
    <form onSubmit={enterChat} noValidate>
      <label className="phone-label" htmlFor="signup-phone">Your phone number</label>
      <div className={`phone-entry ${error ? 'has-error' : ''}`}>
        <label className="sr-only" htmlFor="calling-code">Country calling code</label>
        <select id="calling-code" value={country} onChange={e => { setCountry(e.target.value as CountryId); setError(null); }}>
          {callingCodes.map(code => <option key={code.id} value={code.id}>{code.id} {code.prefix}</option>)}
        </select>
        <input ref={phoneField} id="signup-phone" type="tel" inputMode="tel" autoComplete="off" placeholder="202 555 0111" value={phone} maxLength={24} onChange={e => {setPhone(e.target.value);setError(null);}} aria-invalid={!!error} aria-describedby={error ? 'phone-error phone-note' : 'phone-note'}/>
      </div>
      {error && <p id="phone-error" className="field-error" role="alert">{error}</p>}
      <button className="sample-button" type="button" onClick={() => {setCountry('US');setPhone(samplePhone);setError(null);phoneField.current?.focus();}}>Use a sample number instead</button>
      <button type="submit" className="primary-cta modal-cta">Continue to chat preview <span aria-hidden="true">↗</span></button>
      <p id="phone-note" className="signup-disclaimer"><span aria-hidden="true">◇</span> Preview only. Your number stays in this page. No account, verification text or message is created.</p>
    </form>
    <div className="signup-next"><span className="message-symbol" aria-hidden="true">···</span><span>A conversation, not another form.<small>Explore invitations and replies in the next step.</small></span></div>
  </div>;
  return <div className="chat-preview">
    <header className="chat-heading"><span className="chat-avatar" aria-hidden="true">11:11</span><div><h2 ref={heading} tabIndex={-1} id="panel-title">Your 11:11 conversation</h2><p><span/> IN-BROWSER PREVIEW</p></div></header>
    <p className="chat-disclosure">Not connected to SMS or iMessage. Nothing is sent.</p>
    <div className="chat-stream" role="region" aria-label="Example conversation" tabIndex={0}>
      <p className="chat-timestamp">A LITTLE CHANCE STARTS HERE</p>
      <div className="chat-bubble incoming">Welcome to 11:11. We’re glad you’re curious. <span aria-hidden="true">✧</span></div>
      <div className="chat-bubble incoming">Imagine an evening with someone new. What sounds like you?</div>
      <div className="quick-replies" aria-label="Choose an example invitation">{experiences.map(item => <button key={item.id} aria-pressed={selected === item.id} onClick={() => choose(item.id)}>{item.short}</button>)}</div>
      {selected && <>
        <div className="chat-bubble outgoing">{event.short} sounds like me.</div>
        <div className="chat-bubble incoming">A little glimpse of what could be next.</div>
        <article className="chat-invitation" aria-label="Example invitation">
          <div className="chat-card-art"><p className="eyebrow">AN EXAMPLE INVITATION</p><Illustration kind={event.id}/><h3>{event.label}</h3><p className="chat-card-quote">{event.invitation}</p><div className="chat-card-meta"><span>ONE + ONE<small>always two people</small></span><span>THE DETAILS<small>to be arranged</small></span></div></div>
          <div className="chat-card-footer"><span>11:11 encounters</span><span>CONCEPT</span></div>
        </article>
        <div className="invitation-actions"><button disabled={accepted} onClick={() => setAccepted(true)}>{accepted ? 'Accepted in this preview ✓' : 'Accept this invitation'}<span aria-hidden="true">↗</span></button><button aria-expanded={details} onClick={() => setDetails(!details)}>{details ? 'Hide the details' : 'See the details'}<span aria-hidden="true">{details ? '−' : '+'}</span></button><button onClick={() => {const index=experiences.findIndex(x => x.id === selected);choose(experiences[(index+1)%experiences.length].id);}}>Show me another possibility<span aria-hidden="true">↻</span></button></div>
        {details && <div className="chat-details"><h4>A little more about this evening</h4><p>{event.detail}</p><p>This example is for two people. Date, venue, pricing and availability are not set. It cannot be booked.</p></div>}
        {accepted && <><div className="chat-bubble outgoing">I’d like to go. <span aria-hidden="true">✧</span></div><div className="chat-bubble incoming">That’s the idea. One thoughtful invitation, answered here.<br/><br/><strong>Preview complete:</strong> nothing has been booked or sent.</div></>}
      </>}
      {messages.map(message => <div className="message-pair" key={message.id}><div className="chat-bubble outgoing">{message.text}</div><div className="chat-bubble incoming demo-reply">This is a local chat demo. Personal replies will be available when a messaging service is connected.</div></div>)}
      <div ref={bottom}/>
    </div>
    <div className="sr-only" role="status">{accepted ? 'Invitation accepted in the preview only. Nothing booked or sent.' : selected ? `${event.label} example invitation selected.` : 'Choose an experience to see an example invitation.'}</div>
    <form className="chat-composer" onSubmit={send}><label htmlFor="chat-message" className="sr-only">Message preview</label><input id="chat-message" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={280} placeholder="Try a message…" autoComplete="off"/><button type="submit" disabled={!canPreviewMessage(draft)} aria-label="Send preview message">↑</button></form>
    <div className="chat-bottom"><span>LOCAL DEMO · NO MESSAGES SENT</span><button onClick={restart}>Start over</button></div>
  </div>;
}

export function AppDownloadPreview({onSignup}: {onSignup: () => void}) {
  return <div className="app-download"><p className="eyebrow">11:11, IN YOUR POCKET</p><h2 id="panel-title">More present.<br/><em>Wherever you are.</em></h2><div className="app-device" aria-hidden="true"><div className="device-island"/><span className="device-brand">11:11</span><p>One invitation.<br/><em>A new possibility.</em></p><div className="device-invite"><Illustration kind="dinner"/><span>A table for two</span><small>AN EXPERIENCE FOR TWO</small></div><div className="device-pill">A LITTLE ROOM FOR CHANCE ↗</div></div><span className="coming-soon-badge">iOS FIRST · COMING SOON</span><p>We’re designing the 11:11 app. There isn’t an App Store or TestFlight download yet.</p><button className="primary-cta modal-cta" onClick={onSignup}>Explore the signup preview <span aria-hidden="true">↗</span></button><p className="fine-print">For now, try the experience here. The phone shown is a concept, not a released app.</p></div>;
}

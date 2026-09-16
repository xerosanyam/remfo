import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = { ink: '#111827', muted: '#64748b', line: '#e2e8f0', soft: '#f8fafc', blue: '#2563eb', green: '#16a34a' };
const icon = (name: string) => staticFile(`icons/${name}.svg`);

const nav = [
  ['jotatexteditor', 'record'],
  ['sololearn', 'revise'],
  ['body-measures', 'measure'],
  ['brainf', 'generate with ai'],
  ['pomodoro', 'pomo'],
] as const;

function Sidebar({ active }: { active: string }) {
  return <div style={{ width: 176, height: '100%', borderRight: `1px solid ${C.line}`, background: '#fff', padding: '26px 0', flexShrink: 0 }}>
    <Img src={staticFile('logo-black.png')} style={{ width: 42, height: 42, borderRadius: 12, margin: '0 0 34px 22px' }} />
    {nav.map(([asset, label]) => <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 18px', background: active === label ? '#f1f5f9' : '#fff', color: C.ink, fontSize: 15 }}>
      <Img src={icon(asset)} style={{ width: 23, height: 23 }} /> <span>{label}</span>
    </div>)}
    <div style={{ color: C.muted, fontSize: 13, padding: '28px 22px' }}>a calmer way to remember</div>
  </div>;
}

function Shell({ active, children }: { active: string; children: React.ReactNode }) {
  return <div style={{ width: '100%', height: '100%', display: 'flex', background: '#fff', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}><Sidebar active={active} /><div style={{ flex: 1, background: '#fff' }}>{children}</div></div>;
}

function Caption({ children }: { children: React.ReactNode }) {
  return <div style={{ position: 'absolute', left: '50%', bottom: 34, transform: 'translateX(-50%)', color: '#fff', background: '#0f172add', borderRadius: 10, padding: '12px 22px', whiteSpace: 'nowrap', fontSize: 26, fontWeight: 500 }}>{children}</div>;
}

function Pointer({ x, y }: { x: number; y: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame % 30, fps, config: { damping: 12, stiffness: 180 } });
  return <div style={{ position: 'absolute', left: x, top: y, width: 25, height: 25, borderRadius: '50%', border: '3px solid #fff', background: C.blue, boxShadow: '0 2px 8px #0005', transform: `scale(${0.85 + scale * 0.15})` }} />;
}

function RecordPage({ filled = false }: { filled?: boolean }) {
  return <Shell active="record"><main style={{ maxWidth: 900, margin: '0 auto', padding: '100px 80px' }}>
    <div style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>record a new card</div>
    <h1 style={{ fontSize: 36, fontWeight: 500, margin: '0 0 52px', letterSpacing: '-.03em' }}>write something you'd like to remember</h1>
    <label style={{ display: 'block', color: C.muted, fontSize: 14, marginBottom: 10 }}>front</label>
    <div style={{ border: `1px solid ${filled ? '#93c5fd' : C.line}`, borderRadius: 12, padding: 20, fontSize: 21, minHeight: 90, background: filled ? '#eff6ff' : '#fff' }}>{filled ? 'What makes a habit easier to repeat?' : 'Start with a question...'}</div>
    <label style={{ display: 'block', color: C.muted, fontSize: 14, margin: '32px 0 10px' }}>back</label>
    <div style={{ border: `1px solid ${filled ? '#86efac' : C.line}`, borderRadius: 12, padding: 20, fontSize: 21, minHeight: 90, background: filled ? '#f0fdf4' : '#fff' }}>{filled ? 'Make the cue obvious and the action small.' : 'Add the answer you want to recall...'}</div>
    <button style={{ marginTop: 34, border: 0, borderRadius: 9, background: C.ink, color: '#fff', fontSize: 17, padding: '14px 22px' }}>{filled ? 'save card' : 'save card'}</button>
  </main></Shell>;
}

function LearnPage() {
  return <Shell active="generate with ai"><main style={{ maxWidth: 900, margin: '0 auto', padding: '100px 80px' }}>
    <div style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>generate with ai</div>
    <h1 style={{ fontSize: 36, fontWeight: 500, margin: '0 0 20px', letterSpacing: '-.03em' }}>turn a topic into useful cards</h1>
    <p style={{ color: C.muted, fontSize: 18, marginBottom: 36 }}>Give Remfo a topic. It will make a small, focused set to review.</p>
    <div style={{ border: `1px solid ${C.blue}`, borderRadius: 12, padding: 20, fontSize: 21, background: '#eff6ff' }}>the science of habit formation</div>
    <button style={{ marginTop: 22, border: 0, borderRadius: 9, background: C.ink, color: '#fff', fontSize: 17, padding: '14px 22px' }}>generate cards</button>
    <div style={{ marginTop: 54, padding: 26, borderRadius: 14, background: C.soft, border: `1px solid ${C.line}` }}><div style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>preview</div><div style={{ fontSize: 23 }}>Why do habits stick?</div><div style={{ color: C.muted, fontSize: 17, marginTop: 18 }}>Repetition turns a behavior into an automatic response.</div></div>
  </main></Shell>;
}

function RevisePage() {
  return <Shell active="revise"><main style={{ maxWidth: 900, margin: '0 auto', padding: '84px 80px' }}>
    <div style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>revise</div><h1 style={{ fontSize: 36, fontWeight: 500, margin: '0 0 38px', letterSpacing: '-.03em' }}>a little review, right on time</h1>
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: 34, minHeight: 350, boxShadow: '0 12px 30px #0f172a0b' }}><div style={{ color: C.muted, fontSize: 14, marginBottom: 42 }}>card 7 of 12</div><div style={{ fontSize: 31, lineHeight: 1.25 }}>Why do habits stick?</div><div style={{ marginTop: 54, paddingTop: 26, borderTop: `1px solid ${C.line}`, color: C.ink, fontSize: 20 }}>Repetition turns a behavior into an automatic response.</div></div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 26 }}>{['again', 'hard', 'good', 'easy'].map((x, i) => <button key={x} style={{ border: `1px solid ${i === 2 ? C.green : C.line}`, borderRadius: 8, background: i === 2 ? '#f0fdf4' : '#fff', padding: '12px 22px', fontSize: 15 }}>{x}</button>)}</div>
  </main></Shell>;
}

function Heatmap() {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(21, 17px)', gap: 5, marginTop: 26 }}>{Array.from({ length: 105 }, (_, i) => <div key={i} style={{ width: 17, height: 17, borderRadius: 4, background: i % 11 === 0 ? '#bbf7d0' : i % 5 === 0 ? '#4ade80' : i % 3 === 0 ? '#86efac' : '#f1f5f9' }} />)}</div>;
}

function MeasurePage() {
  return <Shell active="measure"><main style={{ maxWidth: 1000, margin: '0 auto', padding: '84px 80px' }}><div style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>measure</div><h1 style={{ fontSize: 36, fontWeight: 500, margin: '0 0 42px', letterSpacing: '-.03em' }}>progress you can feel</h1><div style={{ display: 'flex', gap: 18 }}>{[['Current Streak', '21', 'days'], ['Cards reviewed', '128', 'this month'], ['Cards created', '43', 'this month']].map(([a, b, c]) => <div key={a} style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 14, padding: 24 }}><div style={{ color: C.muted, fontSize: 14 }}>{a}</div><div style={{ fontSize: 42, marginTop: 18 }}>{b}</div><div style={{ color: C.muted, marginTop: 6 }}>{c}</div></div>)}</div><div style={{ marginTop: 36, border: `1px solid ${C.line}`, borderRadius: 14, padding: 26 }}><div style={{ fontSize: 18 }}>review activity</div><Heatmap /></div></main></Shell>;
}

function Intro() { const frame = useCurrentFrame(); const opacity = interpolate(frame, [0, 25, 120, 150], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }); return <AbsoluteFill style={{ background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity }}><div style={{ maxWidth: 1120, textAlign: 'center', fontSize: 68, lineHeight: 1.1, letterSpacing: '-.04em' }}>you save useful ideas all day.<br /><span style={{ color: '#93c5fd' }}>most disappear.</span></div></AbsoluteFill>; }
function Outro() { const frame = useCurrentFrame(); const y = interpolate(frame, [0, 25], [40, 0], { extrapolateRight: 'clamp' }); return <AbsoluteFill style={{ background: C.ink, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }), transform: `translateY(${y}px)` }}><div style={{ fontSize: 72, letterSpacing: '-.04em' }}>remember what matters.</div><button style={{ marginTop: 38, background: '#fff', color: C.ink, border: 0, borderRadius: 10, padding: '16px 28px', fontSize: 20 }}>try Remfo</button></AbsoluteFill>; }

export const RemfoDemo = () => <AbsoluteFill style={{ background: '#fff' }}>
  <Sequence from={0} durationInFrames={150}><Intro /><Caption>You save useful ideas all day. Most disappear.</Caption><Audio src={staticFile('audio/01-opening.wav')} /></Sequence>
  <Sequence from={150} durationInFrames={270}><RecordPage /><Pointer x={1010} y={468} /><Caption>When I find an idea worth keeping, I record it here.</Caption><Audio src={staticFile('audio/02-record.wav')} /></Sequence>
  <Sequence from={420} durationInFrames={300}><RecordPage filled /><Pointer x={1050} y={674} /><Caption>It takes a few seconds. Remfo handles when it should come back.</Caption><Audio src={staticFile('audio/03-save.wav')} /></Sequence>
  <Sequence from={720} durationInFrames={360}><LearnPage /><Pointer x={990} y={392} /><Caption>Or I can ask AI to turn a topic into useful flashcards.</Caption><Audio src={staticFile('audio/04-ai.wav')} /></Sequence>
  <Sequence from={1080} durationInFrames={480}><RevisePage /><Pointer x={1268} y={786} /><Caption>Later, Remfo brings each card back. I reveal the answer and rate how it felt.</Caption><Audio src={staticFile('audio/05-revise.wav')} /></Sequence>
  <Sequence from={1560} durationInFrames={300}><MeasurePage /><Caption>The schedule adapts, and progress stays visible without pressure.</Caption><Audio src={staticFile('audio/06-measure.wav')} /></Sequence>
  <Sequence from={1860} durationInFrames={240}><Outro /><Audio src={staticFile('audio/07-close.wav')} /></Sequence>
</AbsoluteFill>;

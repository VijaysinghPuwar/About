import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { sweepHold } from '@/lib/theme-transition';

/*
  The hero's second column.

  It replaces three neon status rows — a pulsing "SYSTEMS ONLINE" dot, an emoji
  map pin, and a second pulsing dot for "Open to opportunities" — none of which
  reported real state. In their place: a schematic of the thing this person
  actually works on, and a definition list of three facts that are checkable.

  The schematic is the same topology in both modes; only the traced path
  changes. In security mode it traces the detection loop that ends at
  containment. In pentest mode it traces an intrusion path inward from an
  untrusted network. Same network, two directions of travel — which is the
  argument the mode toggle is making.

  The path is numbered, so it draws in that order rather than arriving whole:
  each leg strokes on at a constant speed and its step label resolves as the
  leg lands. Reading order and drawing order are the same thing, which is the
  only reason the numbers are there. Once the chain is complete the travelling
  dot starts — flow, after the route that carries it, never on top of it.

  Both the draw and the dot stop under prefers-reduced-motion; the path is
  rendered fully drawn instead, so nothing is lost.
*/

const NODE_LABEL = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '9.5px',
  letterSpacing: '0.09em',
} as const;

const STEP_LABEL = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.06em',
  fill: 'hsl(var(--primary))',
} as const;

/*
  Every leg strokes at the same speed, so a long hop across the boundary takes
  visibly longer than a short one inside it. Timing the legs equally instead
  would flatten exactly the distance the diagram is about.

  The speed is deliberately unhurried — a chain that completes in a second is
  a flourish, not a diagram. At this rate the whole detection loop takes about
  seven seconds, which is roughly how long the terminal beside it spends typing
  its intro, and slow enough to read each step as it lands.
*/
const SPEED = 155; // user units per second
const GAP = 0.1; // beat between legs, so the joins read as joins
const LABEL_IN = 0.5;

/** On load the diagram is already on screen; a short settle is all it needs. */
const IDLE_DELAY = 0.35;

type Leg = { d: string };
type Step = { text: string; x: number; y: number; leg: number; anchor?: 'end' };

/** Straight-line paths only, which every leg here is. */
function legLength(d: string) {
  const n = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
  let total = 0;
  for (let i = 2; i < n.length; i += 2) {
    total += Math.hypot(n[i] - n[i - 2], n[i + 1] - n[i - 1]);
  }
  return total;
}

/** Lays the legs end to end on a timeline, all offsets relative to the start. */
function schedule(legs: Leg[]) {
  let t = 0;
  const timed = legs.map((leg) => {
    const dur = legLength(leg.d) / SPEED;
    const at = t;
    t = at + dur + GAP;
    return { ...leg, at, dur, end: at + dur };
  });
  return { legs: timed, total: t - GAP };
}

/*
  Detection: four feeds converge on the collector, the collector raises what it
  found to the identity core, and the core reaches back out to the edge to shut
  the thing down. The four feeds are drawn one after another rather than at once
  — collection is the slow part of this loop, and drawing it as the slow part is
  the honest reading.
*/
const DETECTION = {
  ...schedule([
    { d: 'M206 164 L300 368' },
    { d: 'M206 272 L300 368' },
    { d: 'M388 292 L300 368' },
    { d: 'M393 120 L300 368' },
    { d: 'M300 368 L300 240' },
    { d: 'M319 207 L393 120' },
  ]),
  steps: [
    { text: '01 COLLECT', x: 222, y: 148, leg: 0 },
    { text: '02 DETECT', x: 286, y: 396, leg: 3, anchor: 'end' },
    { text: '03 TRIAGE', x: 334, y: 252, leg: 4 },
    { text: '04 CONTAIN', x: 408, y: 108, leg: 5 },
  ] as Step[],
  width: 1.2,
};

/* Intrusion: one continuous walk inward, each leg landing on the node its
   label names. */
const ATTACK = {
  ...schedule([
    { d: 'M544 48 L393 120' },
    { d: 'M393 120 L388 292' },
    { d: 'M388 292 L319 229' },
    { d: 'M281 229 L206 272' },
  ]),
  steps: [
    { text: '01 RECON', x: 474, y: 64, leg: 0, anchor: 'end' },
    { text: '02 ACCESS', x: 408, y: 108, leg: 0 },
    { text: '03 ESCALATE', x: 402, y: 276, leg: 1 },
    { text: '04 PIVOT', x: 334, y: 252, leg: 2 },
    { text: '05 LATERAL', x: 220, y: 298, leg: 3 },
  ] as Step[],
  width: 1.3,
};

export function SecurityDiagram() {
  const { isPentest } = useTheme();
  const reduced = useReducedMotion();
  const animate = !reduced;

  const chain = isPentest ? ATTACK : DETECTION;

  /* Resolved once per chain — reading the shutter, not a mount counter, so a
     re-render for any other reason cannot restart the draw mid-way through it.
     A mode switch renders from inside the shutter's sealed beat and has to wait
     it out; a first load has no shutter to wait for. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const delay = useMemo(() => sweepHold() / 1000 || IDLE_DELAY, [isPentest]);

  /* The dot is held out of the DOM until the route it travels exists, rather
     than started with an SMIL offset — a `begin` resolves against the document
     timeline, which is not where a mid-session mode switch starts. */
  const [routeDrawn, setRouteDrawn] = useState(!animate);
  useEffect(() => {
    if (!animate) {
      setRouteDrawn(true);
      return;
    }
    setRouteDrawn(false);
    const id = window.setTimeout(
      () => setRouteDrawn(true),
      (delay + chain.total) * 1000,
    );
    return () => window.clearTimeout(id);
    // `delay` is derived from a ref and is stable for a given chain.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPentest, animate]);

  const drawStyle = (at: number, dur: number) =>
    animate
      ? ({
          strokeDasharray: 1,
          strokeDashoffset: 1,
          animation: `diagram-trace ${dur.toFixed(2)}s linear ${(delay + at).toFixed(2)}s forwards`,
        } as const)
      : undefined;

  return (
    <div>
      {/* The schematic needs width to stay legible, so below `lg` it is dropped
          rather than shrunk. The three facts underneath are the part a phone
          reader actually needs, and they stay at every width. */}
      <div className="hidden lg:block">
        <svg
          viewBox="0 0 600 420"
          className="block h-auto w-full"
          role="img"
          aria-label={
            isPentest
              ? 'Schematic: an intrusion path from an untrusted network through the edge device, into published services, then laterally toward identity and endpoints inside the trust boundary'
              : 'Schematic: telemetry from endpoints and services flows to a collector, feeds detection and triage at the identity core, and ends in containment at the edge device'
          }
        >
          {/* trust boundary */}
          <path
            d="M486 218 L393 62 L207 62 L114 218 L207 374 L393 374 Z"
            fill="none"
            stroke="hsl(var(--border-strong))"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          {/* inner segment */}
          <path
            d="M414 218 L356 120 L244 120 L186 218 L244 316 L356 316 Z"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />

          {/* idle topology */}
          <g stroke="hsl(var(--border-strong))" strokeWidth="1" fill="none">
            <path d="M300 218 L206 164" />
            <path d="M300 218 L206 272" />
            <path d="M300 218 L388 292" />
            <path d="M300 218 L300 368" />
            <path d="M206 164 L206 272" />
          </g>

          {/* The traced chain. Keyed by mode so a switch remounts it and the
              draw runs again from step one. */}
          <g key={isPentest ? 'attack' : 'detection'}>
            <g fill="none" stroke="hsl(var(--primary))" strokeWidth={chain.width}>
              {chain.legs.map((leg) => (
                <path key={leg.d} d={leg.d} pathLength={1} style={drawStyle(leg.at, leg.dur)} />
              ))}
            </g>
            <g style={STEP_LABEL}>
              {chain.steps.map((step) => (
                <text
                  key={step.text}
                  x={step.x}
                  y={step.y}
                  textAnchor={step.anchor}
                  style={
                    animate
                      ? {
                          opacity: 0,
                          /* Scale about the label's own box, not the SVG origin,
                             so the overshoot happens where the label sits. */
                          transformBox: 'fill-box',
                          transformOrigin: 'center',
                          animation: `diagram-step-in ${LABEL_IN}s cubic-bezier(.2,.9,.3,1.2) ${(
                            delay + chain.legs[step.leg].end
                          ).toFixed(2)}s forwards`,
                        }
                      : undefined
                  }
                >
                  {step.text}
                </text>
              ))}
            </g>

            {animate && routeDrawn && (
              isPentest ? (
                <circle r="2.8" fill="hsl(var(--primary))">
                  <animateMotion
                    dur="8s"
                    repeatCount="indefinite"
                    path="M544 48 L393 120 L388 292 L319 229"
                  />
                </circle>
              ) : (
                <>
                  <circle r="2.8" fill="hsl(var(--primary))">
                    <animateMotion dur="6s" repeatCount="indefinite" path="M393 120 L300 368" />
                  </circle>
                  <circle r="2.8" fill="hsl(var(--primary))">
                    <animateMotion dur="6s" begin="1.4s" repeatCount="indefinite" path="M206 272 L300 368" />
                  </circle>
                </>
              )
            )}
          </g>

          {/* nodes */}
          <g style={NODE_LABEL}>
            <circle cx="544" cy="48" r="4.5" fill="hsl(var(--background))" stroke="hsl(var(--muted-foreground-dim))" strokeWidth="1.3" />
            <text x="544" y="30" textAnchor="middle" style={{ fill: 'hsl(var(--muted-foreground-dim))' }}>UNTRUSTED</text>

            <circle cx="393" cy="120" r="6" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <text x="408" y="140" style={{ fill: 'hsl(var(--muted-foreground))' }}>EDGE</text>

            <path
              d="M300 196 L319 207 L319 229 L300 240 L281 229 L281 207 Z"
              fill="hsl(var(--card-elevated))"
              stroke="hsl(var(--foreground))"
              strokeWidth="1.4"
            />
            <text x="300" y="184" textAnchor="middle" style={{ fill: 'hsl(var(--foreground))' }}>IDENTITY</text>

            <circle cx="206" cy="164" r="3.5" fill="hsl(var(--muted-foreground))" />
            <circle cx="206" cy="272" r="3.5" fill="hsl(var(--muted-foreground))" />
            <text x="176" y="222" textAnchor="end" style={{ fill: 'hsl(var(--muted-foreground-dim))' }}>ENDPOINTS</text>

            <circle cx="388" cy="292" r="4.5" fill="hsl(var(--background))" stroke="hsl(var(--muted-foreground))" strokeWidth="1.3" />
            <text x="402" y="308" style={{ fill: 'hsl(var(--muted-foreground-dim))' }}>SERVICES</text>

            <circle cx="300" cy="368" r="4.5" fill="hsl(var(--background))" stroke="hsl(var(--muted-foreground))" strokeWidth="1.3" />
            <text x="314" y="372" style={{ fill: 'hsl(var(--muted-foreground-dim))' }}>TELEMETRY</text>

            <text x="118" y="104" style={{ fill: 'hsl(var(--muted-foreground-dim))' }}>TRUST BOUNDARY</text>
          </g>
        </svg>

        <div className="mt-0.5 font-mono text-[10px] tracking-[0.16em] text-muted-dim">
          {isPentest ? 'ATTACK CHAIN' : 'DETECTION LOOP'}
        </div>
      </div>

      {/* Three facts, each one checkable. This is what the pulsing status dots
          were standing in for. */}
      <dl className="border-t border-border lg:mt-7">
        {[
          ['FOCUS', 'Infrastructure · Network · Application security'],
          ['CURRENT', 'MTA — Staten Island Railway'],
          ['AVAILABILITY', 'Open to security engineering roles'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-6 border-b border-border py-2.5">
            <dt className="meta-label shrink-0">{label}</dt>
            <dd className="text-right text-[13.5px] text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

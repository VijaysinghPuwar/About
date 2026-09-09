import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { sweepHold } from '@/lib/theme-transition';

/*
  The hero's second column.

  It replaces three neon status rows (a pulsing "SYSTEMS ONLINE" dot, an emoji
  map pin, and a second pulsing dot for "Open to opportunities"), none of which
  reported real state. In their place: a schematic of the thing this person
  actually works on, and a definition list of three facts that are checkable.

  The nodes are named after the systems he actually administers, not after
  abstractions. They used to read UNTRUSTED, TRUST BOUNDARY, EDGE, IDENTITY,
  SERVICES and TELEMETRY, which look precise and mean nothing in particular:
  asked what TELEMETRY was, the only honest answer was "a word for logs". Named
  as Splunk, Active Directory, Microsoft 365 and the firewall, the drawing is a
  map of one real estate and every node is something he has logged into.

  The schematic is the same topology in both modes; only the traced path
  changes. In security mode it traces the detection loop that ends at
  containment. In pentest mode it traces an intrusion path inward from an
  untrusted network. Same network, two directions of travel, which is the
  argument the mode toggle is making.

  The path is numbered, so it draws in that order rather than arriving whole:
  each leg strokes on at a constant speed and its step label resolves as the
  leg lands. Reading order and drawing order are the same thing, which is the
  only reason the numbers are there. Once the chain is complete the travelling
  dot starts. Flow, after the route that carries it, never on top of it.

  Both the draw and the dot stop under prefers-reduced-motion; the path is
  rendered fully drawn instead, so nothing is lost.
*/

const NODE_LABEL = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '9.5px',
  letterSpacing: '0.09em',
} as const;

/*
  A label sits wherever its leg lands, and legs land in a crowded drawing: the
  numbered steps all cross either a traced leg, a topology line or the boundary
  at some point, and a bright accent word with a line running under it reads as
  a smudge rather than as a word.

  So the glyphs knock the line out around themselves. `paint-order: stroke`
  lays the background colour down first, in a stroke that follows the
  letterforms, and fills over it, which leaves a hairline of clearance shaped
  like the word. Nothing is added to the palette and nothing glows: the halo is
  the page's own background, and its only job is that the line behind stops
  short of the letters and resumes after them.

  Moving the labels instead was the other option and it does not survive: the
  two modes put nine labels on the same drawing, several land in the same
  wedges, and any position solved by hand is one geometry change away from
  being wrong again.
*/
const LABEL_KNOCKOUT = {
  paintOrder: 'stroke',
  stroke: 'hsl(var(--background))',
  strokeWidth: '2.6px',
  strokeLinejoin: 'round',
} as const;

const STEP_LABEL = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.06em',
  fill: 'hsl(var(--primary))',
  ...LABEL_KNOCKOUT,
} as const;

/*
  Every leg strokes at the same speed, so a long hop across the boundary takes
  visibly longer than a short one inside it. Timing the legs equally instead
  would flatten exactly the distance the diagram is about.

  The speed is deliberately unhurried, a chain that completes in a second is
  a flourish, not a diagram. At this rate the whole detection loop takes about
  seven seconds, which is roughly how long the terminal beside it spends typing
  its intro, and slow enough to read each step as it lands.
*/
/*
  What each node is, in one sentence he would actually say.

  A diagram that needs a separate page to explain it has failed; a diagram
  with a tooltip has failed on every touch screen. The caption line below the
  drawing was already there and already empty, so it doubles as the readout:
  at rest it names the reading, and while a node is held it explains that
  node. Nothing is covered, nothing new is navigated to, and the sentence a
  reader gets is the sentence he can repeat in an interview.
*/
const NODE_NOTES: Record<string, string> = {
  internet: 'Everything outside the perimeter. Untrusted by default.',
  firewall: 'The edge. Where traffic is allowed in or stopped.',
  ad: 'Active Directory. Accounts, groups and access, created and revoked as staff join, move and leave.',
  endpoints: 'Staff laptops and operations workstations across the sites.',
  m365: 'Microsoft 365. Mail, files and the identities attached to them.',
  splunk: 'Where the logs land and the detections run. Click any node for the detail.',
};

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
 , collection is the slow part of this loop, and drawing it as the slow part is
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
    { text: '03 TICKET', x: 334, y: 252, leg: 4 },
    { text: '04 CONTAIN', x: 408, y: 108, leg: 5 },
  ] as Step[],
  width: 1.2,
};

/* Intrusion: one continuous walk inward, each leg landing on the node its
   label names.

   01 and 02 name the two ends of the same leg and sit on opposite sides of
   it, which is deliberate. 02 was on the same side as 01, close enough to the
   line that the leg ran the length of the words and split `02` from
   `FOOTHOLD`. A knockout answers a line that crosses a label; it cannot help
   one that travels along it, so this one moves. Up and left of the edge
   device puts it in the only clear space near the node it names, and just
   inside the boundary, which is where a foothold is. */
const ATTACK = {
  ...schedule([
    { d: 'M544 48 L393 120' },
    { d: 'M393 120 L388 292' },
    { d: 'M388 292 L319 229' },
    { d: 'M281 229 L206 272' },
  ]),
  steps: [
    { text: '01 RECON', x: 474, y: 64, leg: 0, anchor: 'end' },
    { text: '02 FOOTHOLD', x: 378, y: 106, leg: 0, anchor: 'end' },
    { text: '03 ESCALATE', x: 402, y: 276, leg: 1 },
    { text: '04 PIVOT', x: 334, y: 252, leg: 2 },
    { text: '05 LATERAL', x: 220, y: 298, leg: 3 },
  ] as Step[],
  width: 1.3,
};

export function SecurityDiagram() {
  const { isPentest } = useTheme();
  /** The node under the cursor or keyboard focus, if any. */
  const [node, setNode] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const animate = !reduced;

  const chain = isPentest ? ATTACK : DETECTION;

  /* Resolved once per chain, reading the shutter, not a mount counter, so a
     re-render for any other reason cannot restart the draw mid-way through it.
     A mode switch renders from inside the shutter's sealed beat and has to wait
     it out; a first load has no shutter to wait for. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const delay = useMemo(() => sweepHold() / 1000 || IDLE_DELAY, [isPentest]);

  /* The dot is held out of the DOM until the route it travels exists, rather
     than started with an SMIL offset, a `begin` resolves against the document
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
      {/* The schematic needs width to stay legible, so on a phone it is dropped
          rather than shrunk. The three facts underneath are the part a phone
          reader actually needs, and they stay at every width.

          The cut used to happen at `lg`, which took the schematic away from
          tablets too. It has room there: the hero is a single column below
          980px, so at 834px the drawing gets the full ~774px measure and its
          9px labels land near 12px. Only under 640px does it stop being
          readable, which is where it now stops being drawn. */}
      <div className="hidden sm:block">
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

          {/* nodes

              `LABEL_KNOCKOUT` is spread onto each label rather than set on
              this group: the group holds the marks as well as the names, and
              a stroke set here would be inherited by every child that does not
              declare one of its own. The endpoint dots declare only a fill, so
              they would each pick up a 2.6-wide ring of background colour and
              punch a hole in the topology around themselves, and the invisible
              hit boxes would do the same along their edges. */}
          <g style={NODE_LABEL}>
            {/* Hit targets.

                A box per node rather than a disc on the dot, because the dot
                is not what anyone aims at: the label beside it is the part
                that reads as the node, and a target that stops at the ink
                leaves the name inert. Each box covers the mark and its label
                together.

                They are drawn before the ink and the ink is inert, so the
                whole box answers including its exact centre. As discs behind
                live ink, the one pixel a reader actually points at, the dot,
                was the one pixel that did nothing.

                `Link`, not `<a href>`: an href inside the SVG reloaded the
                whole document, which re-ran the theme boot and redrew this
                diagram from step one just to move down the page.

                Each is focusable, so the notes are reachable from the
                keyboard. */}
            {[
              { id: 'internet', name: 'Internet', x: 512, y: 18, w: 64, h: 42 },
              { id: 'firewall', name: 'Firewall', x: 382, y: 110, w: 82, h: 36 },
              { id: 'ad', name: 'Active Directory', x: 247, y: 170, w: 106, h: 74 },
              { id: 'endpoints', name: 'Endpoints', x: 117, y: 156, w: 97, h: 124 },
              { id: 'm365', name: 'Microsoft 365', x: 380, y: 284, w: 106, h: 28 },
              { id: 'splunk', name: 'Splunk', x: 292, y: 358, w: 64, h: 20 },
            ].map(hit => (
              <Link
                key={hit.id}
                to={`/environment#${hit.id}`}
                aria-label={`${hit.name}: ${NODE_NOTES[hit.id]}`}
                onMouseEnter={() => setNode(hit.id)}
                onMouseLeave={() => setNode(null)}
                onFocus={() => setNode(hit.id)}
                onBlur={() => setNode(null)}
              >
                <rect
                  x={hit.x}
                  y={hit.y}
                  width={hit.w}
                  height={hit.h}
                  fill="transparent"
                  style={{ cursor: 'pointer', outlineOffset: '2px' }}
                />
              </Link>
            ))}
            {/* The ink. Inert, so the boxes above own every pixel of a
                node including the one under the mark itself. */}
            <g style={{ pointerEvents: 'none' }}>
              <circle style={{ transformOrigin: '544px 48px', transform: node === 'internet' ? 'scale(1.5)' : undefined, transition: 'transform .3s ease' }} cx="544" cy="48" r="4.5" fill="hsl(var(--background))" stroke={node === 'internet' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground-dim))'} strokeWidth="1.3" />
              <text x="544" y="30" textAnchor="middle" style={{ ...LABEL_KNOCKOUT, fill: 'hsl(var(--muted-foreground-dim))' }}>INTERNET</text>

              <circle style={{ transformOrigin: '393px 120px', transform: node === 'firewall' ? 'scale(1.5)' : undefined, transition: 'transform .3s ease' }} cx="393" cy="120" r="6" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <text x="408" y="140" style={{ ...LABEL_KNOCKOUT, fill: 'hsl(var(--muted-foreground))' }}>FIREWALL</text>

              <path
                d="M300 196 L319 207 L319 229 L300 240 L281 229 L281 207 Z"
                fill="hsl(var(--card-elevated))"
                stroke={node === 'ad' ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                strokeWidth="1.4"
                style={{
                  transformOrigin: '300px 218px',
                  transform: node === 'ad' ? 'scale(1.5)' : undefined,
                  transition: 'transform .3s ease',
                }}
              />
              <text x="300" y="180" textAnchor="middle" style={{ ...LABEL_KNOCKOUT, fill: 'hsl(var(--foreground))' }}>ACTIVE DIRECTORY</text>

              <circle
                cx="206"
                cy="164"
                r="3.5"
                fill={node === 'endpoints' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                style={{ transformOrigin: '206px 164px', transform: node === 'endpoints' ? 'scale(1.5)' : undefined, transition: 'transform .3s ease' }}
              />
              <circle
                cx="206"
                cy="272"
                r="3.5"
                fill={node === 'endpoints' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                style={{ transformOrigin: '206px 272px', transform: node === 'endpoints' ? 'scale(1.5)' : undefined, transition: 'transform .3s ease' }}
              />
              <text x="176" y="222" textAnchor="end" style={{ ...LABEL_KNOCKOUT, fill: 'hsl(var(--muted-foreground-dim))' }}>ENDPOINTS</text>

              <circle style={{ transformOrigin: '388px 292px', transform: node === 'm365' ? 'scale(1.5)' : undefined, transition: 'transform .3s ease' }} cx="388" cy="292" r="4.5" fill="hsl(var(--background))" stroke={node === 'm365' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} strokeWidth="1.3" />
              <text x="398" y="308" style={{ ...LABEL_KNOCKOUT, fill: 'hsl(var(--muted-foreground-dim))' }}>MICROSOFT 365</text>

              <circle style={{ transformOrigin: '300px 368px', transform: node === 'splunk' ? 'scale(1.5)' : undefined, transition: 'transform .3s ease' }} cx="300" cy="368" r="4.5" fill="hsl(var(--background))" stroke={node === 'splunk' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} strokeWidth="1.3" />
              <text x="314" y="372" style={{ ...LABEL_KNOCKOUT, fill: 'hsl(var(--muted-foreground-dim))' }}>SPLUNK</text>

              <text x="96" y="104" style={{ ...LABEL_KNOCKOUT, fill: 'hsl(var(--muted-foreground-dim))' }}>ENTERPRISE NETWORK</text>
            </g>
          </g>
        </svg>

        <div className="mt-0.5 font-mono text-[10px] tracking-[0.16em] text-muted-dim">
          {node ? NODE_NOTES[node] : isPentest ? 'How an intrusion moves' : 'How an alert is handled'}
        </div>
      </div>

      {/* Three facts, each one checkable, set as a status readout.

          These were a label in small caps against a sentence in the body face,
          which is the shape of a specification table and belongs to no part of
          this page. Written as `key  value` in the mono face they read as the
          output of the terminal directly above, which is what they are: the
          same three answers the shell would give.

          Availability is the only line that breathes, because it is the only
          one of the three that can change while someone is reading it. */}
      <dl className="mt-6 border-t border-border font-mono sm:mt-7">
        <div className="flex items-center gap-2.5 border-b border-border py-2.5 text-[11px] tracking-[0.16em] text-muted-dim">
          <span className="text-primary" aria-hidden="true">$</span>
          <span>cat status</span>
        </div>
        {[
          { key: 'focus', value: 'Infrastructure · Network · Application security' },
          { key: 'current', value: 'MTA, Staten Island Railway' },
          { key: 'availability', value: 'Open to security engineering roles', live: true },
        ].map(({ key, value, live }) => (
          <div
            key={key}
            className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border py-[9px]"
          >
            <dt className="w-[92px] shrink-0 text-[11px] tracking-[0.1em] text-muted-dim transition-colors duration-300 group-hover:text-primary">
              {key}
            </dt>
            {/* Grown from the left so the value stays anchored to its key, and
                by a transform so no row moves under the cursor. */}
            <dd className="flex min-w-0 flex-1 origin-left items-baseline gap-2 text-[12.5px] leading-[1.5] text-foreground transition-transform duration-300 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              <span className={live ? 'live-glow' : undefined}>{value}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

import { useReducedMotion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

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

  The travelling dot is the one piece of motion here, and it encodes direction
  of flow rather than decorating the panel. It stops under prefers-reduced-motion;
  the path itself stays drawn, so nothing is lost.
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

export function SecurityDiagram() {
  const { isPentest } = useTheme();
  const reduced = useReducedMotion();
  const animate = !reduced;

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

          {isPentest ? (
            <g>
              <g fill="none" stroke="hsl(var(--primary))" strokeWidth="1.3">
                <path d="M544 48 L393 120" />
                <path d="M393 120 L388 292" />
                <path d="M388 292 L319 229" />
                <path d="M281 229 L206 272" />
              </g>
              <g style={STEP_LABEL}>
                <text x="474" y="64" textAnchor="end">01 RECON</text>
                <text x="408" y="108">02 ACCESS</text>
                <text x="402" y="276">03 ESCALATE</text>
                <text x="334" y="252">04 PIVOT</text>
                <text x="220" y="298">05 LATERAL</text>
              </g>
              {animate && (
                <circle r="2.8" fill="hsl(var(--primary))">
                  <animateMotion
                    dur="8s"
                    repeatCount="indefinite"
                    path="M544 48 L393 120 L388 292 L319 229"
                  />
                </circle>
              )}
            </g>
          ) : (
            <g>
              <g fill="none" stroke="hsl(var(--primary))" strokeWidth="1.2">
                <path d="M206 164 L300 368" />
                <path d="M206 272 L300 368" />
                <path d="M388 292 L300 368" />
                <path d="M393 120 L300 368" />
                <path d="M300 368 L300 240" />
                <path d="M319 207 L393 120" />
              </g>
              <g style={STEP_LABEL}>
                <text x="222" y="148">01 COLLECT</text>
                <text x="286" y="396" textAnchor="end">02 DETECT</text>
                <text x="334" y="252">03 TRIAGE</text>
                <text x="408" y="108">04 CONTAIN</text>
              </g>
              {animate && (
                <>
                  <circle r="2.8" fill="hsl(var(--primary))">
                    <animateMotion dur="6s" repeatCount="indefinite" path="M393 120 L300 368" />
                  </circle>
                  <circle r="2.8" fill="hsl(var(--primary))">
                    <animateMotion dur="6s" begin="1.4s" repeatCount="indefinite" path="M206 272 L300 368" />
                  </circle>
                </>
              )}
            </g>
          )}

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

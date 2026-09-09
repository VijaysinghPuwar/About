import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

/*
  The long read behind the hero schematic.

  The diagram on the home page answers "what does this person work on" in one
  screen. This answers "and what do they actually do in it", for the reader who
  has decided to stay. Every claim here is drawn from the same source as the
  résumé and the timeline, so nothing on this page is a thing the site says
  only here.

  Deliberately one column of prose and mono. It is a document, not another
  grid of cards.
*/

interface NodeDoc {
  id: string;
  name: string;
  what: string;
  work: string[];
  /** What an attacker wants from it, shown in offensive mode. */
  risk: string;
}

const NODES: NodeDoc[] = [
  {
    id: 'internet',
    name: 'Internet',
    what: 'Everything outside the perimeter. Untrusted by default, including traffic that claims to come from a partner or a managed device.',
    work: [
      'Remote access is brokered rather than routed: Zscaler ZPA publishes an application to a user, not a network to a device.',
      'Every remote session is bound to an identity that has already passed multi-factor enrollment in DUO.',
    ],
    risk: 'The only place an unauthenticated attacker starts. Everything after this point assumes they got through something.',
  },
  {
    id: 'firewall',
    name: 'Firewall and edge',
    what: 'Where traffic is allowed in or stopped, and where the network is cut into segments so that a foothold in one place is not a foothold everywhere.',
    work: [
      'Cisco Catalyst switching configured with VLANs and access and trunk ports, so operational systems and office systems are not on one flat network.',
      'OSPF and BGP routing supported on production devices.',
      'Firewall policy and IDS/IPS maintained in a prior role, with traffic and system logs reviewed to find misconfigurations rather than waiting for an alert to find them.',
    ],
    risk: 'The first thing probed and the last thing to close. A rule that is too broad here is worth more to an attacker than any exploit.',
  },
  {
    id: 'ad',
    name: 'Active Directory',
    what: 'The centre of the diagram because it is the centre of the estate. Accounts, groups, and what each of them is allowed to reach.',
    work: [
      'Identity and account lifecycle: provisioning and revocation as staff join, move and leave, which is where most stale access comes from.',
      'Group membership and Group Policy administration across Windows Server environments.',
      'Multi-factor enrollment in DUO and application groups in Zscaler ZPA kept in step with those groups.',
    ],
    risk: 'The objective. Access here is access to everything downstream, which is why the containment step in the loop ends by revoking it.',
  },
  {
    id: 'endpoints',
    name: 'Endpoints',
    what: 'Staff laptops and operations workstations across the sites. The largest surface and the least uniform.',
    work: [
      'Endpoint hardening across 150+ Windows and Linux production machines: baselines, patching, and post-change validation.',
      'Hardware deployed and replaced at remote facilities.',
      'A Python NTP clock-correction service written for a Rail Control Center workstation whose time had drifted, which matters because a log with the wrong timestamp is worse than no log.',
    ],
    risk: 'Where an intrusion usually lands first, because it is the only node that opens attachments.',
  },
  {
    id: 'm365',
    name: 'Microsoft 365',
    what: 'Mail, files, and the identities attached to them. Joined to Active Directory, so it inherits whatever is true there.',
    work: [
      'Administered alongside Active Directory as one identity surface rather than two.',
      'Access reviewed as part of the same joiner, mover and leaver process.',
    ],
    risk: 'Reachable from anywhere with a password, which makes it the quietest way in and the easiest place to miss a compromise.',
  },
  {
    id: 'splunk',
    name: 'Splunk and the log estate',
    what: 'Where the logs land and the detections run. Nothing in this diagram is defensible without it, because nothing else can tell you what happened.',
    work: [
      'Failed-authentication patterns investigated with Splunk SPL in a prior role, which is the search that turns "someone tried" into "someone tried 400 times from one host".',
      'Log analysis, configuration-compliance checking and inventory automated in Python, PowerShell and Bash.',
      'A daily System Verification Log maintained at the MTA, so a change that broke something is caught by a person the same day rather than by a user the next week.',
    ],
    risk: 'The first thing a competent intruder tries to stop writing to. Gaps in it are themselves a signal.',
  },
];

const LOOP = [
  { step: '01', name: 'Collect', text: 'Endpoint, network and identity logs reach the log estate. This is the slow part, and the part that is worthless if it was never set up.' },
  { step: '02', name: 'Detect', text: 'A search or a rule turns raw events into something worth a person’s attention. Most of the work is deciding what is not worth it.' },
  { step: '03', name: 'Ticket', text: 'The finding becomes a ServiceNow record: triaged, worked, and closed with the remediation written down, so the next person does not start over.' },
  { step: '04', name: 'Contain', text: 'Access is revoked in Active Directory, the account is reset, the segment is closed at the edge. The loop ends where the attacker wanted to be.' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 first:mt-0">
      <h2 className="section-title mb-5">{title}</h2>
      {children}
    </section>
  );
}

export default function Environment() {
  const { isPentest } = useTheme();

  return (
    <div className="min-h-[100dvh]">
      <Helmet>
        <title>The environment | Vijaysingh Puwar</title>
        <meta
          name="description"
          content="How an alert moves through an enterprise estate: the firewall and edge, Active Directory, endpoints, Microsoft 365, and the log estate. Written by Vijaysingh Puwar, cybersecurity engineer in New York."
        />
      </Helmet>

      <div className="page-gutter container mx-auto max-w-[760px] pb-[clamp(60px,8vw,100px)] pt-[clamp(96px,12vh,132px)]">
        <div className="section-heading">
          <span className="text-primary">~/</span>ENVIRONMENT
        </div>
        <h1 className="section-title mt-3">
          {isPentest ? 'How an intrusion moves' : 'How an alert is handled'}
        </h1>
        <p className="mt-4 max-w-[58ch] text-[15.5px] leading-[1.65] text-muted-foreground">
          The schematic on the front page is the shape of an ordinary enterprise estate, named
          after the systems I administer rather than after abstractions. This is what each node
          is, what I do in it, and what an intrusion wants from it.
        </p>

        <Section title="The loop">
          <ol className="flex flex-col gap-5">
            {LOOP.map(stage => (
              <li key={stage.step} className="flex gap-4">
                <span className="w-6 shrink-0 pt-1 font-mono text-[11px] tracking-[0.1em] text-primary">
                  {stage.step}
                </span>
                <div className="min-w-0">
                  <div className="font-mono text-[13px] uppercase tracking-[0.08em] text-foreground">
                    {stage.name}
                  </div>
                  <p className="mt-1.5 text-[14.5px] leading-[1.6] text-muted-foreground">
                    {stage.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="The nodes">
          <div className="flex flex-col gap-10">
            {NODES.map(n => (
              /* `scroll-mt` clears the fixed bar, so a link from a node on the
                 home page lands on the heading and not under it. */
              <article key={n.id} id={n.id} className="scroll-mt-24">
                <h3 className="font-mono text-[13px] uppercase tracking-[0.1em] text-primary">
                  {n.name}
                </h3>
                <p className="mt-2.5 text-[15px] leading-[1.6] text-foreground">{n.what}</p>

                <ul className="mt-4 flex flex-col gap-2">
                  {n.work.map((w, i) => (
                    <li key={i} className="flex gap-3 text-[14.5px] leading-[1.55] text-muted-foreground">
                      <span
                        className="mt-[3px] shrink-0 font-mono text-[13px] leading-none text-muted-dim"
                        aria-hidden="true"
                      >
                        {i === n.work.length - 1 ? '└─' : '├─'}
                      </span>
                      <span className="hyphens-auto text-justify">{w}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 border-l-2 border-border-strong pl-4 text-[14px] leading-[1.55] text-muted-dim">
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-dim">
                    From the other side
                  </span>
                  <br />
                  {n.risk}
                </p>
              </article>
            ))}
          </div>
        </Section>

        <div className="mt-16 border-t border-border pt-6">
          <Link
            to="/"
            className="font-mono text-[13px] text-muted-foreground transition-colors hover:text-primary"
          >
            ← Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

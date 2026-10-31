/*
  The video catalogue.

  Hand-written from each video's own YouTube description: the summary is a
  trimmed version of it and the chapters are the timestamps posted there, so
  a chapter link lands where YouTube's own chapter marker does.

  To add a video, put a 1280×720 and a 640×360 WebP of its thumbnail in
  public/videos/, named after the slug, and add an entry here. Newest first.
  Make the thumbnail from the source artwork when there is one: the OSPF
  course's comes from its designed PNG, because YouTube is still showing an
  auto-picked frame for it.
*/

export interface VideoChapter {
  /** Seconds from the start. */
  t: number;
  title: string;
}

export interface Video {
  slug: string;
  youtubeId: string;
  title: string;
  /** Short line for the list. */
  kicker: string;
  summary: string;
  /** ISO date the video went public. */
  published: string;
  /** Length in seconds, from YouTube. */
  duration: number;
  topics: string[];
  chapters: VideoChapter[];
  related: { label: string; href: string }[];
}

/** "1:02:40" or "45:08" to seconds. */
const ts = (s: string) => s.split(':').reduce((acc, n) => acc * 60 + Number(n), 0);
const chapters = (rows: [string, string][]): VideoChapter[] =>
  rows.map(([t, title]) => ({ t: ts(t), title }));

export const CHANNEL_URL = 'https://www.youtube.com/@vijaysinghpuwar';

export const VIDEOS: Video[] = [
  {
    slug: 'ospf-course',
    youtubeId: 'Hul1ntaAMCo',
    title: 'OSPF Explained: Complete Course from Beginner to Expert',
    kicker: 'Course · Networking',
    summary:
      'OSPF from the first Hello packet to multi-area design and troubleshooting, built on one real lab in Cisco Packet Tracer 9: eight OSPF routers in five areas, plus an ISP and a partner network. Every command output on screen comes from that lab, and where Packet Tracer falls short (Type 7 LSAs, HMAC-SHA-256 key chains, BFD, route filtering) the video says so and shows real Cisco IOS syntax instead.',
    published: '2026-10-30',
    duration: 2791,
    topics: ['OSPFv2', 'OSPFv3', 'Multi-area design', 'Stub & NSSA', 'Troubleshooting', 'CCNA / CCNP'],
    chapters: chapters([
      ['0:00', 'Introduction'],
      ['1:01', 'Networking basics'],
      ['2:59', 'Dynamic routing and where OSPF fits'],
      ['5:58', 'OSPF in three steps'],
      ['7:49', 'The router ID'],
      ['9:02', 'OSPF packets'],
      ['10:14', 'Hellos and neighbor rules'],
      ['11:47', 'Neighbor states'],
      ['12:47', 'Network types and the DR'],
      ['17:07', 'The link state database'],
      ['19:10', 'Cost and best paths'],
      ['22:06', 'Areas'],
      ['23:40', 'Routes between areas'],
      ['24:50', 'External routes'],
      ['27:34', 'Two details: loopbacks and passive interfaces'],
      ['28:32', 'Stub areas'],
      ['29:55', 'Totally stubby areas'],
      ['30:39', 'NSSA'],
      ['32:15', 'Summarization'],
      ['33:36', 'Virtual links'],
      ['35:14', 'Authentication'],
      ['36:33', 'Filtering and fast convergence'],
      ['37:47', 'OSPF version 3 for IPv6'],
      ['39:18', 'Configuring OSPF step by step'],
      ['41:31', 'Troubleshooting'],
      ['45:08', 'Recap and best practices'],
    ]),
    related: [
      { label: 'Lab on GitHub', href: 'https://github.com/VijaysinghPuwar/ospf-multi-area-lab' },
    ],
  },
  {
    slug: 'inside-r2dock',
    youtubeId: 'ki4-QJ7QG8Q',
    title: 'Inside R2Dock: How It Really Works',
    kicker: 'Walkthrough · Rust',
    summary:
      'A complete technical walkthrough of R2Dock, an open-source desktop file manager for Cloudflare R2 built with Rust, Tauri 2 and React. Every code panel shows a real file and line range from R2Dock 0.5.1: the trust boundary between the web view and the Rust core, async Rust with Tokio, the multipart upload engine, crash-safe journals, FFmpeg compression and application security, ending with one file traced end to end through a real crash and resume.',
    published: '2026-10-25',
    duration: 5393,
    topics: ['Rust', 'Tokio', 'Tauri 2', 'Cloudflare R2', 'FFmpeg', 'Application security'],
    chapters: chapters([
      ['0:00', 'Intro'],
      ['0:33', 'Why R2Dock exists'],
      ['3:40', 'Architecture and technology decisions'],
      ['8:20', 'How the source code is organized'],
      ['12:38', 'Rust internals'],
      ['20:16', 'Async programming and Tokio'],
      ['24:56', 'Talking to R2'],
      ['31:43', 'The upload engine'],
      ['38:18', 'Downloads and integrity'],
      ['43:16', 'The job scheduler'],
      ['47:32', 'Persistence and crash recovery'],
      ['51:53', 'Audio compression'],
      ['58:32', 'Video compression'],
      ['1:02:40', 'Backpressure and performance'],
      ['1:05:55', 'Application security'],
      ['1:12:18', 'The frontend'],
      ['1:17:08', 'Testing and quality engineering'],
      ['1:22:05', 'One file, end to end'],
      ['1:27:06', 'Limitations and engineering lessons'],
    ]),
    related: [
      { label: 'Read the book', href: '/books/r2dock' },
      { label: 'Source on GitHub', href: 'https://github.com/VijaysinghPuwar/R2Dock' },
    ],
  },
  {
    slug: 'data-center-network',
    youtubeId: 'VVfJT8srvqo',
    title: 'Data Center Network Explained: HSRP, OSPF, BGP and an ASA Firewall',
    kicker: 'Project · Networking',
    summary:
      'How an enterprise data center network works, built, tested and broken on purpose in Cisco Packet Tracer 9. VLANs and trunks, Rapid Spanning Tree, LACP, HSRP, OSPF, dual-ISP eBGP and a four-zone ASA firewall with NAT and a DMZ, then the security policy proven with real traffic (12/12 acceptance tests) and failure drills run while traffic is flowing.',
    published: '2026-10-24',
    duration: 984,
    topics: ['HSRP', 'OSPF', 'eBGP', 'Cisco ASA', 'NAT / DMZ', 'Failure testing'],
    chapters: chapters([
      ['0:00', 'Welcome'],
      ['0:25', 'The big picture'],
      ['1:21', 'A tour from top to bottom'],
      ['2:39', 'VLANs and trunks'],
      ['3:49', 'Spanning tree and EtherChannel'],
      ['5:01', 'HSRP: a gateway that never dies'],
      ['5:56', 'OSPF: routing inside the data center'],
      ['6:55', 'BGP: two internet providers'],
      ['7:47', 'The firewall: zones and rules'],
      ['9:16', 'NAT, the DMZ and public DNS'],
      ['10:20', 'Everyday services and secure management'],
      ['11:48', 'Proving the policy with real traffic'],
      ['12:26', 'Breaking things on purpose'],
      ['14:01', 'Three lessons'],
      ['15:06', 'Limits'],
      ['15:39', 'Wrap-up'],
    ]),
    related: [
      { label: 'Lab on GitHub', href: 'https://github.com/VijaysinghPuwar/enterprise-datacenter-network-lab' },
    ],
  },
];

export const getVideo = (slug?: string) => VIDEOS.find(v => v.slug === slug);

/** 2791 → "46:31", 5393 → "1:29:53". */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** 2791 → "47 min", 5393 → "1 h 30 min". For prose, not timestamps. */
export function formatLength(seconds: number): string {
  const total = Math.round(seconds / 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h} h ${m} min` : `${m} min`;
}

export function formatPublished(iso: string): string {
  const [y, mo, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1, d, 12)).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

export const thumb = (v: Video, size: 'sm' | 'lg' = 'lg') =>
  `/videos/${v.slug}${size === 'sm' ? '-640' : ''}.webp`;

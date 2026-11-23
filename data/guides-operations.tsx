import Link from "next/link";
import type { Guide } from "./guides";

const published = "2026-11-23";

export const OPERATIONS_GUIDES: Guide[] = [
  {
    slug: "jellyfin-direct-play-vs-transcoding",
    category: "workloads",
    title: "Jellyfin Direct Play vs transcoding on a mini PC",
    description: "Find out why Jellyfin transcodes a video, isolate subtitles and bitrate limits, and decide whether your mini PC needs an upgrade.",
    published,
    updated: published,
    related: [
      { href: "/guides/quick-sync-generations-plex-jellyfin", label: "Compare mini PC video codecs by CPU generation" },
      { href: "/best/best-mini-pc-for-plex-4k", label: "Compare models with 4K HEVC hardware decoding" },
    ],
    body: () => (
      <>
        <p>Start with the playback information for one troublesome file. Compare the same video on the same device before making a hardware purchase. A mini PC can serve a 4K file by Direct Play even if its processor would struggle to convert that file in real time.</p>
        <h2>What each playback mode asks the server to do</h2>
        <dl className="faq">
          <div><dt>Direct Play</dt><dd>The client accepts the original container, video, audio and selected subtitles. The server sends the media as-is.</dd></div>
          <div><dt>Remux or Direct Stream</dt><dd>The server can keep the video stream when it is compatible. It may repackage streams into another container or convert an incompatible audio stream.</dd></div>
          <div><dt>Video transcoding</dt><dd>The server converts the video for a codec, playback quality or feature the client requires. Burning subtitles into the picture can trigger this even when the client supports the video codec.</dd></div>
        </dl>
        <h2>Test one variable at a time</h2>
        <ol>
          <li>Play the file locally at original quality, with subtitles off. Check the mode in your Jellyfin client or server dashboard.</li>
          <li>Enable the same subtitles again. If this triggers video transcoding, try a compatible text subtitle track or compare with a different Jellyfin client.</li>
          <li>Try the same file over the connection that causes problems. If lowering quality triggers transcoding, check the remote bitrate and available upload bandwidth.</li>
          <li>If you need video transcoding routinely, check the exact CPU in the listing. Compare hardware decode for your source and hardware encode for the output your clients accept.</li>
        </ol>
        <h2>Before replacing the server</h2>
        <p>If only one TV or browser causes transcoding, test another client on that device or a different playback device. If every client must receive lower-bitrate streams, the server’s video hardware and your upload capacity become more important. Try your actual worst-case file, including HDR and subtitles if you use them.</p>
        <p>See <a href="https://jellyfin.org/docs/general/clients/codec-support/">Jellyfin’s client codec tables</a> and its <a href="https://jellyfin.org/docs/general/post-install/transcoding/hardware-acceleration/">hardware acceleration documentation</a>.</p>
      </>
    ),
  },
  {
    slug: "mini-pc-home-server-backup-checklist",
    category: "workloads",
    title: "A backup checklist for a single mini PC home server",
    description: "Plan what to back up on a Proxmox or Docker mini PC, where to store the copies and how to test a restore before a drive fails.",
    published,
    updated: published,
    related: [
      { href: "/guides/proxmox-vs-docker-home-server", label: "Compare Proxmox and Docker for a home server" },
      { href: "/guides/mini-pc-for-nas", label: "Check what a mini PC can store" },
    ],
    body: () => (
      <>
        <p>Plan for the mini PC and every disk inside it to be unavailable at the same time. Keep a backup on a separate device or service. A second internal SSD can help organize your server or form a mirror, but a separate copy is what lets you recover after loss of the whole machine.</p>
        <h2>Inventory the things you need to restore</h2>
        <ul>
          <li><strong>Docker:</strong> save your Compose files, app data volumes and bind-mounted directories. For a database, use its supported backup or export procedure so the copy is consistent.</li>
          <li><strong>Proxmox:</strong> back up the guests and record the host settings you need to rebuild. Check any pass-through disks, bind mounts and external shares separately. Data outside the guest backup needs its own copy.</li>
          <li><strong>Home Assistant:</strong> keep a backup and the recovery information you need to open it. Record which host or VM owns each USB radio.</li>
          <li><strong>Everything else:</strong> include irreplaceable files, recovery keys and enough setup notes to map a service back to its data after reinstalling.</li>
        </ul>
        <h2>Run a small restore drill</h2>
        <p>Pick one service. Restore its data to a separate directory or isolated VM, start it without taking over the live service’s address, and check a few records or files. Record how long the restore took and what you had to look up.</p>
        <h2>Decide what needs the most frequent copies</h2>
        <p>Base the interval on how much work you can afford to lose. An automation setup that changes daily may need daily copies, while static installer files can usually be recovered from their original sources. Review backup failures and available storage before they accumulate.</p>
        <p>Read the <a href="https://pve.proxmox.com/pve-docs/chapter-vzdump.html">Proxmox backup and restore manual</a> and the <a href="https://docs.docker.com/engine/storage/volumes/">Docker volumes documentation</a> for platform-specific backup details.</p>
      </>
    ),
  },
];

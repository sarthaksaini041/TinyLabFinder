import Link from "next/link";
import { ModelTable } from "../components/ModelTable";
import { CATALOG } from "../lib/catalog";
import type { Guide } from "./guides";

// Guides written around recurring questions in r/homelab, r/selfhosted, r/Proxmox and the
// ServeTheHome forums (see improvement.md). Tables are generated from data/models.ts so
// they cannot drift from the spec pages. Anything unofficial is labelled as such.

const byGen = [...CATALOG].sort((a, b) => a.brand.localeCompare(b.brand) || a.released - b.released);
const intel = CATALOG.filter((m) => m.vendor === "Intel");
const UPDATED = "2026-09-25";

export const NEW_GUIDES: Guide[] = [
  {
    slug: "do-mini-pcs-support-64gb-ram",
    category: "upgrades",
    title: "Do Lenovo Tiny, OptiPlex Micro and EliteDesk Mini PCs support 64 GB of RAM?",
    description: "Official RAM limits for every used ThinkCentre Tiny, OptiPlex Micro and EliteDesk Mini in our database, which ones are officially 64 GB, and what owners report about running 64 GB on 32 GB-rated models.",
    updated: UPDATED,
    models: () => true,
    related: [
      { href: "/best/mini-pcs-that-support-64gb-ram", label: "Mini PCs that officially support 64 GB" },
      { href: "/guides/mini-pc-ram-upgrade", label: "Mini PC RAM upgrade guide" },
    ],
    body: () => (
      <>
        <p>
          Short answer: the newer business models are officially rated for 64 GB; most 6th–9th generation ones are officially
          rated for 32 GB. &quot;Official&quot; means the manufacturer tested and documented it. It is not a hard ceiling in every
          case: 32 GB SODIMMs became common after many of these machines launched, and owners regularly report 2 × 32 GB kits
          working in models rated for 32 GB.
        </p>
        <h2>Official maximum by model</h2>
        <ModelTable models={byGen} cols={["released", "gen", "ramType", "ram"]} caption="Official RAM limits" />
        <p className="small muted">&quot;(verify)&quot; means we could not confirm every figure against an official document; check the machine type in a listing.</p>
        <h2>What about 64 GB in a 32 GB-rated model?</h2>
        <p>
          Owner reports of 64 GB working are common for the Lenovo M720q/M920q and HP EliteDesk 800 G4/G5, and the model pages
          note it where we have seen it repeatedly. Treat it as unsupported: it can depend on the BIOS version and the specific
          modules, and a vendor will not help if it does not boot. If 64 GB matters, the safer choice is a model that is
          officially rated for it.
        </p>
        <h2>Tips before you buy RAM</h2>
        <ul>
          <li>These use laptop-size SODIMMs. The HP Elite Mini 800 G9 takes DDR5; everything older in this list takes DDR4.</li>
          <li>Install matched pairs for dual-channel bandwidth. A single 32 GB stick works but halves memory bandwidth.</li>
          <li>Faster modules are fine: they run at the platform&apos;s speed (e.g. DDR4-3200 runs at 2666 MT/s in an 8th/9th-gen box).</li>
          <li>Update the BIOS first if you are going above the official limit.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "mini-pc-10gbe-network-card",
    category: "upgrades",
    title: "Which used mini PCs can take a 10GbE network card?",
    description: "How to add 10 Gigabit (or 2.5GbE) networking to a used 1-litre PC: which Lenovo Tiny models take a PCIe card via a riser, what else to buy, heat and card-height limits, and the alternatives.",
    updated: UPDATED,
    models: (m) => m.pcieSlot !== "none" || (m.lanUpgrades ?? []).length > 0,
    related: [
      { href: "/best/mini-pcs-that-support-10gbe", label: "Mini PCs that support 10GbE" },
      { href: "/guides/1gbe-vs-2-5gbe-vs-10gbe-home-server", label: "Decide whether you need 2.5GbE or 10GbE" },
      { href: "/best/mini-pcs-with-pcie-slot", label: "Mini PCs with a PCIe slot" },
      { href: "/guides/mini-pc-opnsense-pfsense-router", label: "Mini PC as an OPNsense/pfSense router" },
    ],
    body: () => (
      <>
        <p>
          No used 1-litre business PC has 10GbE built in. The reliable way to add it is a low-profile PCIe network card, and only
          a few chassis have a PCIe slot. On the Lenovo ThinkCentre Tiny models below, the slot comes from an optional riser card
          that sits where the 2.5&quot; drive would go, so you give up that bay.
        </p>
        <h2>Models with a path beyond 1 GbE</h2>
        <ModelTable
          models={CATALOG.filter((m) => (m.lanUpgrades ?? []).length > 0)}
          cols={["gen", "pcie", "network"]}
          caption="Models with a faster networking path"
        />
        <p className="small muted">&quot;Owner-reported&quot; means widely used by owners but not listed as an option by the manufacturer.</p>
        <h2>What to buy</h2>
        <ul>
          <li><strong>The riser and a low-profile bracket.</strong> They are model-specific and almost never included with the PC.</li>
          <li><strong>A low-profile card.</strong> SFP+ cards (with a DAC cable or fibre module) run noticeably cooler than 10GBASE-T (RJ45) cards, which matters in a case this small with one fan.</li>
          <li><strong>Check card length and height</strong> against the space above the riser before you buy.</li>
        </ul>
        <h2>If your model has no PCIe slot</h2>
        <p>
          HP Elite Mini 800 G9 units can be configured from the factory with an Intel I226-V 2.5GbE port in the Flex IO position.
          For everything else, a USB 3 2.5GbE adapter is the practical option. USB 10GbE adapters exist but cost more than a
          different mini PC and are rarely worth it for a server.
        </p>
        <p><Link href="/?pcie=1">Show models with PCIe expansion in the finder →</Link></p>
      </>
    ),
  },
  {
    slug: "mini-pc-power-consumption",
    category: "buying",
    title: "Mini PC power consumption for a 24/7 home server: how to measure and reduce it",
    description: "How to measure the real idle power of a used mini PC home server, what makes it higher or lower, and how to turn watts into a yearly electricity cost. No made-up numbers.",
    updated: UPDATED,
    models: () => true,
    related: [
      { href: "/best/low-power-mini-pc-home-server", label: "Models with a measured idle of 15 W or less" },
      { href: "/best/best-budget-mini-pc-home-server", label: "Best budget mini PCs for a first home server" },
    ],
    body: () => (
      <>
        <p>
          Idle power is the number that matters for a home server, because it sits idle most of the day. It is also the number
          most often guessed. We publish a model&apos;s idle figure only with its source, configuration and method; until then the
          model page says &quot;Not measured yet&quot;. The published readings so far are collected on{" "}
          <Link href="/best/low-power-mini-pc-home-server">the low-power list</Link>.
        </p>
        <h2>What changes idle power</h2>
        <ul>
          <li><strong>BIOS power settings:</strong> deep CPU package C-states and PCIe ASPM enabled make the biggest difference. Some ex-office units ship with performance profiles.</li>
          <li><strong>Drives and cards:</strong> each NVMe SSD, 2.5&quot; drive and especially a 10GBASE-T card adds idle draw.</li>
          <li><strong>The operating system:</strong> Linux with <code>powertop --auto-tune</code> applied usually idles lower than a default install.</li>
          <li><strong>The power adapter:</strong> a higher-wattage brick is not less efficient at idle by default, but a failing third-party adapter can be.</li>
          <li><strong>Displays and USB devices:</strong> measure headless if the server will run headless.</li>
        </ul>
        <h2>How to measure it properly</h2>
        <ol>
          <li>Use a plug-in wall meter between the adapter and the socket (this measures what you pay for).</li>
          <li>Boot into the real OS and workload (e.g. Proxmox with your VMs idle) and wait 10 minutes to settle.</li>
          <li>Note the lowest stable reading over a few minutes, plus CPU, RAM, drives, OS, BIOS settings and mains voltage.</li>
        </ol>
        <p>
          Measured one? <Link href="/contact">Send us the reading with those details</Link> and we will add it to the model
          page with credit, labelled as a community measurement.
        </p>
        <h2>From watts to cost</h2>
        <p>
          Yearly energy = watts × 24 × 365 ÷ 1000 kWh. So every 1 W of continuous draw is 8.76 kWh per year. Multiply by your
          electricity price per kWh: for example, a 10 W difference at 0.30 per kWh is about 26 per year in your currency.
        </p>
        <h2>Official sources to check</h2>
        <p>
          Many of these models were ENERGY STAR certified, and the <a href="https://www.energystar.gov/productfinder/product/certified-computers" rel="nofollow noopener" target="_blank">ENERGY STAR product finder</a> lists
          an idle-state power figure measured under a standard test for specific certified configurations. It is a useful
          comparison point, but your configuration and OS will differ.
        </p>
      </>
    ),
  },
  {
    slug: "best-used-mini-pc-for-proxmox",
    category: "workloads",
    title: "Choosing a used mini PC for Proxmox: RAM, drives, NICs and clusters",
    description: "What actually matters when picking a used Lenovo Tiny, OptiPlex Micro or EliteDesk Mini as a Proxmox VE node or a small cluster: RAM ceiling, second drive, networking, vPro and quorum.",
    updated: UPDATED,
    models: (m) => m.totalDrives >= 2,
    related: [
      { href: "/best/best-mini-pc-for-proxmox", label: "Models that meet the Proxmox criteria" },
      { href: "/best/mini-pcs-with-two-nvme-slots", label: "Mini PCs with two NVMe slots" },
      { href: "/guides/check-used-nvme-ssd-health", label: "Check the health of a used NVMe SSD" },
      { href: "/best/mini-pcs-with-intel-vpro-amt", label: "Mini PCs with vPro/AMT" },
    ],
    body: () => (
      <>
        <p>Proxmox VE runs on almost anything. What decides whether a mini PC is a good node is how many guests it can hold and how you will store them.</p>
        <h2>1. RAM ceiling first</h2>
        <p>RAM runs out before CPU on most home Proxmox hosts. ZFS also uses RAM for its cache. Prefer a model officially rated for 64 GB if you plan many VMs; see <Link href="/guides/do-mini-pcs-support-64gb-ram">which models support 64 GB</Link>.</p>
        <h2>2. A second drive</h2>
        <p>
          Two drives let you mirror the VM storage or keep the OS separate. Two NVMe slots is best; one NVMe plus a 2.5&quot; SATA
          SSD is the common compromise. On Lenovo Tiny models a PCIe riser takes the 2.5&quot; bay, so you cannot have both.
        </p>
        <h2>3. Networking</h2>
        <p>
          One 1 GbE port is enough for a single node. For a cluster with shared storage or live migration, or for an OPNsense VM,
          look at <Link href="/best/mini-pcs-with-faster-than-gigabit-networking">models with a faster or second NIC path</Link>. Intel NICs (I219, I226)
          are well supported by Proxmox&apos;s kernel.
        </p>
        <h2>4. Remote management</h2>
        <p>Intel vPro/AMT on supported CPUs gives you remote console and power control for a headless node, without extra hardware.</p>
        <h2>5. Clusters: three is the magic number</h2>
        <p>
          A Proxmox cluster needs a majority of votes (quorum) to make changes. Three nodes can lose one and keep running; with two
          nodes you need an external QDevice for a third vote. Buying three identical used units also means one set of spare parts.
        </p>
        <h2>Models with real headroom (two NVMe, 64 GB or PCIe)</h2>
        <ModelTable
          models={CATALOG.filter((m) => m.maxThreads >= 6 && m.totalDrives >= 2 && m.ram.maxOfficialGB >= 32 && (m.storage.m2Nvme >= 2 || m.ram.maxOfficialGB >= 64 || m.pcieSlot !== "none"))}
          cols={["gen", "ram", "drives", "network", "vpro"]}
          caption="Proxmox-friendly models"
        />
      </>
    ),
  },
  {
    slug: "mini-pc-nvme-ssd-upgrade",
    category: "upgrades",
    title: "Mini PC NVMe SSD upgrade guide: slots, sizes and the 2.5\" bay",
    description: "How many NVMe SSDs each used Lenovo Tiny, OptiPlex Micro and EliteDesk Mini holds, which M.2 slots are for storage versus Wi-Fi, and what you need for the 2.5\" bay.",
    updated: UPDATED,
    models: () => true,
    related: [
      { href: "/best/mini-pcs-with-two-nvme-slots", label: "Mini PCs with two NVMe slots" },
      { href: "/guides/mini-pc-for-nas", label: "Can a mini PC be a NAS?" },
    ],
    body: () => (
      <>
        <p>Storage is where these small machines differ most, and where listings are most often wrong.</p>
        <h2>Storage slots by model</h2>
        <ModelTable models={byGen} cols={["released", "nvme", "drives", "pcie"]} caption="Storage slots" />
        <h2>What to buy</h2>
        <ul>
          <li><strong>M.2 2280 NVMe</strong> is the size these storage slots take. Shorter 2230/2242 drives need an adapter or a screw position that may not exist.</li>
          <li><strong>The small M.2 2230 slot is usually for Wi-Fi</strong> (E-key), not storage. It does not count as an SSD slot.</li>
          <li><strong>2.5&quot; SATA</strong> needs the model&apos;s caddy and SATA cable, which are often missing from units sold with only an M.2 SSD.</li>
        </ul>
        <h2>Common mix-ups</h2>
        <ul>
          <li>The Lenovo M920q has board footprints for a second M.2 slot, but it is populated only on the M920x. See <Link href="/compare/m920q-vs-m920x">M920q vs M920x</Link>.</li>
          <li>On Lenovo Tiny models, installing a PCIe riser uses the space of the 2.5&quot; bay.</li>
          <li>On the HP 800 G8/G9 Mini, units configured with M.2-only storage ship without the SATA drive bracket (per HP&apos;s QuickSpecs).</li>
        </ul>
      </>
    ),
  },
  {
    slug: "mini-pc-ram-upgrade",
    category: "upgrades",
    title: "Mini PC RAM upgrade guide: DDR4 vs DDR5, speeds and slots",
    description: "Which memory each used Lenovo Tiny, OptiPlex Micro and EliteDesk Mini takes (DDR4 or DDR5 SODIMM), the official maximum, speeds, and how to upgrade without wasting money.",
    updated: UPDATED,
    models: () => true,
    related: [{ href: "/guides/do-mini-pcs-support-64gb-ram", label: "Do these mini PCs support 64 GB?" }],
    body: () => (
      <>
        <p>Every model here has two SODIMM slots (laptop-size memory). The generation decides DDR4 or DDR5; the two are not interchangeable.</p>
        <h2>Memory by model</h2>
        <ModelTable models={byGen} cols={["released", "ramType", "ram"]} caption="Memory type and limits" />
        <h2>How to upgrade sensibly</h2>
        <ol>
          <li>Check what is installed first: 2 × 8 GB leaves no free slot, so going to 32 GB means replacing both.</li>
          <li>Buy a matched 2-module kit for dual-channel bandwidth.</li>
          <li>Speed: buy the listed speed or faster; faster modules run at the platform&apos;s maximum.</li>
          <li>Keep the old modules if you run a cluster: they can go into another node.</li>
        </ol>
      </>
    ),
  },
  {
    slug: "mini-pc-opnsense-pfsense-router",
    category: "workloads",
    title: "Using a used mini PC as an OPNsense or pfSense router",
    description: "Which used 1-litre PCs make good OPNsense or pfSense routers, how to get a second (or fourth) network port without USB, and what to avoid.",
    updated: UPDATED,
    models: (m) => m.pcieSlot !== "none" || m.extraNicOption !== null,
    related: [
      { href: "/best/mini-pcs-for-opnsense-router", label: "Mini PCs that work as a router" },
      { href: "/guides/mini-pc-10gbe-network-card", label: "Adding a 10GbE card" },
    ],
    body: () => (
      <>
        <p>
          A router needs at least two network ports: WAN and LAN. These PCs have one. The quality of the second port matters more
          than the CPU: every Intel Core CPU in this list is fast enough to route a typical home gigabit connection.
        </p>
        <h2>Ways to get a second port, best first</h2>
        <ol>
          <li><strong>PCIe card</strong> (Lenovo Tiny riser models): a dual- or quad-port Intel NIC gives the most reliable result and room for VLANs.</li>
          <li><strong>Vendor module</strong> (HP Flex IO): a second Ethernet port in the chassis. Match the module version to the generation.</li>
          <li><strong>USB adapter:</strong> works, especially with VLANs on a managed switch (&quot;router on a stick&quot;), but is the least robust option for a firewall.</li>
        </ol>
        <h2>Models with an internal second-port option</h2>
        <ModelTable models={CATALOG.filter((m) => m.pcieSlot !== "none" || m.extraNicOption !== null)} cols={["gen", "pcie", "network"]} why={(m) => m.extraNicOption ?? ""} caption="Router-friendly models" />
        <h2>Tips</h2>
        <ul>
          <li>Intel NICs have the best driver support in FreeBSD, which OPNsense and pfSense are based on.</li>
          <li>AES-NI, used for VPN throughput, is present on all the Intel Core CPUs in this list.</li>
          <li>Running the router as a Proxmox VM saves a box but means the internet goes down when you reboot the host.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "mini-pc-for-nas",
    category: "workloads",
    title: "Can a used mini PC be a NAS? Drive limits and better options",
    description: "How much storage a used 1-litre PC can really hold, when a mini PC NAS makes sense, why USB drive enclosures are a compromise, and which models hold the most drives.",
    updated: UPDATED,
    models: (m) => m.totalDrives >= 2,
    related: [
      { href: "/best/mini-pcs-with-two-nvme-slots", label: "Mini PCs with two NVMe slots" },
      { href: "/guides/mini-pc-nvme-ssd-upgrade", label: "NVMe upgrade guide" },
    ],
    body: () => (
      <>
        <p>
          The honest answer: a 1-litre PC makes a good small SSD NAS, not a big hard-drive NAS. The most any model here holds is
          three internal drives (two NVMe and one 2.5&quot;), and there is no room for 3.5&quot; hard drives.
        </p>
        <h2>Models that hold the most drives</h2>
        <ModelTable models={CATALOG.filter((m) => m.totalDrives >= 3)} cols={["drives", "pcie", "network"]} caption="Models with three drive positions" />
        <h2>Good fits</h2>
        <ul>
          <li>An all-SSD NAS for documents and photos, mirrored across two NVMe drives.</li>
          <li>A backup target or a Nextcloud / Immich server with the bulk data on SSD.</li>
          <li>A 2.5GbE or 10GbE path helps: a single SATA SSD already outruns 1 GbE.</li>
        </ul>
        <h2>The USB enclosure question</h2>
        <p>
          USB drive enclosures work for backups, but they are a compromise for a ZFS or RAID pool: USB bridges can drop drives or
          hide drive health data, which is why TrueNAS and most ZFS guides advise against USB-attached pools. For several hard
          drives, a small tower or a purpose-built NAS is the better tool; a mini PC can still run the apps next to it.
        </p>
      </>
    ),
  },
  {
    slug: "used-mini-pc-vs-n100",
    category: "buying",
    title: "Used business mini PC vs a new Intel N100 mini PC for a home server",
    description: "A used Lenovo Tiny, OptiPlex Micro or EliteDesk Mini against a new Intel N100/N150 mini PC: cores, RAM ceiling, expansion, media decoding and warranty, compared on published specs.",
    updated: UPDATED,
    models: (m) => m.vendor === "Intel",
    related: [
      { href: "/best/best-budget-mini-pc-home-server", label: "Best budget used mini PCs" },
      { href: "/which-mini-pc", label: "Which mini PC is right for me?" },
    ],
    body: () => (
      <>
        <p>
          New Intel N100/N150 boxes are the other common starting point for a home server. Both are good choices; they are good at
          different things. The N100 figures below are from <a href="https://www.intel.com/content/www/us/en/products/sku/231803/intel-processor-n100-6m-cache-up-to-3-40-ghz/specifications.html" rel="nofollow noopener" target="_blank">Intel&apos;s specification page</a>.
        </p>
        <div className="table-scroll panel" style={{ padding: 0 }}>
          <table className="grid-table">
            <thead><tr><th scope="col"></th><th scope="col">Intel N100 (new mini PC)</th><th scope="col">Typical used 1-litre business PC</th></tr></thead>
            <tbody>
              <tr><th scope="row">CPU</th><td>4 cores / 4 threads, 6 W TDP</td><td>2–14 cores, 35 W &quot;T&quot; desktop CPUs (e.g. i5-8500T: 6 cores)</td></tr>
              <tr><th scope="row">Max memory</th><td>16 GB (Intel spec), single channel</td><td>32–64 GB official, two SODIMM slots</td></tr>
              <tr><th scope="row">Media decode</th><td>Includes AV1 decode</td><td>10-bit HEVC from 7th gen; AV1 from 11th gen</td></tr>
              <tr><th scope="row">Expansion</th><td>Varies by model; many have 2.5GbE ports built in</td><td>PCIe riser on some Lenovo Tiny models; vendor NIC modules on HP</td></tr>
              <tr><th scope="row">CPU upgrade</th><td>Soldered</td><td>Socketed on most (swap to a better CPU of the same generation)</td></tr>
              <tr><th scope="row">Warranty</th><td>New, with warranty</td><td>Usually a short seller warranty</td></tr>
            </tbody>
          </table>
        </div>
        <h2>Pick the N100 if</h2>
        <ul>
          <li>You want the lowest likely idle power, built-in 2.5GbE and a warranty.</li>
          <li>Your services fit in 16 GB (Home Assistant, Pi-hole, a few containers, Jellyfin with AV1).</li>
        </ul>
        <h2>Pick a used business mini PC if</h2>
        <ul>
          <li>You need more than 16 GB of RAM for VMs, or more CPU threads.</li>
          <li>You want a PCIe slot for 10GbE or a multi-port NIC, or plan a matching three-node cluster cheaply.</li>
        </ul>
        <p>Used models that decode AV1 too: <Link href="/?media=av1">filter the finder for AV1 decode</Link>.</p>
        <p className="small muted">Intel-based used models in our database: {intel.length}.</p>
      </>
    ),
  },
  {
    slug: "tinyminimicro-model-names-explained",
    category: "buying",
    title: "Lenovo Tiny, OptiPlex Micro and EliteDesk Mini names explained (TinyMiniMicro)",
    description: "Decode the model names of used 1-litre business PCs: which Lenovo M-series, Dell OptiPlex Micro and HP EliteDesk/ProDesk Mini generations use which CPUs, and what the tiers mean.",
    updated: UPDATED,
    models: () => true,
    related: [{ href: "/", label: "Filter every model in the finder" }],
    body: () => (
      <>
        <p>
          &quot;TinyMiniMicro&quot; is the homelab nickname (popularised by ServeTheHome) for 1-litre business desktops: Lenovo
          ThinkCentre <em>Tiny</em>, HP EliteDesk/ProDesk <em>Mini</em> and Dell OptiPlex <em>Micro</em>. The names follow patterns
          that tell you the tier and generation.
        </p>
        <h2>Naming patterns</h2>
        <ul>
          <li><strong>Lenovo:</strong> M7xx models are the value tier and M9xx the business tier (vPro chipsets, more options), e.g. M720q vs M920q. From 2020 Lenovo switched to &quot;Gen&quot; names (M70q Gen 1, M90q Gen 1). The &quot;x&quot; suffix (M920x) marks the extended variant with a second M.2 slot and PCIe option.</li>
          <li><strong>Dell:</strong> OptiPlex 3000-series Micro is the value tier and 7000-series the business tier; the tens digit tracks the generation (7050 → 7060 → 7070 → 7080).</li>
          <li><strong>HP:</strong> ProDesk 400/600 is the value tier and EliteDesk 800 the business tier; G2, G3, G4 … is the generation. From G9 the line is called &quot;Elite Mini 800&quot;.</li>
          <li><strong>AMD versions</strong> have their own names: Lenovo M75q, HP EliteDesk 705.</li>
        </ul>
        <h2>Every model we track, by generation</h2>
        <ModelTable models={byGen} cols={["released", "gen", "ramType"]} caption="Model generations" />
        <p>Looking for a specific capability? <Link href="/which-mini-pc">Answer four questions</Link> and see which of these fit.</p>
      </>
    ),
  },
];

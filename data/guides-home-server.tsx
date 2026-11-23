import Link from "next/link";
import type { Guide } from "./guides";

const published = "2026-11-18";

export const HOME_SERVER_GUIDES: Guide[] = [
  {
    slug: "home-assistant-mini-pc",
    category: "workloads",
    title: "How to choose a used mini PC for Home Assistant",
    description: "Choose a used mini PC for Home Assistant OS or a Proxmox VM. Check RAM, storage, Ethernet, USB radios and backups before you buy.",
    published,
    updated: published,
    related: [
      { href: "/guides/proxmox-vs-docker-home-server", label: "Proxmox vs Docker for a home server" },
      { href: "/guides/used-mini-pc-for-frigate", label: "Size a mini PC for Frigate and Home Assistant" },
      { href: "/best/best-budget-mini-pc-home-server", label: "Browse budget home server mini PCs" },
      { href: "/guides/check-a-used-mini-pc-listing", label: "Check a used listing before buying" },
    ],
    body: () => (
      <>
        <p>For automations, dashboards and a few smart-home radios, start with a used business mini PC with 8 GB of RAM, a 128 GB or larger SSD and wired Ethernet. That is a shopping baseline for a dedicated host. Budget for more memory and storage if the same machine will also run cameras, video processing or several virtual machines.</p>

        <h2>Choose where Home Assistant will run</h2>
        <ul>
          <li><strong>Home Assistant OS on the mini PC.</strong> Choose this for a dedicated smart-home box with built-in app management. Check that the machine supports UEFI boot and that you can change Secure Boot settings. The native install writes an image to the target drive, so save anything you want to keep first.</li>
          <li><strong>Home Assistant OS in a Proxmox VM.</strong> Choose this if the mini PC will run other VMs. Plan memory for all guests and the host, and test that any USB radio is available to the VM after a reboot.</li>
          <li><strong>Home Assistant Container on Linux.</strong> Choose this if you already manage a Linux and Docker host. You are responsible for container updates, persistent storage and companion services.</li>
        </ul>

        <h2>Compare three common used models</h2>
        <ul>
          <li><Link href="/models/lenovo-thinkcentre-m720q">Lenovo ThinkCentre M720q Tiny</Link>. An option for a dedicated box. Check whether the power adapter and SSD come with the listing.</li>
          <li><Link href="/models/dell-optiplex-3080-micro">Dell OptiPlex 3080 Micro</Link>. Consider a 10th-generation Core i5 configuration if you also expect to run several services. Check the RAM layout so you know what an upgrade will cost.</li>
          <li><Link href="/models/hp-elitedesk-800-g4-mini">HP EliteDesk 800 G4 Mini</Link>. Its two M.2 SSD connectors give you room to keep a separate data drive. Check the listing for the drive and mounting hardware you need.</li>
        </ul>

        <h2>Plan for radios and recovery</h2>
        <p>Leave an accessible port for a Zigbee or Z-Wave adapter. For Zigbee, allow space for a USB extension cable so you can position the radio away from the PC and nearby USB 3 hardware. If you use a VM, verify that the radio still works after a cold boot.</p>
        <p>Save a Home Assistant backup off the mini PC and keep the backup encryption key available. Write down which radios and services are attached, then check that your recovery plan covers any services you run outside Home Assistant.</p>

        <h2>Installation and setup references</h2>
        <ul>
          <li><a href="https://www.home-assistant.io/installation/">Home Assistant installation methods</a></li>
          <li><a href="https://www.home-assistant.io/installation/generic-x86-64/">Home Assistant OS on a generic x86-64 PC</a></li>
          <li><a href="https://www.home-assistant.io/integrations/zha/">Home Assistant Zigbee adapter and setup guidance</a></li>
        </ul>
      </>
    ),
  },
  {
    slug: "proxmox-vs-docker-home-server",
    category: "workloads",
    title: "Proxmox vs Docker for a single mini PC home server",
    description: "Decide between Linux with Docker, Proxmox VMs or Docker inside a Proxmox VM. Compare memory use, device access, storage and backups.",
    published,
    updated: published,
    related: [
      { href: "/guides/best-used-mini-pc-for-proxmox", label: "Choose a mini PC for Proxmox" },
      { href: "/guides/mini-pc-home-server-backup-checklist", label: "Plan backups for a single mini PC" },
      { href: "/guides/home-assistant-mini-pc", label: "Choose a mini PC for Home Assistant" },
      { href: "/best/best-mini-pc-for-proxmox", label: "Compare used mini PCs for Proxmox" },
    ],
    body: () => (
      <>
        <p>Use Linux with Docker when your home server will mainly run containerized applications. Choose Proxmox VE when you want to run several operating systems as virtual machines. On a Proxmox host, you can run Docker inside a Linux VM and reserve other VMs for workloads such as Home Assistant OS.</p>

        <h2>Which setup fits your workload?</h2>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Home server setup comparison">
          <table className="grid-table">
            <thead><tr><th scope="col">Setup</th><th scope="col">Good fit</th><th scope="col">What you maintain</th></tr></thead>
            <tbody>
              <tr><th scope="row">Linux with Docker</th><td>Jellyfin, web apps and other services on one host</td><td>Linux, Compose files, and backups of app data and databases</td></tr>
              <tr><th scope="row">Proxmox with VMs</th><td>Multiple operating systems, lab experiments or an appliance VM</td><td>Host and guest updates, guest storage and backups</td></tr>
              <tr><th scope="row">Proxmox with a Docker VM</th><td>Containerized services alongside separate VMs</td><td>Both layers, plus any device passthrough and external storage</td></tr>
            </tbody>
          </table>
        </div>

        <h2>Size RAM and storage for the guests</h2>
        <p>List the services you plan to run and their memory needs. For virtual machines, budget for each active guest OS as well as the host. Check whether the model officially supports your target memory and whether you need to replace both installed sticks. A second drive can separate VM or app data from the boot disk. Keep backups on another device so one PC failure does not take both copies.</p>

        <h2>Check the devices your services need</h2>
        <p>For media transcoding, check the exact CPU and integrated GPU in the listing. Docker on Linux can expose a supported graphics device to a container. A guest VM also needs a way to access that device, which depends on the host, firmware and guest setup. Plan for USB radio access if you will run home automation in a guest.</p>

        <h2>Make a restore test part of the setup</h2>
        <p>For Docker, keep the Compose configuration and cover volumes, bind-mounted files and consistent database exports in your backup plan. For Proxmox, test restoring a guest and check separately that any data stored outside its virtual disks is backed up. Document where each copy lives and which drives or devices it depends on.</p>

        <h2>Platform references</h2>
        <ul>
          <li><a href="https://pve.proxmox.com/pve-docs/chapter-pct.html">Proxmox VE container documentation</a></li>
          <li><a href="https://docs.docker.com/engine/storage/volumes/">Docker volumes documentation</a></li>
        </ul>
      </>
    ),
  },
  {
    slug: "intel-t-vs-non-t-mini-pc",
    category: "buying",
    title: "Intel T vs non-T CPUs in used mini PCs",
    description: "Compare an Intel Core i5-8500T with the i5-8500, learn what TDP can tell you, and check chassis and adapter compatibility before buying.",
    published,
    updated: published,
    related: [
      { href: "/guides/mini-pc-power-consumption", label: "Measure a mini PC’s power consumption" },
      { href: "/guides/quick-sync-generations-plex-jellyfin", label: "Check hardware transcoding by CPU generation" },
      { href: "/guides/check-a-used-mini-pc-listing", label: "Check a used mini PC listing" },
    ],
    body: () => (
      <>
        <p>Intel uses the T suffix for power-optimized desktop models. Used ThinkCentre Tiny, OptiPlex Micro and EliteDesk Mini listings often include these CPUs. Read the full processor number, because a listing that says only “Core i5” leaves out the generation and power configuration.</p>

        <h2>Example comparison featuring the Core i5-8500</h2>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Intel Core i5-8500T and i5-8500 specifications">
          <table className="grid-table">
            <thead><tr><th scope="col">Intel specification</th><th scope="col">Core i5-8500T</th><th scope="col">Core i5-8500</th></tr></thead>
            <tbody>
              <tr><th scope="row">Cores / threads</th><td>6 / 6</td><td>6 / 6</td></tr>
              <tr><th scope="row">Base frequency</th><td>2.10 GHz</td><td>3.00 GHz</td></tr>
              <tr><th scope="row">Maximum turbo frequency</th><td>3.50 GHz</td><td>4.10 GHz</td></tr>
              <tr><th scope="row">TDP</th><td>35 W</td><td>65 W</td></tr>
              <tr><th scope="row">Integrated graphics</th><td>Intel UHD Graphics 630</td><td>Intel UHD Graphics 630</td></tr>
            </tbody>
          </table>
        </div>
        <p>Intel publishes these figures for the <a href="https://www.intel.com/content/www/us/en/products/sku/129941/intel-core-i58500t-processor-9m-cache-up-to-3-50-ghz/specifications.html">i5-8500T</a> and <a href="https://www.intel.com/content/www/us/en/products/sku/129939/intel-core-i58500-processor-9m-cache-up-to-4-10-ghz/specifications.html">i5-8500</a>. Turbo frequency is a maximum under suitable conditions. Sustained performance also depends on the machine’s power limits and cooling.</p>

        <h2>How to compare electricity use</h2>
        <p>Use TDP when checking the CPU and cooling specification. For a server’s electricity bill, compare the whole system at the wall with the drives and services you expect to run. Idle draw often matters most for a server that spends most of its time waiting. A sustained 5 W difference across a year works out to 43.8 kWh.</p>

        <h2>What to verify in the listing</h2>
        <ul>
          <li>Ask for a BIOS or system information photo showing the full processor number, including its suffix.</li>
          <li>Check the manufacturer’s supported CPU configurations for that exact chassis if the seller swapped the processor.</li>
          <li>Confirm the cooler and power adapter match the configuration. A compatible socket alone tells you little about cooling or firmware support.</li>
          <li>For Plex or Jellyfin, compare codec support for the exact integrated GPU and the files you play.</li>
        </ul>
      </>
    ),
  },
];

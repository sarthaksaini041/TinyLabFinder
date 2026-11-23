import Link from "next/link";
import type { Guide } from "./guides";

const published = "2026-11-23";

export const HARDWARE_PLANNING_GUIDES: Guide[] = [
  {
    slug: "used-mini-pc-for-frigate",
    category: "workloads",
    title: "Choosing a used mini PC for Frigate and Home Assistant",
    description: "Plan a used mini PC for Frigate by checking video decoding, object detection and storage retention with your actual camera streams.",
    published,
    updated: published,
    related: [
      { href: "/guides/home-assistant-mini-pc", label: "Choose a mini PC for Home Assistant" },
      { href: "/guides/mini-pc-nvme-ssd-upgrade", label: "Check SSD slots before buying a recording drive" },
      { href: "/guides/mini-pc-power-consumption", label: "Measure the power draw of an always-on mini PC" },
    ],
    body: () => (
      <>
        <p>Start with your camera streams and the number of days you want to keep. A used mini PC can run Frigate and Home Assistant together, but your camera codec, object detection setup and write volume determine what the hardware needs to handle.</p>

        <h2>Check video decoding and detection separately</h2>
        <p>Frigate can use a compatible GPU to decode camera video. Object detection is a separate job, with its own supported accelerator and model combinations. For an Intel mini PC, check the exact CPU and integrated GPU against Frigate’s hardware decoding and OpenVINO guidance when you plan to use those features. Confirm the container or VM can see the device.</p>
        <p>Where your camera offers two streams, try a lower-resolution substream for detection and the higher-resolution stream for recording. Test the substream where the objects you care about actually appear. A low-resolution view may work at a doorway but miss important detail at the far end of a driveway.</p>

        <h2>Estimate recording storage from bitrate</h2>
        <p>For continuous recording, every <strong>1 Mb/s adds about 10.8 GB per day</strong> in decimal units. Multiply 10.8 by the sum of the recording bitrates in Mb/s and the number of days. Include audio in the stream rate when it is recorded.</p>
        <p>Four cameras averaging 2 Mb/s each use about <strong>605 GB over seven days</strong> before filesystem overhead and free-space headroom. Variable-bitrate streams can rise with motion or noisy night footage. If you retain only portions of footage, measure a representative day and check Frigate’s effective retention settings before sizing the disk from a quiet afternoon.</p>

        <h2>Run one camera before expanding</h2>
        <ol>
          <li>Test the exact codec, main stream and detection stream you plan to use.</li>
          <li>Confirm video decoding uses the intended device. Check detection speed separately.</li>
          <li>Play back a recording and restart Frigate to verify the storage mount and device access survive a reboot.</li>
          <li>Measure disk growth during the day and after dark, then add the remaining cameras and repeat.</li>
        </ol>
        <p>If you also run a media server, test one camera recording while a client transcodes a video. Both services can contend for the same GPU or drive. For an all-in-one host, a separate recording volume gives you a clear retention boundary and makes it easier to see how much space video consumes.</p>
        <p>Platform references include <a href="https://docs.frigate.video/frigate/hardware/">Frigate’s recommended hardware</a>, its <a href="https://docs.frigate.video/configuration/hardware_acceleration_video/">video acceleration guide</a> and <a href="https://docs.frigate.video/configuration/record/">recording and retention documentation</a>.</p>
      </>
    ),
  },
  {
    slug: "check-used-nvme-ssd-health",
    category: "buying",
    title: "How to check a used NVMe SSD before trusting it",
    description: "Read NVMe SMART health with smartctl. Understand percentage used, media errors, spare capacity and what to record during the return window.",
    published,
    updated: published,
    related: [
      { href: "/guides/check-a-used-mini-pc-listing", label: "Check the rest of a used mini PC listing" },
      { href: "/guides/mini-pc-nvme-ssd-upgrade", label: "Check NVMe sizes and slots by model" },
      { href: "/guides/mini-pc-home-server-backup-checklist", label: "Plan a backup before moving important data" },
    ],
    body: () => (
      <>
        <p>A bootable SSD can still have a health warning. In the return window, record its model, capacity and NVMe SMART log before putting your data on it. If the drive came with a used PC, compare what the system sees with what the listing promised.</p>

        <h2>Read the NVMe SMART log on Linux</h2>
        <p>Use <code>lsblk -d -o NAME,MODEL,SIZE,TRAN</code> to identify the physical drive. Then use <code>sudo smartctl -a /dev/nvme0</code>, replacing the device with the correct NVMe controller on your machine. This reads health data. A USB enclosure may hide the log if its bridge cannot pass NVMe commands through. If possible, check directly in the mini PC’s M.2 slot.</p>
        <dl className="faq">
          <div><dt>Critical Warning</dt><dd>Any nonzero warning deserves investigation. Read the decoded warning to see whether it concerns temperature, spare capacity, reliability or another condition.</dd></div>
          <div><dt>Percentage Used</dt><dd>The controller’s estimate of endurance consumed. A value of 25% is an estimate of wear. It says nothing about how full your filesystem is. A value at or above 100% means estimated rated endurance has been used.</dd></div>
          <div><dt>Available Spare</dt><dd>Remaining reserve capacity reported by the drive. Compare it with the drive’s own Available Spare Threshold.</dd></div>
          <div><dt>Media and Data Integrity Errors</dt><dd>Unrecovered data-integrity errors reported by the controller. Take a screenshot or save the output and compare later. A count that keeps rising is a reason to stop relying on that drive.</dd></div>
        </dl>

        <h2>Put the counters in context</h2>
        <p>Power-on hours show how long the drive was powered, while data written shows something closer to wear from use. The general error log entry count is a different field from media and data integrity errors. Read the entries before drawing conclusions from the count alone.</p>
        <p>Check temperature during an ordinary copy and look for drive resets or read failures. Start with a backup before any write-heavy testing. If the listed capacity is wrong, a critical warning persists, or errors increase under routine use, document what you observed while the return window is open.</p>
        <p>See the <a href="https://man.archlinux.org/man/smartctl.8">smartctl manual</a> and the <a href="https://www.smartmontools.org/static/doxygen/structsmartmontools_1_1nvme__smart__log.html">NVMe SMART field definitions in smartmontools</a>.</p>
      </>
    ),
  },
  {
    slug: "1gbe-vs-2-5gbe-vs-10gbe-home-server",
    category: "upgrades",
    title: "1 GbE vs 2.5 GbE vs 10 GbE for a mini PC home server",
    description: "Compare Ethernet transfer times, find the bottleneck between your mini PC and NAS, and decide whether a faster port is worth buying.",
    published,
    updated: published,
    related: [
      { href: "/guides/mini-pc-10gbe-network-card", label: "Find used mini PCs that can take a 10GbE network card" },
      { href: "/best/mini-pcs-with-faster-than-gigabit-networking", label: "Browse models with a 2.5GbE or faster upgrade path" },
      { href: "/guides/mini-pc-for-nas", label: "Compare storage options for a mini PC NAS" },
    ],
    body: () => (
      <>
        <p>Before buying a faster NIC, time a real transfer and check the negotiated speed at both ends. A newer port on the mini PC helps only if the client, network path and storage can use the added bandwidth.</p>

        <h2>What each speed changes for a 100 GB transfer</h2>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Ideal Ethernet transfer rates">
          <table className="grid-table">
            <thead><tr><th scope="col">Link speed</th><th scope="col">Raw rate</th><th scope="col">Ideal time</th><th scope="col">Where it is useful</th></tr></thead>
            <tbody>
              <tr><th scope="row">1 GbE</th><td>125 MB/s</td><td>13 min 20 sec</td><td>Automation, typical media playback and occasional backups</td></tr>
              <tr><th scope="row">2.5 GbE</th><td>312.5 MB/s</td><td>5 min 20 sec</td><td>Regular large backups or a fast shared SSD</td></tr>
              <tr><th scope="row">10 GbE</th><td>1,250 MB/s</td><td>1 min 20 sec</td><td>Frequent transfers between fast storage systems or several active clients</td></tr>
            </tbody>
          </table>
        </div>
        <p>The raw times use decimal GB and assume an uninterrupted transfer at line rate. File transfers also pay for protocol overhead, filesystem work and storage latency. Lots of small files usually take longer than one large file of the same total size.</p>

        <h2>Check the whole path</h2>
        <ol>
          <li>On Linux, use <code>ethtool</code> with the interface name to read the negotiated speed. Check the switch port and the receiving device too. Some 10GbE equipment does not support 2.5GbE.</li>
          <li>Measure network throughput between two wired devices you control with <code>iperf3</code>. Then copy a large file to the same destination. If the network test is fast and the copy is slow, investigate the disks, sharing protocol or CPU load.</li>
          <li>Repeat in the other direction. Reads and writes can have different limits, especially when the destination drive’s cache fills.</li>
        </ol>

        <h2>Buy the smallest upgrade that clears the bottleneck</h2>
        <p>Use 2.5GbE when a faster link would shorten a backup or transfer you do regularly. For 10GbE in a one-litre PC, check switch compatibility, card heat, riser and bracket requirements, and whether the card takes the space of the SATA bay. Price the whole path against the time it saves on your actual workload.</p>
        <p>See <a href="https://www.intel.com/content/www/us/en/support/articles/000030131.html">Intel’s guidance on multi-gigabit negotiation</a> and the <a href="https://software.es.net/iperf/invoking.html">iperf3 user documentation</a>.</p>
      </>
    ),
  },
];

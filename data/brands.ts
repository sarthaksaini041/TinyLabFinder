import type { Brand } from "./models";

type BrandCollection = {
  slug: string;
  brand: Brand;
  family: string;
  description: string;
  checks: string[];
};

export const BRAND_COLLECTIONS: BrandCollection[] = [
  {
    slug: "lenovo",
    brand: "Lenovo",
    family: "ThinkCentre Tiny",
    description: "Compare used Lenovo ThinkCentre Tiny PCs by NVMe slots, RAM limits and PCIe riser support, including the M720q, M920q, M920x and Ryzen M75q.",
    checks: [
      "The M920q has one M.2 NVMe slot. The M920x has two, which matters if you want a separate SSD for data.",
      "The M720q and M920q can take a PCIe card with the correct riser and bracket. Check whether your card will occupy the space used by the 2.5-inch drive.",
      "The M75q uses AMD Ryzen PRO. Check the exact processor and the media server’s hardware acceleration support if you plan to transcode video.",
    ],
  },
  {
    slug: "dell",
    brand: "Dell",
    family: "OptiPlex Micro",
    description: "Compare used Dell OptiPlex Micro PCs from the 3050 through the 7080. Check drive bays, CPU options and official RAM limits before buying.",
    checks: [
      "Confirm the listing says Micro. Dell also sold OptiPlex systems with the same model number in larger chassis with different expansion options.",
      "The 3080 Micro and 7080 Micro both officially support 64 GB of RAM. The 7080 has two M.2 SSD slots, compared with one in the 3080.",
      "Ask whether the 2.5-inch drive carrier and cable are included if you plan to add SATA storage.",
    ],
  },
  {
    slug: "hp",
    brand: "HP",
    family: "EliteDesk & ProDesk Mini",
    description: "Compare used HP EliteDesk, ProDesk and Elite Mini PCs by NVMe capacity, DDR4 or DDR5 memory, and optional Flex IO networking.",
    checks: [
      "The EliteDesk 800 G4 Mini has two M.2 SSD connectors and a 2.5-inch bay. Check for the caddy and cable before budgeting for a SATA drive.",
      "The EliteDesk 800 G8 Mini uses DDR4 and the Elite Mini 800 G9 uses DDR5. Buy SO-DIMMs for the exact generation in the listing.",
      "A Flex IO opening can house different optional modules. Ask for a rear photo and the module part number if you need another Ethernet port.",
    ],
  },
];

import { AD_PROVIDER, ADSENSE_CLIENT, ADSENSE_SLOT, adsEnabled } from "./AdConfig";
import { AdContainer } from "./AdContainer";
import { AdScript } from "./AdScript";
import { ResponsiveAd } from "./ResponsiveAd";

/** Single fixed placement after the guide and its related links. */
export function AdSlot() {
  if (AD_PROVIDER === "placeholder") {
    return <AdContainer><div className="ad__placeholder">Guide footer ad preview</div></AdContainer>;
  }
  if (!adsEnabled()) return null;

  return (
    <AdContainer>
      <AdScript />
      <ResponsiveAd client={ADSENSE_CLIENT} slot={ADSENSE_SLOT} />
    </AdContainer>
  );
}

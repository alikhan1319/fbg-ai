import type { MetadataRoute } from "next";
import { ASSET_V, BRAND } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.shortName,
    description: "Free background remover AI and 6-in-1 online image editing tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A1929",
    theme_color: "#1E88E5",
    icons: [
      {
        src: BRAND.icon,
        sizes: "48x48",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `/img/web-icon-192.png?v=${ASSET_V}`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

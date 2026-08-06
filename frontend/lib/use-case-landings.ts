import { BRAND } from "@/lib/constants";

export type LandingToolId =
  | "remove-bg"
  | "upscale"
  | "enhance"
  | "blur-bg"
  | "gen-bg"
  | "watermark";

export type UseCaseLanding = {
  toolId: LandingToolId;
  /** URL folder, e.g. /remove-background */
  pathPrefix: string;
  toolHref: string;
  toolLabel: string;
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  faqs: { question: string; answer: string }[];
  relatedGuides: { title: string; href: string }[];
  ctaLabel: string;
};

export function landingPath(landing: UseCaseLanding) {
  return `${landing.pathPrefix}/${landing.slug}`;
}

type Draft = Omit<UseCaseLanding, "toolId" | "pathPrefix" | "toolHref" | "toolLabel">;

function pack(
  toolId: LandingToolId,
  pathPrefix: string,
  toolHref: string,
  toolLabel: string,
  items: Draft[]
): UseCaseLanding[] {
  return items.map((item) => ({ ...item, toolId, pathPrefix, toolHref, toolLabel }));
}

const REMOVE_BG = pack("remove-bg", "/remove-background", "/remove-bg", "Remove BG", [
  {
    slug: "passport-photo",
    title: "Remove Background from Passport Photo Free | FBG AI",
    description:
      "Remove background from passport photos online free. Create clean ID-ready cutouts, then place on white or official colors. No signup, no watermark.",
    keywords: ["remove background from passport photo", "passport photo background remover", "ID photo transparent background"],
    h1: "Remove Background from Passport Photo",
    intro:
      "Need a passport or ID photo with a plain official background? Isolate the subject with Free Background Remover AI, then place the cutout on white or the color your country requires.",
    sections: [
      {
        heading: "Why remove the passport photo background first?",
        paragraphs: [
          "Most passport and visa specs require a solid light background with no shadows or patterns. Removing the existing background gives you a clean subject for the exact shade authorities expect.",
          "Our free AI background remover preserves hair edges and glasses frames so your face stays natural.",
        ],
      },
      {
        heading: "How to create an ID-ready photo",
        paragraphs: [
          "Upload a well-lit headshot, download a transparent PNG, then composite onto pure white (#FFFFFF) or the shade in your embassy guide.",
          "Check shoulder crop, head size, and expression against your country’s checklist before submitting.",
        ],
      },
      {
        heading: "Tips for clean edges on hair and glasses",
        paragraphs: [
          "Shoot against a simple wall with soft even lighting. After export, zoom ears, glasses, and collar lines; re-crop and retry if fringe remains.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I use this for official passport applications?",
        answer:
          "You can create a compliant-looking photo, but you must still follow your country’s size, background color, and photo rules.",
      },
      {
        question: "What background color should I use after removal?",
        answer: "Many countries require white or off-white. Always verify the official guide for your document.",
      },
    ],
    relatedGuides: [
      { title: "Best Background Colors for Passport Photos", href: "/blog/best-background-colors-passport-photos" },
      { title: "How to Remove Background Without Photoshop", href: "/blog/remove-background-without-photoshop" },
    ],
    ctaLabel: "Remove passport photo background",
  },
  {
    slug: "product-images",
    title: "Remove Background from Product Images Free | E-commerce — FBG AI",
    description:
      "Remove background from product images for Amazon, Shopify, and Etsy. Get listing-ready transparent PNGs and white backgrounds — free, no watermark.",
    keywords: ["remove background from product images", "ecommerce background remover", "amazon product photo white background"],
    h1: "Remove Background from Product Images",
    intro: "Marketplace shoppers judge quality fast. Clean cutouts on white or branded backgrounds convert better and meet listing rules.",
    sections: [
      {
        heading: "Marketplace-ready cutouts",
        paragraphs: [
          "Upload product JPGs or PNGs up to 15MB. Isolate sneakers, bottles, electronics, and packaging with sharp edges.",
          "Export transparent PNG for design tools, or composite onto pure white for Amazon main images.",
        ],
      },
      {
        heading: "Keep catalog consistency",
        paragraphs: [
          "Shoot with similar lighting, then run every SKU through the same remove-background workflow.",
          "Pair with our upscaler when supplier photos are soft.",
        ],
      },
      {
        heading: "When to regenerate a lifestyle scene",
        paragraphs: ["After removal, use Generate Background for lifestyle or color-matched scenes while keeping the product identical."],
      },
    ],
    faqs: [
      {
        question: "Do Amazon listings need a white background?",
        answer: "Amazon main images typically require pure white. Remove the backdrop first, then place the cutout on #FFFFFF.",
      },
      {
        question: "What file format should I download?",
        answer: "Use transparent PNG for design. Use JPEG on white when a marketplace rejects transparency.",
      },
    ],
    relatedGuides: [
      { title: "How to Remove Backgrounds for E-commerce Product Photos", href: "/blog/remove-backgrounds-ecommerce-product-photos" },
      { title: "Shopify Product Photos: White vs Transparent PNG", href: "/blog/shopify-product-photos-white-vs-transparent" },
    ],
    ctaLabel: "Clean product backgrounds",
  },
  {
    slug: "car-images",
    title: "Remove Background from Car Images Free | Vehicle Photos — FBG AI",
    description:
      "Remove background from car and vehicle images online free. Isolate cars for dealership listings and ads with clean edges — no signup.",
    keywords: ["remove background from car images", "car photo background remover", "vehicle listing cutout"],
    h1: "Remove Background from Car Images",
    intro: "Dealerships look sharper when vehicles sit on clean studio backgrounds instead of cluttered streets.",
    sections: [
      {
        heading: "Isolate cars, trucks, and bikes",
        paragraphs: [
          "Remove parking lots and busy streets while keeping chrome, glass, and tire detail.",
          "Use light gray or white for inventory pages, or a lifestyle scene for ads.",
        ],
      },
      {
        heading: "Shooting tips for better AI edges",
        paragraphs: [
          "Leave space around the silhouette. Avoid extreme wide-angle distortion and heavy HDR that melts tires into asphalt.",
        ],
      },
      {
        heading: "Listing and ad workflows",
        paragraphs: ["Batch inventory photos, then upscale low-res dealer shots for consistent fleet branding."],
      },
    ],
    faqs: [
      {
        question: "Will reflections on car paint stay?",
        answer: "Yes — the tool targets the background scene. Specular reflections on paint usually remain with the vehicle.",
      },
      {
        question: "Can I remove people standing near the car?",
        answer: "If people are clearly separate they may remove with the background. Heavy overlap needs a reshoot or crop.",
      },
    ],
    relatedGuides: [
      { title: "Batch Workflow Tips for Catalog Photography", href: "/blog/batch-workflow-tips-catalog-photography" },
      { title: "Free Background Remover AI vs Paid Tools", href: "/blog/free-background-remover-ai-vs-paid-tools" },
    ],
    ctaLabel: "Remove car photo background",
  },
  {
    slug: "logo",
    title: "Remove Background from Logo Free | Transparent Logo PNG — FBG AI",
    description:
      "Remove background from logos online free. Export transparent PNG logos for websites, decks, and merch — no signup, no watermark.",
    keywords: ["remove background from logo", "transparent logo maker", "logo background remover"],
    h1: "Remove Background from Logo",
    intro: "Turn scanned logos and screenshots into transparent PNGs for any brand color, presentation, or packaging mockup.",
    sections: [
      {
        heading: "From flat file to transparent asset",
        paragraphs: [
          "Upload a logo with a white or solid backdrop and cut out the mark for Figma, Canva, Word, and web builders.",
          "Prefer SVG when you have one — when you only have PNG/JPG, AI cutout is the fastest path.",
        ],
      },
      {
        heading: "Keep fine type and icons sharp",
        paragraphs: [
          "Start with the highest resolution available. Upscale before large print. Check thin letterforms at 200% zoom.",
        ],
      },
      {
        heading: "Where transparent logos help",
        paragraphs: ["Headers, pitch decks, email signatures, packaging mockups, and social avatars."],
      },
    ],
    faqs: [
      {
        question: "Should I use PNG or JPG for logos?",
        answer: "Always export logos with transparency as PNG (or SVG). JPG cannot store transparency.",
      },
      {
        question: "What if my logo has a gradient background?",
        answer: "AI removal works on many gradients. Complex scenes may need a cleaner source or tighter crop.",
      },
    ],
    relatedGuides: [
      { title: "PNG vs JPG: Which Format Should You Use?", href: "/blog/png-vs-jpg-which-format" },
      { title: "How to Remove Background Without Photoshop", href: "/blog/remove-background-without-photoshop" },
    ],
    ctaLabel: "Make logo transparent",
  },
  {
    slug: "signature",
    title: "Remove Background from Signature Free | Transparent Signature — FBG AI",
    description:
      "Remove background from signatures online free. Isolate handwritten signatures as transparent PNGs for documents — privacy-first, no signup.",
    keywords: ["remove background from signature", "transparent signature PNG", "signature background remover"],
    h1: "Remove Background from Signature",
    intro: "Scan or photograph a handwritten signature, remove the paper background, and overlay the ink on contracts and letterheads.",
    sections: [
      {
        heading: "Clean scanned ink",
        paragraphs: [
          "Photograph on plain white paper with even light. Upload and remove the paper tone so only ink remains.",
          "Avoid uploading full ID pages when you only need the signature.",
        ],
      },
      {
        heading: "Privacy reminders",
        paragraphs: [
          `${BRAND.name} auto-deletes uploads within one hour. Crop tightly to the signature area.`,
          "Read our privacy policy before processing sensitive files.",
        ],
      },
      {
        heading: "Using the PNG in documents",
        paragraphs: ["Insert into Word, Google Docs, or PDF editors. Resize with locked proportions."],
      },
    ],
    faqs: [
      {
        question: "Is it legal to remove a signature background?",
        answer: "Only process signatures you own or are authorized to use. Do not forge documents.",
      },
      {
        question: "My paper has a watermark — will it disappear?",
        answer: "Paper texture often removes with the background. Heavy printed watermarks may need the watermark remover.",
      },
    ],
    relatedGuides: [
      { title: "Privacy Best Practices for Online Image Tools", href: "/blog/privacy-best-practices-online-image-tools" },
      { title: "Transparent Background Guide", href: "/blog/transparent-background-guide" },
    ],
    ctaLabel: "Isolate signature",
  },
  {
    slug: "jewelry",
    title: "Remove Background from Jewelry Photos Free | FBG AI",
    description:
      "Remove background from jewelry images for ecommerce. Keep sparkle and metal edges while exporting transparent PNGs — free, no watermark.",
    keywords: ["remove background from jewelry", "jewelry product photo background", "ring necklace cutout"],
    h1: "Remove Background from Jewelry",
    intro: "Rings, necklaces, and watches sell better with distraction-free backgrounds that highlight metal and gemstones.",
    sections: [
      {
        heading: "Preserve sparkle and fine chains",
        paragraphs: [
          "Shoot on a simple surface, then remove the backdrop so chains and prongs stay crisp.",
          "Zoom after export — if a clasp is clipped, re-upload with more padding.",
        ],
      },
      {
        heading: "Catalog and marketplace use",
        paragraphs: [
          "Place cutouts on soft gray, black, or brand colors. Use pure white when marketplaces require it.",
          "Upscale soft phone photos before listing.",
        ],
      },
      {
        heading: "Lifestyle vs studio",
        paragraphs: ["After isolation, Generate Background can place jewelry into lifestyle scenes across campaigns."],
      },
    ],
    faqs: [
      {
        question: "Do reflections confuse the AI?",
        answer: "Strong room reflections can be treated as background. Soft product reflections usually stay with the jewelry.",
      },
      {
        question: "Can I process macro shots?",
        answer: "Yes — when the subject is clearly separated from the surface color.",
      },
    ],
    relatedGuides: [
      { title: "How to Remove Backgrounds for E-commerce Product Photos", href: "/blog/remove-backgrounds-ecommerce-product-photos" },
      { title: "Generate AI Backgrounds for Product Listings", href: "/blog/generate-ai-backgrounds-product-listings" },
    ],
    ctaLabel: "Clean jewelry backgrounds",
  },
  {
    slug: "furniture",
    title: "Remove Background from Furniture Photos Free | FBG AI",
    description:
      "Remove background from furniture images for catalogs and marketplaces. Isolate sofas, chairs, and tables for clean listings.",
    keywords: ["remove background from furniture", "furniture catalog background remover", "sofa product cutout"],
    h1: "Remove Background from Furniture",
    intro: "Furniture listings convert when shoppers see the piece clearly — not warehouse clutter or busy floors.",
    sections: [
      {
        heading: "Catalog cutouts for sofas and tables",
        paragraphs: [
          "Remove walls, floors, and props while keeping fabric texture, wood grain, and leg details.",
          "Transparent PNGs drop into lookbooks and room planners.",
        ],
      },
      {
        heading: "Large object tips",
        paragraphs: [
          "Photograph the full silhouette with space around corners. Overlapping plants may need a cleaner shoot.",
        ],
      },
      {
        heading: "Room scene workflows",
        paragraphs: ["After isolation, place the piece on a neutral floor or generate a room-style background for ads."],
      },
    ],
    faqs: [
      {
        question: "Will shadows under furniture remain?",
        answer: "Contact shadows often remove with the floor. Add a soft drop shadow later if you want realism.",
      },
      {
        question: "Can I batch an entire catalog?",
        answer: "Process SKUs one image at a time with the same lighting and framing for consistency.",
      },
    ],
    relatedGuides: [
      { title: "Batch Workflow Tips for Catalog Photography", href: "/blog/batch-workflow-tips-catalog-photography" },
      { title: "Ecommerce Image Optimization tips", href: "/blog/ecommerce-image-optimization" },
    ],
    ctaLabel: "Remove furniture backgrounds",
  },
  {
    slug: "png",
    title: "Remove Background from PNG Online Free | Transparent PNG — FBG AI",
    description:
      "Remove background from PNG images online free. Clean up existing PNGs or convert photos to transparent PNG — no signup, no watermark.",
    keywords: ["remove background from png", "transparent png maker", "png background remover"],
    h1: "Remove Background from PNG",
    intro: "Already have a PNG with a leftover backdrop? Re-process it into a true transparent PNG with clean alpha edges.",
    sections: [
      {
        heading: "PNG with leftover backgrounds",
        paragraphs: [
          "Many “transparent” files still have white boxes. Upload and export a cleaner alpha channel.",
          "JPG sources also work — we convert the cutout to transparent PNG on download.",
        ],
      },
      {
        heading: "When PNG beats JPG",
        paragraphs: [
          "Use PNG for transparency, logos, and hard-edge graphics. Use JPG for large photos without transparency needs.",
        ],
      },
      {
        heading: "Export and reuse",
        paragraphs: ["Drop results into Canva, Figma, Shopify, or social templates. Upscale first for large print."],
      },
    ],
    faqs: [
      {
        question: "Does removing background increase file size?",
        answer: "Transparent PNGs can be larger than JPEGs — you are storing an alpha channel.",
      },
      {
        question: "Max upload size?",
        answer: "Upload PNG, JPG, or WebP up to 15MB per image.",
      },
    ],
    relatedGuides: [
      { title: "PNG vs JPG: Which Format Should You Use?", href: "/blog/png-vs-jpg-which-format" },
      { title: "Transparent Background Guide", href: "/blog/transparent-background-guide" },
    ],
    ctaLabel: "Make PNG transparent",
  },
]);

const UPSCALE = pack("upscale", "/upscale", "/upscale", "Upscale", [
  {
    slug: "old-photos",
    title: "Upscale Old Photos Online Free | Restore Detail — FBG AI",
    description:
      "Upscale old photos online free. Recover detail from scanned prints and compressed JPEGs with AI 2× or 4× — no signup.",
    keywords: ["upscale old photos", "enlarge old photo online free", "restore old photo resolution"],
    h1: "Upscale Old Photos Online Free",
    intro: "Family scans and phone exports often look soft when enlarged. AI upscaling restores usable detail for sharing and print.",
    sections: [
      {
        heading: "Why old photos look soft when enlarged",
        paragraphs: [
          "Scanners and social compression strip high-frequency detail. Stretching in a basic editor invents blur — AI upscaling predicts plausible texture instead.",
        ],
      },
      {
        heading: "Choose 2× vs 4×",
        paragraphs: [
          "Start with 2× for web albums. Use 4× when you need poster size from a small scan — then inspect faces carefully.",
        ],
      },
      {
        heading: "Workflow tip",
        paragraphs: ["Enhance flat scans first if they are very dark, then upscale for cleaner results."],
      },
    ],
    faqs: [
      {
        question: "Will upscaling fix scratches on prints?",
        answer: "It improves resolution, not physical damage. Deep scratches may still need manual repair.",
      },
      {
        question: "What formats can I upload?",
        answer: "JPG, PNG, and WebP up to 15MB.",
      },
    ],
    relatedGuides: [
      { title: "Upscale Old Photos for Print & Posters", href: "/blog/upscale-old-photos-for-print-posters" },
      { title: "AI Image Upscaling: When to Use 2× vs 4×", href: "/blog/ai-image-upscaling-2x-vs-4x" },
    ],
    ctaLabel: "Upscale old photo",
  },
  {
    slug: "for-print",
    title: "Upscale Image for Print Free | Poster & Banner Ready — FBG AI",
    description:
      "Upscale images for print online free. Enlarge photos for posters, banners, and flyers with AI sharpening — no watermark.",
    keywords: ["upscale image for print", "enlarge photo for poster", "print ready image upscaler"],
    h1: "Upscale Image for Print",
    intro: "Print vendors need higher pixel counts. Upscale soft digital files before sending banners or posters to press.",
    sections: [
      {
        heading: "Match DPI expectations",
        paragraphs: [
          "Ask your printer for required DPI and dimensions. Upscale so the long edge meets their minimum, then export high-quality JPG or PNG.",
        ],
      },
      {
        heading: "Avoid over-sharpening",
        paragraphs: ["If text on shirts warps after 4×, stay at 2× or enhance lightly first."],
      },
      {
        heading: "Combine with cutouts",
        paragraphs: ["Remove background first when the print is a product cutout on a solid plate."],
      },
    ],
    faqs: [
      {
        question: "Is 4× always better for print?",
        answer: "Not always — inspect edges. Sometimes 2× plus enhance looks more natural.",
      },
      {
        question: "Can I print large from a phone photo?",
        answer: "Often yes after upscaling, but extreme enlargements from tiny sources will still look soft up close.",
      },
    ],
    relatedGuides: [
      { title: "Upscale Old Photos for Print & Posters", href: "/blog/upscale-old-photos-for-print-posters" },
      { title: "AI Image Upscaling: When to Use 2× vs 4×", href: "/blog/ai-image-upscaling-2x-vs-4x" },
    ],
    ctaLabel: "Upscale for print",
  },
  {
    slug: "product-photos",
    title: "Upscale Product Photos Free | Sharper Ecommerce Images — FBG AI",
    description:
      "Upscale product photos online free for sharper Shopify and Amazon grids. AI 2×/4× detail without a watermark.",
    keywords: ["upscale product photos", "enlarge product image ecommerce", "AI upscale product photo"],
    h1: "Upscale Product Photos",
    intro: "Supplier images are often small. Upscale them so mobile product cards look crisp instead of muddy.",
    sections: [
      {
        heading: "Ecommerce thumbnail clarity",
        paragraphs: ["Upscale after background removal so edges stay clean on white plates."],
      },
      {
        heading: "Keep textures honest",
        paragraphs: ["Fabric and leather should look real — if AI invents patterns, drop to 2×."],
      },
      {
        heading: "Batch mindset",
        paragraphs: ["Use the same scale across a catalog so relative sharpness stays consistent."],
      },
    ],
    faqs: [
      {
        question: "Should I upscale before or after remove background?",
        answer: "Either works; many sellers remove background first, then upscale the cutout.",
      },
      {
        question: "Does upscaling help SEO images?",
        answer: "Clearer images improve UX; still compress wisely for page speed.",
      },
    ],
    relatedGuides: [
      { title: "Ecommerce Image Optimization Tips", href: "/blog/ecommerce-image-optimization" },
      { title: "AI Image Upscaling: When to Use 2× vs 4×", href: "/blog/ai-image-upscaling-2x-vs-4x" },
    ],
    ctaLabel: "Upscale product photo",
  },
  {
    slug: "for-instagram",
    title: "Upscale Photos for Instagram Free | Sharper Feed Posts — FBG AI",
    description:
      "Upscale photos for Instagram online free. Make soft phone exports look sharper in feed and Reels covers — no signup.",
    keywords: ["upscale photo for instagram", "sharpen instagram image", "enlarge photo for social media"],
    h1: "Upscale Photos for Instagram",
    intro: "Instagram recompresses uploads. Starting from a sharper master helps your post survive compression.",
    sections: [
      {
        heading: "Feed and cover crops",
        paragraphs: ["Upscale first, then crop to 1080×1350 or 1080×1920 so you are not enlarging a tiny crop."],
      },
      {
        heading: "Portrait tips",
        paragraphs: ["2× is usually enough for social. Pair with enhance if the shot is flat or dingy."],
      },
      {
        heading: "After background removal",
        paragraphs: ["Cut out subjects, upscale, then place on branded colors for consistent carousels."],
      },
    ],
    faqs: [
      {
        question: "Will Instagram still compress my image?",
        answer: "Yes — but a sharper source usually looks better after compression.",
      },
      {
        question: "Best scale for Stories?",
        answer: "2× from a decent phone photo is typically enough for Stories and Reels covers.",
      },
    ],
    relatedGuides: [
      { title: "Social Media Image Sizes After Background Removal", href: "/blog/social-media-image-sizes-after-bg-removal" },
      { title: "AI Image Upscaling: When to Use 2× vs 4×", href: "/blog/ai-image-upscaling-2x-vs-4x" },
    ],
    ctaLabel: "Upscale for Instagram",
  },
  {
    slug: "low-resolution",
    title: "Upscale Low Resolution Images Free | AI Enlarge — FBG AI",
    description:
      "Upscale low resolution images online free. Enlarge small JPG and PNG files with AI while keeping edges cleaner than basic stretch.",
    keywords: ["upscale low resolution image", "enlarge small photo online", "AI enlarge low res image"],
    h1: "Upscale Low Resolution Images",
    intro: "Got a tiny asset from email or a CMS? AI enlargement beats stretching pixels in Paint or Preview.",
    sections: [
      {
        heading: "What “low res” means here",
        paragraphs: ["Files under ~1000px on the long edge often need help for modern retina layouts."],
      },
      {
        heading: "Limits to know",
        paragraphs: ["Extremely tiny icons (under ~200px) cannot invent true detail — expect soft results."],
      },
      {
        heading: "Next steps",
        paragraphs: ["After upscaling, enhance carefully or remove background for design use."],
      },
    ],
    faqs: [
      {
        question: "Can AI recreate lost license-plate text?",
        answer: "No — do not rely on upscaling for forensic or legal text recovery.",
      },
      {
        question: "PNG or JPG out?",
        answer: "Use PNG for graphics with hard edges; JPG for photos.",
      },
    ],
    relatedGuides: [
      { title: "AI Image Upscaling: When to Use 2× vs 4×", href: "/blog/ai-image-upscaling-2x-vs-4x" },
      { title: "PNG vs JPG: Which Format Should You Use?", href: "/blog/png-vs-jpg-which-format" },
    ],
    ctaLabel: "Upscale low-res image",
  },
  {
    slug: "4k",
    title: "Upscale Image to 4K Free | 4× AI Upscaler — FBG AI",
    description:
      "Upscale images to 4K-style resolution with free AI 4× enlargement. Sharper detail for screens and large displays — no watermark.",
    keywords: ["upscale image to 4k", "4x AI upscaler free", "enlarge photo to 4k online"],
    h1: "Upscale Image to 4K",
    intro: "Need a larger master for 4K slides or big screens? Use 4× upscaling, then verify faces and fine text.",
    sections: [
      {
        heading: "When 4× makes sense",
        paragraphs: ["Presentations, digital signage, and large web heroes benefit when the source is mid-size but soft."],
      },
      {
        heading: "Quality check",
        paragraphs: ["Zoom to 100% on eyes, logos, and fabric. If artifacts appear, try 2× or enhance first."],
      },
      {
        heading: "Privacy",
        paragraphs: ["Uploads auto-delete within one hour on FBG AI."],
      },
    ],
    faqs: [
      {
        question: "Is the output exactly 3840×2160?",
        answer: "Output size depends on your source dimensions times the selected scale — crop afterward if you need exact 16:9 4K.",
      },
      {
        question: "How long does 4× take?",
        answer: "Longer than 2× — typically from several seconds up to a couple of minutes depending on size.",
      },
    ],
    relatedGuides: [
      { title: "AI Image Upscaling: When to Use 2× vs 4×", href: "/blog/ai-image-upscaling-2x-vs-4x" },
      { title: "Upscale Old Photos for Print & Posters", href: "/blog/upscale-old-photos-for-print-posters" },
    ],
    ctaLabel: "Upscale to 4×",
  },
]);

const ENHANCE = pack("enhance", "/enhance-image", "/enhance-image", "Enhance", [
  {
    slug: "blurry-photos",
    title: "Enhance Blurry Photos Online Free | Sharpen AI — FBG AI",
    description:
      "Enhance blurry photos online free. Sharpen soft phone shots and reduce noise without a heavy Photoshop workflow.",
    keywords: ["enhance blurry photos", "sharpen blurry image online free", "fix soft photo AI"],
    h1: "Enhance Blurry Photos Online Free",
    intro: "Mild motion or focus blur can often look cleaner after AI sharpening and denoise — without crunchy over-processing.",
    sections: [
      {
        heading: "What enhancement can and cannot fix",
        paragraphs: [
          "Soft focus and compression haze improve. Extreme shake or totally missed focus cannot be magically restored.",
        ],
      },
      {
        heading: "Dial sharpen vs denoise",
        paragraphs: ["Too much sharpening creates halos. Balance denoise so skin and skies stay natural."],
      },
      {
        heading: "Pair with upscale",
        paragraphs: ["Enhance first when the file is dark or muddy, then upscale for social or print."],
      },
    ],
    faqs: [
      {
        question: "Will this fix out-of-focus eyes?",
        answer: "It can help slightly soft eyes, not a completely missed focus plane.",
      },
      {
        question: "Is there a watermark?",
        answer: "No watermark on free-tier exports.",
      },
    ],
    relatedGuides: [
      { title: "Enhance Image Quality Without Over-Editing", href: "/blog/enhance-image-quality-without-over-editing" },
      { title: "AI Image Upscaling: When to Use 2× vs 4×", href: "/blog/ai-image-upscaling-2x-vs-4x" },
    ],
    ctaLabel: "Enhance blurry photo",
  },
  {
    slug: "dark-photos",
    title: "Enhance Dark Photos Online Free | Brighten & Color Fix — FBG AI",
    description:
      "Enhance dark photos online free. Lift underexposed images with AI color and contrast correction — no signup.",
    keywords: ["enhance dark photos", "brighten dark photo online", "fix underexposed image AI"],
    h1: "Enhance Dark Photos Online Free",
    intro: "Underexposed phone shots hide detail in shadows. Gentle AI enhancement recovers usable brightness and color.",
    sections: [
      {
        heading: "Lift without blowing highlights",
        paragraphs: ["Aim for natural midtones. If windows clip to pure white, re-shoot with better exposure when possible."],
      },
      {
        heading: "Noise in shadows",
        paragraphs: ["Brightening reveals noise — use denoise controls so skies and walls stay clean."],
      },
      {
        heading: "Product and portrait use",
        paragraphs: ["Dark catalog shots and indoor portraits both benefit before you remove backgrounds."],
      },
    ],
    faqs: [
      {
        question: "Can I recover a totally black frame?",
        answer: "If almost no signal exists, enhancement cannot invent a clean photo.",
      },
      {
        question: "RAW support?",
        answer: "Upload common JPG/PNG/WebP exports from your camera or phone.",
      },
    ],
    relatedGuides: [
      { title: "Enhance Image Quality Without Over-Editing", href: "/blog/enhance-image-quality-without-over-editing" },
      { title: "Privacy Best Practices for Online Image Tools", href: "/blog/privacy-best-practices-online-image-tools" },
    ],
    ctaLabel: "Enhance dark photo",
  },
  {
    slug: "product-photos",
    title: "Enhance Product Photos Free | Cleaner Ecommerce Images — FBG AI",
    description:
      "Enhance product photos online free. Improve color, clarity, and contrast for marketplace-ready listings.",
    keywords: ["enhance product photos", "improve product image quality", "ecommerce photo enhancer"],
    h1: "Enhance Product Photos",
    intro: "Flat or dull product shots underperform. AI enhancement wakes up color and detail before you publish.",
    sections: [
      {
        heading: "Keep colors honest",
        paragraphs: ["Shoppers hate misleading color. Enhance for clarity, not neon saturation."],
      },
      {
        heading: "Recommended order",
        paragraphs: ["Enhance → remove background → upscale if needed → compress for the web."],
      },
      {
        heading: "Metal and fabric",
        paragraphs: ["Watch for over-sharpened edges on jewelry and knitwear."],
      },
    ],
    faqs: [
      {
        question: "Should every SKU use the same settings?",
        answer: "Yes when possible — consistent processing looks more professional across a catalog.",
      },
      {
        question: "White background required?",
        answer: "Enhance does not replace background removal — use Remove BG for white-plate listings.",
      },
    ],
    relatedGuides: [
      { title: "Ecommerce Image Optimization Tips", href: "/blog/ecommerce-image-optimization" },
      { title: "Enhance Image Quality Without Over-Editing", href: "/blog/enhance-image-quality-without-over-editing" },
    ],
    ctaLabel: "Enhance product photo",
  },
  {
    slug: "portraits",
    title: "Enhance Portrait Photos Free | Natural Skin & Detail — FBG AI",
    description:
      "Enhance portrait photos online free. Improve lighting and clarity while keeping skin tones natural — no watermark.",
    keywords: ["enhance portrait photo", "improve portrait quality online", "AI portrait enhancer free"],
    h1: "Enhance Portrait Photos",
    intro: "Headshots and creator portraits often need a light polish — not a plastic beauty filter.",
    sections: [
      {
        heading: "Natural skin first",
        paragraphs: ["Prioritize gentle clarity. Heavy denoise can erase freckles and texture people expect."],
      },
      {
        heading: "After enhancement",
        paragraphs: ["Remove or blur the background for LinkedIn and team pages."],
      },
      {
        heading: "Group photos",
        paragraphs: ["Enhance the full frame, then crop individuals if needed."],
      },
    ],
    faqs: [
      {
        question: "Does this smooth skin like a beauty app?",
        answer: "It focuses on clarity and color — not heavy beauty smoothing.",
      },
      {
        question: "Good for passport photos?",
        answer: "Light enhancement is fine; follow official retouching rules for your country.",
      },
    ],
    relatedGuides: [
      { title: "Enhance Image Quality Without Over-Editing", href: "/blog/enhance-image-quality-without-over-editing" },
      { title: "Portrait Background Removal: Hair & Edge Tips", href: "/blog/portrait-background-removal-hair-edge-tips" },
    ],
    ctaLabel: "Enhance portrait",
  },
  {
    slug: "screenshots",
    title: "Enhance Screenshots Online Free | Sharper UI Captures — FBG AI",
    description:
      "Enhance screenshots online free. Clean up soft UI captures and compressed screen grabs for docs and blogs.",
    keywords: ["enhance screenshot", "sharpen screenshot online", "improve screen capture quality"],
    h1: "Enhance Screenshots Online Free",
    intro: "Compressed Slack or Zoom grabs look soft in documentation. Light AI enhancement improves readability of UI chrome.",
    sections: [
      {
        heading: "Text legibility",
        paragraphs: ["Sharpen carefully — overdoing it creates ringing around letters."],
      },
      {
        heading: "Upscale small captures",
        paragraphs: ["If the capture is tiny, upscale after a mild enhance."],
      },
      {
        heading: "Privacy",
        paragraphs: ["Crop secrets and personal data before uploading any screenshot."],
      },
    ],
    faqs: [
      {
        question: "Can it OCR my screenshot?",
        answer: "No — this tool enhances pixels; it does not extract text.",
      },
      {
        question: "Retina captures?",
        answer: "High-DPI screenshots usually need less enhancement; compress wisely instead.",
      },
    ],
    relatedGuides: [
      { title: "Enhance Image Quality Without Over-Editing", href: "/blog/enhance-image-quality-without-over-editing" },
      { title: "Privacy Best Practices for Online Image Tools", href: "/blog/privacy-best-practices-online-image-tools" },
    ],
    ctaLabel: "Enhance screenshot",
  },
  {
    slug: "old-photos",
    title: "Enhance Old Photos Online Free | Color & Clarity — FBG AI",
    description:
      "Enhance old photos online free. Improve faded scans with clearer detail and balanced color before you archive or print.",
    keywords: ["enhance old photos", "restore old photo clarity online", "improve faded photo AI"],
    h1: "Enhance Old Photos Online Free",
    intro: "Faded albums benefit from gentle clarity and color correction before upscaling for reprints.",
    sections: [
      {
        heading: "Scan quality matters",
        paragraphs: ["Flat, dust-free scans give the enhancer better signal than phone-of-a-print shots."],
      },
      {
        heading: "Then upscale",
        paragraphs: ["Enhance → upscale → print is a reliable family-archive pipeline."],
      },
      {
        heading: "Color expectations",
        paragraphs: ["We improve clarity; we are not a full historical colorization studio."],
      },
    ],
    faqs: [
      {
        question: "Will it remove creases?",
        answer: "Minor softness improves; deep creases and tears usually remain.",
      },
      {
        question: "Black-and-white photos?",
        answer: "Yes — enhancement still helps contrast and detail.",
      },
    ],
    relatedGuides: [
      { title: "Upscale Old Photos for Print & Posters", href: "/blog/upscale-old-photos-for-print-posters" },
      { title: "Enhance Image Quality Without Over-Editing", href: "/blog/enhance-image-quality-without-over-editing" },
    ],
    ctaLabel: "Enhance old photo",
  },
]);

const BLUR = pack("blur-bg", "/blur-background", "/blur-background", "Blur BG", [
  {
    slug: "portraits",
    title: "Blur Background of Portrait Photos Free | AI Bokeh — FBG AI",
    description:
      "Blur background of portrait photos online free. Keep faces sharp with adjustable AI depth-of-field — no signup.",
    keywords: ["blur background portrait", "portrait background blur online free", "AI bokeh portrait"],
    h1: "Blur Background of Portrait Photos",
    intro: "Get a DSLR-style portrait look in the browser — subject sharp, distractions softened.",
    sections: [
      {
        heading: "Dial the intensity",
        paragraphs: ["Subtle blur feels editorial; heavier blur feels cinematic. Keep catchlights and eyes crisp."],
      },
      {
        heading: "When to remove instead",
        paragraphs: ["Need transparent PNG or pure white? Use Remove BG, not blur."],
      },
      {
        heading: "Hair and glasses",
        paragraphs: ["Even lighting helps the model separate subject from backdrop cleanly."],
      },
    ],
    faqs: [
      {
        question: "Does blur make a transparent PNG?",
        answer: "No — blur keeps the scene, just softened. Use Remove BG for transparency.",
      },
      {
        question: "Good for LinkedIn?",
        answer: "Yes — professional headshots often look better with mild background blur.",
      },
    ],
    relatedGuides: [
      { title: "Blur Background for Professional Portrait Photos", href: "/blog/blur-background-professional-portraits" },
      { title: "Blur vs Remove Background: Which to Choose?", href: "/blog/blur-vs-remove-background-which-to-choose" },
    ],
    ctaLabel: "Blur portrait background",
  },
  {
    slug: "product-photos",
    title: "Blur Background of Product Photos Free | FBG AI",
    description:
      "Blur background of product photos online free. Soften busy scenes while keeping the product sharp for lifestyle listings.",
    keywords: ["blur product photo background", "product background blur online", "lifestyle product bokeh"],
    h1: "Blur Background of Product Photos",
    intro: "Lifestyle product shots sell emotion — mild blur keeps focus on the item without a full studio cutout.",
    sections: [
      {
        heading: "Lifestyle vs marketplace white",
        paragraphs: ["Amazon main images usually need white (remove BG). Lifestyle secondaries can use blur."],
      },
      {
        heading: "Watch reflections",
        paragraphs: ["Shiny products may mirror the room — blur softens but does not always remove reflections."],
      },
      {
        heading: "Pair with enhance",
        paragraphs: ["Enhance dull product color, then blur the backdrop for social ads."],
      },
    ],
    faqs: [
      {
        question: "Can I fully remove the background instead?",
        answer: "Yes — open the Remove BG tool when you need a cutout.",
      },
      {
        question: "Multiple products in frame?",
        answer: "Blur works best with one clear subject; crowded frames may soft-blur the wrong object.",
      },
    ],
    relatedGuides: [
      { title: "Blur vs Remove Background: Which to Choose?", href: "/blog/blur-vs-remove-background-which-to-choose" },
      { title: "Generate AI Backgrounds for Product Listings", href: "/blog/generate-ai-backgrounds-product-listings" },
    ],
    ctaLabel: "Blur product background",
  },
  {
    slug: "headshots",
    title: "Blur Background for Headshots Free | Pro Look Online — FBG AI",
    description:
      "Blur background for headshots online free. Create clean professional headshots with AI subject focus.",
    keywords: ["blur background headshot", "professional headshot background blur", "AI headshot blur free"],
    h1: "Blur Background for Headshots",
    intro: "Corporate and creator headshots look polished when office clutter fades behind a sharp face.",
    sections: [
      {
        heading: "Office and home offices",
        paragraphs: ["Blur bookshelves and cables without relocating furniture."],
      },
      {
        heading: "Team consistency",
        paragraphs: ["Use similar blur intensity across team pages for a unified brand."],
      },
      {
        heading: "Export tips",
        paragraphs: ["Crop to platform aspect ratios after blurring so faces stay centered."],
      },
    ],
    faqs: [
      {
        question: "Better than a green screen?",
        answer: "For quick updates yes. For broadcast-critical work, controlled lighting still wins.",
      },
      {
        question: "Glasses glare?",
        answer: "Blur does not remove glare — adjust angle when shooting if possible.",
      },
    ],
    relatedGuides: [
      { title: "Blur Background for Professional Portrait Photos", href: "/blog/blur-background-professional-portraits" },
      { title: "Portrait Background Removal: Hair & Edge Tips", href: "/blog/portrait-background-removal-hair-edge-tips" },
    ],
    ctaLabel: "Blur headshot background",
  },
  {
    slug: "zoom-calls",
    title: "Blur Background for Zoom Photos Free | Video Still Soften — FBG AI",
    description:
      "Blur backgrounds on Zoom profile photos and meeting stills online free. Keep your face sharp, hide clutter.",
    keywords: ["blur zoom background photo", "blur video call background image", "soften zoom profile photo"],
    h1: "Blur Background for Zoom Photos",
    intro: "Update profile photos and promotional stills so home clutter is not the first thing clients notice.",
    sections: [
      {
        heading: "Profile vs live blur",
        paragraphs: ["This tool blurs still images. Live Zoom background blur is a separate Zoom feature."],
      },
      {
        heading: "Lighting",
        paragraphs: ["Face a window or lamp so the AI can separate you from the wall cleanly."],
      },
      {
        heading: "Privacy",
        paragraphs: ["Crop whiteboards and documents before uploading meeting screenshots."],
      },
    ],
    faqs: [
      {
        question: "Does this work inside the Zoom app?",
        answer: "Process the image here, then upload the result as your Zoom profile photo.",
      },
      {
        question: "Group meeting stills?",
        answer: "Works best with one primary subject; groups may need Remove BG instead.",
      },
    ],
    relatedGuides: [
      { title: "Blur vs Remove Background: Which to Choose?", href: "/blog/blur-vs-remove-background-which-to-choose" },
      { title: "Privacy Best Practices for Online Image Tools", href: "/blog/privacy-best-practices-online-image-tools" },
    ],
    ctaLabel: "Blur Zoom photo",
  },
  {
    slug: "real-estate",
    title: "Blur Background in Real Estate Photos Free | FBG AI",
    description:
      "Blur distracting backgrounds in real estate marketing photos online free while keeping the property subject clear.",
    keywords: ["blur real estate photo background", "soften property photo background", "real estate image blur AI"],
    h1: "Blur Background in Real Estate Photos",
    intro: "Agent portraits and detail shots look cleaner when street clutter softens behind the subject.",
    sections: [
      {
        heading: "Agent headshots on location",
        paragraphs: ["Blur busy streets behind agents without relocating to a studio."],
      },
      {
        heading: "Do not blur the listing hero",
        paragraphs: ["Keep property hero images sharp — blur is for people-focused marketing crops."],
      },
      {
        heading: "MLS rules",
        paragraphs: ["Follow local MLS editing guidelines; some boards limit digital alterations."],
      },
    ],
    faqs: [
      {
        question: "Can I blur license plates?",
        answer: "This tool softens backgrounds broadly; for plate privacy, crop or use dedicated redaction.",
      },
      {
        question: "Interior wide shots?",
        answer: "Wide interiors usually should stay sharp — blur suits portraits more than rooms.",
      },
    ],
    relatedGuides: [
      { title: "Blur Background for Professional Portrait Photos", href: "/blog/blur-background-professional-portraits" },
      { title: "Blur vs Remove Background: Which to Choose?", href: "/blog/blur-vs-remove-background-which-to-choose" },
    ],
    ctaLabel: "Blur real estate photo",
  },
  {
    slug: "youtube-thumbnails",
    title: "Blur Background for YouTube Thumbnails Free | FBG AI",
    description:
      "Blur thumbnail backgrounds online free so your face or product pops. Adjustable AI blur for YouTube clicks.",
    keywords: ["blur youtube thumbnail background", "thumbnail background blur online", "AI thumbnail bokeh"],
    h1: "Blur Background for YouTube Thumbnails",
    intro: "Thumbnails compete in a grid — soft backgrounds help bold text and faces stand out.",
    sections: [
      {
        heading: "Face + text hierarchy",
        paragraphs: ["Blur first, then add big text in Canva or Photoshop so type stays razor sharp."],
      },
      {
        heading: "Mobile readability",
        paragraphs: ["Check the result at phone size; over-blur can look muddy when scaled down."],
      },
      {
        heading: "Consistent channel look",
        paragraphs: ["Reuse similar blur strength across a series for brand recognition."],
      },
    ],
    faqs: [
      {
        question: "Best aspect ratio?",
        answer: "Process then crop to 1280×720 for classic YouTube thumbnails.",
      },
      {
        question: "Remove BG instead?",
        answer: "Use Remove BG when you want a solid color plate behind the subject.",
      },
    ],
    relatedGuides: [
      { title: "Social Media Image Sizes After Background Removal", href: "/blog/social-media-image-sizes-after-bg-removal" },
      { title: "Blur vs Remove Background: Which to Choose?", href: "/blog/blur-vs-remove-background-which-to-choose" },
    ],
    ctaLabel: "Blur thumbnail background",
  },
]);

const GEN_BG = pack("gen-bg", "/generate-background", "/generate-background", "Gen BG", [
  {
    slug: "product-photos",
    title: "Generate Background for Product Photos Free | AI Scenes — FBG AI",
    description:
      "Generate AI backgrounds for product photos online free. Replace plain backdrops with studio or lifestyle scenes — no signup.",
    keywords: ["generate background for product photo", "AI product background generator", "replace product backdrop AI"],
    h1: "Generate Background for Product Photos",
    intro: "After you isolate a product, generate studio, marble, or lifestyle scenes without a full reshoot.",
    sections: [
      {
        heading: "Start with a clean cutout",
        paragraphs: ["Remove background first so composites do not keep leftover room edges."],
      },
      {
        heading: "Match lighting language",
        paragraphs: ["Soft daylight products suit soft studio prompts — avoid neon scenes unless on-brand."],
      },
      {
        heading: "SKU consistency",
        paragraphs: ["Reuse prompt families across colorways so only the product changes."],
      },
    ],
    faqs: [
      {
        question: "Do I need to remove the background first?",
        answer: "Strongly recommended for clean composites.",
      },
      {
        question: "Solid color only?",
        answer: "You can use solid colors or richer AI scenes depending on the controls offered.",
      },
    ],
    relatedGuides: [
      { title: "Generate AI Backgrounds for Product Listings", href: "/blog/generate-ai-backgrounds-product-listings" },
      { title: "How to Remove Backgrounds for E-commerce Product Photos", href: "/blog/remove-backgrounds-ecommerce-product-photos" },
    ],
    ctaLabel: "Generate product background",
  },
  {
    slug: "portraits",
    title: "Generate Background for Portraits Free | AI Studio Scenes — FBG AI",
    description:
      "Generate AI backgrounds for portraits online free. Place people on studio or creative scenes after cutout.",
    keywords: ["generate portrait background", "AI portrait background generator", "replace portrait backdrop"],
    h1: "Generate Background for Portraits",
    intro: "Swap messy rooms for clean studio color or stylized scenes while keeping the person identical.",
    sections: [
      {
        heading: "Hair-aware cutouts",
        paragraphs: ["Remove BG with good lighting first so generated scenes do not halo around hair."],
      },
      {
        heading: "Professional vs creative",
        paragraphs: ["LinkedIn favors simple gradients; campaigns can push bolder scenes."],
      },
      {
        heading: "Color harmony",
        paragraphs: ["Pick backgrounds that complement wardrobe colors."],
      },
    ],
    faqs: [
      {
        question: "Does the face change?",
        answer: "The goal is to keep the subject and change the backdrop — always review the result.",
      },
      {
        question: "Passport photos?",
        answer: "Use solid official colors only; see our passport remove-background guide.",
      },
    ],
    relatedGuides: [
      { title: "Generate AI Backgrounds for Product Listings", href: "/blog/generate-ai-backgrounds-product-listings" },
      { title: "Best Background Colors for Passport Photos", href: "/blog/best-background-colors-passport-photos" },
    ],
    ctaLabel: "Generate portrait background",
  },
  {
    slug: "ecommerce",
    title: "Generate Ecommerce Backgrounds Free | Listing Scenes — FBG AI",
    description:
      "Generate ecommerce backgrounds online free for catalog and ad creatives. Studio plates and lifestyle scenes for SKUs.",
    keywords: ["ecommerce background generator", "AI listing background", "product scene generator free"],
    h1: "Generate Ecommerce Backgrounds",
    intro: "Build secondary lifestyle images for ads while keeping marketplace main images on white.",
    sections: [
      {
        heading: "Main vs secondary images",
        paragraphs: ["Keep Amazon main images white. Use generated scenes for A+ or social ads."],
      },
      {
        heading: "Brand kits",
        paragraphs: ["Save prompt recipes that match your brand palette."],
      },
      {
        heading: "Speed",
        paragraphs: ["Cutout once, generate multiple scenes for seasonal campaigns."],
      },
    ],
    faqs: [
      {
        question: "Will scenes look identical every time?",
        answer: "AI scenes can vary — lock prompts and review each export.",
      },
      {
        question: "Shadow realism?",
        answer: "Add soft shadows in your design tool if the composite feels floaty.",
      },
    ],
    relatedGuides: [
      { title: "Generate AI Backgrounds for Product Listings", href: "/blog/generate-ai-backgrounds-product-listings" },
      { title: "Ecommerce Image Optimization Tips", href: "/blog/ecommerce-image-optimization" },
    ],
    ctaLabel: "Generate ecommerce background",
  },
  {
    slug: "studio-white",
    title: "Generate Studio White Background Free | Clean Product Plate — FBG AI",
    description:
      "Generate a clean studio white background for products online free after cutout — marketplace-friendly plates.",
    keywords: ["studio white background generator", "white product background online", "pure white backdrop AI"],
    h1: "Generate Studio White Background",
    intro: "Need a pure selling plate? Place cutouts on clean studio white for catalogs and ads.",
    sections: [
      {
        heading: "White vs transparent",
        paragraphs: ["Transparent PNG is flexible; white JPG is what many marketplaces want on upload."],
      },
      {
        heading: "Shadow options",
        paragraphs: ["Add a soft contact shadow later so products do not look pasted."],
      },
      {
        heading: "Color accuracy",
        paragraphs: ["Check white balance so products do not cast odd tints on the plate."],
      },
    ],
    faqs: [
      {
        question: "Is this the same as remove background?",
        answer: "Remove BG creates the cutout; generate/studio white places it on a selling plate.",
      },
      {
        question: "Hex white?",
        answer: "Aim for #FFFFFF for Amazon-style main images.",
      },
    ],
    relatedGuides: [
      { title: "Shopify Product Photos: White vs Transparent PNG", href: "/blog/shopify-product-photos-white-vs-transparent" },
      { title: "How to Remove Backgrounds for E-commerce Product Photos", href: "/blog/remove-backgrounds-ecommerce-product-photos" },
    ],
    ctaLabel: "Make studio white background",
  },
  {
    slug: "lifestyle",
    title: "Generate Lifestyle Backgrounds Free | AI Product Scenes — FBG AI",
    description:
      "Generate lifestyle backgrounds for products and creators online free. Scene-style backdrops for ads and social.",
    keywords: ["lifestyle background generator", "AI lifestyle product scene", "generate lifestyle backdrop"],
    h1: "Generate Lifestyle Backgrounds",
    intro: "Tell a story around the product — kitchen, desk, outdoors — without booking a location shoot.",
    sections: [
      {
        heading: "Keep it believable",
        paragraphs: ["Match perspective and light direction to the original product photo."],
      },
      {
        heading: "Ad creative",
        paragraphs: ["Generate 2–3 variants, then A/B test thumbnails."],
      },
      {
        heading: "Legal sense",
        paragraphs: ["Do not imply endorsements or real locations you do not have rights to reference deceptively."],
      },
    ],
    faqs: [
      {
        question: "Can I use celebrities in scenes?",
        answer: "Do not generate or imply celebrity endorsements you do not have rights to.",
      },
      {
        question: "Video backgrounds?",
        answer: "This tool targets still images.",
      },
    ],
    relatedGuides: [
      { title: "Generate AI Backgrounds for Product Listings", href: "/blog/generate-ai-backgrounds-product-listings" },
      { title: "Social Media Image Sizes After Background Removal", href: "/blog/social-media-image-sizes-after-bg-removal" },
    ],
    ctaLabel: "Generate lifestyle background",
  },
  {
    slug: "solid-color",
    title: "Generate Solid Color Background Free | Brand Color Plates — FBG AI",
    description:
      "Generate solid color backgrounds online free for brand plates, social posts, and catalog consistency.",
    keywords: ["solid color background generator", "brand color backdrop online", "replace background solid color"],
    h1: "Generate Solid Color Background",
    intro: "Drop cutouts onto brand hex colors for cohesive carousels and pitch decks.",
    sections: [
      {
        heading: "Brand kits",
        paragraphs: ["Use official brand hex values for Instagram grids and packaging mockups."],
      },
      {
        heading: "Contrast",
        paragraphs: ["Ensure subject edges remain visible on light or dark plates."],
      },
      {
        heading: "Passport colors",
        paragraphs: ["For IDs, follow official color rules — see our passport guide."],
      },
    ],
    faqs: [
      {
        question: "Can I pick any hex?",
        answer: "Use the color controls in the tool to match your brand palette.",
      },
      {
        question: "Gradient backgrounds?",
        answer: "Start with solid plates; add gradients in your design tool if needed.",
      },
    ],
    relatedGuides: [
      { title: "Best Background Colors for Passport Photos", href: "/blog/best-background-colors-passport-photos" },
      { title: "Transparent Background Guide", href: "/blog/transparent-background-guide" },
    ],
    ctaLabel: "Apply solid color background",
  },
]);

const WATERMARK = pack("watermark", "/remove-watermark", "/remove-watermark", "Watermark", [
  {
    slug: "from-photos",
    title: "Remove Watermark from Photos Free | Clean Your Images — FBG AI",
    description:
      "Remove watermarks from your own photos online free with AI inpainting. Mark the area and restore clean pixels — no signup.",
    keywords: ["remove watermark from photo", "watermark remover online free", "clean watermark from image AI"],
    h1: "Remove Watermark from Photos",
    intro: "Clean draft stamps and overlays from images you own. Mark the watermark, then let AI rebuild the area.",
    sections: [
      {
        heading: "Only edit images you have rights to",
        paragraphs: [
          "Do not remove watermarks from stock previews or others’ work. That can violate copyright.",
        ],
      },
      {
        heading: "How marking works",
        paragraphs: ["Paint over the stamp or logo, then run removal. Inspect faces and textures afterward."],
      },
      {
        heading: "Privacy",
        paragraphs: ["Uploads auto-delete within one hour."],
      },
    ],
    faqs: [
      {
        question: "Is removing any watermark legal?",
        answer: "Only process files you own or are licensed to edit.",
      },
      {
        question: "Large diagonal stamps?",
        answer: "Large overlays are harder — reshooting or using originals is often better.",
      },
    ],
    relatedGuides: [
      { title: "Remove Watermarks Safely: What You Need to Know", href: "/blog/remove-watermarks-safely-legal-guide" },
      { title: "Privacy Best Practices for Online Image Tools", href: "/blog/privacy-best-practices-online-image-tools" },
    ],
    ctaLabel: "Remove photo watermark",
  },
  {
    slug: "logo-overlay",
    title: "Remove Logo Overlay from Images Free | FBG AI",
    description:
      "Remove logo overlays from your own images online free. Target brand stamps you added by mistake and restore the photo.",
    keywords: ["remove logo from photo", "remove logo overlay online", "AI remove branded stamp"],
    h1: "Remove Logo Overlay from Images",
    intro: "Accidentally baked a logo into an export? Mark the overlay and restore the underlying image you own.",
    sections: [
      {
        heading: "Best candidates",
        paragraphs: ["Corner logos on flat skies or walls inpaint more cleanly than logos over busy faces."],
      },
      {
        heading: "Design tip",
        paragraphs: ["Keep logos on separate layers in future exports so you never need removal."],
      },
      {
        heading: "After cleanup",
        paragraphs: ["Enhance lightly if the patched area looks soft."],
      },
    ],
    faqs: [
      {
        question: "Can I remove someone else’s brand?",
        answer: "No — only clean logos on assets you control.",
      },
      {
        question: "Transparent PNG logos?",
        answer: "If the logo is composited into pixels, mark that region for inpainting.",
      },
    ],
    relatedGuides: [
      { title: "Remove Watermarks Safely: What You Need to Know", href: "/blog/remove-watermarks-safely-legal-guide" },
      { title: "How to Remove Background Without Photoshop", href: "/blog/remove-background-without-photoshop" },
    ],
    ctaLabel: "Remove logo overlay",
  },
  {
    slug: "text-watermark",
    title: "Remove Text Watermark Free | Clean Stamps Online — FBG AI",
    description:
      "Remove text watermarks from your images online free. Mark caption stamps and restore the photo underneath.",
    keywords: ["remove text watermark", "remove stamped text from photo", "AI text watermark remover"],
    h1: "Remove Text Watermark from Images",
    intro: "Date stamps and “PROOF” text on your own files can be marked and cleaned with AI inpainting.",
    sections: [
      {
        heading: "Mark precisely",
        paragraphs: ["Cover the letters tightly so surrounding detail is preserved."],
      },
      {
        heading: "Busy backgrounds",
        paragraphs: ["Text over patterned fabric is harder — expect a soft patch."],
      },
      {
        heading: "Legal reminder",
        paragraphs: ["Never strip watermarks to steal stock photos."],
      },
    ],
    faqs: [
      {
        question: "Handwriting vs printed stamps?",
        answer: "Both can be marked; printed stamps on flat areas usually clean better.",
      },
      {
        question: "Multiple stamps?",
        answer: "Remove one region at a time for better control.",
      },
    ],
    relatedGuides: [
      { title: "Remove Watermarks Safely: What You Need to Know", href: "/blog/remove-watermarks-safely-legal-guide" },
      { title: "Enhance Image Quality Without Over-Editing", href: "/blog/enhance-image-quality-without-over-editing" },
    ],
    ctaLabel: "Remove text watermark",
  },
  {
    slug: "date-stamp",
    title: "Remove Date Stamp from Photos Free | FBG AI",
    description:
      "Remove camera date stamps from your photos online free. Clean orange/white timestamps from old digicam shots.",
    keywords: ["remove date stamp from photo", "remove timestamp from image", "clean camera date overlay"],
    h1: "Remove Date Stamp from Photos",
    intro: "Old digicam orange timestamps clutter prints. Mark the stamp on photos you own and restore the corner.",
    sections: [
      {
        heading: "Classic corner stamps",
        paragraphs: ["Corners over sky or walls inpaint cleanly; stamps over faces are riskier."],
      },
      {
        heading: "Archive workflow",
        paragraphs: ["Clean → enhance → upscale before reprinting family albums."],
      },
      {
        heading: "Keep a master",
        paragraphs: ["Save an unedited original for historical accuracy when the stamp matters."],
      },
    ],
    faqs: [
      {
        question: "Will EXIF date remain?",
        answer: "This edits pixels, not necessarily file metadata — check EXIF separately if needed.",
      },
      {
        question: "Video timestamps?",
        answer: "This tool is for still images only.",
      },
    ],
    relatedGuides: [
      { title: "Remove Watermarks Safely: What You Need to Know", href: "/blog/remove-watermarks-safely-legal-guide" },
      { title: "Upscale Old Photos for Print & Posters", href: "/blog/upscale-old-photos-for-print-posters" },
    ],
    ctaLabel: "Remove date stamp",
  },
  {
    slug: "screenshot",
    title: "Remove Watermark from Screenshots Free | FBG AI",
    description:
      "Remove watermarks from screenshots you own online free. Clean tool badges and draft overlays from documentation images.",
    keywords: ["remove watermark from screenshot", "clean screenshot overlay", "remove badge from screen capture"],
    h1: "Remove Watermark from Screenshots",
    intro: "Documentation grabs sometimes include draft badges. Mark overlays on screenshots you are allowed to edit.",
    sections: [
      {
        heading: "UI edges",
        paragraphs: ["Inpainting near sharp UI can soften icons — crop tighter when possible."],
      },
      {
        heading: "Secrets",
        paragraphs: ["Redact passwords and personal data before uploading any screenshot."],
      },
      {
        heading: "Enhance after",
        paragraphs: ["A light enhance can even out a patched region."],
      },
    ],
    faqs: [
      {
        question: "Software trial watermarks?",
        answer: "Do not bypass licensing. Only clean overlays on assets you have rights to publish.",
      },
      {
        question: "Browser chrome?",
        answer: "Crop browser UI first; only mark the watermark region you need gone.",
      },
    ],
    relatedGuides: [
      { title: "Remove Watermarks Safely: What You Need to Know", href: "/blog/remove-watermarks-safely-legal-guide" },
      { title: "Privacy Best Practices for Online Image Tools", href: "/blog/privacy-best-practices-online-image-tools" },
    ],
    ctaLabel: "Clean screenshot watermark",
  },
  {
    slug: "stock-preview",
    title: "Clean Watermarks on Your Own Previews Free | Rights Reminder — FBG AI",
    description:
      "Learn when watermark removal is allowed. Use FBG AI only on images you own — never to steal stock previews.",
    keywords: ["remove stock watermark legal", "watermark remover own images", "clean preview watermark responsibly"],
    h1: "Watermark Removal — Rights-First Guide",
    intro: "Stock site previews are not free photos. Use our remover only for files you created or licensed for editing.",
    sections: [
      {
        heading: "What we allow",
        paragraphs: [
          "Your camera originals, client work you own, and overlays you added accidentally.",
        ],
      },
      {
        heading: "What we do not endorse",
        paragraphs: ["Stripping watermarks to use unpaid stock, celebrity photos, or others’ portfolios."],
      },
      {
        heading: "Better alternative",
        paragraphs: ["Buy the license, shoot originals, or use properly free resources."],
      },
    ],
    faqs: [
      {
        question: "Can the tool technically remove a stock stamp?",
        answer: "Technical ability is not permission. Unauthorized removal can be copyright infringement.",
      },
      {
        question: "Where do I read the full policy?",
        answer: "See our Terms of Service and the watermark legal guide on the blog.",
      },
    ],
    relatedGuides: [
      { title: "Remove Watermarks Safely: What You Need to Know", href: "/blog/remove-watermarks-safely-legal-guide" },
      { title: "Terms of Service", href: "/terms" },
    ],
    ctaLabel: "Open watermark remover",
  },
]);

export const USE_CASE_LANDINGS: UseCaseLanding[] = [
  ...REMOVE_BG,
  ...UPSCALE,
  ...ENHANCE,
  ...BLUR,
  ...GEN_BG,
  ...WATERMARK,
];

export function getUseCaseLanding(pathPrefix: string, slug: string): UseCaseLanding | undefined {
  return USE_CASE_LANDINGS.find((item) => item.pathPrefix === pathPrefix && item.slug === slug);
}

/** @deprecated Prefer getUseCaseLanding(pathPrefix, slug) */
export function getUseCaseLandingBySlug(slug: string): UseCaseLanding | undefined {
  return USE_CASE_LANDINGS.find((item) => item.slug === slug && item.toolId === "remove-bg");
}

export function getUseCaseSlugs(pathPrefix?: string): string[] {
  return USE_CASE_LANDINGS.filter((item) => (pathPrefix ? item.pathPrefix === pathPrefix : true)).map(
    (item) => item.slug
  );
}

export function getUseCaseSlugsForPrefix(pathPrefix: string): { slug: string }[] {
  return USE_CASE_LANDINGS.filter((item) => item.pathPrefix === pathPrefix).map((item) => ({
    slug: item.slug,
  }));
}

export function getAllUseCasePaths(): string[] {
  return USE_CASE_LANDINGS.map(landingPath);
}

export function getUseCasesByTool(toolId: LandingToolId): UseCaseLanding[] {
  return USE_CASE_LANDINGS.filter((item) => item.toolId === toolId);
}

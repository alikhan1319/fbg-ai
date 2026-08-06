import { BLOG_POSTS, type BlogPost } from "@/lib/blog-posts";
import { BRAND } from "@/lib/constants";

export type BlogArticle = BlogPost & {
  sections: { heading?: string; paragraphs: string[] }[];
};

function mergePost(
  slug: BlogPost["slug"],
  sections: BlogArticle["sections"]
): BlogArticle {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`Missing blog post: ${slug}`);
  return { ...post, sections };
}

const DETAILED_ARTICLES: Partial<Record<BlogPost["slug"], BlogArticle["sections"]>> = {
  "remove-backgrounds-ecommerce-product-photos": [
    {
      paragraphs: [
        "Clean product photos sell. Marketplaces like Amazon, Shopify, and Etsy reward listings with consistent white or transparent backgrounds — and shoppers trust them more at first glance.",
        "Free Background Remover AI makes this workflow fast: upload a product shot, get a transparent PNG in seconds, then place it on white or your brand color. No Photoshop subscription required.",
      ],
    },
    {
      heading: "Step 1: Shoot with separation in mind",
      paragraphs: [
        "Place products on a plain surface or hang them against a neutral wall. Even lighting reduces harsh shadows that confuse AI edge detection.",
        "Avoid busy patterns behind sneakers, bottles, or electronics. A little space around the product helps the free background remover AI isolate edges cleanly.",
      ],
    },
    {
      heading: "Step 2: Upload and remove the background",
      paragraphs: [
        "Open our remove background tool, drag in your JPG or PNG (up to 15MB), and wait a few seconds. Hair-level edge refinement works on product edges, lace, and transparent packaging too.",
        "Download a transparent PNG, then drop it onto a pure white (#FFFFFF) canvas in Canva, Figma, or your marketplace template.",
      ],
    },
    {
      heading: "Step 3: Batch your catalog",
      paragraphs: [
        "Use the same lighting setup and background removal settings across your catalog so every listing looks like the same brand.",
        "Pair background removal with our upscale tool if your source photos are low resolution — sharper detail helps on mobile product grids.",
      ],
    },
    {
      heading: "Internal links to keep learning",
      paragraphs: [
        "Read our Shopify white vs transparent PNG guide, then try the product-images use-case landing for ecommerce-specific tips. Return to the homepage hub anytime for the full six-tool suite.",
      ],
    },
  ],
  "ai-image-upscaling-2x-vs-4x": [
    {
      paragraphs: [
        "Upscaling restores detail in old exports, cropped social images, and supplier photos — but bigger is not always better.",
        "Our AI upscaler offers 2× and 4× modes. Picking the right one keeps textures natural and avoids over-sharpened halos.",
      ],
    },
    {
      heading: "Use 2× for social and web",
      paragraphs: [
        "Instagram, TikTok, and blog heroes rarely need more than double resolution. 2× is faster, uses less memory, and produces cleaner edges on portraits and product shots.",
        "Start with 2× when your source is already decent (720p or 1080p) and you only need a sharper feed image.",
      ],
    },
    {
      heading: "Use 4× for print and large banners",
      paragraphs: [
        "Posters, trade-show graphics, and hero banners benefit from 4× when the source is small or heavily compressed.",
        "Inspect fine text and fabric texture after upscaling — if artifacts appear, try 2× first or enhance the image before upscaling.",
      ],
    },
    {
      heading: "Combine with other tools",
      paragraphs: [
        "Remove the background first, then upscale the cutout for crisp marketplace thumbnails.",
        "Our enhance-image tool can lift flat lighting before upscaling bright or high-key photos.",
      ],
    },
  ],
  "privacy-best-practices-online-image-tools": [
    {
      paragraphs: [
        "Uploading family photos, ID scans, or client work to random websites is risky. Before you use any AI image editor — including Free Background Remover AI — check how your files are handled.",
      ],
    },
    {
      heading: "Look for automatic deletion",
      paragraphs: [
        "Trustworthy tools delete uploads shortly after processing. We auto-delete files within one hour and never use your images to train models without consent.",
        "Avoid services that keep indefinite copies or require accounts just to preview a result.",
      ],
    },
    {
      heading: "Use HTTPS and read the privacy policy",
      paragraphs: [
        "Only upload on sites served over HTTPS. Read the privacy policy for retention periods, third-party processors, and your GDPR rights.",
        "Our privacy policy explains exactly what we collect, how long we keep it, and how to request deletion.",
      ],
    },
    {
      heading: "Minimize sensitive uploads",
      paragraphs: [
        "Crop out unnecessary metadata-heavy regions when possible. Do not upload documents you would not email to a stranger.",
        "On shared computers, clear browser downloads after saving your processed PNG or JPG.",
      ],
    },
  ],
  "portrait-background-removal-hair-edge-tips": [
    {
      paragraphs: [
        "Portraits fail AI cutouts when hair blends into walls, backlighting blows out edges, or glasses catch strong reflections. A few capture habits dramatically improve Free Background Remover AI results.",
      ],
    },
    {
      heading: "Light the subject separately from the wall",
      paragraphs: [
        "Stand two steps away from the backdrop. Soft front light keeps flyaways visible without melting into a bright window behind the head.",
        "Avoid neon gels and patterned wallpaper for ID-style or ecommerce headshots.",
      ],
    },
    {
      heading: "Zoom the result before you publish",
      paragraphs: [
        "After download, inspect hairline, ear edges, and collar gaps at 200%. If fringe remains, crop closer and re-run — tighter framing helps the model focus on one subject.",
        "For team pages, keep framing consistent across people so cutouts composite cleanly on one brand background.",
      ],
    },
    {
      heading: "When blur is better than removal",
      paragraphs: [
        "Lifestyle portraits sometimes look more natural with background blur instead of full transparency. Compare both tools before committing to a campaign look.",
      ],
    },
  ],
  "blur-background-professional-portraits": [
    {
      paragraphs: [
        "DSLR-style depth of field used to require expensive glass. AI background blur keeps the subject sharp while softening distractions — ideal for LinkedIn, coaching sites, and brand stories.",
      ],
    },
    {
      heading: "Dial intensity to match the story",
      paragraphs: [
        "Subtle blur feels editorial; heavy blur feels cinematic. Start mid-range, then adjust until the face remains the clear focal point.",
        "Leave a hint of environment when location matters (office, studio, outdoor brand shoot).",
      ],
    },
    {
      heading: "Blur vs remove — quick decision",
      paragraphs: [
        "Remove the background when you need transparent PNGs or pure white marketplace fills. Blur when you want atmosphere without rebuilding a scene from scratch.",
        "Read our blur vs remove comparison guide for side-by-side examples.",
      ],
    },
  ],
  "generate-ai-backgrounds-product-listings": [
    {
      paragraphs: [
        "After you isolate a product, AI background generation places it into studio, lifestyle, or color-matched scenes without reshooting the entire catalog.",
      ],
    },
    {
      heading: "Start with a clean cutout",
      paragraphs: [
        "Run remove background first so the generator composites onto a true subject mask. Soft edges from busy original photos create halos on new scenes.",
      ],
    },
    {
      heading: "Match lighting language",
      paragraphs: [
        "If the product was shot under soft daylight, avoid neon cyberpunk prompts. Simple studio, marble, wood, or soft gradient scenes usually convert better for ecommerce.",
      ],
    },
    {
      heading: "Keep SKUs consistent",
      paragraphs: [
        "Reuse the same prompt family across colorways so shoppers trust that only the product changed — not the photography quality.",
      ],
    },
  ],
  "enhance-image-quality-without-over-editing": [
    {
      paragraphs: [
        "Enhancement should fix flat exposure and soft detail — not invent plastic skin or neon colors. FBG AI’s enhancer focuses on sharpening, denoise, and gentle color correction.",
      ],
    },
    {
      heading: "Order of operations",
      paragraphs: [
        "Enhance after background removal if the cutout looks dull. Enhance before upscaling when the source is dark or muddy so the upscaler has cleaner signal.",
      ],
    },
    {
      heading: "Stop before it looks fake",
      paragraphs: [
        "If teeth and metal highlights clip to pure white, dial back. Natural texture sells more products than over-processed gloss.",
      ],
    },
  ],
  "remove-watermarks-safely-legal-guide": [
    {
      paragraphs: [
        "Watermark removal is for images you own or are licensed to edit — stock previews you did not buy, or someone else’s photos, are off-limits. Misuse can violate copyright law.",
      ],
    },
    {
      heading: "Allowed use cases",
      paragraphs: [
        "Cleaning your own camera stamp, removing a draft overlay from a shoot you paid for, or fixing a logo you accidentally baked into a render you created.",
      ],
    },
    {
      heading: "How our tool works",
      paragraphs: [
        "Mark the watermark area, then let inpainting rebuild pixels underneath. Inspect the result carefully — complex text over faces may need a reshoot instead.",
      ],
    },
    {
      heading: "Privacy note",
      paragraphs: [
        "Uploads auto-delete within one hour. Still avoid uploading documents that contain unrelated personal data.",
      ],
    },
  ],
  "pet-photo-editing-fur-backgrounds": [
    {
      paragraphs: [
        "Fur against grass, couches, or blankets is one of the hardest cutout problems. Free Background Remover AI handles many pet shots when you give it contrast and framing.",
      ],
    },
    {
      heading: "Capture tips for cats and dogs",
      paragraphs: [
        "Shoot slightly above eye level with a plain towel or wall behind the pet. Avoid harsh noon sun that blows white fur.",
      ],
    },
    {
      heading: "After the cutout",
      paragraphs: [
        "Place pets on soft gradients for social posts, or generate a playful scene. Upscale if the phone photo is soft before printing a poster.",
      ],
    },
  ],
  "shopify-product-photos-white-vs-transparent": [
    {
      paragraphs: [
        "Shopify themes differ: some expect JPG on white, others love transparent PNG overlays. Choosing wrong wastes design time.",
      ],
    },
    {
      heading: "When white JPG wins",
      paragraphs: [
        "Many marketplace-inspired themes and Meta ads prefer a solid white field. Composite your transparent PNG onto #FFFFFF and export JPG when the theme rejects alpha.",
      ],
    },
    {
      heading: "When transparent PNG wins",
      paragraphs: [
        "Lookbooks, hover effects, and multi-layer product builders need alpha. Keep PNG for design systems; convert only at the final upload step if required.",
      ],
    },
  ],
  "social-media-image-sizes-after-bg-removal": [
    {
      paragraphs: [
        "A perfect cutout still fails if you squash it into the wrong crop. Plan canvas sizes before you export from Free Background Remover AI.",
      ],
    },
    {
      heading: "Common safe sizes",
      paragraphs: [
        "Instagram feed ~1080×1080 or 1080×1350, Stories/Reels 1080×1920, LinkedIn ~1200×627 for link posts. Place the subject with breathing room for UI chrome.",
      ],
    },
    {
      heading: "Protect edges while resizing",
      paragraphs: [
        "Resize the transparent PNG in a tool that respects alpha. Avoid repeated JPG re-saves that introduce muddy halos around hair.",
      ],
    },
  ],
  "batch-workflow-tips-catalog-photography": [
    {
      paragraphs: [
        "Catalogs fall apart when SKU #1 looks studio-perfect and SKU #40 looks like a phone snapshot. Systemize lighting, framing, and export settings.",
      ],
    },
    {
      heading: "Shoot once, process many",
      paragraphs: [
        "Use the same camera distance, height, and softbox position. Process every image through remove background with identical follow-up (white plate or generated scene).",
      ],
    },
    {
      heading: "Name files for sanity",
      paragraphs: [
        "sku_color_angle.png beats IMG_4921. Keep a spreadsheet mapping filenames to listing URLs.",
      ],
    },
  ],
  "upscale-old-photos-for-print-posters": [
    {
      paragraphs: [
        "Compressed JPEGs from old phones look soft on posters. Upscale 2× or 4×, then enhance carefully before sending files to a print vendor.",
      ],
    },
    {
      heading: "Inspect text and faces",
      paragraphs: [
        "If lettering on a shirt warps, stay at 2×. Faces benefit from enhance + moderate upscale rather than aggressive 4× alone.",
      ],
    },
    {
      heading: "Print checklist",
      paragraphs: [
        "Confirm DPI expectations with your printer. Export the highest quality JPG or PNG they accept after upscaling.",
      ],
    },
  ],
  "blur-vs-remove-background-which-to-choose": [
    {
      paragraphs: [
        "Both tools solve “busy background,” but the creative outcome differs. Choose based on whether you need transparency or atmosphere.",
      ],
    },
    {
      heading: "Choose remove background when…",
      paragraphs: [
        "You need transparent PNG, marketplace white, or a completely new generated scene behind the subject.",
      ],
    },
    {
      heading: "Choose blur when…",
      paragraphs: [
        "You want a portrait-mode look while keeping a hint of place. Headshots and lifestyle product shots often prefer blur.",
      ],
    },
  ],
  "free-background-remover-ai-vs-paid-tools": [
    {
      paragraphs: [
        "Paid brands advertise hair-perfect edges and bulk APIs. Free Background Remover AI focuses on instant browser use, no signup, no watermark, and privacy-first deletion.",
      ],
    },
    {
      heading: "Where free wins",
      paragraphs: [
        "Occasional sellers, students, and marketers who need a few clean cutouts weekly without subscriptions. Six tools in one suite reduces tab sprawl.",
      ],
    },
    {
      heading: "Where paid may still help",
      paragraphs: [
        "Enterprise APIs, huge batch pipelines, or niche vertical models. Start free; upgrade elsewhere only when volume demands it.",
      ],
    },
  ],
  "best-background-colors-passport-photos": [
    {
      paragraphs: [
        "After you remove the background from a passport photo, the solid color you choose must match official guidance — not Instagram aesthetics.",
      ],
    },
    {
      heading: "White and off-white",
      paragraphs: [
        "Many countries require white or light backgrounds. Use pure #FFFFFF unless your embassy specifies cream or light gray.",
      ],
    },
    {
      heading: "Light blue and light gray",
      paragraphs: [
        "Some visa programs allow pale blue. Avoid dark navy, red, or patterned fills. Always verify the latest government PDF before submitting.",
      ],
    },
    {
      heading: "Workflow on FBG AI",
      paragraphs: [
        "Use the passport-photo use-case page, remove the backdrop, then composite onto the required color in any editor. Keep a neutral expression and correct head size.",
      ],
    },
  ],
  "remove-background-without-photoshop": [
    {
      paragraphs: [
        "Photoshop’s pen tool is precise but slow and expensive. Browser AI removes backgrounds in seconds for most product and portrait jobs.",
      ],
    },
    {
      heading: "Three-step free workflow",
      paragraphs: [
        "1) Open Free Background Remover AI. 2) Upload JPG/PNG/WebP. 3) Download transparent PNG. Optional: upscale or enhance.",
      ],
    },
    {
      heading: "When you still need desktop software",
      paragraphs: [
        "Complex multi-subject composites, print-ready CMYK, or pixel-perfect logo redraws may still need Illustrator or Photoshop. For everyday cutouts, AI is enough.",
      ],
    },
  ],
  "png-vs-jpg-which-format": [
    {
      paragraphs: [
        "PNG stores transparency and sharp graphics. JPG compresses photos smaller but cannot keep an alpha channel.",
      ],
    },
    {
      heading: "Use PNG for",
      paragraphs: [
        "Logos, UI assets, cutouts, signatures, and any file that must sit on multiple background colors.",
      ],
    },
    {
      heading: "Use JPG for",
      paragraphs: [
        "Large photographs without transparency, social uploads with size caps, and marketplace forms that reject PNG.",
      ],
    },
  ],
  "transparent-background-guide": [
    {
      paragraphs: [
        "A transparent background means pixels can be fully or partially see-through. Designers preview this as a checkerboard — the checkers are not part of your file.",
      ],
    },
    {
      heading: "How to create one",
      paragraphs: [
        "Upload to our remove background tool and export PNG. Place the file in Canva, Figma, or Shopify without a white box around the subject.",
      ],
    },
    {
      heading: "Common mistakes",
      paragraphs: [
        "Saving as JPG after cutout destroys transparency. Flattening layers too early in design tools does the same. Keep a master PNG.",
      ],
    },
  ],
  "ecommerce-image-optimization": [
    {
      paragraphs: [
        "Slow images hurt conversion. Optimize file size after you perfect the cutout and composition.",
      ],
    },
    {
      heading: "Pipeline that works",
      paragraphs: [
        "Remove background → enhance if needed → upscale only if soft → resize to theme requirements → compress with a quality target around 70–85 for JPG.",
      ],
    },
    {
      heading: "Measure what matters",
      paragraphs: [
        "Track LCP on product pages. A beautiful 4MB hero that blocks paint costs sales. Prefer one sharp optimized image over five heavy variants above the fold.",
      ],
    },
  ],
};

function defaultSections(post: BlogPost): BlogArticle["sections"] {
  return [
    {
      paragraphs: [post.excerpt],
    },
    {
      heading: "Quick takeaway",
      paragraphs: [
        `This guide is part of the ${BRAND.name} blog — practical tips for creators, sellers, and teams using free AI image tools online.`,
        "Upload your image, process it in seconds, and download without a watermark on our free tier.",
      ],
    },
    {
      heading: "Try it yourself",
      paragraphs: [
        `Open the related tool on ${BRAND.name} and apply what you learned to your own photos. No signup is required to get started.`,
        "For privacy, uploads are automatically deleted within one hour after processing.",
      ],
    },
  ];
}

export function getBlogArticle(slug: string): BlogArticle | undefined {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return undefined;

  const detailed = DETAILED_ARTICLES[post.slug];
  if (detailed) return mergePost(post.slug, detailed);

  return { ...post, sections: defaultSections(post) };
}

export function getAllBlogSlugs(): BlogPost["slug"][] {
  return BLOG_POSTS.map((p) => p.slug);
}

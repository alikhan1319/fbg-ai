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

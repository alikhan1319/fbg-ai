"""Seed blog posts into MySQL when database is empty."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from cms_models import BlogPost

BRAND_NAME = "Free Background Remover AI"


def default_sections(excerpt: str) -> list[dict]:
    return [
        {"paragraphs": [excerpt]},
        {
            "heading": "Quick takeaway",
            "paragraphs": [
                f"This guide is part of the {BRAND_NAME} blog — practical tips for creators, sellers, and teams using free AI image tools online.",
                "Upload your image, process it in seconds, and download without a watermark on our free tier.",
            ],
        },
        {
            "heading": "Try it yourself",
            "paragraphs": [
                f"Open the related tool on {BRAND_NAME} and apply what you learned to your own photos. No signup is required to get started.",
                "For privacy, uploads are automatically deleted within one hour after processing.",
            ],
        },
    ]


DETAILED_SECTIONS: dict[str, list[dict]] = {
    "remove-backgrounds-ecommerce-product-photos": [
        {
            "paragraphs": [
                "Clean product photos sell. Marketplaces like Amazon, Shopify, and Etsy reward listings with consistent white or transparent backgrounds — and shoppers trust them more at first glance.",
                "Free Background Remover AI makes this workflow fast: upload a product shot, get a transparent PNG in seconds, then place it on white or your brand color. No Photoshop subscription required.",
            ]
        },
        {
            "heading": "Step 1: Shoot with separation in mind",
            "paragraphs": [
                "Place products on a plain surface or hang them against a neutral wall. Even lighting reduces harsh shadows that confuse AI edge detection.",
                "Avoid busy patterns behind sneakers, bottles, or electronics. A little space around the product helps the free background remover AI isolate edges cleanly.",
            ],
        },
        {
            "heading": "Step 2: Upload and remove the background",
            "paragraphs": [
                "Open our remove background tool, drag in your JPG or PNG (up to 15MB), and wait a few seconds. Hair-level edge refinement works on product edges, lace, and transparent packaging too.",
                "Download a transparent PNG, then drop it onto a pure white (#FFFFFF) canvas in Canva, Figma, or your marketplace template.",
            ],
        },
        {
            "heading": "Step 3: Batch your catalog",
            "paragraphs": [
                "Use the same lighting setup and background removal settings across your catalog so every listing looks like the same brand.",
                "Pair background removal with our upscale tool if your source photos are low resolution — sharper detail helps on mobile product grids.",
            ],
        },
    ],
    "ai-image-upscaling-2x-vs-4x": [
        {
            "paragraphs": [
                "Upscaling restores detail in old exports, cropped social images, and supplier photos — but bigger is not always better.",
                "Our AI upscaler offers 2× and 4× modes. Picking the right one keeps textures natural and avoids over-sharpened halos.",
            ]
        },
        {
            "heading": "Use 2× for social and web",
            "paragraphs": [
                "Instagram, TikTok, and blog heroes rarely need more than double resolution. 2× is faster, uses less memory, and produces cleaner edges on portraits and product shots.",
                "Start with 2× when your source is already decent (720p or 1080p) and you only need a sharper feed image.",
            ],
        },
        {
            "heading": "Use 4× for print and large banners",
            "paragraphs": [
                "Posters, trade-show graphics, and hero banners benefit from 4× when the source is small or heavily compressed.",
                "Inspect fine text and fabric texture after upscaling — if artifacts appear, try 2× first or enhance the image before upscaling.",
            ],
        },
        {
            "heading": "Combine with other tools",
            "paragraphs": [
                "Remove the background first, then upscale the cutout for crisp marketplace thumbnails.",
                "Our enhance-image tool can lift flat lighting before upscaling bright or high-key photos.",
            ],
        },
    ],
    "privacy-best-practices-online-image-tools": [
        {
            "paragraphs": [
                "Uploading family photos, ID scans, or client work to random websites is risky. Before you use any AI image editor — including Free Background Remover AI — check how your files are handled.",
            ]
        },
        {
            "heading": "Check retention and deletion",
            "paragraphs": [
                "Look for a clear privacy policy that states how long uploads are stored. We delete processed files within one hour.",
                "Avoid tools that require account creation for one-off edits unless you trust their data handling.",
            ],
        },
        {
            "heading": "Use HTTPS and trusted domains",
            "paragraphs": [
                "Only upload over HTTPS. Check the URL bar and avoid lookalike domains.",
                "For sensitive work, prefer tools that process locally or disclose server locations.",
            ],
        },
        {
            "heading": "After you download",
            "paragraphs": [
                "Save exports to a secure folder. Do not re-upload private documents to public sharing links.",
                "On shared computers, clear browser downloads after saving your processed PNG or JPG.",
            ],
        },
    ],
}

SEED_POSTS = [
    {
        "title": "How to Remove Backgrounds for E-commerce Product Photos",
        "excerpt": "Step-by-step guide to clean white backgrounds that boost conversions on Shopify, Amazon, and Etsy.",
        "date": "2026-05-12",
        "slug": "remove-backgrounds-ecommerce-product-photos",
        "category": "Background removal",
        "read_time": "6 min read",
        "tool_link": "/remove-bg",
        "image": "/images/remove-bg/product-sneaker-after.jpg",
        "image_alt": "Sneaker product photo with clean background removed for e-commerce listing",
    },
    {
        "title": "AI Image Upscaling: When to Use 2× vs 4×",
        "excerpt": "Get sharper social posts and print assets without artifacts — choose the right upscale setting.",
        "date": "2026-05-08",
        "slug": "ai-image-upscaling-2x-vs-4x",
        "category": "Upscale",
        "read_time": "5 min read",
        "tool_link": "/upscale",
        "image": "/images/upscale/product-after-portrait.jpg",
        "image_alt": "Upscaled product image showing sharper detail after AI enhancement",
    },
    {
        "title": "Privacy Best Practices for Online Image Tools",
        "excerpt": "What to look for before uploading sensitive photos to any AI editor online.",
        "date": "2026-05-01",
        "slug": "privacy-best-practices-online-image-tools",
        "category": "Privacy",
        "read_time": "4 min read",
        "tool_link": "/privacy",
        "image": "/images/remove-bg/portrait-before.jpg",
        "image_alt": "Portrait photo example for safe upload to online AI image tools",
    },
    {
        "title": "Portrait Background Removal: Hair & Edge Tips",
        "excerpt": "How to get clean cutouts on portraits with fine hair, glasses, and soft edges every time.",
        "date": "2026-04-28",
        "slug": "portrait-background-removal-hair-edge-tips",
        "category": "Background removal",
        "read_time": "5 min read",
        "tool_link": "/remove-bg",
        "image": "/images/remove-bg/portrait-after.png",
        "image_alt": "Portrait with background removed showing clean hair edges on transparent PNG",
    },
    {
        "title": "Blur Background for Professional Portrait Photos",
        "excerpt": "Create a DSLR-style depth-of-field look while keeping your subject sharp and natural.",
        "date": "2026-04-24",
        "slug": "blur-background-professional-portraits",
        "category": "Blur background",
        "read_time": "4 min read",
        "tool_link": "/blur-background",
        "image": "/images/blur-background/portrait-after-real.jpg",
        "image_alt": "Portrait photo with beautifully blurred background using AI depth effect",
    },
    {
        "title": "Generate AI Backgrounds for Product Listings",
        "excerpt": "Replace plain backdrops with studio, lifestyle, or colored scenes that match your brand.",
        "date": "2026-04-20",
        "slug": "generate-ai-backgrounds-product-listings",
        "category": "Generate background",
        "read_time": "6 min read",
        "tool_link": "/generate-background",
        "image": "/images/generate-bg/home-pet-after-blue-v3.jpg",
        "image_alt": "Pet photo with AI-generated blue background for creative product-style shots",
    },
    {
        "title": "Enhance Image Quality Without Over-Editing",
        "excerpt": "Fix lighting, color, and clarity while keeping skin tones and highlights natural.",
        "date": "2026-04-16",
        "slug": "enhance-image-quality-without-over-editing",
        "category": "Enhance",
        "read_time": "5 min read",
        "tool_link": "/enhance-image",
        "image": "/images/upscale/portrait-after.jpg",
        "image_alt": "Enhanced portrait with improved clarity and balanced lighting",
    },
    {
        "title": "Remove Watermarks Safely: What You Need to Know",
        "excerpt": "Legal and practical guidance for cleaning your own images — not someone else's work.",
        "date": "2026-04-12",
        "slug": "remove-watermarks-safely-legal-guide",
        "category": "Watermark",
        "read_time": "4 min read",
        "tool_link": "/remove-watermark",
        "image": "/images/remove-watermark/portrait-after-v5.jpg",
        "image_alt": "Photo after watermark removal showing restored image detail",
    },
    {
        "title": "Pet Photo Editing: Fur, Whiskers & Busy Backgrounds",
        "excerpt": "Cut out cats and dogs cleanly even when fur blends into grass or furniture.",
        "date": "2026-04-08",
        "slug": "pet-photo-editing-fur-backgrounds",
        "category": "Background removal",
        "read_time": "5 min read",
        "tool_link": "/remove-bg",
        "image": "/images/remove-bg/pet-after.png",
        "image_alt": "Pet photo with background removed showing detailed fur edges",
    },
    {
        "title": "Shopify Product Photos: White vs Transparent PNG",
        "excerpt": "Which export format converts better on Shopify themes and marketplace grids.",
        "date": "2026-04-04",
        "slug": "shopify-product-photos-white-vs-transparent",
        "category": "E-commerce",
        "read_time": "4 min read",
        "tool_link": "/remove-bg",
        "image": "/images/upscale/product-before-portrait.jpg",
        "image_alt": "Product photo prepared for Shopify listing with clean background",
    },
    {
        "title": "Social Media Image Sizes After Background Removal",
        "excerpt": "Resize cutouts for Instagram, TikTok, and LinkedIn without losing edge quality.",
        "date": "2026-03-30",
        "slug": "social-media-image-sizes-after-bg-removal",
        "category": "Social media",
        "read_time": "5 min read",
        "tool_link": "/remove-bg",
        "image": "/images/remove-bg/portrait-before.jpg",
        "image_alt": "Portrait prepared for social media after background removal",
    },
    {
        "title": "Batch Workflow Tips for Catalog Photography",
        "excerpt": "Keep lighting, framing, and export settings consistent across hundreds of SKUs.",
        "date": "2026-03-26",
        "slug": "batch-workflow-tips-catalog-photography",
        "category": "Workflow",
        "read_time": "6 min read",
        "tool_link": "/remove-bg",
        "image": "/images/remove-bg/product-sneaker-before.jpg",
        "image_alt": "Multiple product photos prepared for catalog background removal workflow",
    },
    {
        "title": "Upscale Old Photos for Print & Posters",
        "excerpt": "Recover detail from compressed JPEGs before sending files to print vendors.",
        "date": "2026-03-22",
        "slug": "upscale-old-photos-for-print-posters",
        "category": "Upscale",
        "read_time": "5 min read",
        "tool_link": "/upscale",
        "image": "/images/upscale/pet-after.jpg",
        "image_alt": "Upscaled pet photo with restored fur detail suitable for print",
    },
    {
        "title": "Blur Background vs Remove Background: Which to Choose?",
        "excerpt": "Compare both tools for headshots, team pages, and lifestyle product shots.",
        "date": "2026-03-18",
        "slug": "blur-vs-remove-background-which-to-choose",
        "category": "Guides",
        "read_time": "4 min read",
        "tool_link": "/blur-background",
        "image": "/images/blur-background/product-after-real-portrait.jpg",
        "image_alt": "Product photo with blurred background compared to full removal",
    },
    {
        "title": "Free Background Remover AI vs Paid Tools",
        "excerpt": "How our free tier compares on speed, quality, privacy, and export limits.",
        "date": "2026-03-14",
        "slug": "free-background-remover-ai-vs-paid-tools",
        "category": "Comparisons",
        "read_time": "6 min read",
        "tool_link": "/remove-bg",
        "image": "/images/generate-bg/home-pet-before-v3.jpg",
        "image_alt": "Before and after example comparing free AI background removal quality",
    },
]


def _parse_date(date_str: str) -> datetime:
    return datetime.strptime(date_str, "%Y-%m-%d")


def _format_display_date(dt: datetime) -> str:
    return dt.strftime("%B %d, %Y")


def seed_if_empty(db: Session) -> None:
    count = db.query(BlogPost).count()
    if count > 0:
        return

    for item in SEED_POSTS:
        published = _parse_date(item["date"])
        sections = DETAILED_SECTIONS.get(item["slug"]) or default_sections(item["excerpt"])
        db.add(
            BlogPost(
                title=item["title"],
                slug=item["slug"],
                excerpt=item["excerpt"],
                category=item["category"],
                read_time=item["read_time"],
                tool_link=item["tool_link"],
                image=item["image"],
                image_alt=item["image_alt"],
                status="published",
                sections=sections,
                published_at=published,
            )
        )

    db.flush()

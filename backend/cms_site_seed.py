"""Seed site content (FAQ, testimonials, legal pages) when tables are empty."""

from __future__ import annotations

from sqlalchemy.orm import Session

from cms_models import SiteFaqItem, SiteLegalPage, SiteTestimonial

DEFAULT_FAQ = [
    ("Is Free Background Remover AI really free?", "Yes. Core tools including background removal are free to use with fair usage limits. No credit card is required to get started."),
    ("Do I need to create an account?", "No signup is required for basic use. Upload your image, process it, and download — all in your browser."),
    ("What image formats are supported?", "We support JPG, JPEG, PNG, and WebP for uploads. Downloads are typically PNG (with transparency) or JPG depending on the tool."),
    ("How long are my images stored?", "For privacy, uploaded files are automatically deleted within 1 hour. We do not use your images for training without consent."),
    ("Can I use results commercially?", "You retain rights to your uploaded images and processed outputs. Please ensure you have rights to the original content you upload."),
    ("How accurate is AI background removal?", "Our models excel at portraits, products, and objects with complex edges including hair, fur, and glass."),
    ("Is there a watermark on downloads?", "No. Free tier exports do not include a platform watermark on your processed images."),
    ("Does it work on mobile?", "Yes. The site is fully responsive and works on modern mobile browsers."),
    ("What is the maximum file size?", "We recommend images up to 25MB for optimal speed. Larger files may take longer to process."),
    ("Can I remove watermarks from any image?", "Only use the watermark remover on images you own or have permission to edit. Respect copyright and intellectual property."),
    ("How does FBG AI compare to remove.bg?", "We offer six AI tools in one platform — not just background removal — with a generous free tier, no output watermark, and privacy-first auto-delete."),
    ("Is batch processing available?", "Batch workflows are available for power users. Start with single-image processing on the free tier and scale as your needs grow."),
    ("What resolution can I export?", "Exports support HD and up to 4K depending on the tool and source image quality. Upscaler can enhance resolution up to 4×."),
    ("Do you offer an API?", "API access for developers is on our roadmap. Join the newsletter to get notified when it launches."),
]

DEFAULT_TESTIMONIALS = [
    ("Sarah J.", "Product Photographer", "Studio North", "Removed backgrounds for 200+ product photos in an afternoon. Quality rivals paid tools."),
    ("James L.", "Portrait Photographer", "Lens & Light Co.", "The edge detection on hair is impressive. My clients love the transparent PNG exports."),
    ("Priya K.", "Social Media Manager", "Bloom Digital", "Upscale + remove BG in one place saved our team hours every week."),
    ("Alex R.", "Graphic Designer", "Pixel Forge", "Clean UI, fast results, and no watermark — exactly what I needed for client work."),
    ("Maria G.", "E-commerce Founder", "Artisan Goods", "I use the blur and enhance tools for marketing visuals. Free and reliable."),
    ("David T.", "Content Creator", "Creator Lab", "Gen BG and remove BG combo is a game-changer for YouTube thumbnails."),
]


def _avatar_from_name(name: str) -> str:
    for ch in name.strip():
        if ch.isalpha():
            return ch.upper()
    trimmed = name.strip()
    return trimmed[:1].upper() if trimmed else "A"


def _p(*paragraphs: str) -> str:
    return "".join(f"<p>{text}</p>" for text in paragraphs)


DEFAULT_LEGAL_PAGES = [
    {
        "slug": "privacy",
        "page_title": "Privacy Policy",
        "last_updated": "May 29, 2026",
        "highlights": [
            {"icon": "Trash2", "title": "Auto-delete uploads", "text": "Images you upload for background removal, upscaling, and other AI tools are automatically deleted within 1 hour."},
            {"icon": "Eye", "title": "No model training", "text": "We do not use your uploaded photos to train AI models without your explicit consent."},
            {"icon": "Lock", "title": "Encrypted in transit", "text": "Files are transferred over HTTPS/TLS. Processing happens on secure servers with access controls."},
            {"icon": "UserCheck", "title": "Your rights respected", "text": "Request access, correction, or deletion of personal data by emailing our privacy team anytime."},
        ],
        "sections": [
            {"id": "introduction", "title": "1. Introduction", "contentHtml": _p(
                'Free Background Remover AI ("FBG AI", "we", "us", or "our") operates an online AI image editing platform. This Privacy Policy describes how we collect, use, store, and protect information when you visit our site or use our free AI tools.',
                "By using our services, you agree to the practices described here. If you do not agree, please do not use the platform.",
            )},
            {"id": "information-we-collect", "title": "2. Information we collect", "contentHtml": _p(
                "We may collect contact details when you reach out via our contact page or newsletter.",
                "When you use our AI tools, you may upload photos (JPG, PNG, WebP) for processing.",
                "We automatically collect technical information such as browser type, device type, and pages viewed through standard server logs.",
            )},
            {"id": "uploaded-images", "title": "3. Uploaded images & AI processing", "contentHtml": _p(
                "Files are transmitted securely over encrypted HTTPS connections.",
                "Images are processed solely to perform the AI task you selected.",
                "Uploaded files and generated outputs are automatically deleted from our processing servers within 1 hour.",
                "We do not use your uploaded images to train machine learning models without your explicit consent.",
            )},
            {"id": "how-we-use", "title": "4. How we use your information", "contentHtml": _p(
                "We use collected information to provide, operate, and improve our AI image editing tools.",
                "We respond to support requests, send newsletter updates if you opt in, monitor site performance, and comply with legal obligations.",
            )},
            {"id": "cookies", "title": "5. Cookies & analytics", "contentHtml": _p(
                "We use essential cookies required for site functionality. With your consent, we may also use analytics cookies to understand how visitors use our site.",
                "You can manage cookie preferences through our cookie consent banner or your browser settings.",
            )},
            {"id": "retention", "title": "6. Data retention", "contentHtml": _p(
                "Uploaded images are deleted within 1 hour of processing.",
                "Contact and support messages are retained as long as needed to resolve your inquiry.",
                "Analytics data is aggregated where possible; raw logs are retained for a limited period before deletion.",
            )},
            {"id": "sharing", "title": "7. Third-party sharing", "contentHtml": _p(
                "We do not sell your personal information. We may share limited data with trusted service providers who help us operate the platform.",
                "We may disclose information if required by law or to protect the rights and safety of our users.",
            )},
            {"id": "your-rights", "title": "8. Your privacy rights", "contentHtml": _p(
                "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data.",
                "Contact our privacy team to exercise these rights.",
            )},
            {"id": "security", "title": "9. Security", "contentHtml": _p(
                "We implement technical and organizational measures to protect your information, including encryption in transit and access controls.",
            )},
            {"id": "children", "title": "10. Children's privacy", "contentHtml": _p(
                "Our services are not directed to children under 13. We do not knowingly collect personal information from children.",
            )},
            {"id": "international", "title": "11. International users", "contentHtml": _p(
                "If you access our services from outside your home country, your information may be processed in jurisdictions with different data protection laws.",
            )},
            {"id": "changes", "title": "12. Policy changes", "contentHtml": _p(
                "We may update this Privacy Policy from time to time. We will revise the last updated date when changes are made.",
            )},
            {"id": "contact", "title": "13. Contact us", "contentHtml": _p(
                "For privacy questions or data requests, contact us through our contact page or privacy email listed on the site.",
            )},
        ],
    },
    {
        "slug": "terms",
        "page_title": "Terms of Service",
        "last_updated": "May 29, 2026",
        "highlights": [
            {"icon": "CheckCircle2", "title": "Free to start", "text": "Use our background remover and five other AI tools on a generous free tier — no credit card required."},
            {"icon": "ShieldCheck", "title": "Your content, your rights", "text": "You keep ownership of images you upload. Only submit content you have the legal right to edit and publish."},
            {"icon": "Ban", "title": "Lawful use only", "text": "Do not upload illegal, harmful, or copyrighted material without permission. Misuse may result in access restrictions."},
            {"icon": "Scale", "title": "Fair usage limits", "text": "Free access is subject to reasonable rate limits so the platform stays fast and available for everyone."},
        ],
        "sections": [
            {"id": "acceptance", "title": "1. Acceptance of terms", "contentHtml": _p(
                "By accessing or using Free Background Remover AI, you agree to these Terms of Service and our Privacy Policy.",
            )},
            {"id": "eligibility", "title": "2. Eligibility", "contentHtml": _p(
                "You must be at least 13 years old and able to form a binding contract to use the Service.",
            )},
            {"id": "services", "title": "3. Our services", "contentHtml": _p(
                "We provide free AI image editing tools including background removal, upscaling, enhancement, blur, watermark removal, and background generation.",
            )},
            {"id": "your-content", "title": "4. Your content & uploads", "contentHtml": _p(
                "You retain ownership of images you upload. You grant us a limited license to process your files solely to deliver the requested result.",
            )},
            {"id": "acceptable-use", "title": "5. Acceptable use", "contentHtml": _p(
                "Do not use the Service for illegal activity, harassment, malware distribution, or processing content you do not have rights to edit.",
            )},
            {"id": "free-tier", "title": "6. Free tier & limits", "contentHtml": _p(
                "Free access is subject to fair usage limits. We may throttle or restrict access to prevent abuse.",
            )},
            {"id": "intellectual-property", "title": "7. Intellectual property", "contentHtml": _p(
                "The platform, branding, and software are owned by us or our licensors. Do not copy or reverse engineer the Service without permission.",
            )},
            {"id": "disclaimers", "title": "8. Disclaimers", "contentHtml": _p(
                "AI-generated results may contain imperfections. You are responsible for reviewing results before commercial or public use.",
            )},
            {"id": "liability", "title": "9. Limitation of liability", "contentHtml": _p(
                "To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the Service.",
            )},
            {"id": "indemnification", "title": "10. Indemnification", "contentHtml": _p(
                "You agree to indemnify and hold us harmless from claims arising from your use of the Service or violation of these Terms.",
            )},
            {"id": "termination", "title": "11. Termination", "contentHtml": _p(
                "We may suspend or terminate access if you violate these Terms. You may stop using the Service at any time.",
            )},
            {"id": "governing-law", "title": "12. Governing law & disputes", "contentHtml": _p(
                "These Terms are governed by applicable laws. Disputes should first be addressed through good-faith contact with our support team.",
            )},
            {"id": "changes", "title": "13. Changes to these terms", "contentHtml": _p(
                "We may update these Terms from time to time. Continued use after changes constitutes acceptance of the updated Terms.",
            )},
            {"id": "contact", "title": "14. Contact", "contentHtml": _p(
                "Questions about these Terms? Contact us through our contact page or support email listed on the site.",
            )},
        ],
    },
]


def seed_site_content_if_empty(db: Session) -> None:
    if db.query(SiteFaqItem).count() == 0:
        for i, (question, answer) in enumerate(DEFAULT_FAQ):
            db.add(SiteFaqItem(question=question, answer=answer, sort_order=i, is_active=True))

    if db.query(SiteTestimonial).count() == 0:
        for i, (name, role, company, quote) in enumerate(DEFAULT_TESTIMONIALS):
            db.add(
                SiteTestimonial(
                    name=name,
                    role=role,
                    company=company,
                    quote=quote,
                    avatar=_avatar_from_name(name),
                    sort_order=i,
                    is_active=True,
                )
            )

    if db.query(SiteLegalPage).count() == 0:
        for page in DEFAULT_LEGAL_PAGES:
            db.add(
                SiteLegalPage(
                    slug=page["slug"],
                    page_title=page["page_title"],
                    last_updated=page["last_updated"],
                    highlights=page["highlights"],
                    sections=page["sections"],
                )
            )

    db.flush()

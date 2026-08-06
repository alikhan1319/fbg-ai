import Link from "next/link";
import { SectionShell } from "@/components/ui/SectionHeading";
import { BRAND } from "@/lib/constants";
import { PRIMARY_KEYWORD, PRIMARY_KEYWORD_TITLE } from "@/lib/seo";

/**
 * Long-form crawlable copy for homepage topical depth (server-friendly, no client JS).
 */
export function SeoContentSection() {
  return (
    <SectionShell id="learn" className="bg-brand-bg" ariaLabel="Learn about free background remover AI">
      <div className="mx-auto max-w-3xl">
        <p className="studio-label">Guide</p>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          How {PRIMARY_KEYWORD_TITLE} works
        </h2>
        <p className="mt-4 text-base leading-relaxed text-brand-muted">
          {PRIMARY_KEYWORD_TITLE} ({BRAND.shortName}) is a free online AI image studio. Upload a JPG, PNG, or
          WebP, process it in the browser workflow, and download a clean result — typically a transparent PNG —
          without creating an account. This page explains what the AI does, when to use each tool, supported
          formats, privacy expectations, and realistic limitations.
        </p>

        <h3 className="mt-12 font-display text-xl font-bold text-brand-text sm:text-2xl">
          Free AI background remover — what happens after upload
        </h3>
        <p className="mt-3 text-base leading-relaxed text-brand-muted">
          Our{" "}
          <Link href="/remove-bg" className="font-semibold text-brand-secondary hover:underline">
            remove image background online free
          </Link>{" "}
          tool detects the primary subject (person, product, pet, or object), refines difficult edges like hair
          and fur, then replaces the backdrop with transparency. You can keep the transparent PNG for design
          tools or place the cutout on white for marketplace listings. Processing usually completes in a few
          seconds on modern connections.
        </p>

        <h3 className="mt-10 font-display text-xl font-bold text-brand-text sm:text-2xl">
          Transparent PNG, white backgrounds, and no-watermark exports
        </h3>
        <p className="mt-3 text-base leading-relaxed text-brand-muted">
          Searchers often need a <strong className="font-semibold text-brand-text">transparent background maker</strong>{" "}
          for Canva, Figma, Shopify, or Amazon. A transparent PNG preserves an alpha channel so the subject sits
          on any color. If a marketplace requires pure white, drop the PNG onto #FFFFFF before upload. Free-tier
          exports from {BRAND.shortName} do not add a watermark — important when comparing an{" "}
          <em>AI image background remover without watermark</em> to freemium competitors.
        </p>
        <p className="mt-3 text-base leading-relaxed text-brand-muted">
          Need to{" "}
          <Link href="/remove-background/png" className="font-semibold text-brand-secondary hover:underline">
            remove background from PNG
          </Link>{" "}
          files that still show a leftover white box? Re-process them through the same tool to rebuild a cleaner
          alpha edge. For passport-style ID photos, see{" "}
          <Link href="/remove-background/passport-photo" className="font-semibold text-brand-secondary hover:underline">
            remove background from passport photo
          </Link>
          .
        </p>

        <h3 className="mt-10 font-display text-xl font-bold text-brand-text sm:text-2xl">
          Supported formats, size limits, and processing speed
        </h3>
        <p className="mt-3 text-base leading-relaxed text-brand-muted">
          Upload JPG, PNG, or WebP up to 15MB. Extremely large print files should be resized first for faster
          uploads. Typical {PRIMARY_KEYWORD} jobs finish in about two seconds after the file reaches the server;
          upscaling and enhancement can take longer depending on resolution and 2× vs 4× settings. If the API is
          offline, the UI shows a clear error with retry options.
        </p>

        <h3 className="mt-10 font-display text-xl font-bold text-brand-text sm:text-2xl">
          Six tools for one creative workflow
        </h3>
        <p className="mt-3 text-base leading-relaxed text-brand-muted">
          Beyond background removal, {BRAND.name} includes an{" "}
          <Link href="/upscale" className="font-semibold text-brand-secondary hover:underline">
            AI image upscaler
          </Link>
          ,{" "}
          <Link href="/enhance-image" className="font-semibold text-brand-secondary hover:underline">
            image enhancer
          </Link>
          ,{" "}
          <Link href="/blur-background" className="font-semibold text-brand-secondary hover:underline">
            background blur
          </Link>
          ,{" "}
          <Link href="/generate-background" className="font-semibold text-brand-secondary hover:underline">
            AI background generator
          </Link>
          , and{" "}
          <Link href="/remove-watermark" className="font-semibold text-brand-secondary hover:underline">
            watermark remover
          </Link>{" "}
          (for images you own). A common ecommerce path: remove background → upscale → enhance → export.
        </p>

        <h3 className="mt-10 font-display text-xl font-bold text-brand-text sm:text-2xl">
          Use cases: products, portraits, logos, and more
        </h3>
        <p className="mt-3 text-base leading-relaxed text-brand-muted">
          Sellers use cutouts for Amazon and Shopify main images. Photographers deliver studio-style portraits.
          Designers isolate logos and signatures. Explore long-tail guides for{" "}
          <Link href="/remove-background/product-images" className="font-semibold text-brand-secondary hover:underline">
            product images
          </Link>
          ,{" "}
          <Link href="/remove-background/jewelry" className="font-semibold text-brand-secondary hover:underline">
            jewelry
          </Link>
          ,{" "}
          <Link href="/remove-background/furniture" className="font-semibold text-brand-secondary hover:underline">
            furniture
          </Link>
          ,{" "}
          <Link href="/remove-background/car-images" className="font-semibold text-brand-secondary hover:underline">
            car photos
          </Link>
          , and{" "}
          <Link href="/remove-background/logo" className="font-semibold text-brand-secondary hover:underline">
            logos
          </Link>
          .
        </p>

        <h3 className="mt-10 font-display text-xl font-bold text-brand-text sm:text-2xl">
          Privacy: auto-delete and what we do not do
        </h3>
        <p className="mt-3 text-base leading-relaxed text-brand-muted">
          Uploads are processed to deliver your result, then auto-deleted within one hour. We do not sell your
          images. Read the{" "}
          <Link href="/privacy" className="font-semibold text-brand-secondary hover:underline">
            privacy policy
          </Link>{" "}
          for retention details, and our{" "}
          <Link href="/blog/privacy-best-practices-online-image-tools" className="font-semibold text-brand-secondary hover:underline">
            privacy best practices guide
          </Link>{" "}
          before uploading sensitive documents. Prefer cropping IDs tightly when you only need a face or signature.
        </p>

        <h3 className="mt-10 font-display text-xl font-bold text-brand-text sm:text-2xl">
          Limitations — when results need a second try
        </h3>
        <p className="mt-3 text-base leading-relaxed text-brand-muted">
          AI cutouts struggle with extreme motion blur, subjects blended into matching colors, or heavy
          compression. Busy group photos may leave fringe pixels. Retake with better lighting, crop closer to the
          subject, or try a different source file. Hair against similar tones may need a cleaner original. These
          limits are normal for free online removers — including paid tools in hard edge cases.
        </p>

        <h3 className="mt-10 font-display text-xl font-bold text-brand-text sm:text-2xl">
          Learn more on the blog
        </h3>
        <p className="mt-3 text-base leading-relaxed text-brand-muted">
          For step-by-step workflows, read{" "}
          <Link
            href="/blog/remove-background-without-photoshop"
            className="font-semibold text-brand-secondary hover:underline"
          >
            how to remove background without Photoshop
          </Link>
          ,{" "}
          <Link href="/blog/png-vs-jpg-which-format" className="font-semibold text-brand-secondary hover:underline">
            PNG vs JPG
          </Link>
          , and{" "}
          <Link
            href="/blog/remove-backgrounds-ecommerce-product-photos"
            className="font-semibold text-brand-secondary hover:underline"
          >
            ecommerce product photo tips
          </Link>
          . Visit{" "}
          <Link href="/about" className="font-semibold text-brand-secondary hover:underline">
            About
          </Link>{" "}
          to learn who builds {PRIMARY_KEYWORD_TITLE}, or{" "}
          <Link href="/contact" className="font-semibold text-brand-secondary hover:underline">
            Contact
          </Link>{" "}
          support if something fails.
        </p>

        <p className="mt-10 border-t border-brand-border pt-8 text-sm text-brand-muted">
          Ready to try? Open the{" "}
          <Link href="/remove-bg" className="font-semibold text-brand-secondary hover:underline">
            {PRIMARY_KEYWORD} tool
          </Link>{" "}
          or browse all{" "}
          <Link href="/use-cases" className="font-semibold text-brand-secondary hover:underline">
            use-case landing pages
          </Link>{" "}
          for upscale, enhance, blur, and more — no signup required.
        </p>
      </div>
    </SectionShell>
  );
}

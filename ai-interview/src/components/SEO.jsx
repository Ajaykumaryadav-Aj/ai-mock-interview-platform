// src/components/SEO.jsx
// Lightweight, zero-dependency SEO and meta tag manager for React + Vite (SPA)

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_URL, SITE_NAME, DEFAULT_SEO } from "@/config/site";

function setOrCreateMeta(attrName, attrVal, content) {
  let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrVal);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setOrCreateLink(rel, href) {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function setJsonLd(id, data) {
  let script = document.getElementById(id);
  if (!data) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

/**
 * Reusable SEO component for managing page titles, meta descriptions, canonical URLs,
 * Open Graph, Twitter cards, robots directives, and JSON-LD schemas.
 */
export const SEO = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  noindex = false,
  nofollow = false,
  structuredData,
  breadcrumbs,
}) => {
  const location = useLocation();

  useEffect(() => {
    // 1. Page Title
    const finalTitle = title
      ? title.includes(SITE_NAME)
        ? title
        : `${title} | ${SITE_NAME}`
      : DEFAULT_SEO.title;
    document.title = finalTitle;

    // 2. Meta Description
    const finalDesc = description || DEFAULT_SEO.description;
    setOrCreateMeta("name", "description", finalDesc);

    // 3. Robots directive
    const robotsContent = noindex
      ? "noindex, nofollow"
      : nofollow
      ? "index, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
    setOrCreateMeta("name", "robots", robotsContent);
    setOrCreateMeta("name", "googlebot", robotsContent);

    // 4. Canonical URL
    const finalCanonical = canonical
      ? canonical.startsWith("http")
        ? canonical
        : `${SITE_URL}${canonical.startsWith("/") ? canonical : `/${canonical}`}`
      : `${SITE_URL}${location.pathname}`;
    setOrCreateLink("canonical", finalCanonical);

    // 5. Open Graph Metadata
    const finalOgImage = ogImage || DEFAULT_SEO.ogImage;
    setOrCreateMeta("property", "og:title", finalTitle);
    setOrCreateMeta("property", "og:description", finalDesc);
    setOrCreateMeta("property", "og:url", finalCanonical);
    setOrCreateMeta("property", "og:type", ogType);
    setOrCreateMeta("property", "og:site_name", SITE_NAME);
    setOrCreateMeta("property", "og:image", finalOgImage);
    setOrCreateMeta("property", "og:locale", "en_US");

    // 6. Twitter / X Card Metadata
    setOrCreateMeta("name", "twitter:card", DEFAULT_SEO.twitterCard);
    setOrCreateMeta("name", "twitter:title", finalTitle);
    setOrCreateMeta("name", "twitter:description", finalDesc);
    setOrCreateMeta("name", "twitter:image", finalOgImage);

    // 7. Structured Data / JSON-LD
    if (structuredData) {
      setJsonLd("seo-structured-data", structuredData);
    } else {
      setJsonLd("seo-structured-data", null);
    }

    // 8. Breadcrumbs JSON-LD
    if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
      const breadcrumbListSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: crumb.name,
          item: crumb.item.startsWith("http") ? crumb.item : `${SITE_URL}${crumb.item}`,
        })),
      };
      setJsonLd("seo-breadcrumb-data", breadcrumbListSchema);
    } else {
      setJsonLd("seo-breadcrumb-data", null);
    }

    // Cleanup on unmount or route change
    return () => {
      // Optional: keep last title or let next component overwrite
    };
  }, [
    title,
    description,
    canonical,
    ogImage,
    ogType,
    noindex,
    nofollow,
    structuredData,
    breadcrumbs,
    location.pathname,
  ]);

  return null;
};

export default SEO;

import { useEffect } from "react";

/**
 * Custom React hook to dynamically update document title and description for SEO purposes.
 * 
 * @param {Object} seoOptions Options containing title and description strings.
 */
export function useSEO({ title, description, path }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);
    }

    // Dynamic canonical URL update
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    const origin = window.location.origin;
    const cleanPath = (path || window.location.pathname).replace(/\/$/, "");
    const canonicalUrl = `${origin}${cleanPath || "/"}`;
    canonicalLink.setAttribute("href", canonicalUrl);
  }, [title, description, path]);
}


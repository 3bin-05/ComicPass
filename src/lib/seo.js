import { useEffect } from "react";

/**
 * Custom React hook to dynamically update document title and description for SEO purposes.
 * 
 * @param {Object} seoOptions Options containing title and description strings.
 */
export function useSEO({ title, description }) {
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
  }, [title, description]);
}

import { SITE } from "@/data/site";

/* Structured data, rendered on the server so crawlers never need to run
   JavaScript to see it. `<` is escaped so no string in the data can ever
   close the script tag early. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/* Breadcrumbs for an inner page: Home › This page. */
export function Crumbs({ name, path }: { name: string; path: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name, item: `${SITE.url}${path}` },
        ],
      }}
    />
  );
}

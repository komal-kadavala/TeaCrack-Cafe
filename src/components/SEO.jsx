import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const siteUrl = import.meta.env.VITE_SITE_URL || 'https://teacrackcafe.vercel.app';
const defaultTitle = 'Teacrack Cafe | Cozy Cafe in Rajkot';
const defaultDescription = 'Teacrack Cafe in Rajkot serves fresh masala chai, coffee, sandwiches, burgers, pizza and garlic bread in a cozy, welcoming ambience.';
const defaultKeywords = 'Teacrack Cafe, cafe in Rajkot, veg cafe, masala chai, coffee, burgers, pizza, garlic bread, Rajkot Gujarat';
const defaultImage = `${siteUrl}/logo.jpg`;

const pageMeta = {
  '/': {
    title: 'Home',
    description: 'Discover Teacrack Cafe in Rajkot for fresh masala chai, signature coffee, burgers, pizza and cozy cafe vibes.',
    keywords: 'Teacrack Cafe, Rajkot cafe, masala chai, coffee house, burgers, pizza',
  },
  '/about': {
    title: 'About Us',
    description: 'Learn about Teacrack Cafe, our story, values, and why guests love our 100% veg menu in Rajkot.',
    keywords: 'about Teacrack Cafe, Rajkot cafe story, 100% veg cafe, cozy cafe',
  },
  '/menu': {
    title: 'Menu',
    description: 'Explore our full menu of drinks, food, pizza and breads at Teacrack Cafe in Rajkot.',
    keywords: 'Teacrack menu, cafe menu Rajkot, chai coffee menu, pizza bread menu',
  },
  '/gallery': {
    title: 'Gallery',
    description: 'Browse photos of Teacrack Cafe’s warm ambience, menu highlights and welcoming interior.',
    keywords: 'Teacrack gallery, cafe ambience Rajkot, interior photos',
  },
  '/reviews': {
    title: 'Reviews',
    description: 'Read customer reviews and share your experience at Teacrack Cafe in Rajkot.',
    keywords: 'Teacrack reviews, cafe reviews Rajkot, customer feedback',
  },
  '/contact': {
    title: 'Contact',
    description: 'Visit Teacrack Cafe in Rajkot or call us for orders, reservations and directions.',
    keywords: 'contact Teacrack Cafe, cafe in Rajkot, phone number, address',
  },
};

function upsertTag(tagName, attributes, parent = document.head) {
  let tag = parent.querySelector(tagName);
  if (!tag) {
    tag = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        tag.setAttribute(key, value);
      }
    });
    parent.appendChild(tag);
    return tag;
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      tag.setAttribute(key, value);
    } else {
      tag.removeAttribute(key);
    }
  });

  return tag;
}

function setMetaTag(name, content, attr = 'name') {
  if (!content) return;
  upsertTag('meta', { [attr]: name, content });
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  path,
  type = 'website',
  noIndex = false,
}) {
  const location = useLocation();
  const pathname = path || location.pathname;

  useEffect(() => {
    const meta = pageMeta[pathname] || {};
    const resolvedTitle = title || meta.title || defaultTitle;
    const finalTitle = resolvedTitle.includes('Teacrack') ? resolvedTitle : `${resolvedTitle} | Teacrack Cafe`;
    const resolvedDescription = description || meta.description || defaultDescription;
    const resolvedKeywords = keywords || meta.keywords || defaultKeywords;
    const resolvedImage = image ? `${siteUrl}${image.startsWith('/') ? image : `/${image}`}` : defaultImage;
    const canonicalUrl = `${siteUrl}${pathname === '/' ? '' : pathname}`;

    document.title = finalTitle;
    setMetaTag('description', resolvedDescription);
    setMetaTag('keywords', resolvedKeywords);
    setMetaTag('author', 'Teacrack Cafe');
    setMetaTag('robots', noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    setMetaTag('language', 'en');
    setMetaTag('theme-color', '#1a3a3a');

    upsertTag('link', { rel: 'canonical', href: canonicalUrl });
    upsertTag('link', { rel: 'alternate', hreflang: 'en', href: canonicalUrl });
    upsertTag('meta', { property: 'og:title', content: finalTitle });
    upsertTag('meta', { property: 'og:description', content: resolvedDescription });
    upsertTag('meta', { property: 'og:image', content: resolvedImage });
    upsertTag('meta', { property: 'og:url', content: canonicalUrl });
    upsertTag('meta', { property: 'og:type', content: type });
    upsertTag('meta', { property: 'og:site_name', content: 'Teacrack Cafe' });
    upsertTag('meta', { name: 'twitter:card', content: 'summary_large_image' });
    upsertTag('meta', { name: 'twitter:title', content: finalTitle });
    upsertTag('meta', { name: 'twitter:description', content: resolvedDescription });
    upsertTag('meta', { name: 'twitter:image', content: resolvedImage });
    upsertTag('meta', { name: 'twitter:site', content: '@teacrackcafe' });

    const existingScript = document.querySelector('script[data-seo-schema]');
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Teacrack Cafe',
      description: resolvedDescription,
      url: canonicalUrl,
      telephone: '+91-92743-28677',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rajkot, Gujarat',
        addressLocality: 'Rajkot',
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '09:00',
          closes: '23:00',
        },
      ],
      priceRange: '₹₹',
      servesCuisine: ['Cafe', 'Coffee', 'Pizza', 'Sandwiches', 'Burgers', 'Vegetarian Food'],
      cuisine: 'Vegetarian',
      logo: `${siteUrl}/logo.jpg`,
      image: [resolvedImage, `${siteUrl}/inside.jpg`],
      hasMap: 'https://maps.app.goo.gl/MmhBj8DRSeyFwsHGA',
      sameAs: ['https://maps.app.goo.gl/MmhBj8DRSeyFwsHGA'],
    };

    if (existingScript) {
      existingScript.textContent = JSON.stringify(schema);
    } else {
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo-schema', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [description, image, keywords, noIndex, pathname, title, type]);

  return null;
}

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://crithit.gg';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/notifications', '/diary'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://leaveflow.com'

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login'],
      disallow: ['/dashboard/', '/settings/', '/api/', '/leads/', '/leaves/', '/employees/', '/reports/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

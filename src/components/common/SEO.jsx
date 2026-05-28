import React from 'react'
import { Helmet } from 'react-helmet-async'

const siteDefaults = {
  siteName: 'GiftsBhejo',
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://example.com',
  defaultTitle: 'GiftsBhejo - Delivering Love & Joy',
  defaultDescription: 'GiftsBhejo - Send thoughtful gifts and surprises. Fast delivery across regions.',
  defaultImage: '/images/giftsbhejo-logo.png',
  twitterHandle: '@GiftsBhejo'
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  canonical,
  schemaMarkup
}) {
  const finalTitle = title ? `${title} | ${siteDefaults.siteName}` : siteDefaults.defaultTitle
  const finalDescription = description || siteDefaults.defaultDescription
  const finalImage = image || siteDefaults.defaultImage
  const finalUrl = url || siteDefaults.siteUrl
  const finalCanonical = canonical || finalUrl

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={finalCanonical} />

      {/* Open Graph */}
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteDefaults.siteName} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={siteDefaults.twitterHandle} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Basic robots instruction (can be overridden) */}
      <meta name="robots" content="index, follow" />

      {/* Structured data (JSON-LD) */}
      {schemaMarkup ? (
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
      ) : (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteDefaults.siteName,
            "url": siteDefaults.siteUrl,
            "logo": siteDefaults.defaultImage
          })}
        </script>
      )}
    </Helmet>
  )
}

import React from 'react'

/**
 * JsonLd component for injecting JSON-LD structured data into the <head>
 * This helps search engines understand the context of the page (SoftwareApplication, Organization, etc.)
 */
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

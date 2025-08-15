interface MetadataProps {
  title: string;
  description: string;
  path: string;
  canonical?: string;
  schemaData?: Record<string, unknown>;
}

export function Metadata({ title, description, path, canonical, schemaData }: MetadataProps) {
  const siteUrl = "https://kids-math.com";
  const canonicalUrl = canonical || `${siteUrl}${path}`;
  const imageUrl = `${siteUrl}/og-image.jpg`;

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": ["WebSite", "WebApplication"],
    "name": title,
    "description": description,
    "inLanguage": "en",
    "applicationCategory": "EducationalApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student",
      "ageRange": "5-12"
    },
    "teaches": [
      "Number Sense",
      "Addition",
      "Subtraction",
      "Multiplication",
      "Division"
    ],
    "publisher": {
      "@type": "Organization",
      "name": "EasyMath"
    }
  };

  const finalSchema = { ...defaultSchema, ...schemaData };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="kids math games, math practice, number sense, addition games, subtraction games, multiplication games, division games, educational games" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      <link rel="canonical" href={canonicalUrl} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(finalSchema)
        }}
      />
    </>
  );
}
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
  const baseKeywords = [
    "EasyMath AI",
    "kids math games",
    "adaptive math practice",
    "math learning analytics",
    "addition games",
    "number sense activities",
    "bilingual math practice",
  ];

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": ["WebSite", "WebApplication"],
    "name": title,
    "alternateName": "EasyMath AI",
    "description": description,
    "inLanguage": ["zh-CN", "en-US"],
    "url": canonicalUrl,
    "applicationCategory": "EducationalApplication",
    "isFamilyFriendly": true,
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
      "name": "EasyMath",
      "url": siteUrl
    }
  };

  const finalSchema = { ...defaultSchema, ...schemaData };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={baseKeywords.join(", ")} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="EasyMath AI Team" />
      <meta name="publisher" content="EasyMath AI" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="EasyMath AI" />
      <meta property="og:locale" content="zh_CN" />

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

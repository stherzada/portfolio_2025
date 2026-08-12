import type { MetaData } from "@/types/Metadata"

export function useMeta() {
  const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
    const element = document.querySelector(`meta[${attribute}="${name}"]`)
    if (element) {
      element.setAttribute('content', content)
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute(attribute, name)
      meta.setAttribute('content', content)
      document.head.appendChild(meta)
    }
  }

  const updateTitle = (title: string) => {
    document.title = title
  }

  const updateCanonical = (url: string) => {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (canonical) {
      canonical.href = url
    } else {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      canonical.href = url
      document.head.appendChild(canonical)
    }
  }

  const setMeta = (metaData: MetaData) => {
    if (metaData.title) {
      updateTitle(metaData.title)
    }

    if (metaData.description) {
      updateMetaTag('description', metaData.description)
    }
    if (metaData.canonical) {
      updateCanonical(metaData.canonical)
    }

    if (metaData.ogTitle) {
      updateMetaTag('og:title', metaData.ogTitle, 'property')
    }
    if (metaData.ogDescription) {
      updateMetaTag('og:description', metaData.ogDescription, 'property')
    }
    if (metaData.ogImage) {
      updateMetaTag('og:image', metaData.ogImage, 'property')
    }
    if (metaData.ogType) {
      updateMetaTag('og:type', metaData.ogType, 'property')
    }
    if (metaData.ogUrl) {
      updateMetaTag('og:url', metaData.ogUrl, 'property')
    }

    if (metaData.twitterTitle) {
      updateMetaTag('twitter:title', metaData.twitterTitle)
    }
    if (metaData.twitterDescription) {
      updateMetaTag('twitter:description', metaData.twitterDescription)
    }
    if (metaData.twitterImage) {
      updateMetaTag('twitter:image', metaData.twitterImage)
    }
  }

  return {
    setMeta,
    updateTitle,
    updateMetaTag,
    updateCanonical
  }
}

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
  }

  return {
    setMeta,
    updateTitle,
    updateMetaTag,
    updateCanonical
  }
}

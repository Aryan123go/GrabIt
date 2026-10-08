import { useEffect, useState } from 'react'

const earbudsImage = 'https://images.unsplash.com/photo-1674230506510-1076217561b6?auto=format&fit=crop&w=800&q=80'
const unavailableImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="#e9ece7"/><g fill="none" stroke="#8a958d" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M330 220h140a55 55 0 0 1 55 55v125a35 35 0 0 1-35 35H310a35 35 0 0 1-35-35V275a55 55 0 0 1 55-55Z"/><path d="M345 220v95m110-95v95"/></g><text x="400" y="510" fill="#64736a" font-family="Arial,sans-serif" font-size="25" text-anchor="middle">IMAGE UNAVAILABLE</text></svg>'
)}`

function getProductImageSource(src, alt) {
  if (/\bear\s?buds?\b/i.test(alt || '')) return earbudsImage
  return src || unavailableImage
}

function ProductImage({ src, alt, className }) {
  const productImageSource = getProductImageSource(src, alt)
  const [imageSource, setImageSource] = useState(productImageSource)

  useEffect(() => {
    setImageSource(productImageSource)
  }, [productImageSource])

  const handleError = () => {
    setImageSource(unavailableImage)
  }

  return <img src={imageSource} alt={alt} className={className} onError={handleError} />
}

export default ProductImage

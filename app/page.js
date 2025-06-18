// ============================================================================
// FIXED: app/products/[slug]/page.js - SAFE getImageUrl FUNCTION
// ============================================================================

// 🔧 SAFE getImageUrl function that handles all data types
const getImageUrl = (imageUrl) => {
  console.log('🖼️ Processing image URL:', imageUrl, 'Type:', typeof imageUrl);
  
  // Handle null, undefined, or empty values
  if (!imageUrl) {
    console.log('🖼️ No image URL provided, using placeholder');
    return '/placeholder-product.jpg';
  }
  
  // Convert to string if it's not already a string
  let urlString;
  if (typeof imageUrl === 'string') {
    urlString = imageUrl;
  } else if (typeof imageUrl === 'object') {
    // Handle object cases (might have url property)
    if (imageUrl.url) {
      urlString = imageUrl.url;
      console.log('🖼️ Found URL in object:', urlString);
    } else if (imageUrl.src) {
      urlString = imageUrl.src;
      console.log('🖼️ Found src in object:', urlString);
    } else if (imageUrl.image) {
      urlString = imageUrl.image;
      console.log('🖼️ Found image in object:', urlString);
    } else {
      // Try to convert object to string or use first property
      const firstValue = Object.values(imageUrl)[0];
      if (typeof firstValue === 'string') {
        urlString = firstValue;
        console.log('🖼️ Using first object value:', urlString);
      } else {
        console.log('🖼️ Object has no usable URL, using placeholder');
        return '/placeholder-product.jpg';
      }
    }
  } else {
    // Convert other types to string
    urlString = String(imageUrl);
    console.log('🖼️ Converted to string:', urlString);
  }
  
  // Ensure we have a valid string
  if (!urlString || typeof urlString !== 'string') {
    console.log('🖼️ Invalid URL string, using placeholder');
    return '/placeholder-product.jpg';
  }
  
  // Trim whitespace
  urlString = urlString.trim();
  
  // Handle empty string after trimming
  if (!urlString) {
    console.log('🖼️ Empty URL after trimming, using placeholder');
    return '/placeholder-product.jpg';
  }
  
  // Check if it's already a complete URL
  if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
    console.log('🖼️ Using complete URL:', urlString);
    return urlString;
  }
  
  // Check if it's a relative URL starting with /
  if (urlString.startsWith('/')) {
    console.log('🖼️ Using relative URL:', urlString);
    return urlString;
  }
  
  // Convert relative path to absolute URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
  const fullUrl = `${baseUrl}${urlString.startsWith('/') ? '' : '/'}${urlString}`;
  console.log('🖼️ Creating full URL:', fullUrl);
  return fullUrl;
};

// ============================================================================
// ALTERNATIVE: More Robust getImageUrl Function
// ============================================================================

const getImageUrlRobust = (imageInput) => {
  console.log('🖼️ Processing image input:', { imageInput, type: typeof imageInput });
  
  try {
    // Handle null/undefined
    if (imageInput == null) {
      return '/placeholder-product.jpg';
    }
    
    // Handle string
    if (typeof imageInput === 'string') {
      return processImageString(imageInput);
    }
    
    // Handle array (take first item)
    if (Array.isArray(imageInput)) {
      if (imageInput.length > 0) {
        return getImageUrlRobust(imageInput[0]);
      }
      return '/placeholder-product.jpg';
    }
    
    // Handle object
    if (typeof imageInput === 'object') {
      // Common object properties for images
      const possibleKeys = ['url', 'src', 'image', 'file', 'path', 'href'];
      
      for (const key of possibleKeys) {
        if (imageInput[key]) {
          return getImageUrlRobust(imageInput[key]);
        }
      }
      
      // If object has a toString method that returns a useful value
      const stringValue = String(imageInput);
      if (stringValue !== '[object Object]' && stringValue.length > 0) {
        return processImageString(stringValue);
      }
    }
    
    // Handle number or other types
    const stringValue = String(imageInput);
    if (stringValue && stringValue !== 'undefined' && stringValue !== 'null') {
      return processImageString(stringValue);
    }
    
    return '/placeholder-product.jpg';
    
  } catch (error) {
    console.error('🖼️ Error processing image URL:', error);
    return '/placeholder-product.jpg';
  }
};

const processImageString = (urlString) => {
  if (!urlString || typeof urlString !== 'string') {
    return '/placeholder-product.jpg';
  }
  
  urlString = urlString.trim();
  
  if (!urlString) {
    return '/placeholder-product.jpg';
  }
  
  // Complete URLs
  if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
    return urlString;
  }
  
  // Relative URLs starting with /
  if (urlString.startsWith('/')) {
    return urlString;
  }
  
  // Convert to absolute URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
  return `${baseUrl}/${urlString}`;
};

// ============================================================================
// EXAMPLE USAGE IN YOUR PRODUCT PAGE
// ============================================================================

// Replace your existing getImageUrl function with this:

const ProductDetail = ({ product }) => {
  // ... other code ...

  // 🔧 SAFE IMAGE PROCESSING
  const getImageUrl = (imageInput) => {
    console.log('🖼️ Processing image:', { imageInput, type: typeof imageInput });
    
    // Handle null/undefined
    if (imageInput == null) {
      return '/placeholder-product.jpg';
    }
    
    // Convert to string safely
    let urlString;
    try {
      if (typeof imageInput === 'string') {
        urlString = imageInput;
      } else if (typeof imageInput === 'object') {
        // Handle object with image properties
        urlString = imageInput.url || imageInput.src || imageInput.image || imageInput.file;
        if (!urlString) {
          // Try to stringify the object
          const stringified = String(imageInput);
          if (stringified !== '[object Object]') {
            urlString = stringified;
          }
        }
      } else {
        urlString = String(imageInput);
      }
    } catch (error) {
      console.error('🖼️ Error converting image to string:', error);
      return '/placeholder-product.jpg';
    }
    
    // Validate string
    if (!urlString || typeof urlString !== 'string') {
      return '/placeholder-product.jpg';
    }
    
    urlString = urlString.trim();
    
    if (!urlString) {
      return '/placeholder-product.jpg';
    }
    
    // Process the URL string
    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      return urlString;
    }
    
    if (urlString.startsWith('/')) {
      return urlString;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app';
    return `${baseUrl}/${urlString}`;
  };

  // Safe image gallery component
  const ImageGallery = ({ images, productName }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    
    // Process images safely
    const processedImages = [];
    
    if (images && Array.isArray(images)) {
      images.forEach((image, index) => {
        const url = getImageUrl(image);
        if (url) {
          processedImages.push(url);
        }
      });
    }
    
    // If no valid images, add placeholder
    if (processedImages.length === 0) {
      processedImages.push('/placeholder-product.jpg');
    }

    return (
      <div className="space-y-4">
        {/* Main Image */}
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={processedImages[selectedImageIndex]}
            alt={productName || 'Product image'}
            width={500}
            height={500}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('🖼️ Image failed to load:', e.target.src);
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </div>

        {/* Thumbnail Gallery */}
        {processedImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {processedImages.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`aspect-square overflow-hidden rounded-md border-2 ${
                  index === selectedImageIndex 
                    ? 'border-orange-500' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Image
                  src={imageUrl}
                  alt={`${productName} ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ... rest of your component
};

// ============================================================================
// DEBUGGING: Check what your image data looks like
// ============================================================================



// This will help you understand the exact structure of your image data
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

const fallbackImage =
  "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";

const ImageWithFallback = ({
  src,
  img,
  fallback = fallbackImage,
  alt = "image",
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset error state when src changes
    setHasError(false);
    setImgSrc(src || fallback);
  }, [src]);

  // If using regular img tag (for legacy support)
  if (img) {
    const { className: propClassName, style: propStyle, ...restProps } = props;
    const mergedClassName = `transition duration-150 ease-linear ${propClassName || ""}`;
    const mergedStyle = {
      width: "100%",
      height: "100%",
      ...propStyle,
    };
    
    return (
      <img
        src={hasError ? fallback : imgSrc}
        onError={() => {
          if (!hasError && imgSrc !== fallback) {
            setHasError(true);
            setImgSrc(fallback);
          }
        }}
        alt={alt}
        {...restProps}
        className={mergedClassName}
        style={mergedStyle}
      />
    );
  }

  // For Next.js Image component - use key to force re-render on error
  const imageSrc = hasError || !src ? fallback : (src || fallback);
  
  // Extract className and style to merge properly
  const { className: propClassName, style: propStyle, ...restProps } = props;
  const mergedClassName = `object-contain transition duration-150 ease-linear transform group-hover:scale-105 p-2 ${propClassName || ""}`;
  const mergedStyle = {
    objectFit: "contain",
    ...propStyle,
  };

  return (
    <Image
      key={imageSrc} // Force re-render when src changes
      src={imageSrc}
      alt={alt}
      onError={() => {
        if (!hasError && imageSrc !== fallback) {
          setHasError(true);
        }
      }}
      unoptimized={false}
      {...restProps}
      className={mergedClassName}
      style={mergedStyle}
    />
  );
};

export default ImageWithFallback;

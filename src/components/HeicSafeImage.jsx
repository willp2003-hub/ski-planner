import { useState } from "react";
import heic2any from "heic2any";

function isHeicUrl(url) {
  try {
    return /\.(heic|heif)/i.test(decodeURIComponent(url));
  } catch {
    return /\.(heic|heif)/i.test(url);
  }
}

function HeicSafeImage({ src, alt, className, onClick }) {
  const [displaySrc, setDisplaySrc] = useState(src);
  const [converting, setConverting] = useState(false);

  const handleError = async () => {
    if (converting || !isHeicUrl(src)) return;
    setConverting(true);
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const converted = await heic2any({ blob, toType: "image/jpeg", quality: 0.85 });
      const result = Array.isArray(converted) ? converted[0] : converted;
      setDisplaySrc(URL.createObjectURL(result));
    } catch {
      // leave broken image as-is
    }
  };

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={handleError}
    />
  );
}

export default HeicSafeImage;

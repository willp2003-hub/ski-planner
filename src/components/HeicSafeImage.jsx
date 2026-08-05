import { useState } from "react";
import heic2any from "heic2any";

function HeicSafeImage({ src, alt, className, onClick }) {
  const [displaySrc, setDisplaySrc] = useState(src);
  const [attempted, setAttempted] = useState(false);

  const handleError = async () => {
    if (attempted) return;
    setAttempted(true);
    try {
      const res = await fetch(src);
      if (!res.ok) return;
      const blob = await res.blob();
      // Convert if the actual content is HEIC/HEIF regardless of URL extension
      if (!blob.type.includes("heic") && !blob.type.includes("heif")) return;
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

import { useState, type ImgHTMLAttributes } from "react";
import { optimizedSrc, buildSrcSet, canOptimize } from "../utils/images";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  src?: string;
  /** Rendered width in CSS pixels. Drives both the default variant and the srcset ceiling. */
  width?: number;
  /** Overrides the responsive ladder when a slot has an unusual size. */
  widths?: number[];
  quality?: number;
  /** Set on above-the-fold images: skips lazy loading and raises fetch priority. */
  priority?: boolean;
}

/**
 * Drop-in <img> that serves WebP through /api/img with a responsive srcset and lazy
 * loading. If the optimizer fails for any reason the component falls back to the
 * original URL, so a bad transform degrades to "as slow as before", never to a blank box.
 */
export default function OptimizedImage({
  src,
  width,
  widths,
  quality,
  priority = false,
  sizes,
  alt = "",
  ...rest
}: OptimizedImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src) return <img alt={alt} {...rest} />;

  const useOptimizer = !failed && canOptimize(src);
  const resolvedSrc = useOptimizer ? optimizedSrc(src, { width, quality }) : src;
  const srcSet = useOptimizer ? buildSrcSet(src, { width, quality, widths }) : undefined;

  return (
    <img
      {...rest}
      src={resolvedSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes || (width ? `${width}px` : "100vw") : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
    />
  );
}

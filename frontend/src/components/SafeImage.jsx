import React, { useEffect, useState } from 'react';
import { resolveImageUrl, PLACEHOLDER_IMAGE } from '../utils/categories.js';

/**
 * <img> that never shows the browser's broken-image icon.
 * If the photo can't be loaded (deleted file, wrong URL, server asleep,
 * offline) it swaps to a neat bundled "Photo coming soon" picture.
 *
 * `src` is the raw value saved in the database. `width` asks Cloudinary for a
 * smaller copy (cards use 600, the detail gallery uses 1000).
 */
export default function SafeImage({ src, alt = '', width, className = '', ...rest }) {
  const resolved = resolveImageUrl(src, width);
  const [failed, setFailed] = useState(false);

  // a new photo -> try it again
  useEffect(() => setFailed(false), [resolved]);

  return (
    <img
      src={failed ? PLACEHOLDER_IMAGE : resolved}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}

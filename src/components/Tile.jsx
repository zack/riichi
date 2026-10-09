import { useEffect, useRef, useState } from 'react';

import { getTileTextClass } from '../scripts/TileText';

// How long (in ms) a drawing gets before the tile's name is printed in its
// place. Even a cached drawing isn't there the instant it's requested, so
// without the wait every tile would flash its name for a frame or two.
const SLOW_AFTER = 250;

// We keep the path that failed (or is slow) instead of a boolean, because the
// next hand reuses this component for a different drawing, and that one gets
// its own try
function Tile({ alt, called, label, path, text, winning }) {
  const [failedPath, setFailedPath] = useState(null);
  const [slowPath, setSlowPath] = useState(null);
  const imageRef = useRef(null);
  const failed = failedPath === path;
  const slow = slowPath === path && !failed;

  useEffect(() => {
    const image = imageRef.current;
    if (image.complete) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (!image.complete) {
        setSlowPath(path);
      }
    }, SLOW_AFTER);

    return () => clearTimeout(timer);
  }, [path]);

  const classNames = ['tile'];
  if (called) {
    classNames.push('called');
  }
  if (failed) {
    classNames.push('failed');
  }
  if (slow) {
    classNames.push('slow');
  }
  if (winning) {
    classNames.push('winning');
  }

  return (
    <span className='tile-cell'>
      <span className={classNames.join(' ')}>
        <img
          alt={alt}
          key={path}
          onError={() => setFailedPath(path)}
          onLoad={() => setSlowPath(null)}
          ref={imageRef}
          src={path}
        />
        {(failed || slow) && (
          <span aria-hidden='true' className={getTileTextClass(text)}>
            {text}
          </span>
        )}
      </span>
      {typeof label === 'string' && (
        <span aria-hidden='true' className='tile-label'>
          {label}
        </span>
      )}
    </span>
  );
}

export { Tile };

import { useState } from 'react';

import { getTileTextClass } from '../scripts/TileText';

// We keep the path that failed (or is slow) instead of a boolean, because the
// next hand reuses this component for a different drawing, and that one gets
// its own try
function Tile({ alt, called, label, path, text, winning }) {
  const [failedPath, setFailedPath] = useState(null);
  const failed = failedPath === path;

  const classNames = ['tile'];
  if (called) {
    classNames.push('called');
  }
  if (failed) {
    classNames.push('failed');
  }
  if (winning) {
    classNames.push('winning');
  }

  return (
    <span className='tile-cell'>
      <span className={classNames.join(' ')}>
        <img alt={alt} onError={() => setFailedPath(path)} src={path} />
        {failed && (
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

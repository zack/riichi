function Tile({ alt, called, label, path, winning }) {
  const classNames = ['tile'];
  if (called) {
    classNames.push('called');
  }
  if (winning) {
    classNames.push('winning');
  }

  return (
    <span className='tile-cell'>
      <span className={classNames.join(' ')}>
        <img alt={alt} src={path} />
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

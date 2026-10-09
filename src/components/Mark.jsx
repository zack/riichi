import { MARK_PATHS } from '../scripts/Marks';

const Mark = ({ name, result }) => (
  <svg
    aria-hidden={name ? undefined : 'true'}
    aria-label={name}
    className={`mark ${result}-mark`}
    fill='none'
    role={name ? 'img' : undefined}
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    viewBox='0 0 24 24'
  >
    <path d={MARK_PATHS[result]} />
  </svg>
);

export { Mark };

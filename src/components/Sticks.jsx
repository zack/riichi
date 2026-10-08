const RiichiStick = () => (
  <svg aria-hidden='true' className='riichi-stick' viewBox='0 0 64 10'>
    <rect height='9' rx='4.5' width='63' x='0.5' y='0.5' />
    <circle cx='32' cy='5' r='2.2' />
  </svg>
);

const MAX_COUNTABLE_HONBA = 3;

const HONBA_STICK_GAP = 2;
const HONBA_STICK_HEIGHT = 5;
const HONBA_STICK_WIDTH = 36;
const HONBA_DOT_COLUMNS = [13.5, 16.5, 19.5, 22.5];
const HONBA_DOT_ROWS = [1.6, 3.4];

const HonbaSticks = ({ count }) => {
  const sticks = Array.from({ length: count }, (_stick, index) => index);
  const height = count * HONBA_STICK_HEIGHT + (count - 1) * HONBA_STICK_GAP;

  return (
    <svg
      aria-label={count}
      className='honba-sticks'
      role='img'
      viewBox={`0 0 ${HONBA_STICK_WIDTH} ${height}`}
    >
      {sticks.map((stick) => {
        const top = stick * (HONBA_STICK_HEIGHT + HONBA_STICK_GAP);

        return (
          <g key={stick}>
            <rect
              height={HONBA_STICK_HEIGHT - 1}
              rx={(HONBA_STICK_HEIGHT - 1) / 2}
              width={HONBA_STICK_WIDTH - 1}
              x='0.5'
              y={top + 0.5}
            />
            {HONBA_DOT_ROWS.map((row) =>
              HONBA_DOT_COLUMNS.map((column) => (
                <circle
                  cx={column}
                  cy={top + row}
                  key={`${row}-${column}`}
                  r='0.6'
                />
              )),
            )}
          </g>
        );
      })}
    </svg>
  );
};

const HonbaCount = ({ count, showNames }) => (
  <span className='tile-cell honba'>
    <span className='info-number'>
      <HonbaSticks count={count} />
    </span>
    {(showNames || count > MAX_COUNTABLE_HONBA) && (
      <span
        aria-hidden='true'
        className={`tile-label ${showNames ? '' : 'floating'}`}
      >
        {count > MAX_COUNTABLE_HONBA && `(${count})`}
      </span>
    )}
  </span>
);

export { HonbaCount, RiichiStick };

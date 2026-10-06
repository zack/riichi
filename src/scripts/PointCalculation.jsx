import {
  MANGAN_BASIC_POINTS,
  getBasicPoints,
  getLimit,
  getLimitBasicPoints,
  getRonMultiplier,
  getTsumoMultipliers,
  getUncappedBasicPoints,
  roundUpToHundred,
  roundsUpToMangan,
} from './ScoringTable';

const LABEL_SEPARATOR = ': ';

function splitStep(text) {
  const index = text.indexOf(LABEL_SEPARATOR);

  if (index === -1) {
    return { value: text };
  } else {
    return {
      label: text.slice(0, index),
      value: text.slice(index + LABEL_SEPARATOR.length),
    };
  }
}

function calculatePoints(agari, options, t) {
  const calculationSteps = [];
  let calculationStepsDealer = [];

  //Initialise Point totals
  let basicPoints, pointValue, pointValueDealer;

  const han = parseInt(agari.han);
  const fu = parseInt(agari.fu);
  const isTsumo = agari.isTsumo;
  const isDealer = agari.isDealer;
  const isKiriageMangan = options.kiriageMangan;

  const testHonba = options.testHonba;
  const honbaSticks = agari.honbaSticks;
  const honbaPoints = honbaSticks * 300;
  const honbaPointsPerPlayer = getHonbaPoints(isTsumo, honbaPoints);

  //Calculate base points as a function of han and fu
  //Any calculation steps are also pushed into calculationSteps which will be displayed to the user
  calculationSteps.push({
    value: agari.han + ' ' + t('pointCalculations.han'),
  });
  switch (han) {
    case 1:
    case 2:
    case 3:
    case 4:
      basicPoints = getBasicPoints(han, fu, isKiriageMangan);
      calculationSteps.push({
        value: agari.fu + ' ' + t('pointCalculations.fu'),
      });
      calculationSteps.push({
        label: t('pointCalculations.basicPoints'),
        value: (
          <>
            {agari.fu} x 2
            <sup>
              {'2 + '}
              {agari.han}
            </sup>
          </>
        ),
      });
      calculationSteps.push({
        value: agari.fu + ' x ' + Math.pow(2, 2 + agari.han),
      });
      if (getUncappedBasicPoints(han, fu) > MANGAN_BASIC_POINTS) {
        calculationSteps.push({
          remark: t('pointCalculations.basicPointsLimited'),
        });
      }

      //KiriageMangan is a mode which rounds up points for certain han/fu values
      if (isKiriageMangan && roundsUpToMangan(han, fu)) {
        calculationSteps.push(splitStep(t('pointCalculations.kiriageMangan')));
      }
      break;
    default:
      basicPoints = getLimitBasicPoints(getLimit(han).mangans);
      break;
  }

  calculationSteps.push({
    label: t('pointCalculations.basicPoints'),
    value: basicPoints,
  });
  calculationStepsDealer = [].concat(calculationSteps);

  //Work out final points based on whether winner is dealer / whether it was tsumo
  const [tsumoMultiplier, tsumoMultiplierDealer] =
    getTsumoMultipliers(isDealer);
  const pointMultiplier = isTsumo
    ? tsumoMultiplier
    : getRonMultiplier(isDealer);
  const unroundedPointValue = basicPoints * pointMultiplier;
  pointValue = roundUpToHundred(unroundedPointValue);
  const winTypeString = getWinTypeText(isTsumo, isDealer, t);

  addCalculationSteps(
    calculationSteps,
    winTypeString,
    unroundedPointValue,
    pointMultiplier,
    pointValue,
    t,
  );

  if (isTsumo && !isDealer) {
    pointValueDealer = roundUpToHundred(basicPoints * tsumoMultiplierDealer);

    addCalculationSteps(
      calculationStepsDealer,
      t('pointCalculations.tsumoDealer'),
      basicPoints * tsumoMultiplierDealer,
      tsumoMultiplierDealer,
      pointValueDealer,
      t,
    );
  }

  if (testHonba && honbaSticks > 0) {
    pointValue = pointValue + honbaPointsPerPlayer;
    pointValueDealer = pointValueDealer + honbaPointsPerPlayer;

    calculationSteps.push(
      splitStep(
        format(t('pointCalculations.honba'), pointValue, honbaPointsPerPlayer),
      ),
    );
    calculationStepsDealer.push(
      splitStep(
        format(
          t('pointCalculations.honba'),
          pointValueDealer,
          honbaPointsPerPlayer,
        ),
      ),
    );
  }

  return {
    pointValue: pointValue,
    pointValueDealer: pointValueDealer,
    calculationSteps: calculationSteps,
    calculationStepsDealer: calculationStepsDealer,
  };
}

function format(template, ...values) {
  let i = 0;
  return template.replace(/{}/g, function () {
    return typeof values[i] != 'undefined' ? values[i++] : '';
  });
}

function getWinTypeText(isTsumo, isDealer, t) {
  if (isTsumo && isDealer) {
    return t('pointCalculations.dealerTsumo');
  }
  if (!isTsumo && !isDealer) {
    return t('pointCalculations.ronNonDealer');
  }
  if (!isTsumo && isDealer) {
    return t('pointCalculations.dealerRon');
  }
  if (isTsumo && !isDealer) {
    return t('pointCalculations.tsumoNonDealer');
  }
}

function getHonbaPoints(isTsumo, honbaPoints) {
  if (isTsumo) {
    return honbaPoints / 3;
  } else {
    return honbaPoints;
  }
}

function addCalculationSteps(
  calculationSteps,
  winTypeString,
  unroundedPointValue,
  pointMultiplier,
  pointValue,
  t,
) {
  calculationSteps.push({
    label: winTypeString,
    value: format('{} (x{})', unroundedPointValue, pointMultiplier),
  });

  if (unroundedPointValue !== pointValue) {
    calculationSteps.push(
      splitStep(
        format(
          t('pointCalculations.roundUp'),
          pointValue,
          pointValue - unroundedPointValue,
        ),
      ),
    );
  }
}

export { calculatePoints };

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
  switch (parseInt(agari.han)) {
    case 1:
    case 2:
    case 3:
    case 4:
      basicPoints = Math.min(
        parseInt(agari.fu) * Math.pow(2, 2 + parseInt(agari.han)),
        2000,
      );
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
      if (parseInt(agari.fu) * Math.pow(2, 2 + parseInt(agari.han)) > 2000) {
        calculationSteps.push({
          remark: t('pointCalculations.basicPointsLimited'),
        });
      }

      //KiriageMangan is a mode which rounds up points for certain han/fu values
      if (isKiriageMangan) {
        if (
          (agari.han === 3 && agari.fu === '60')
          || (agari.han === 4 && agari.fu === '30')
        ) {
          basicPoints = 2000;
          calculationSteps.push(
            splitStep(t('pointCalculations.kiriageMangan')),
          );
        }
      }
      break;
    case 5:
      basicPoints = 2000;
      break;
    case 6:
    case 7:
      basicPoints = 3000;
      break;
    case 8:
    case 9:
    case 10:
      basicPoints = 4000;
      break;
    case 11:
    case 12:
      basicPoints = 6000;
      break;
    default:
      basicPoints = 8000;
      break;
  }

  calculationSteps.push({
    label: t('pointCalculations.basicPoints'),
    value: basicPoints,
  });
  calculationStepsDealer = [].concat(calculationSteps);

  //Work out final points based on whether winner is dealer / whether it was tsumo
  const pointMultiplier = getBasicPointsMultiplier(isTsumo, isDealer);
  const unroundedPointValue = basicPoints * pointMultiplier;
  pointValue = Math.ceil(unroundedPointValue / 100) * 100;
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
    pointValueDealer = Math.ceil((basicPoints * 2) / 100) * 100;

    addCalculationSteps(
      calculationStepsDealer,
      t('pointCalculations.tsumoDealer'),
      basicPoints * 2,
      2,
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

function getBasicPointsMultiplier(isTsumo, isDealer) {
  if (isTsumo && isDealer) {
    return 2;
  }
  if (!isTsumo && !isDealer) {
    return 4;
  }
  if (!isTsumo && isDealer) {
    return 6;
  }
  if (isTsumo && !isDealer) {
    return 1;
  }
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

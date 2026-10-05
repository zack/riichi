import { Flex, Heading } from '@radix-ui/themes';

import { useTranslation } from '../i18n/I18nContext';
import { ROUNDING, getExactFu } from '../scripts/QuizFields';
import * as YakuConversion from '../scripts/YakuConversion';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

const BreakdownLine = ({ label, value }) => (
  <>
    <span className='breakdown-label'>{label && `${label}:`}</span>
    <span className='breakdown-value'>{value}</span>
  </>
);

const CalculationSteps = ({ steps }) => (
  <div className='breakdown'>
    {steps.map((step, index) =>
      step.remark ? (
        <span className='breakdown-remark' key={index}>
          {step.remark}
        </span>
      ) : (
        <BreakdownLine key={index} label={step.label} value={step.value} />
      ),
    )}
  </div>
);

const Section = ({ children, title }) => (
  <Flex align='center' direction='column' gap='1'>
    <Heading as='h3' size='3'>
      {title}
    </Heading>
    {children}
  </Flex>
);

function AnswerKey({ agari, options, points }) {
  const { t } = useTranslation();
  const han = t('quiz.han').toLowerCase();
  const fu = t('quiz.fu').toLowerCase();
  const dealerPaysMore = agari.isTsumo && !agari.isDealer;

  const scoringYaku = Object.entries(agari.yakusAchieved).filter(
    ([_yakuId, value]) => Number(value) !== 0,
  );

  let fuAnswer;
  let fuDetails;
  let fuTitle;
  if (options.exactFu) {
    fuAnswer = getExactFu(agari);
    fuTitle = t('quiz.exactFu');
    fuDetails = agari.fu_details.filter((line) => line.reason !== ROUNDING);
  } else {
    fuAnswer = agari.fu;
    fuDetails = agari.fu_details;
    fuTitle = t('quiz.fu');
  }

  let pointsTitle;
  if (agari.isTsumo && agari.isDealer) {
    pointsTitle = t('quiz.pointsFromEach');
  } else if (agari.isTsumo) {
    pointsTitle = t('quiz.pointsFromNonDealer');
  } else {
    pointsTitle = t('quiz.points');
  }

  const hanAndFu = (
    <>
      {options.testHan && (
        <Section title={`${t('quiz.han')}: ${agari.han}`}>
          <div className='breakdown'>
            {scoringYaku.map(([yakuId, value]) => (
              <BreakdownLine
                key={yakuId}
                label={YakuConversion.YakuIdToName(yakuId, t)}
                value={`${value} ${han}`}
              />
            ))}
          </div>
        </Section>
      )}

      {options.testFu && (
        <Section title={`${fuTitle}: ${fuAnswer}`}>
          <div className='breakdown'>
            {fuDetails.map((line, index) => (
              <BreakdownLine
                key={index}
                label={t(
                  `fuDetails.${line.reason}`,
                  capitalizeFirstLetter(line.reason.replaceAll('_', ' ')),
                )}
                value={`${line.fu} ${fu}`}
              />
            ))}
          </div>
        </Section>
      )}
    </>
  );

  const pointsSections = (
    <>
      <Section title={`${pointsTitle}: ${points.pointValue}`}>
        <CalculationSteps steps={points.calculationSteps} />
      </Section>

      {dealerPaysMore && (
        <Section
          title={`${t('quiz.pointsFromDealer')}: ${points.pointValueDealer}`}
        >
          <CalculationSteps steps={points.calculationStepsDealer} />
        </Section>
      )}
    </>
  );

  const pointsGetOwnRow = options.testPoints && dealerPaysMore;

  return (
    <section className='color-card purple'>
      <Heading as='h2' size='4'>
        {t('quiz.realAnswer')}
      </Heading>
      <Flex className='answer-key' gapY='5' wrap='wrap'>
        {hanAndFu}
        {options.testPoints && !pointsGetOwnRow && pointsSections}
      </Flex>
      {pointsGetOwnRow && (
        <Flex className='answer-key' gapY='5' wrap='wrap'>
          {pointsSections}
        </Flex>
      )}
    </section>
  );
}

export { AnswerKey };

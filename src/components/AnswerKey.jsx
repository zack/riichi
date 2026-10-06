import { Flex, Heading, Text } from '@radix-ui/themes';

import { useTranslation } from '../i18n/I18nContext';
import { ROUNDING, fuHasNoAnswer, getExactFu } from '../scripts/QuizFields';
import { getFuWikiUrl, getYakuWikiUrl } from '../scripts/WikiLinks';
import * as YakuConversion from '../scripts/YakuConversion';
import { WikiLink } from './WikiLink';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

const BreakdownLine = ({ href, label, value }) => (
  <>
    <span className='breakdown-label'>
      {label && (
        <>
          <WikiLink href={href}>{label}</WikiLink>:
        </>
      )}
    </span>
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
  const { currentLanguage, t } = useTranslation();
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

  const showFu = options.testFu && !fuHasNoAnswer(agari, options);

  const hasLinks = currentLanguage === 'en' && (options.testHan || showFu);
  const breakdownClass =
    currentLanguage === 'en' ? 'breakdown linked' : 'breakdown';

  const hanAndFu = (
    <>
      {options.testHan && (
        <Section title={`${t('quiz.han')}: ${agari.han}`}>
          <div className={breakdownClass}>
            {scoringYaku.map(([yakuId, value]) => (
              <BreakdownLine
                href={getYakuWikiUrl(yakuId, currentLanguage)}
                key={yakuId}
                label={YakuConversion.YakuIdToName(yakuId, t)}
                value={`${value} ${han}`}
              />
            ))}
          </div>
        </Section>
      )}

      {showFu && (
        <Section title={`${fuTitle}: ${fuAnswer}`}>
          <div className={breakdownClass}>
            {fuDetails.map((line, index) => (
              <BreakdownLine
                href={getFuWikiUrl(line.reason, currentLanguage)}
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
      <Flex align='center' direction='column' gap='1'>
        <Heading as='h2' size='4'>
          {t('quiz.realAnswer')}
        </Heading>
        {hasLinks && (
          <Text as='p' color='gray' size='1'>
            {t('quiz.linksOpenNewTab')}
          </Text>
        )}
      </Flex>
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

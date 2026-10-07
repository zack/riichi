import { Flex, Heading, Text } from '@radix-ui/themes';

import { useTranslation } from '../i18n/I18nContext';
import { MARKS, MARK_NAMES } from '../scripts/Marks';
import {
  CORRECT,
  ROUNDING,
  WRONG,
  answerIsCorrect,
  fuHasNoAnswer,
  getExactFu,
  getGradedFields,
} from '../scripts/QuizFields';
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

const Total = ({ answers, field, graded, picked, title }) => {
  const { t } = useTranslation();
  let result;
  if (!graded) {
    result = undefined;
  } else if (answerIsCorrect(field, answers)) {
    result = CORRECT;
  } else {
    result = WRONG;
  }

  return (
    <>
      <Heading as='h3' className={`answer-total ${result ?? ''}`} size='3'>
        {title}
        {result && (
          <>
            {' '}
            <span aria-label={t(MARK_NAMES[result])} role='img'>
              {MARKS[result]}
            </span>
          </>
        )}
      </Heading>
      {result === WRONG && (
        <Text as='p' className='answer-picked' size='1'>
          {t('quiz.youPicked')} {picked ?? answers[field.id].trim()}
        </Text>
      )}
    </>
  );
};

const Section = ({ children, total }) => (
  <Flex align='center' direction='column' gap='1'>
    {total}
    {children}
  </Flex>
);

function AnswerKey({ agari, answers, fields, options, points }) {
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

  const gradedFields = getGradedFields(fields, answers);
  const getTotal = (fieldId, title, picked) => {
    const field = fields.find((each) => each.id === fieldId);

    return (
      <Total
        answers={answers}
        field={field}
        graded={gradedFields.includes(field)}
        picked={picked}
        title={title}
      />
    );
  };

  const fuField = fields.find((each) => each.id === 'fu');
  const fuIsGraded = gradedFields.includes(fuField);
  const pickedHanAndFu =
    !showFu && fuIsGraded
      ? `${answers.han} ${han} ${answers.fu.trim()} ${fu}`
      : undefined;

  const hanAndFu = (
    <>
      {options.testHan && (
        <Section
          total={getTotal(
            'han',
            `${t('quiz.han')}: ${agari.han}`,
            pickedHanAndFu,
          )}
        >
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
        <Section total={getTotal('fu', `${fuTitle}: ${fuAnswer}`)}>
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

  const pointsSteps = dealerPaysMore
    ? [
        ...points.calculationSteps,
        ...points.calculationStepsDealer.filter(
          (step) => !points.calculationSteps.includes(step),
        ),
      ]
    : points.calculationSteps;

  return (
    <>
      {hasLinks && (
        <Text as='p' color='gray' size='1'>
          {t('quiz.linksOpenNewTab')}
        </Text>
      )}
      <Flex className='answer-key' gapY='3' wrap='wrap'>
        {hanAndFu}
        {options.testPoints && (
          <Section
            total={getTotal('points', `${pointsTitle}: ${points.pointValue}`)}
          >
            {dealerPaysMore
              && getTotal(
                'pointsDealer',
                `${t('quiz.pointsFromDealer')}: ${points.pointValueDealer}`,
              )}
            <CalculationSteps steps={pointsSteps} />
          </Section>
        )}
      </Flex>
    </>
  );
}

export { AnswerKey };

import { readFileSync, readdirSync } from 'node:fs';

import { FU_CHOICE_ROWS, HAN_CHOICE_ROWS } from '../src/scripts/Choices.js';

const HANDS_DIR = new URL('../src/data/', import.meta.url);

function getChoices(choiceRows) {
  return choiceRows.flat().flatMap((group) => group.choices);
}

const hanChoices = getChoices(HAN_CHOICE_ROWS);
const fuChoices = getChoices(FU_CHOICE_ROWS);
const handFiles = readdirSync(HANDS_DIR).filter((file) =>
  file.endsWith('.json'),
);
const problems = [];

for (const file of handFiles) {
  const hand = JSON.parse(readFileSync(new URL(file, HANDS_DIR), 'utf8'));

  if (!hanChoices.includes(String(hand.han))) {
    problems.push(`${file}: ${hand.han} han isn't one of the choices`);
  }
  if (!fuChoices.includes(String(hand.fu))) {
    problems.push(`${file}: ${hand.fu} fu isn't one of the choices`);
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  console.error(`${problems.length} problems in ${handFiles.length} hands`);
  process.exit(1);
}

console.log(`All ${handFiles.length} hands have their han and fu as a choice`);

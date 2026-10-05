const FU_CHOICE_ROWS = [
  [
    { choices: ['20'] },
    { choices: ['25'] },
    { choices: ['30'] },
    { choices: ['40'] },
    { choices: ['50'] },
    { choices: ['60'] },
    { choices: ['70'] },
  ],
];

const HAN_CHOICE_ROWS = [
  [
    { choices: ['1'] },
    { choices: ['2'] },
    { choices: ['3'] },
    { choices: ['4'] },
    { choices: ['5'], limit: 'mangan' },
  ],
  [
    { choices: ['6', '7'], limit: 'haneman' },
    { choices: ['8', '9', '10'], limit: 'baiman' },
  ],
];

export { FU_CHOICE_ROWS, HAN_CHOICE_ROWS };

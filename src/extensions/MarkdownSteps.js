const STEP_CLASSES = [
  'tone-h1',
  'tone-h3',
  'tone-baiman',
  'tone-h4',
  'tone-yakuman',
  'tone-h2',
  'tone-gray sums',
];

export function getMarkdownSteps() {
  return {
    hooks: {
      postprocess: (html) => {
        const parts = html.split(/(?=<h2[ >])/);
        const before = parts[0].startsWith('<h2') ? '' : parts.shift();
        const steps = parts;
        const cards = steps.map(
          (step, index) =>
            `<section class="step ${STEP_CLASSES[index % STEP_CLASSES.length]}">${step}</section>`,
        );

        return `${before}<div class="steps">${cards.join('')}</div>`;
      },
    },
  };
}

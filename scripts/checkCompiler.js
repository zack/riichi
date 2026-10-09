// runs the compiler over every source file and fails if anything is skipped

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { transformAsync } from '@babel/core';

const SOURCE_DIR = new URL('../src/', import.meta.url);

const COMPILED = 'CompileSuccess';
const NOT_PROBLEMS = [COMPILED, 'Timing'];

const FUNCTION_NAME = /(?:function|const|let)\s+(\w+)/;

function getName(event, lines) {
  const startLine = event.fnLoc?.start?.line;
  const name = event.fnName ?? lines[startLine - 1]?.match(FUNCTION_NAME)?.[1];

  return name ?? `the function at line ${startLine}`;
}

function getDetail(event) {
  const detail = event.detail?.options ?? event.detail ?? {};
  const line = detail.loc?.start?.line ?? event.fnLoc?.start?.line;
  const reason = detail.reason ?? event.reason ?? event.data ?? event.kind;

  return { description: detail.description, line, reason };
}

const sourceFiles = readdirSync(SOURCE_DIR, { recursive: true }).filter(
  (file) => file.endsWith('.js') || file.endsWith('.jsx'),
);
const problems = [];
let compiledCount = 0;

for (const file of sourceFiles) {
  const code = readFileSync(new URL(file, SOURCE_DIR), 'utf8');
  const events = [];

  try {
    await transformAsync(code, {
      babelrc: false,
      configFile: false,
      filename: fileURLToPath(new URL(file, SOURCE_DIR)),
      parserOpts: { plugins: ['jsx'] },
      plugins: [
        [
          'babel-plugin-react-compiler',
          { logger: { logEvent: (_filename, event) => events.push(event) } },
        ],
      ],
    });
  } catch (error) {
    problems.push(`src/${file}: ${error.message}`);
  }

  for (const event of events) {
    if (event.kind === COMPILED) {
      compiledCount += 1;
    } else if (!NOT_PROBLEMS.includes(event.kind)) {
      const { description, line, reason } = getDetail(event);
      const name = getName(event, code.split('\n'));

      problems.push(
        `src/${file}:${line}: ${name} wasn't compiled (${event.kind}): ${reason}${description ? `. ${description}` : ''}`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  console.error(
    `${problems.length} problems, and ${compiledCount} of ${compiledCount + problems.length} components and hooks compiled`,
  );
  process.exit(1);
}

console.log(
  `All ${compiledCount} components and hooks in ${sourceFiles.length} files compiled`,
);

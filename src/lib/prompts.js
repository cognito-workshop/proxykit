import readline from 'node:readline';

export function prompt(questions) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answers = {};
    let i = 0;

    function ask() {
      if (i >= questions.length) {
        rl.close();
        resolve(answers);
        return;
      }

      const q = questions[i++];

      if (q.type === 'select') {
        rl.question(formatSelect(q), (input) => {
          const idx = parseInt(input, 10) - 1;
          if (idx >= 0 && idx < q.choices.length) {
            answers[q.name] = q.choices[idx];
          } else {
            answers[q.name] = q.default || q.choices[0];
          }
          ask();
        });
      } else {
        rl.question(formatText(q), (input) => {
          answers[q.name] = input.trim() || q.default || '';
          ask();
        });
      }
    }

    ask();
  });
}

function formatText(q) {
  const def = q.default ? ` ${q.default}` : '';
  return `${q.message}:${def} `;
}

function formatSelect(q) {
  const lines = [`\n${q.message}:`];
  q.choices.forEach((c, i) => {
    const marker = c === q.default ? ' (default)' : '';
    lines.push(`  ${i + 1}. ${c}${marker}`);
  });
  lines.push('');
  return lines.join('\n') + 'Enter choice: ';
}

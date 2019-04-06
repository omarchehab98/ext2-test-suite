const fs = require("fs");

const testSuite = fs
  .readdirSync(__dirname)
  .filter(x => x.startsWith("ext2"))
  .map(program => {
    const tests = fs
      .readdirSync(`${__dirname}/${program}`)
      .filter(x => x.endsWith("json"));
    return {
      program,
      tests: tests
        .map(test => require(`${__dirname}/${program}/${test}`))
        .map((test, i) => ({
          ...test,
          description: `src/tests/${program}/${i}.json: ${test.description || 'untitled test case'}`,
          preargs: test.preargs || [],
          args: test.args || []
        }))
    };
  });

module.exports = testSuite;

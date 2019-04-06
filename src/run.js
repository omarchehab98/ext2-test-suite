"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const testSuites = require("./tests");
const createCommand = require("./helpers/create_command");

// Expect a bin folder
// Either bin folder or create a symbolic link to your bin folder
const binaries = new Set(fs.readdirSync(`${__dirname}/bin`));

const mkdir = createCommand("/bin/mkdir");
const cp = createCommand("/bin/cp");
const rm = createCommand("/bin/rm");
const diff = createCommand(`/usr/bin/diff`);

const ext2Dump = createCommand(`${__dirname}/bin/ext2_dump`);


function resolveFixtures(arg) {
  if (arg.startsWith("fixture")) {
    return path.resolve(__dirname, arg);
  }
  return arg;
}


function writeGlobals(path) {
  const updated = fs
    .readFileSync(path, "utf8")
    .replace(/{{__dirname}}/g, __dirname);
  fs.writeFileSync(path, updated);
}


describe("csc369", function() {
  before(async function() {
    await rm("-rf", path.resolve(__dirname, "runs"));
  });

  testSuites.forEach(suite => {
    describe(suite.program, function() {
      if (!binaries.has(suite.program)) {
        console.warn(`Expected to find ${suite.program} in src/bin, skipping tests`)
      }

      const command = createCommand(`${__dirname}/bin/${suite.program}`);

      suite.tests.forEach(function(test, i) {
        const runTest = !binaries.has(suite.program) || test.skip ? it.skip : test.only ? it.only : it;

        runTest(test.description, async function() {
          const fixtureImage = path.resolve(
            __dirname,
            "fixtures/images",
            test.image
          );
          const runImage = path.resolve(
            __dirname,
            "runs",
            suite.program,
            `${i}.img`
          );
          const runFolder = path.resolve(__dirname, "runs", suite.program);

          await mkdir("-p", runFolder);

          const { stderrCp, codeCp } = await cp(fixtureImage, runImage);
          if (codeCp) throw new Error(stderrCp);

          const commandResult = await command(
            ...test.preargs,
            runImage,
            ...test.args.map(resolveFixtures)
          );

          const expectedDump = path.resolve(
            __dirname,
            `tests/${suite.program}/${i}.ans`
          );
          const actualDump = path.resolve(
            __dirname,
            `runs/${suite.program}/${i}.out`
          );

          const ext2DumpResult = await ext2Dump(runImage);
          assert.equal(ext2DumpResult.code, 0);

          fs.writeFileSync(
            actualDump,
            `<CODE> ${commandResult.code}
<STDOUT>
${commandResult.stdout}
<STDERR>
${commandResult.stderr}
` +
              (commandResult.code
                ? ""
                : `<IMAGE>
${ext2DumpResult.stdout}`)
          );

          writeGlobals(expectedDump);
          const diffResult = await diff("-wbB", actualDump, expectedDump);
          if (diffResult.code !== 0) {
            await cp(
              expectedDump,
              path.resolve(__dirname, `runs/${suite.program}/${i}.ans`)
            );
            throw new Error(
              `Snapshot does not match result
---
< Actual: ${actualDump}
> Expected: ${expectedDump}
---
${diffResult.stdout}\n${diffResult.stderr}`.trim()
            );
          } else {
            await rm("-rf", runImage);
            await rm("-rf", actualDump);
          }
        });
      });
    });
  });
});

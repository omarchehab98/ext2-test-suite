"use strict";
const util = require("util");
const exec = util.promisify(require("child_process").exec);

module.exports = createCommand;

function createCommand(program) {
  return async function command(...params) {
    try {
      const args = await Promise.all(params);
      const result = await exec(
        `'${[program]
          .concat(args)
          .map(escape)
          .join("' '")}'`
      );
      return {
        code: result.code || 0,
        stdout: result.stdout,
        stderr: result.stderr
      };
    } catch (err) {
      if (err.cmd) {
        return err;
      } else {
        throw err;
      }
    }
  };
}

function escape(arg) {
  return arg.replace(/'/g, "\\'");
}

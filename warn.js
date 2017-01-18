const assert = require('assert');
const chalk = require('chalk');

module.exports = function (evaluation, message) {
    try {
        assert(evaluation, message);
    } catch (e) {
        console.warn(chalk.yellow.bold('WARNING') + ':', e.message);
    }
};

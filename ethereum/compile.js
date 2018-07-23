const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const taskPath = path.resolve(__dirname, 'contracts', 'Task.sol');
const source = fs.readFileSync(taskPath, 'utf8');
const output = solc.compile(source, 1).contracts;

fs.ensureDir(buildPath);

for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(':', '') + '.json'),
    output[contract]
  );
}

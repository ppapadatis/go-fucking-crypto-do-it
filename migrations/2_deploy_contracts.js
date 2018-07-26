const TaskFactory = artifacts.require('./TaskFactory.sol');
const Task = artifacts.require('./Task.sol');

module.exports = function(deployer) {
  deployer.deploy(TaskFactory);
  deployer.deploy(Task);
};

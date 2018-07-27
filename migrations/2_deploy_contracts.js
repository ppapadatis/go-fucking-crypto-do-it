const Task = artifacts.require('./TaskCore.sol');

module.exports = (deployer) => {
  deployer.deploy(Task);
};

const TaskFactory = artifacts.require('./TaskFactory.sol');
const Task = artifacts.require('./Task.sol');

module.exports = (deployer, network, accounts) => {
  deployer.deploy(TaskFactory);
  deployer.deploy(Task, 'deploy', 1564177620, accounts[0], {
    from: accounts[0],
    value: '3000000000000000',
    gas: 4444444
  });
};

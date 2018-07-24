const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const compiledFactory = require('../ethereum/build/TaskFactory.json');
const compiledTask = require('../ethereum/build/Task.json');

const web3 = new Web3(ganache.provider());

let accounts;
let factory;
let taskAddress;
let task;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  await factory.methods.createTask('complete a task', '1563896088').send({
    from: accounts[0],
    value: web3.utils.toWei('3', 'finney'),
    gas: '1000000'
  });

  [taskAddress] = await factory.methods.getDeployedTasks().call();
  task = await new web3.eth.Contract(
    JSON.parse(compiledTask.interface),
    taskAddress
  );
});

describe('Task Tests', () => {
  it('deploys a factory and a task', () => {
    assert.ok(factory.options.address);
    assert.ok(task.options.address);
  });

  it('marks caller as the procrastinator', async () => {
    const procrastinator = await task.methods.procrastinator().call();
    assert.equal(accounts[0], procrastinator);
  });

  it('allows a procrastinator to set a supervisor', async () => {
    await task.methods.setSupervisor(accounts[1]).send({
      from: accounts[0],
      gas: '1000000'
    });

    const isSupervisor = await task.methods.supervisors(accounts[1]).call();
    assert(isSupervisor);
  });

  it('allows a supervisor to confirm a task', async () => {
    await task.methods.setSupervisor(accounts[1]).send({
      from: accounts[0],
      gas: '1000000'
    });

    await task.methods.confirmCompleteRequest().send({
      from: accounts[1],
      gas: '1000000'
    });

    const request = await task.methods.request().call();
    assert(request.approvalsCount > 0);
  });

  it('allows procrastinator to withdraw his stake', async () => {
    await task.methods.setSupervisor(accounts[1]).send({
      from: accounts[0],
      gas: '1000000'
    });

    await task.methods.confirmCompleteRequest().send({
      from: accounts[1],
      gas: '1000000'
    });

    await task.methods.finalizeCompleteRequest().send({
      from: accounts[0],
      gas: '1000000'
    });

    const request = await task.methods.request().call();
    assert(request.complete);
  });

  it('processes requests', async () => {
    // todo
  });

  it('returns the summary when requested', async () => {
    // todo
  });

  it('requires a minimum stake', async () => {
    // todo
  });

  it('requires a minimum date', async () => {
    // todo
  });
});

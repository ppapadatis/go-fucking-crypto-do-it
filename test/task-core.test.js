const debug = require('debug')('ck');
const BigNumber = require('bignumber.js');
const util = require('./util.js');
const taskCore = artifacts.require('./TaskCore');

contract('TaskCore', (accounts) => {
  before(() => util.measureGas(accounts));
  after(() => util.measureGas(accounts));

  if (util.isNotFocusTest('core')) return;

  const tomorrow = Date.now() + 24 * 60 * 60;
  const yesterday = Date.now() - 24 * 60 * 60;
  const nullAddress = '0x0000000000000000000000000000000000000000';
  const serviceOwner = accounts[0];
  const user = accounts[1];
  const supervisor1 = accounts[2];
  const supervisor2 = accounts[3];
  const newServiceOwner = accounts[4];
  const logEvents = [];
  const pastEvents = [];
  let coreC;

  after(function() {
    logEvents.forEach((ev) => ev.stopWatching());
  });

  async function deployContract() {
    await taskCore.deployed();
    coreC = await taskCore.new();

    const eventsWatch = coreC.allEvents();
    eventsWatch.watch((err, res) => {
      if (err) return;
      pastEvents.push(res);
      debug('>>', res.event, res.args);
    });
    logEvents.push(eventsWatch);
  }

  describe('initial state', () => {
    before(deployContract);

    it('deploys the contract', async () => {
      assert(taskCore.address);
    });

    it('assigns the creator as a service owner', async () => {
      const owner = await coreC.serviceOwner();
      assert.equal(owner, serviceOwner);
    });
  });

  describe('access control functionality', () => {
    before(deployContract);

    it('transfers ownership to another address', async () => {
      await coreC.transferOwnership(newServiceOwner);
      const owner = await coreC.serviceOwner();
      assert.equal(owner, newServiceOwner);
    });
  });

  describe('core functionality', () => {
    before(deployContract);

    it('creates a new task', async () => {
      await coreC.createTask('goal', tomorrow, {
        from: user,
        value: web3.toWei('2', 'finney'),
      });

      assert(coreC.ownershipTaskCount[user] > 0);
    });

    it('returns task details by id', async () => {
      const taskC = await coreC.createTask('goal', tomorrow, {
        from: user,
        value: web3.toWei('2', 'finney'),
      });

      const details = await taskC.getTask(0).call();
      assert(details);
    });

    it('denies a task if the user is null', async () => {
      try {
        await coreC.createTask('goal', tomorrow, {
          from: nullAddress,
          value: web3.toWei('2', 'finney'),
        });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies a task if the user payes less than the minimum', async () => {
      try {
        await coreC.createTask('goal', tomorrow, {
          from: user,
          value: web3.toWei('1', 'finney'),
        });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies a task if the user does not speficy a goal', async () => {
      try {
        await coreC.createTask(null, tomorrow, {
          from: user,
          value: web3.toWei('2', 'finney'),
        });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies a task if the user specifies a date earlier than today', async () => {
      try {
        await coreC.createTask('goal', yesterday, {
          from: user,
          value: web3.toWei('2', 'finney'),
        });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });
  });

  describe('base functionality', () => {
    before(deployContract);
  });

  describe('ownership functionality', () => {
    before(deployContract);
  });

  // it('allows a procrastinator to set a supervisor', async () => {
  //   await factory.deployed();
  //   const task = await factory
  //     .createTask('complete a task', tomorrow)
  //     .send({
  //       from: accounts[0],
  //       value: web3.utils.toWei('3', 'finney'),
  //       gas: '1000000',
  //     });

  //   await task.setSupervisor(accounts[1]).send({
  //     from: accounts[0],
  //     gas: '1000000',
  //   });

  //   const isSupervisor = await task.supervisors(accounts[1]).call();
  //   assert(isSupervisor);
  // });

  // it('allows a supervisor to confirm a task', async () => {
  //   await factory.deployed();
  //   const task = await factory
  //     .createTask('complete a task', tomorrow)
  //     .send({
  //       from: accounts[0],
  //       value: web3.utils.toWei('3', 'finney'),
  //       gas: '1000000',
  //     });

  //   await task.setSupervisor(accounts[1]).send({
  //     from: accounts[0],
  //     gas: '1000000',
  //   });

  //   await task.confirmCompleteRequest().send({
  //     from: accounts[1],
  //     gas: '1000000',
  //   });

  //   const request = await task.request().call();
  //   assert(request.approvalsCount > 0);
  // });

  // it('allows procrastinator to withdraw his stake', async () => {
  //   await factory.deployed();
  //   const task = await factory
  //     .createTask('complete a task', tomorrow)
  //     .send({
  //       from: accounts[0],
  //       value: web3.utils.toWei('3', 'finney'),
  //       gas: '1000000',
  //     });

  //   await task.setSupervisor(accounts[1]).send({
  //     from: accounts[0],
  //     gas: '1000000',
  //   });

  //   await task.confirmCompleteRequest().send({
  //     from: accounts[1],
  //     gas: '1000000',
  //   });

  //   await task.finalizeCompleteRequest().send({
  //     from: accounts[0],
  //     gas: '1000000',
  //   });

  //   const request = await task.request().call();
  //   assert(request.complete);
  // });

  // it('processes requests', async () => {
  //   await factory.deployed();
  //   const task = await factory
  //     .createTask('complete a task', tomorrow)
  //     .send({
  //       from: accounts[0],
  //       value: web3.utils.toWei('3', 'finney'),
  //       gas: '1000000',
  //     });

  //   let startBalance = await web3.eth.getBalance(accounts[0]);
  //   startBalance = web3.utils.fromWei(startBalance, 'ether');
  //   startBalance = parseFloat(startBalance);

  //   await task.setSupervisor(accounts[1]).send({
  //     from: accounts[0],
  //     gas: '1000000',
  //   });

  //   await task.confirmCompleteRequest().send({
  //     from: accounts[1],
  //     gas: '1000000',
  //   });

  //   await task.finalizeCompleteRequest().send({
  //     from: accounts[0],
  //     gas: '1000000',
  //   });

  //   let endBalance = await web3.eth.getBalance(accounts[0]);
  //   endBalance = web3.utils.fromWei(endBalance, 'ether');
  //   endBalance = parseFloat(endBalance);

  //   assert(startBalance.toFixed(1) == endBalance.toFixed(1));
  // });

  // it('returns the summary when requested', async () => {
  //   await factory.deployed();
  //   const task = await factory
  //     .createTask('complete a task', tomorrow)
  //     .send({
  //       from: accounts[0],
  //       value: web3.utils.toWei('3', 'finney'),
  //       gas: '1000000',
  //     });

  //   const summary = await task.getSummary().call();
  //   assert.equal(summary[2], accounts[0]);
  // });

  // it('requires a minimum stake', async () => {
  //   await factory.deployed();
  //   try {
  //     await factory
  //       .createTask('fail creation due to low stake', tomorrow)
  //       .send({
  //         from: accounts[0],
  //         value: web3.utils.toWei('1', 'finney'),
  //         gas: '1000000',
  //       });
  //     assert(false);
  //   } catch (err) {
  //     assert(err);
  //   }
  // });

  // it('requires a minimum date', async () => {
  //   await factory.deployed();
  //   try {
  //     await factory
  //       .createTask('fail creation due to invalid date', yesterday)
  //       .send({
  //         from: accounts[0],
  //         value: web3.utils.toWei('3', 'finney'),
  //         gas: '1000000',
  //       });
  //     assert(false);
  //   } catch (err) {
  //     assert(err);
  //   }
  // });
});

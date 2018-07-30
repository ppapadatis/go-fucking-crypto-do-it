const debug = require('debug')('ck');
const util = require('./util.js');
const taskCore = artifacts.require('./TaskCore');

contract('TaskCore', (accounts) => {
  before(() => util.measureGas(accounts));
  after(() => util.measureGas(accounts));

  if (util.isNotFocusTest('core')) return;

  const yesterday = Date.now() - 24 * 60 * 60;
  const tomorrow = Date.now() + 24 * 60 * 60;
  const nullAddress = '0x0000000000000000000000000000000000000000';
  const serviceOwner = accounts[0];
  const user = accounts[1];
  const newServiceOwner = accounts[2];
  const supervisor1 = accounts[3];
  const supervisor2 = accounts[4];
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

  async function createTask(from, time, goal = 'goal', value = '2') {
    await coreC.createTask(goal, time, {
      from: from,
      value: web3.toWei(value, 'finney'),
    });
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
      await createTask(user, tomorrow);
      const owner = await coreC.taskIndexToOwner.call(0);
      assert.equal(owner, user);
    });

    it('returns task details by id', async () => {
      await createTask(user, tomorrow);
      const details = await coreC.getTask.call(0);
      assert.ok(details);
    });

    it('denies a task if the user is null', async () => {
      try {
        await createTask(nullAddress, tomorrow);
        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies a task if the user does not speficy a goal', async () => {
      try {
        await coreC.createTask(user, tomorrow, null);

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies a task if the user payes less than the minimum', async () => {
      try {
        await createTask(user, tomorrow, 'goal', '1');
        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies a task if the user specifies a date earlier than today', async () => {
      try {
        await createTask(user, yesterday, 'goal', '2');
        assert(false);
      } catch (err) {
        assert(err);
      }
    });
  });

  describe('ownership functionality', () => {
    before(deployContract);

    it('sets a single supervisor', async () => {
      try {
        await createTask(user, tomorrow);
        const transaction = await coreC.setSupervisors([supervisor1], 0, {
          from: user,
        });

        assert.ok(transaction);
      } catch (err) {
        assert(false, err.toString());
      }
    });

    it('sets multiple supervisors', async () => {
      try {
        await createTask(user, tomorrow);
        const transaction = await coreC.setSupervisors(
          [supervisor1, supervisor2],
          1,
          {
            from: user,
          },
        );

        assert.ok(transaction);
      } catch (err) {
        assert(false, err.toString());
      }
    });

    it('allows a supervisor to confirm a task', async () => {
      try {
        await createTask(user, tomorrow);
        await coreC.setSupervisors([supervisor1], 2, { from: user });
        const transaction = await coreC.confirmTaskCompletion(2, {
          from: supervisor1,
        });

        assert.ok(transaction);
      } catch (err) {
        assert(false, err.toString());
      }
    });

    it('allows the user to withdraw the stake', async () => {
      try {
        await createTask(user, tomorrow);
        await coreC.setSupervisors([supervisor1], 3, { from: user });
        await coreC.confirmTaskCompletion(3, { from: supervisor1 });
        const transaction = await coreC.withdrawStake(3, { from: user });

        assert.ok(transaction);
      } catch (err) {
        assert(false, err.toString());
      }
    });

    it('allows the service owner to claim the expired task', async () => {
      try {
        await createTask(user, tomorrow);
        await util.forwardEVMTime(Date.now() + 48 * 60 * 60);
        const transaction = await coreC.claimStake(4, { from: serviceOwner });

        assert.ok(transaction);
      } catch (err) {
        assert(false, err.toString());
      }
    });

    it('denies the user as a supervisor', async () => {
      try {
        await createTask(user, tomorrow + 48 * 60 * 60);
        await coreC.setSupervisors([user], 5, { from: user });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies the same supervisor twice', async () => {
      try {
        await createTask(user, tomorrow + 48 * 60 * 60);
        await coreC.setSupervisors([supervisor1, supervisor1], 6, {
          from: user,
        });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies the null address as supervisor', async () => {
      try {
        await createTask(user, tomorrow + 48 * 60 * 60);
        await coreC.setSupervisors([nullAddress], 7, { from: user });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies confirmation on expired task', async () => {
      try {
        await createTask(user, tomorrow + 48 * 60 * 60);
        await coreC.setSupervisors([supervisor1], 8, { from: user });
        await util.forwardEVMTime(Date.now() + 96 * 60 * 60);
        await coreC.confirmTaskCompletion(8, { from: supervisor1 });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies confirmation on fulfilled task', async () => {
      try {
        await createTask(user, tomorrow + 96 * 60 * 60);
        await coreC.setSupervisors([supervisor1], 9, { from: user });
        await coreC.confirmTaskCompletion(9, { from: supervisor1 });
        await coreC.withdrawStake(9, { from: user });
        await coreC.confirmTaskCompletion(9, { from: supervisor1 });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies a non-supervisor to confirm a task', async () => {
      try {
        await createTask(user, tomorrow + 96 * 60 * 60);
        await coreC.setSupervisors([supervisor1], 10, { from: user });
        await coreC.confirmTaskCompletion(10, { from: supervisor2 });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies double confirmations', async () => {
      try {
        await createTask(user, tomorrow + 96 * 60 * 60);
        await coreC.setSupervisors([supervisor1], 11, { from: user });
        await coreC.confirmTaskCompletion(11, { from: supervisor1 });
        await coreC.confirmTaskCompletion(11, { from: supervisor1 });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies withdrawal on tasks not owned by the user', async () => {
      try {
        await createTask(user, tomorrow + 96 * 60 * 60);
        await coreC.setSupervisors([supervisor1], 12, { from: user });
        await coreC.confirmTaskCompletion(12, { from: supervisor1 });
        await coreC.withdrawStake(12, { from: supervisor1 });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies withdrawal on fulfilled tasks', async () => {
      try {
        await createTask(user, tomorrow + 96 * 60 * 60);
        await coreC.setSupervisors([supervisor1], 13, { from: user });
        await coreC.confirmTaskCompletion(13, { from: supervisor1 });
        await coreC.withdrawStake(13, { from: user });
        await coreC.withdrawStake(13, { from: user });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies claim on non-expired tasks', async () => {
      try {
        await createTask(user, tomorrow + 96 * 60 * 60);
        await coreC.claimStake(14, { from: serviceOwner });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('denies claim on fulfilled tasks', async () => {
      try {
        await createTask(user, tomorrow + 96 * 60 * 60);
        await coreC.setSupervisors([supervisor1], 15, { from: user });
        await coreC.confirmTaskCompletion(15, { from: supervisor1 });
        await coreC.withdrawStake(15, { from: user });
        await coreC.claimStake(15, { from: serviceOwner });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });
  });
});

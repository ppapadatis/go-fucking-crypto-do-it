const debug = require('debug')('ck');
const util = require('./util.js');
const taskCore = artifacts.require('./TaskCore');

contract('TaskCore', accounts => {
  before(() => util.measureGas(accounts));
  after(() => util.measureGas(accounts));

  if (util.isNotFocusTest('core')) return;

  const yesterday = Date.now() - 24 * 60 * 60;
  const tomorrow = Date.now() + 24 * 60 * 60;
  const dayAfterTomorrow = tomorrow + 24 * 60 * 60;
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
    logEvents.forEach(ev => ev.stopWatching());
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
        value: web3.toWei('2', 'finney')
      });

      const owner = await coreC.taskIndexToOwner.call(0);
      assert.equal(owner, user);
    });

    it('returns task details by id', async () => {
      await coreC.createTask('goal', tomorrow, {
        from: user,
        value: web3.toWei('2', 'finney')
      });

      const details = await coreC.getTask.call(0);
      assert.ok(details);
    });

    it('denies a task if the user is null', async () => {
      try {
        await coreC.createTask('goal', tomorrow, {
          from: nullAddress,
          value: web3.toWei('2', 'finney')
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
          value: web3.toWei('1', 'finney')
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
          value: web3.toWei('2', 'finney')
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
          value: web3.toWei('2', 'finney')
        });

        assert(false);
      } catch (err) {
        assert(err);
      }
    });
  });

  describe('ownership functionality', () => {
    async function createTask() {
      await coreC.createTask('goal', tomorrow, {
        from: user,
        value: web3.toWei('2', 'finney')
      });
    }

    before(deployContract);
    before(createTask);

    it('sets a single supervisor', async () => {
      try {
        const transaction = await coreC.setSupervisors([supervisor1], 0, {
          from: user
        });

        assert.ok(transaction);
      } catch (err) {
        assert(false, err.toString());
      }
    });

    it('sets multiple supervisors', async () => {
      try {
        const transaction = await coreC.setSupervisors(
          [supervisor1, supervisor2],
          0,
          {
            from: user
          }
        );

        assert.ok(transaction);
      } catch (err) {
        assert(false, err.toString());
      }
    });

    it('allows a supervisor to confirm a task', async () => {
      try {
        await coreC.setSupervisors([supervisor1], 0, {
          from: user
        });
        const transaction = await coreC.confirmTaskCompletion(0, {
          from: supervisor1
        });

        assert.ok(transaction);
      } catch (err) {
        assert(false, err.toString());
      }
    });

    it('allows the user to withdraw the stake', async () => {
      try {
        await coreC.setSupervisors([supervisor1], 0, {
          from: user
        });
        await coreC.confirmTaskCompletion(0, { from: supervisor1 });
        const transaction = await coreC.withdrawStake(0, { from: user });

        assert.ok(transaction);
      } catch (err) {
        assert(false, err.toString());
      }
    });

    it('allows the service owner to claim the expired task', async () => {
      try {
        await util.forwardEVMTime(dayAfterTomorrow);
        const transaction = await coreC.claimStake(0, {
          from: serviceOwner,
          gas: 4500000
        });

        assert.ok(transaction);
      } catch (err) {
        assert(false, err.toString());
      }
    });

    // it('denies the user as a supervisor', async () => {});
    // it('denies the same supervisor twice', async () => {});
    // it('denies the null address as supervisor', async () => {});

    // it('denies confirmation on expired task', async () => {});
    // it('denies confirmation on fulfilled task', async () => {});
    // it('denies a non-supervisor to confirm a task', async () => {});
    // it('denies double confirmations', async () => {});

    // it('denies withdrawal on tasks not owned by the user', async () => {});
    // it('denies withdrawal on fulfilled tasks', async () => {});

    // it('denies claim on non-expired tasks', async () => {});
    // it('denies claim on fulfilled tasks', async () => {});
  });
});

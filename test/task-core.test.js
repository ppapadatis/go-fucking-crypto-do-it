const debug = require('debug')('ck')
const util = require('./util.js')
const taskCore = artifacts.require('./TaskCore')

contract('TaskCore', accounts => {
  before(() => util.measureGas(accounts))
  after(() => util.measureGas(accounts))

  if (util.isNotFocusTest('core')) return

  const yesterday = Date.now() - 24 * 60 * 60
  const tomorrow = Date.now() + 24 * 60 * 60
  const nullAddress = '0x0000000000000000000000000000000000000000'
  const serviceOwner = accounts[0]
  const user = accounts[1]
  const newServiceOwner = accounts[2]
  const supervisor = accounts[3]
  const randomAddress = accounts[4]
  const logEvents = []
  const pastEvents = []
  let coreC

  after(function() {
    logEvents.forEach(ev => ev.stopWatching())
  })

  async function deployContract() {
    await taskCore.deployed()
    coreC = await taskCore.new()

    const eventsWatch = coreC.allEvents()
    eventsWatch.watch((err, res) => {
      if (err) return
      pastEvents.push(res)
      debug('>>', res.event, res.args)
    })
    logEvents.push(eventsWatch)
  }

  async function createTask(
    from,
    deadline,
    supervisorAdd,
    goal = 'goal',
    value = '2'
  ) {
    const tx = await coreC.createTask(goal, deadline, supervisorAdd, {
      from: from,
      value: web3.toWei(value, 'finney')
    })
    return tx.logs[0].args.taskId.toNumber()
  }

  describe('initial state', () => {
    before(deployContract)

    it('deploys the contract', async () => {
      assert.ok(taskCore.address)
    })

    it('assigns the creator as a service owner', async () => {
      const owner = await coreC.serviceOwner()
      assert.equal(owner, serviceOwner)
    })

    it('assigns 2 finney as a minimum stake', async () => {
      const minimumStake = await coreC.minimumStake()
      assert.equal(web3.toWei('2', 'finney'), minimumStake)
    })
  })

  describe('access control functionality', () => {
    before(deployContract)

    it('changes the minimum stake', async () => {
      await coreC.setMinimumStake(web3.toWei('3', 'finney'), {
        from: serviceOwner
      })
      const minimumStake = await coreC.minimumStake()
      assert.equal(web3.toWei('3', 'finney'), minimumStake)
    })

    it('transfers ownership to another address', async () => {
      await coreC.transferOwnership(newServiceOwner, { from: serviceOwner })
      const owner = await coreC.serviceOwner()
      assert.equal(owner, newServiceOwner)
    })
  })

  describe('core functionality', () => {
    before(deployContract)

    it('creates a new task', async () => {
      const taskId = await createTask(user, tomorrow, supervisor)
      const owner = await coreC.taskIndexToOwner.call(taskId)
      assert.equal(owner, user)
    })

    it('returns task details by id', async () => {
      const taskId = await createTask(user, tomorrow, supervisor)
      const details = await coreC.getTask.call(taskId)
      assert.ok(details)
    })

    it('denies a task if the user is null', async () => {
      try {
        await createTask(nullAddress, tomorrow, supervisor)
        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('denies a task if the user does not speficy a goal', async () => {
      try {
        await coreC.createTask(user, tomorrow, supervisor, null)
        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('denies a task if the user payes less than the minimum', async () => {
      try {
        await createTask(user, tomorrow, supervisor, 'goal', '1')
        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('denies a task if the user specifies a date earlier than today', async () => {
      try {
        await createTask(user, yesterday, supervisor, 'goal', '2')
        assert(false)
      } catch (err) {
        assert(err)
      }
    })
  })

  describe('ownership functionality', () => {
    before(deployContract)

    it('allows a supervisor to confirm a task', async () => {
      try {
        const taskId = await createTask(user, tomorrow, supervisor)
        const transaction = await coreC.confirmTask(taskId, {
          from: supervisor
        })

        assert.ok(transaction)
      } catch (err) {
        assert(false, err.toString())
      }
    })

    it('allows the user to withdraw the stake', async () => {
      try {
        const taskId = await createTask(user, tomorrow, supervisor)
        await coreC.confirmTask(taskId, { from: supervisor })
        const transaction = await coreC.withdrawStake(taskId, { from: user })

        assert.ok(transaction)
      } catch (err) {
        assert(false, err.toString())
      }
    })

    it('allows the service owner to claim the expired task', async () => {
      try {
        const taskId = await createTask(user, tomorrow, supervisor)
        await util.forwardEVMTime(Date.now() + 48 * 60 * 60)
        const transaction = await coreC.claimStake(taskId, {
          from: serviceOwner
        })

        assert.ok(transaction)
      } catch (err) {
        assert(false, err.toString())
      }
    })

    it('denies the user as a supervisor', async () => {
      try {
        await createTask(user, tomorrow + 48 * 60 * 60, user)
        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('denies the null address as supervisor', async () => {
      try {
        await createTask(user, tomorrow + 48 * 60 * 60, nullAddress)
        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('denies confirmation on expired task', async () => {
      try {
        const taskId = await createTask(
          user,
          tomorrow + 48 * 60 * 60,
          supervisor
        )
        await util.forwardEVMTime(Date.now() + 96 * 60 * 60)
        await coreC.confirmTask(taskId, { from: supervisor })

        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('denies confirmation on fulfilled task', async () => {
      try {
        const taskId = await createTask(
          user,
          tomorrow + 96 * 60 * 60,
          supervisor
        )
        await coreC.confirmTask(taskId, { from: supervisor })
        await coreC.withdrawStake(taskId, { from: user })
        await coreC.confirmTask(taskId, { from: supervisor })

        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('denies a non-supervisor to confirm a task', async () => {
      try {
        const taskId = await createTask(
          user,
          tomorrow + 96 * 60 * 60,
          supervisor
        )
        await coreC.confirmTask(taskId, { from: randomAddress })

        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('denies double confirmations', async () => {
      try {
        const taskId = await createTask(
          user,
          tomorrow + 96 * 60 * 60,
          supervisor
        )
        await coreC.confirmTask(taskId, { from: supervisor })
        await coreC.confirmTask(taskId, { from: supervisor })

        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('denies withdrawal on tasks not owned by the user', async () => {
      try {
        const taskId = await createTask(
          user,
          tomorrow + 96 * 60 * 60,
          supervisor
        )
        await coreC.confirmTask(taskId, { from: supervisor })
        await coreC.withdrawStake(taskId, { from: randomAddress })

        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('denies withdrawal on fulfilled tasks', async () => {
      try {
        const taskId = await createTask(
          user,
          tomorrow + 96 * 60 * 60,
          supervisor
        )
        await coreC.confirmTask(taskId, { from: supervisor })
        await coreC.withdrawStake(taskId, { from: user })
        await coreC.withdrawStake(taskId, { from: user })

        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('denies claim on non-expired tasks', async () => {
      try {
        const taskId = await createTask(
          user,
          tomorrow + 96 * 60 * 60,
          supervisor
        )
        await coreC.claimStake(taskId, { from: serviceOwner })

        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('denies claim on fulfilled tasks', async () => {
      try {
        const taskId = await createTask(
          user,
          tomorrow + 96 * 60 * 60,
          supervisor
        )
        await coreC.confirmTask(taskId, { from: supervisor })
        await coreC.withdrawStake(taskId, { from: user })
        await coreC.claimStake(taskId, { from: serviceOwner })

        assert(false)
      } catch (err) {
        assert(err)
      }
    })
  })
})

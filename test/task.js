const factory = artifacts.require('./TaskFactory');
const task = artifacts.require('./Task');
import { APPROVED_NETWORK_ID } from '../src/util/constants';
import Web3 from 'web3';

contract('Task', async accounts => {
  it('deploys a factory and a task', async () => {
    await factory.deployed();
    assert.ok(factory.networks[APPROVED_NETWORK_ID].address);

    // await task.deployed();
    // assert.ok(task.networks[APPROVED_NETWORK_ID].address);
  });

  // it('marks caller as the procrastinator', async () => {
  //   await factory.deployed();
  //   const task = await factory
  //     .createTask('complete a task', '1563896088')
  //     .send({
  //       from: accounts[0],
  //       value: web3.utils.toWei('3', 'finney'),
  //       gas: '1000000',
  //     });

  //   const procrastinator = await task.procrastinator().call();
  //   assert.equal(accounts[0], procrastinator);
  // });

  // it('allows a procrastinator to set a supervisor', async () => {
  //   await factory.deployed();
  //   const task = await factory
  //     .createTask('complete a task', '1563896088')
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
  //     .createTask('complete a task', '1563896088')
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
  //     .createTask('complete a task', '1563896088')
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
  //     .createTask('complete a task', '1563896088')
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
  //     .createTask('complete a task', '1563896088')
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
  //       .createTask('fail creation due to low stake', '1563896088')
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
  //       .createTask('fail creation due to invalid date', '1500892600')
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
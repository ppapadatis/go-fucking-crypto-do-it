pragma solidity ^0.4.17;

import './Task.sol';

contract TaskFactory {
    address[] public deployedTasks;

    function createTask(string _goal, uint _deadline) public payable {
        require(msg.sender != 0x0);
        require(msg.value >= 2 finney);
        require(_deadline > now);

        address newTask = (new Task).value(msg.value)(_goal, _deadline, msg.sender);
        deployedTasks.push(newTask);
    }

    function getDeployedTasks() public view returns (address[]) {
        return deployedTasks;
    }
}

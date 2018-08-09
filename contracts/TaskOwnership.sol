pragma solidity ^0.4.22;

import './TaskBase.sol';

/// @title Ownership contract for CryptoTasks. Holds all common functionality.
/// @author Panagiotis Papadatis (https://github.com/ppapadatis)
/// @dev See the TaskCore contract documentation to understand how the various contract facets are arranged.
contract TaskOwnership is TaskBase
{
    /// @dev Checks if a given address is the current owner of a particular task.
    ///
    /// @param _claimant The address we are validating against.
    /// @param _taskId The task's ID.
    /// @return bool True, if the claimant is the owner of the task.
    function _owns(address _claimant, uint _taskId) internal view returns (bool)
    {
        require(_claimant != address(0), "Owner address must not be null");
        return taskIndexToOwner[_taskId] == _claimant;
    }

    /// @dev Checks if the given address is a supervisor for the given task.
    ///
    /// @param _supervisor The address to check for.
    /// @param _taskId The ID of the task.
    /// @return bool True, if the address is a supervisor.
    function _supervises(address _supervisor, uint _taskId) internal view returns (bool)
    {
        require(_supervisor != address(0), "Supervisor address must not be null");
        return tasks[_taskId].supervisor == _supervisor;
    }

    /// @dev Checks if the given task is in progress and on time.
    ///
    /// @param _taskId The ID of the task.
    /// @return bool True, if the task is in progress and on time.
    function _inProgress(uint _taskId) internal view returns (bool)
    {
        return tasks[_taskId].state == TaskState.InProgress && tasks[_taskId].deadline >= now;
    }

    /// @dev Returns the owner of the given task ID.
    ///
    /// @param _taskId The ID of the task.
    /// @return address The address of the owner.
    function getOwnerOfTask(uint _taskId) public view returns (address)
    {
        return taskIndexToOwner[_taskId];
    }

    /// @dev Returns the total number of tasks.
    ///
    /// @return uint The total number of tasks.
    function getTotalTasks() public view returns (uint)
    {
        return tasks.length;
    }

    /// @notice Returns the number of Tasks owned by a specific address.
    ///
    /// @param _owner The owner address to check.
    /// @return uint The number of tasks owned by the address.
    function getNumberOfTasks(address _owner) public view returns (uint)
    {
        require(_owner != address(0), "Owner must not be null");
        return ownershipTaskCount[_owner];
    }

    /// @notice This method MUST NEVER be called by smart contract code.
    ///  It's expensive because it walks the entire tasks array and also
    ///  returns a dynamic array, which is only supported for web3 calls.
    /// @dev Returns a list of all Task IDs assigned to an address.
    ///
    /// @param _owner The owner whose Tasks we are interested in.
    /// @return uint[] An array of all tasks owned by a given address.
    function getTasksOfOwner(address _owner) external view returns (uint[])
    {
        require(_owner != address(0), "Owner must not be null");
        uint balance = getNumberOfTasks(_owner);

        if (balance == 0) {
            return new uint[](0);
        }

        uint[] memory result = new uint[](balance);
        uint totalTasks = getTotalTasks();
        uint resultIndex = 0;

        for (uint taskIndex = 0; taskIndex < totalTasks; taskIndex++) {
            if (taskIndexToOwner[taskIndex] == _owner) {
                result[resultIndex] = taskIndex;
                resultIndex = resultIndex.add(1);
            }
        }

        return result;
    }

    /// @dev Grant the supervisor of the task to mark is as confirmed.
    ///
    /// @param _taskId The ID of the task.
    function confirmTask(uint _taskId) public
    {
        require(_supervises(msg.sender, _taskId), "Cannot confirm unauthorized tasks");
        require(_inProgress(_taskId), "Can only confirm tasks in-progress");

        Task storage task = tasks[_taskId];
        task.state = TaskState.Confirmed;
        emit Confirmed(taskIndexToOwner[_taskId], _taskId, task.goal, task.deadline, msg.sender, task.stake);
    }

    /// @dev Grants the task's owner to withdraw the stake
    ///  as long as the task if confirmed as fulfilled.
    ///
    /// @param _taskId The ID of the task.
    function withdrawStake(uint _taskId) public
    {
        require(_owns(msg.sender, _taskId), "Must be the task's owner in order to withdraw the stake");
        require(tasks[_taskId].state == TaskState.Confirmed, "Cannot claim stake on unfulfilled tasks");

        Task storage task = tasks[_taskId];
        tasks[_taskId].state = TaskState.Fulfilled;
        msg.sender.transfer(task.stake);
        emit Fulfilled(msg.sender, _taskId, task.goal, task.deadline, task.supervisor, task.stake);
    }

    /// @dev Grants the service owner the ability to claim the stake
    ///  of the expired and unfulfilled task.
    function claimStake(uint _taskId) public onlyServiceOwner
    {
        require(!_inProgress(_taskId), "Task must have missed the deadline");

        Task storage task = tasks[_taskId];
        task.state = TaskState.Expired;
        serviceOwner.transfer(task.stake);
        emit Expired(taskIndexToOwner[_taskId], _taskId, task.goal, task.deadline, serviceOwner, task.stake);
    }
}

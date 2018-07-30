pragma solidity ^0.4.22;

import "./TaskBase.sol";

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
        return taskIndexToOwner[_taskId] == _claimant;
    }

    /// @dev Checks if a given task is expired.
    ///
    /// @return bool True, if the task is expired.
    function _isExpired(uint _taskId) internal view returns (bool)
    {
        return tasks[_taskId].deadline < now;
    }

    /// @dev Checks if a given task is fulfilled.
    ///
    /// @return bool True, if the task is fulfilled.
    function _isFulfilled(uint _taskId) internal view returns (bool)
    {
        return tasks[_taskId].confirmationRequest.fulfilled;
    }

    /// @notice Returns the number of Tasks owned by a specific address.
    ///
    /// @param _owner The owner address to check.
    /// @return uint The number of tasks owned by the address.
    function balanceOf(address _owner) public view returns (uint count)
    {
        return ownershipTaskCount[_owner];
    }

    /// @dev Grant the task owner the right to set supervisors.
    ///
    /// @param _supervisors An array of addresses to set as supervisors for the task.
    /// @param _taskId The ID of the task.
    function setSupervisors(address[] _supervisors, uint _taskId) public
    {
        require(_owns(msg.sender, _taskId));
        require(!_isExpired(_taskId));
        require(!_isFulfilled(_taskId));

        Task storage task = tasks[_taskId];
        for (uint i = 0; i < _supervisors.length; i++) {

            // Must not be the default address.
            require(_supervisors[i] != address(0));
            
            // Must not be the owner.
            require(_supervisors[i] != msg.sender);
            
            // Must not be an existing supervisor.
            require(!task.supervisors[_supervisors[i]]);

            task.supervisors[_supervisors[i]] = true;
            task.supervisorsCount++;
        }

        emit Supervised(_supervisors, _taskId);
    }

    /// @dev Checks if the given address is a supervisor for the given task.
    ///
    /// @param _supervisor The address to check for.
    /// @param _taskId The ID of the task.
    /// @return bool True, if the address is a supervisor.
    function isSupervisorForTask(address _supervisor, uint _taskId) public view returns (bool)
    {
        Task storage task = tasks[_taskId];
        return task.supervisors[_supervisor];
    }

    /// @dev Grant the supervisors of the task to mark is as fulfilled.
    ///
    /// @param _taskId The ID of the task.
    function confirmTaskCompletion(uint _taskId) public
    {
        require(!_isExpired(_taskId));
        require(!_isFulfilled(_taskId));
        Task storage task = tasks[_taskId];

        // Must be a supervisor.
        require(task.supervisors[msg.sender]);

        // Must not have confirmed the task previously.
        require(!task.confirmationRequest.confirmers[msg.sender]);

        emit Approved(msg.sender, _taskId);

        task.confirmationRequest.confirmers[msg.sender] = true;
        task.confirmationRequest.confirmationsCount++;
    }

    /// @dev Checks if the given address has approved a given task.
    ///
    /// @param _supervisor The address to check for.
    /// @param _taskId The ID of the task.
    /// @return bool True, if the address has approved the task.
    function hasApprovedTask(address _supervisor, uint _taskId) public view returns (bool)
    {
        Task storage task = tasks[_taskId];
        return task.confirmationRequest.confirmers[_supervisor];
    }

    /// @dev Grants the task's owner to withdraw his/her stake
    ///  as long as the task if confirmed as fulfilled.
    ///
    /// @param _taskId The ID of the task.
    function withdrawStake(uint _taskId) public
    {
        require(_owns(msg.sender, _taskId));

        /// @notice The task is marked as fulfilled AFTER the withdrawal of the stake.
        ///  If the user has previously withdrew his/her stake, this will raise an error.
        require(!_isFulfilled(_taskId));

        Task storage task = tasks[_taskId];

        // At least one confirmation is needed.
        require(task.confirmationRequest.confirmationsCount > 0);
        require(task.confirmationRequest.confirmationsCount == task.supervisorsCount);

        task.confirmationRequest.fulfilled = true;
        emit Fulfilled(msg.sender, _taskId);
        msg.sender.transfer(task.stake);
    }

    /// @dev Grants the service owner the ability to claim the stake
    ///  of the expired and unfulfilled task.
    function claimStake(uint _taskId) public onlyServiceOwner
    {
        require(_isExpired(_taskId));
        require(!_isFulfilled(_taskId));

        serviceOwner.transfer(tasks[_taskId].stake);
    }
}

pragma solidity ^0.4.17;

import "./TaskBase.sol";

/// @title Ownership contract for CryptoTasks. Holds all common functionality.
/// @author Panagiotis Papadatis (https://github.com/ppapadatis)
/// @dev See the TaskCore contract documentation to understand how the various contract facets are arranged.
contract TaskOwnership is TaskBase {

    /// @dev Checks if a given address is the current owner of a particular task.
    ///
    /// @param _claimant The address we are validating against.
    /// @param _taskId The task's ID.
    ///
    /// @return bool True, if the claimant is the owner of the task.
    function _owns(address _claimant, uint _taskId) internal view returns (bool) {
        return TaskIndexToOwner[_taskId] == _claimant;
    }

    /// @dev Checks if a given task is expired.
    ///
    /// @return bool True, if the task is expired.
    function _isExpired(uint _taskId) internal view returns (bool) {
        return _taskId > 0 && tasks[_taskId].deadline < now;
    }

    /// @dev Checks if a given task is fulfilled.
    ///
    /// @return bool True, if the task is fulfilled.
    function _isFulfilled(uint _taskId) internal view returns (bool) {
        return _taskId > 0 && tasks[_taskId].confirmationRequest.fulfilled;
    }

    /// @notice Returns the number of Kitties owned by a specific address.
    ///
    /// @param _owner The owner address to check.
    ///
    /// @return uint The number of tasks owned by the address.
    function balanceOf(address _owner) public view returns (uint count) {
        return ownershipTaskCount[_owner];
    }

    /// @dev Grant the task owner the right to set supervisors.
    ///
    /// @param _supervisors An array of addresses to set as supervisors for the task.
    /// @param _taskId The ID of the task.
    function setSupervisors(address[] _supervisors, uint _taskId) public {
        require(_owns(msg.sender, _taskId));
        require(!_isExpired(_taskId));
        require(!_isFulfilled(_taskId));

        Task storage task = tasks[_taskId];
        for (uint i; i < _supervisors.length; i++) {            
            
            // Must not be the default address.
            require(_supervisors[i] != address(0));
            
            // Must not be the owner.
            require(_supervisors[i] != msg.sender);
            
            // Must not be an existing supervisor.
            require(!task.supervisors[_supervisors[i]]);

            task.supervisors[_supervisors[i]] = true;
            task.supervisorsCount++;
        }
    }

    /// @dev Grant the supervisors of the task to mark is as fulfilled.
    ///
    /// @param _taskId The ID of the task.
    function confirmTaskCompletion(uint _taskId) public {
        require(!_isExpired(_taskId));
        require(!_isFulfilled(_taskId));
        Task storage task = tasks[_taskId];

        // Must be a supervisor.
        require(task.supervisors[msg.sender]);

        // Must not have confirmed the task previously.
        require(!task.confirmationRequest.confirmers[msg.sender]);

        task.confirmationRequest.confirmers[msg.sender] = true;
        task.confirmationRequest.confirmationsCount++;
    }

    /// @dev Grants the task's owner to withdraw his/her stake
    ///  as long as the task if confirmed as fulfilled.
    ///
    /// @param _taskId The ID of the task.
    function withdrawStake(uint _taskId) public {
        require(_owns(msg.sender, _taskId));
        require(!_isExpired(_taskId));

        /// @notice The task is marked as fulfilled AFTER the withdrawal of the stake.
        ///  If the user has previously withdrew his/her stake, this will raise an error.
        require(!_isFulfilled(_taskId));

        Task storage task = tasks[_taskId];

        // At least one confirmation is needed.
        require(task.confirmationRequest.confirmationsCount > 0);
        require(task.confirmationRequest.confirmationsCount == task.supervisorsCount);

        task.confirmationRequest.fulfilled = true;
        emit Fulfilled(msg.sender, _taskId);
        assert(msg.sender.send(task.stake));
    }

    /// @dev Grants the service owner the ability to claim the stake
    ///  of the expired task.
    function claimStake(uint _taskId) public onlyServiceOwner {
        require(_isExpired(_taskId));
        require(!tasks[_taskId].confirmationRequest.fulfilled);

        assert(serviceOwner.send(tasks[_taskId].stake));
    }
}

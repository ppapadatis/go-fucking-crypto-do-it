pragma solidity ^0.4.22;

import './TaskOwnership.sol';

/// @title CryptoTasks: Tasks on the Ethereum Blockchain.
/// @author Panagiotis Papadatis (https://github.com/ppapadatis)
/// @dev The main CryptoTasks contract.
contract TaskCore is TaskOwnership
{
    // This is the main CryptoTasks contract.
    // The core contract is breaked up into multiple files using inheritence, one for each major
    // facet of functionality. This allows us to keep related code bundled together while still
    // avoiding a single giant file with everything in it. The breakdown is as follows:
    //
    //      - TaskAccessControl: This contract manages the various addresses and constraints for operations
    //             that can be executed only by specific roles.
    //
    //      - TaskBase: This is where we define the most fundamental code shared throughout the core
    //             functionality. This includes our main data storage, constants and data types, plus
    //             internal functions for managing these items.
    //
    //      - TaskOwnership: This facet contains the functionality we use for managing tasks.

    /// @notice Creates the main CryptoTasks smart contract instance.
    constructor() public
    {
        serviceOwner = msg.sender;
        minimumStake = 2 finney;
    }

    /// @notice No tipping!
    /// @dev Reject all Ether from being sent here.
    function() external payable
    {
        require(false, "No tipping allowed");
    }

    /// @dev Creates a new task for the requested address.
    /// @notice The minimum amount to stake is 2 finney.
    ///
    /// @param _goal The task's goal.
    /// @param _deadline The task's deadline.
    /// @param _supervisor The task's supervisor.
    function createTask(string _goal, uint _deadline, address _supervisor) public payable returns (uint)
    {
        require(bytes(_goal).length > 0, "Goal must not be null or empty");
        require(_deadline >= now, "Deadline must be greater than current block time");
        require(_supervisor != address(0), "Supervisor address must not be null");
        require(_supervisor != msg.sender, "The Creator and the Supervisor address must be different");
        require(msg.sender != address(0), "Creator address must not be null");
        require(msg.value >= minimumStake, "The minimum stake is not met");

        return _createTask(_goal, _deadline, _supervisor, msg.value, msg.sender);
    }

    /// @notice Returns all the relevant information about a specific task.
    ///
    /// @param _taskId The ID of the task of interest.
    /// @return object The task's details.
    function getTask(uint _taskId) external view
        returns (string goal, uint deadline, address supervisor, uint stake, TaskState state)
    {
        Task storage task = tasks[_taskId];
        return (task.goal, task.deadline, task.supervisor, task.stake, task.state);
    }
}

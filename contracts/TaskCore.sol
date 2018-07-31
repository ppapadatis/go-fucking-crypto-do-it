pragma solidity ^0.4.22;

import "./TaskOwnership.sol";

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
    }

    /// @notice No tipping!
    /// @dev Reject all Ether from being sent here.
    function() external payable
    {
        require(false);
    }

    /// @dev Creates a new task for the requested address.
    /// @notice The minimum amount to stake is 2 finney.
    ///
    /// @param _goal The task's goal.
    /// @param _deadline The task's deadline.
    function createTask(string _goal, uint _deadline) public payable
    {
        require(msg.sender != address(0));
        require(msg.value >= 2 finney);
        require(bytes(_goal).length > 0);
        require(_deadline >= now);
        
        _createTask(_goal, _deadline, msg.value, msg.sender);
    }

    /// @notice Returns all the relevant information about a specific task.
    ///
    /// @param _taskId The ID of the task of interest.
    /// @return object The goal, the deadline, the stake, the fulfillment status
    ///   and the expiration status of the task.
    function getTask(uint _taskId) public view
        returns (string goal, uint deadline, uint stake, bool fulfilled, bool expired)
    {
        Task memory task = tasks[_taskId];
        
        goal = task.goal;
        deadline = task.deadline;
        stake = task.stake;
        fulfilled = task.confirmationRequest.fulfilled;
        expired = task.deadline < now;
    }

    /// @dev Returns the address of the contract.
    ///
    /// @return address The address of the contract.
    function getContractAddress() public view returns (address)
    {
        return address(this);
    }
}

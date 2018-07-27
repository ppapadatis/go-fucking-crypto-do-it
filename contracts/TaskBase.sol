pragma solidity ^0.4.17;

import "./TaskAccessControl.sol";

/// @title Base contract for CryptoTasks. Holds all common structs, events and base variables.
/// @author Panagiotis Papadatis (https://github.com/ppapadatis)
/// @dev See the TaskCore contract documentation to understand how the various contract facets are arranged.
contract TaskBase is TaskAccessControl {

    /*** EVENTS ***/

    /// @dev The Creation event is fired whenever a new task comes into existence.
    event Creation(address indexed owner, uint taskId);

    /// @dev The Transfer event is fired every time a task ownership is assigned.
    event Transfer(address indexed from, address indexed to, uint taskId);

    /// @dev The Fulfilled event is fired when a task is marked fulfilled.
    event Fulfilled(address indexed owner, uint taskId);
    
    /*** DATA TYPES ***/
    
    /// @dev The Confirmation Request struct. Every task in order to be fulfilled,
    ///  the accounts marked as supervisors must confirm it for the user to
    ///  be able to withdraw his/her stake.
    struct ConfirmationRequest {

        // A flag to check whether the request is fulfilled or not.
        bool fulfilled;

        // A counter for supervisors that have confirmed the request.
        uint confirmationsCount;

        // A mapping from supervisor address to a bool flag that marks them as confirmers.
        mapping(address => bool) confirmers;
    }

    /// @dev The main Task struct
    struct Task {

        /// @dev The confirmation request struct for the task.
        ConfirmationRequest confirmationRequest;

        /// @dev A description for the goal to achieve.
        string goal;

        /// @dev A unix timestamp representing the date until the task is considered in-progress.
        uint deadline;

        /// @dev The value to stake until fulfilled.
        uint stake;

        /// @dev A counter for the supervisors of the task.
        uint supervisorsCount;

        /// @dev A mapping from supervisor address to a bool flag that marks them as such.
        mapping(address => bool) supervisors;
    }

    /** STORAGE ***/

    /// @dev An array containing the Task struct for all tasks in existence.
    Task[] tasks;

    /// @dev A mapping from task IDs to the address that owns them.
    mapping (uint => address) public TaskIndexToOwner;

    /// @dev A mapping from owner address to count of tasks that address owns.
    mapping (address => uint) ownershipTaskCount;

    /// @dev Assigns ownership of a specific Task to an address.
    ///
    /// @param _from The address to transfer from.
    /// @param _to The address to transfer to.
    /// @param _taskId The task index to transfer.
    function _transfer(address _from, address _to, uint _taskId) internal {
        ownershipTaskCount[_to]++;
        TaskIndexToOwner[_taskId] = _to;
        if (_from != address(0)) {
            ownershipTaskCount[_from]--;
        }

        emit Transfer(_from, _to, _taskId);
    }

    /// @dev An internal method that creates a new Task and stores it. This
    ///  method doesn't do any checking and should only be called when the
    ///  input data is known to be valid.
    ///
    /// @param _goal The task's goal.
    /// @param _deadline The task's deadline.
    /// @param _stake The task's stake value.
    /// @param _owner The inital owner of this task, must be non-zero.
    ///
    /// @return uint The task's id
    function _createTask(string _goal, uint _deadline, uint _stake, address _owner) internal returns (uint) {
        ConfirmationRequest memory _request = ConfirmationRequest({
            fulfilled: false,
            confirmationsCount: 0
        });
        
        Task memory _task = Task({ 
            goal: _goal,
            deadline: _deadline,
            stake: _stake,
            supervisorsCount: 0,
            confirmationRequest: _request
        });

        uint newTaskIndex = tasks.push(_task) - 1;

        emit Creation(_owner, newTaskIndex);
        _transfer(0, _owner, newTaskIndex);
    }    
}

pragma solidity ^0.4.22;

import './TaskAccessControl.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

/// @title Base contract for CryptoTasks. Holds all common structs, events and base variables.
/// @author Panagiotis Papadatis (https://github.com/ppapadatis)
/// @dev See the TaskCore contract documentation to understand how the various contract facets are arranged.
contract TaskBase is TaskAccessControl
{
    /*** Libraries ***/
    using SafeMath for uint256;

    /*** EVENTS ***/

    /// @dev The Created event is fired whenever a new task comes into existence.
    event Created(address indexed owner, uint indexed taskId, string goal, uint deadline, address indexed supervisor, uint stake);

    /// @dev The Confirmed event is fired when a supervisor approves a task.
    event Confirmed(address indexed owner, uint indexed taskId, string goal, uint deadline, address indexed supervisor, uint stake);

    /// @dev The Fulfilled event is fired when a task is marked fulfilled.
    event Fulfilled(address indexed owner, uint indexed taskId, string goal, uint deadline, address indexed supervisor, uint stake);

    /// @dev The Expired event is fired when a task is expired.
    event Expired(address indexed owner, uint indexed taskId, string goal, uint deadline, address indexed supervisor, uint stake);

    /*** DATA TYPES ***/

    /// @dev The lifecycle of a task.
    enum TaskState { InProgress, Confirmed, Fulfilled, Expired }

    /// @dev The main Task struct
    struct Task
    {
        /// @dev A description for the goal to achieve.
        string goal;

        /// @dev A unix timestamp representing the date until the task is considered in-progress.
        uint deadline;

        /// @dev The value to stake until fulfilled.
        uint stake;

        /// @dev The state of the task.
        TaskState state;

        /// @dev Supervisor's address.
        address supervisor;
    }

    /** STORAGE ***/

    /// @dev An array containing the Task struct for all tasks in existence.
    Task[] internal tasks;

    /// @dev A mapping from task IDs to the address that owns them.
    mapping (uint => address) public taskIndexToOwner;

    /// @dev A mapping from owner address to count of tasks that address owns.
    mapping (address => uint) internal ownershipTaskCount;

    /// @dev Assigns ownership of a specific Task to an address.
    ///
    /// @param _from The address to transfer from.
    /// @param _to The address to transfer to.
    /// @param _taskId The task index to transfer.
    function _transfer(address _from, address _to, uint _taskId) internal
    {
        ownershipTaskCount[_to] = ownershipTaskCount[_to].add(1);
        taskIndexToOwner[_taskId] = _to;
        if (_from != address(0)) {
            ownershipTaskCount[_from] = ownershipTaskCount[_from].sub(1);
        }
    }

    /// @dev An internal method that creates a new Task and stores it. This
    ///  method doesn't do any checking and should only be called when the
    ///  input data is known to be valid.
    ///
    /// @param _goal The task's goal.
    /// @param _deadline The task's deadline.
    /// @param _supervisor Supervisor's address.
    /// @param _stake The task's stake value.
    /// @param _owner The inital owner of this task, must be non-zero.
    /// @return uint The task's id.
    function _createTask(string _goal, uint _deadline, address _supervisor, uint _stake, address _owner) internal
        returns (uint)
    {
        Task memory _task = Task({
            goal: _goal,
            deadline: _deadline,
            stake: _stake,
            state: TaskState.InProgress,
            supervisor: _supervisor
        });

        uint newTaskIndex = tasks.push(_task) - 1;

        _transfer(0, _owner, newTaskIndex);
        emit Created(_owner, newTaskIndex, _goal, _deadline, _supervisor, _stake);

        return newTaskIndex;
    }
}

pragma solidity ^0.4.22;

/// @title A facet of TaskCore that manages special access provileges.
/// @author Panagiotis Papadatis (https://github.com/ppapadatis)
/// @dev See the TaskCore contract documentation to understand how the various contract facets are arranged.
contract TaskAccessControl
{
    // The address of the account (or contract) that can execute actions within each role.
    address public serviceOwner;

    // The minimum stake required in order to create a task.
    uint public minimumStake;

    /// @dev The OwnershipTransferred event is fired when the contract changes ownership.
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /// @dev The MinimumStakeChanged event is fired when the stake changes.
    event MinimumStakeChanged(uint oldStake, uint newStake);

    /// @dev Access modifier for Service Owner-only functionality.
    modifier onlyServiceOwner
    {
        require(msg.sender == serviceOwner, "Only authorized owner permitted");
        _;
    }

    /// @dev Allows the current owner to set a minimum stake.
    ///
    /// @param _stake The (new) minimum stake.
    function setMinimumStake(uint _stake) public onlyServiceOwner
    {
        require(_stake != minimumStake, "New and old stake must not be the same");

        minimumStake = _stake;
        emit MinimumStakeChanged(minimumStake, _stake);
    }

    /// @dev Allows the current owner to transfer control of the contract to a newOwner.
    ///
    /// @param _newOwner The address to transfer ownership to.
    function transferOwnership(address _newOwner) public onlyServiceOwner
    {
        require(_newOwner != address(0), "New owner must not be null");
        require(_newOwner != serviceOwner, "New and old owners must not be the same");

        emit OwnershipTransferred(serviceOwner, _newOwner);
        serviceOwner = _newOwner;
    }
}

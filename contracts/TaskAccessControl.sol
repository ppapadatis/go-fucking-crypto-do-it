pragma solidity ^0.4.17;

/// @title A facet of TaskCore that manages special access provileges.
/// @author Panagiotis Papadatis (https://github.com/ppapadatis)
/// @dev See the TaskCore contract documentation to understand how the various contract facets are arranged.
contract TaskAccessControl {

    // The address of the account (or contract) that can execute actions within each role.
    address public serviceOwner;
   
    /// @dev The OwnershipTransferred event is fired when the contract changes ownership.
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /// @dev Access modifier for Service Owner-only functionality.
    modifier onlyServiceOwner {
        require(msg.sender == serviceOwner);
        _;
    }

    /// @dev Allows the current owner to transfer control of the contract to a newOwner.
    ///
    /// @param _newOwner The address to transfer ownership to.
    function transferOwnership(address _newOwner) public onlyServiceOwner {
        _transferOwnership(_newOwner);
    }

    /// @dev Transfers control of the contract to a newOwner.
    ///
    /// @param _newOwner The address to transfer ownership to.
    function _transferOwnership(address _newOwner) internal {
        require(_newOwner != address(0));        
        emit OwnershipTransferred(serviceOwner, _newOwner);
        serviceOwner = _newOwner;
    }
}

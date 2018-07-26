pragma solidity ^0.4.17;

contract Task {
    struct Request {
        bool complete;
        uint approvalsCount;
        mapping(address => bool) approvals;        
    }

    Request public request;
    address public procrastinator;
    string public goal;
    uint public deadline;
    uint public supervisorsCount;
    mapping(address => bool) public supervisors;

    modifier ownerOnly {
        require(msg.sender == procrastinator);
        _;
    }

    constructor(string _goal, uint _deadline, address _owner) public payable {
        require(_owner != 0x0);
        require(msg.value >= 2 finney);
        require(_deadline > now);

        procrastinator = _owner;
        goal = _goal;
        deadline = _deadline;
    }

    function setSupervisor(address _supervisor) public ownerOnly {
        require(_supervisor != procrastinator);
        require(!supervisors[_supervisor]);

        supervisors[_supervisor] = true;
        supervisorsCount++;
    }

    function confirmCompleteRequest() public {
        require(supervisors[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalsCount++;
    }

    function finalizeCompleteRequest() public ownerOnly {
        require(supervisorsCount > 0);
        require(request.approvalsCount == supervisorsCount);
        require(!request.complete);

        procrastinator.transfer(address(this).balance);
        request.complete = true;
    }

    function getSummary() public view returns (uint, uint, address) {
        return (address(this).balance, supervisorsCount, procrastinator);
    }
}

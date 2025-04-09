
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GradeChain {
    address public owner;
    
    // Mapping to store authorized teachers
    mapping(address => bool) public teachers;
    
    // Mapping to store result hashes by student ID
    mapping(string => bytes32) public studentResults;
    
    // Mapping to store result timestamps
    mapping(bytes32 => uint256) public resultTimestamps;
    
    // Mapping to store result issuers
    mapping(bytes32 => address) public resultIssuers;
    
    event TeacherAdded(address indexed teacherAddress);
    event ResultAdded(string indexed studentId, bytes32 resultHash);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyTeacherOrOwner() {
        require(msg.sender == owner || teachers[msg.sender], "Only teachers or owner can call this function");
        _;
    }
    
    function addTeacher(address teacherAddress) public onlyOwner {
        teachers[teacherAddress] = true;
        emit TeacherAdded(teacherAddress);
    }
    
    function isTeacher(address teacherAddress) public view returns (bool) {
        return teachers[teacherAddress];
    }
    
    function addResult(string memory studentId, bytes32 resultHash) public onlyTeacherOrOwner {
        studentResults[studentId] = resultHash;
        resultTimestamps[resultHash] = block.timestamp;
        resultIssuers[resultHash] = msg.sender;
        emit ResultAdded(studentId, resultHash);
    }
    
    function verifyResult(bytes32 resultHash) public view returns (bool, uint256, address) {
        uint256 timestamp = resultTimestamps[resultHash];
        if (timestamp == 0) {
            return (false, 0, address(0));
        }
        return (true, timestamp, resultIssuers[resultHash]);
    }
}

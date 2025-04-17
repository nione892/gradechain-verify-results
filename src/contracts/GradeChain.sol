
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

    // Mapping to store uploaded documents by document ID
    mapping(string => bytes32) public uploadedDocuments;

    // Mapping to store document timestamps
    mapping(bytes32 => uint256) public documentTimestamps;

    // Mapping to store document issuers
    mapping(bytes32 => address) public documentIssuers;

    // Events
    event TeacherAdded(address indexed teacherAddress);
    event TeacherRemoved(address indexed teacherAddress);
    event ResultAdded(string indexed studentId, bytes32 resultHash);
    event DocumentUploaded(string indexed documentId, bytes32 documentHash);

    constructor() {
        owner = msg.sender;
    }

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyTeacherOrOwner() {
        require(msg.sender == owner || teachers[msg.sender], "Only teachers or owner can call this function");
        _;
    }

    // Functions to manage teachers
    function addTeacher(address teacherAddress) public onlyOwner {
        teachers[teacherAddress] = true;
        emit TeacherAdded(teacherAddress);
    }

    function removeTeacher(address teacherAddress) public onlyOwner {
        teachers[teacherAddress] = false;
        emit TeacherRemoved(teacherAddress);
    }

    function isTeacher(address teacherAddress) public view returns (bool) {
        return teachers[teacherAddress];
    }

    // Upload result
    function addResult(string memory studentId, bytes32 resultHash) public onlyTeacherOrOwner {
        require(studentResults[studentId] == 0, "Result already exists");
        studentResults[studentId] = resultHash;
        resultTimestamps[resultHash] = block.timestamp;
        resultIssuers[resultHash] = msg.sender;
        emit ResultAdded(studentId, resultHash);
    }

    // Verify result
    function verifyResult(bytes32 resultHash) public view returns (bool, uint256, address) {
        uint256 timestamp = resultTimestamps[resultHash];
        if (timestamp == 0) {
            return (false, 0, address(0));
        }
        return (true, timestamp, resultIssuers[resultHash]);
    }

    // Upload certificate/document
    function uploadDocument(string memory documentId, bytes32 documentHash) public onlyTeacherOrOwner {
        uploadedDocuments[documentId] = documentHash;
        documentTimestamps[documentHash] = block.timestamp;
        documentIssuers[documentHash] = msg.sender;
        emit DocumentUploaded(documentId, documentHash);
    }

    // Verify certificate/document
    function verifyDocument(bytes32 documentHash) public view returns (bool, uint256, address) {
        uint256 timestamp = documentTimestamps[documentHash];
        if (timestamp == 0) {
            return (false, 0, address(0));
        }
        return (true, timestamp, documentIssuers[documentHash]);
    }
}

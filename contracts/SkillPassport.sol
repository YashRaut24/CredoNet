// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SkillPassport
 * @dev Decentralized verifiable skill passport built for Monad
 */
contract SkillPassport {
    struct Credential {
        bytes32 credentialId;
        address student;
        string skill;
        address issuer;
        string metadataHash;
        uint256 issuedAt;
        bool revoked;
    }

    address public owner;
    
    // Mapping from issuer address to authorization status
    mapping(address => bool) public authorizedIssuers;
    
    // Mapping from credentialId to Credential
    mapping(bytes32 => Credential) private credentials;
    
    // Mapping from student address to list of credentialIds
    mapping(address => bytes32[]) private studentCredentialIds;
    
    // Mapping from issuer address to list of credentialIds
    mapping(address => bytes32[]) private issuerCredentialIds;
    
    // All credential IDs list for global query
    bytes32[] private allCredentialIds;

    // Events
    event CredentialIssued(
        bytes32 indexed credentialId,
        address indexed student,
        address indexed issuer,
        string skill,
        string metadataHash,
        uint256 issuedAt
    );
    
    event CredentialRevoked(
        bytes32 indexed credentialId,
        address indexed issuer,
        uint256 revokedAt
    );
    
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "SkillPassport: caller is not the owner");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(
            authorizedIssuers[msg.sender] || msg.sender == owner,
            "SkillPassport: caller is not an authorized issuer"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
        emit IssuerAuthorized(msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SkillPassport: new owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function authorizeIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "SkillPassport: invalid issuer address");
        require(!authorizedIssuers[issuer], "SkillPassport: issuer already authorized");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    function revokeIssuer(address issuer) external onlyOwner {
        require(authorizedIssuers[issuer], "SkillPassport: issuer not authorized");
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    function isAuthorizedIssuer(address issuer) external view returns (bool) {
        return authorizedIssuers[issuer] || issuer == owner;
    }

    function issueCredential(
        address student,
        string calldata skill,
        string calldata metadataHash
    ) external onlyAuthorizedIssuer returns (bytes32) {
        require(student != address(0), "SkillPassport: invalid student address");
        require(bytes(skill).length > 0, "SkillPassport: skill cannot be empty");

        bytes32 credentialId = keccak256(
            abi.encodePacked(
                student,
                skill,
                msg.sender,
                metadataHash,
                block.timestamp,
                allCredentialIds.length
            )
        );

        Credential memory newCredential = Credential({
            credentialId: credentialId,
            student: student,
            skill: skill,
            issuer: msg.sender,
            metadataHash: metadataHash,
            issuedAt: block.timestamp,
            revoked: false
        });

        credentials[credentialId] = newCredential;
        studentCredentialIds[student].push(credentialId);
        issuerCredentialIds[msg.sender].push(credentialId);
        allCredentialIds.push(credentialId);

        emit CredentialIssued(
            credentialId,
            student,
            msg.sender,
            skill,
            metadataHash,
            block.timestamp
        );

        return credentialId;
    }

    function revokeCredential(bytes32 credentialId) external {
        Credential storage cred = credentials[credentialId];
        require(cred.credentialId != bytes32(0), "SkillPassport: credential does not exist");
        require(!cred.revoked, "SkillPassport: credential already revoked");
        require(
            cred.issuer == msg.sender || msg.sender == owner,
            "SkillPassport: only the issuer or owner can revoke"
        );

        cred.revoked = true;
        emit CredentialRevoked(credentialId, msg.sender, block.timestamp);
    }

    function getCredential(bytes32 credentialId) external view returns (Credential memory) {
        Credential memory cred = credentials[credentialId];
        require(cred.credentialId != bytes32(0), "SkillPassport: credential does not exist");
        return cred;
    }

    function isValidCredential(bytes32 credentialId) external view returns (bool) {
        Credential memory cred = credentials[credentialId];
        if (cred.credentialId == bytes32(0)) {
            return false;
        }
        return !cred.revoked;
    }

    function getStudentCredentials(address student) external view returns (Credential[] memory) {
        bytes32[] memory ids = studentCredentialIds[student];
        Credential[] memory result = new Credential[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = credentials[ids[i]];
        }
        return result;
    }

    function getIssuerCredentials(address issuer) external view returns (Credential[] memory) {
        bytes32[] memory ids = issuerCredentialIds[issuer];
        Credential[] memory result = new Credential[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = credentials[ids[i]];
        }
        return result;
    }

    function getTotalCredentials() external view returns (uint256) {
        return allCredentialIds.length;
    }

    function getAllCredentialIds() external view returns (bytes32[] memory) {
        return allCredentialIds;
    }
}

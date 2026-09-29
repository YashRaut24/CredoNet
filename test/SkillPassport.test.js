const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SkillPassport Contract", function () {
  let SkillPassport;
  let passport;
  let owner;
  let issuer;
  let student;
  let unauthorized;

  beforeEach(async function () {
    [owner, issuer, student, unauthorized] = await ethers.getSigners();
    SkillPassport = await ethers.getContractFactory("SkillPassport");
    passport = await SkillPassport.deploy();
    await passport.waitForDeployment();
  });

  describe("Deployment & Authorization", function () {
    it("should set the deployer as owner and authorized issuer", async function () {
      expect(await passport.owner()).to.equal(owner.address);
      expect(await passport.isAuthorizedIssuer(owner.address)).to.be.true;
    });

    it("should allow owner to authorize a new issuer", async function () {
      await expect(passport.authorizeIssuer(issuer.address))
        .to.emit(passport, "IssuerAuthorized")
        .withArgs(issuer.address);

      expect(await passport.isAuthorizedIssuer(issuer.address)).to.be.true;
    });

    it("should allow owner to revoke an authorized issuer", async function () {
      await passport.authorizeIssuer(issuer.address);
      await expect(passport.revokeIssuer(issuer.address))
        .to.emit(passport, "IssuerRevoked")
        .withArgs(issuer.address);

      expect(await passport.isAuthorizedIssuer(issuer.address)).to.be.false;
    });

    it("should revert if unauthorized account tries to authorize issuer", async function () {
      await expect(
        passport.connect(unauthorized).authorizeIssuer(issuer.address)
      ).to.be.revertedWith("SkillPassport: caller is not the owner");
    });
  });

  describe("Issuing Credentials", function () {
    beforeEach(async function () {
      await passport.authorizeIssuer(issuer.address);
    });

    it("should allow authorized issuer to issue a credential", async function () {
      const tx = await passport
        .connect(issuer)
        .issueCredential(student.address, "Smart Contract Security", "ipfs://QmTestHash123");

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      const studentCreds = await passport.getStudentCredentials(student.address);
      expect(studentCreds.length).to.equal(1);
      expect(studentCreds[0].student).to.equal(student.address);
      expect(studentCreds[0].issuer).to.equal(issuer.address);
      expect(studentCreds[0].skill).to.equal("Smart Contract Security");
      expect(studentCreds[0].metadataHash).to.equal("ipfs://QmTestHash123");
      expect(studentCreds[0].revoked).to.be.false;

      const isValid = await passport.isValidCredential(studentCreds[0].credentialId);
      expect(isValid).to.be.true;
    });

    it("should revert if unauthorized user tries to issue a credential", async function () {
      await expect(
        passport
          .connect(unauthorized)
          .issueCredential(student.address, "DeFi Architecture", "ipfs://QmDeFi")
      ).to.be.revertedWith("SkillPassport: caller is not an authorized issuer");
    });
  });

  describe("Revoking Credentials", function () {
    let credId;

    beforeEach(async function () {
      await passport.authorizeIssuer(issuer.address);
      const tx = await passport
        .connect(issuer)
        .issueCredential(student.address, "Solidity Core", "ipfs://QmCore123");
      await tx.wait();

      const creds = await passport.getStudentCredentials(student.address);
      credId = creds[0].credentialId;
    });

    it("should allow the issuer to revoke the credential", async function () {
      await expect(passport.connect(issuer).revokeCredential(credId))
        .to.emit(passport, "CredentialRevoked");

      const cred = await passport.getCredential(credId);
      expect(cred.revoked).to.be.true;

      const isValid = await passport.isValidCredential(credId);
      expect(isValid).to.be.false;
    });

    it("should allow contract owner to revoke a credential", async function () {
      await expect(passport.connect(owner).revokeCredential(credId))
        .to.emit(passport, "CredentialRevoked");

      const isValid = await passport.isValidCredential(credId);
      expect(isValid).to.be.false;
    });

    it("should prevent unauthorized user from revoking a credential", async function () {
      await expect(
        passport.connect(unauthorized).revokeCredential(credId)
      ).to.be.revertedWith("SkillPassport: only the issuer or owner can revoke");
    });
  });
});

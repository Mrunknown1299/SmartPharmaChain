const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PharmaceuticalSupplyChain", function () {
  let pharmaceuticalSupplyChain;
  let owner;
  let manufacturer;
  let distributor;
  let retailer;
  let consumer;

  beforeEach(async function () {
    [owner, manufacturer, distributor, retailer, consumer] = await ethers.getSigners();

    const PharmaceuticalSupplyChain = await ethers.getContractFactory("PharmaceuticalSupplyChain");
    pharmaceuticalSupplyChain = await PharmaceuticalSupplyChain.deploy();
    await pharmaceuticalSupplyChain.waitForDeployment();

    // Register stakeholders
    await pharmaceuticalSupplyChain.registerManufacturer(manufacturer.address);
    await pharmaceuticalSupplyChain.registerDistributor(distributor.address);
    await pharmaceuticalSupplyChain.registerRetailer(retailer.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await pharmaceuticalSupplyChain.owner()).to.equal(owner.address);
    });
  });

  describe("Registration", function () {
    it("Should register manufacturer", async function () {
      expect(await pharmaceuticalSupplyChain.manufacturers(manufacturer.address)).to.be.true;
    });

    it("Should register distributor", async function () {
      expect(await pharmaceuticalSupplyChain.distributors(distributor.address)).to.be.true;
    });

    it("Should register retailer", async function () {
      expect(await pharmaceuticalSupplyChain.retailers(retailer.address)).to.be.true;
    });
  });

  describe("Drug Manufacturing", function () {
    it("Should manufacture a drug", async function () {
      const batchId = "BATCH001";
      const drugName = "Paracetamol";
      const manufacturerName = "PharmaCorp";
      const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now

      await pharmaceuticalSupplyChain.connect(manufacturer).manufactureDrug(
        batchId,
        drugName,
        manufacturerName,
        expiryDate
      );

      const drugDetails = await pharmaceuticalSupplyChain.getDrugDetails(batchId);
      expect(drugDetails.name).to.equal(drugName);
      expect(drugDetails.manufacturer).to.equal(manufacturerName);
      expect(drugDetails.status).to.equal(0); // Manufactured status
    });

    it("Should not allow non-manufacturer to manufacture drug", async function () {
      const batchId = "BATCH002";
      const drugName = "Aspirin";
      const manufacturerName = "PharmaCorp";
      const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

      await expect(
        pharmaceuticalSupplyChain.connect(distributor).manufactureDrug(
          batchId,
          drugName,
          manufacturerName,
          expiryDate
        )
      ).to.be.revertedWith("Only registered manufacturers can call this function");
    });
  });

  describe("Drug Distribution", function () {
    beforeEach(async function () {
      const batchId = "BATCH003";
      const drugName = "Ibuprofen";
      const manufacturerName = "PharmaCorp";
      const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

      await pharmaceuticalSupplyChain.connect(manufacturer).manufactureDrug(
        batchId,
        drugName,
        manufacturerName,
        expiryDate
      );
    });

    it("Should distribute a drug", async function () {
      const batchId = "BATCH003";

      await pharmaceuticalSupplyChain.connect(distributor).distributeDrug(batchId);

      const drugDetails = await pharmaceuticalSupplyChain.getDrugDetails(batchId);
      expect(drugDetails.status).to.equal(1); // Distributed status
      expect(drugDetails.distributor_id).to.equal(distributor.address);
    });
  });

  describe("Drug Verification", function () {
    it("Should verify authentic drug", async function () {
      const batchId = "BATCH004";
      const drugName = "Amoxicillin";
      const manufacturerName = "PharmaCorp";
      const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

      await pharmaceuticalSupplyChain.connect(manufacturer).manufactureDrug(
        batchId,
        drugName,
        manufacturerName,
        expiryDate
      );

      expect(await pharmaceuticalSupplyChain.verifyDrug(batchId)).to.be.true;
    });

    it("Should not verify non-existent drug", async function () {
      expect(await pharmaceuticalSupplyChain.verifyDrug("NONEXISTENT")).to.be.false;
    });
  });
});

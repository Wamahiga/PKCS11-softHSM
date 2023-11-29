const graphene = require("graphene-pk11");
const Module = graphene.Module;

// Function to generate RSA key pair with a custom attribute (e.g., Terminal Serial Number) in SoftHSM
async function generateRSAKeyPair() {
  const lib = "D:\\SoftHSM2\\lib\\softhsm2-x64.dll";
  const mod = Module.load(lib, "SoftHSM");
  mod.initialize();

  const slot = mod.getSlots(4);

  if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
    // const session = slot.open();
    const session = slot.open(graphene.SessionFlag.RW_SESSION | graphene.SessionFlag.SERIAL_SESSION);


    try {
      session.login("password");

      // Define terminal serial number
      const terminalSerialNumber = "3456789";

      const keyTemplate = {
        class: graphene.ObjectClass.PUBLIC_KEY,
        token: true,
        keyType: graphene.KeyType.RSA,
        label: terminalSerialNumber,
        modulusBits: 2048, // Adjust the key size as needed
        publicExponent: Buffer.from([1, 0, 1]),
        private: true,
      };


      const keyPair = session.generateKeyPair(graphene.KeyGenMechanism.RSA, keyTemplate);

      console.log("RSA Public Key Handle:", keyPair.publicKey.handle.toString("hex"));
      console.log("RSA Private Key Handle:", keyPair.privateKey.handle.toString("hex"));

    } finally {
      session.logout();
      session.close();
    }
  } else {
    console.error("Slot is not initialized");
  }

  mod.finalize();
}

generateRSAKeyPair().catch((error) => {
  console.error("Error:", error);
});

const graphene = require("graphene-pk11");
const Module = graphene.Module;

// Function to generate RSA key pair with a custom attribute (e.g., Terminal Serial Number) in SoftHSM
async function generateRSAKeyPair() {
  const lib = "D:\\SoftHSM2\\lib\\softhsm2-x64.dll";
  const mod = Module.load(lib, "SoftHSM");
  mod.initialize();

  const slot = mod.getSlots(4);

  if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
    const session = slot.open(graphene.SessionFlag.RW_SESSION | graphene.SessionFlag.SERIAL_SESSION);

    try {
      session.login("password");

      // Define terminal serial number
      const terminalSerialNumber = "3456789";

      const keyTemplate = {
        class: graphene.ObjectClass.PUBLIC_KEY,
        token: true,
        keyType: graphene.KeyType.RSA,
        label: terminalSerialNumber,
        modulusBits: 2048, // Adjust the key size as needed
        publicExponent: Buffer.from([1, 0, 1]),
        private: true,
      };

      const keyPair = session.generateKeyPair(graphene.KeyGenMechanism.RSA, keyTemplate);

      console.log("RSA Public Key Handle:", keyPair.publicKey.handle.toString("hex"));
      console.log("RSA Private Key Handle:", keyPair.privateKey.handle.toString("hex"));
    } finally {
      session.logout();
      session.close();
    }
  } else {
    console.error("Slot is not initialized");
  }

  mod.finalize();
}

// Export the function using module.exports
module.exports = generateRSAKeyPair;

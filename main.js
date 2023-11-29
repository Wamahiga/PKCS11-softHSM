const graphene = require("graphene-pk11");
const Module = graphene.Module;
let mod;

// Function to initialize the SoftHSM module and get the slot
function initializeModule() {
  const lib = "D:\\SoftHSM2\\lib\\softhsm2-x64.dll";
 mod = Module.load(lib, "SoftHSM");
  mod.initialize();

  const slot = mod.getSlots(5);

  if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
    return slot;
  } else {
    console.error("Slot is not initialized");
    return null;
  }
}
// Function to fetch the terminal serial number
function fetchTerminalSerialNumber() {
  // For now, returning a hardcoded value
  

  return "12345678";
}


// Function to generate RSA key pair with a custom attribute
async function generateRSAKeyPair(session, terminalSerialNumber) {
  try {
    const keyTemplate = {
      class: graphene.ObjectClass.PUBLIC_KEY,
      token: true,
      keyType: graphene.KeyType.RSA,
      label: terminalSerialNumber,
      modulusBits: 2048, // Adjust the key size as needed
      publicExponent: Buffer.from([1, 0, 1]),
      private: true,
    };

    return await session.generateKeyPair(graphene.KeyGenMechanism.RSA, keyTemplate);
   

  } catch (error) {
    console.error("Error generating RSA key pair:", error.message);
    throw error;
  }
}

// Function to find a public key by label:serial number
function findPublicKey(session, terminalSerialNumber) {
  try {
    return session.find({ class: graphene.ObjectClass.PUBLIC_KEY, label: terminalSerialNumber }).items(0);
  } catch (error) {
    console.error("Error finding public key:", error.message);
    throw error;
  }
}

// Function to find a private key by terminal serial number
function findPrivateKey(session, terminalSerialNumber) {
  try {
    return session.find({ class: graphene.ObjectClass.PRIVATE_KEY, label: terminalSerialNumber }).items(0);
  } catch (error) {
    console.error("Error finding private key:", error.message);
    throw error;
  }
}

// Function to encrypt data using RSA
function encryptData(session, mechanism, publicKey, dataToEncrypt) {
  try {
    const cipher = session.createCipher(mechanism, publicKey);
    return cipher.once(dataToEncrypt, Buffer.alloc(256)).toString("hex");
  } catch (error) {
    console.error("Error encrypting data:", error.message);
    throw error;
  }
}


// Function to decrypt data using RSA
function decryptData(session, mechanism, privateKey, encryptedData) {
  try {
    const decipher = session.createDecipher(mechanism, privateKey);
    const decryptedData = decipher.once(Buffer.from(encryptedData, "hex"), Buffer.alloc(256));
    return decryptedData.toString("utf8");
  } catch (error) {
    console.error("Error decrypting data:", error.message);
    throw error;
  }
}
// Function to perform the key generation, encryption, and decryption
async function performOperations() {
  const slot = initializeModule();

  if (slot) {
    const session = slot.open(graphene.SessionFlag.RW_SESSION | graphene.SessionFlag.SERIAL_SESSION);

    try {
      session.login("password");

      const terminalSerialNumber = fetchTerminalSerialNumber();

      const keyPair = await generateRSAKeyPair(session, terminalSerialNumber);
      console.log("\nRSA Public Key Handle:", keyPair.publicKey.handle.toString("hex"));
      console.log("\nRSA Private Key Handle:", keyPair.privateKey.handle.toString("hex"));

      const publicKey = findPublicKey(session, terminalSerialNumber);
      const privateKey = findPrivateKey(session);

      if (!publicKey || !privateKey) {
        throw new Error("Public or private key not found for the terminal serial number");
      }

      const MESSAGE = "HURRAY I WAS HERE!";
      const mechanism = { name: "RSA_PKCS" };

      const encryptedData = encryptData(session, mechanism, publicKey, Buffer.from(MESSAGE, "utf8"));
      console.log("Encrypted:", encryptedData);

      const decryptedMessage = decryptData(session, mechanism, privateKey, encryptedData);
      console.log("\nDecrypted:", decryptedMessage);
    }catch (error) {
      console.error("Error in performOperations:", error.message);
    }finally {
      session.logout();
      session.close();
    }
  }

  mod.finalize();
}

performOperations().catch((error) => {
  console.error("Error:", error);
});

const graphene = require("graphene-pk11");
const { initializeModule, fetchTerminalSerialNumber, mod } = require("./utils");
const { generateRSAKeyPair, findPublicKey, findPrivateKey } = require("./keyManagement");
const { encryptData, decryptData } = require("./encryption");
let session;


async function performOperations() {
  const slot = initializeModule();

  if (slot) {
     session = slot.open(graphene.SessionFlag.RW_SESSION | graphene.SessionFlag.SERIAL_SESSION);

    try {
      session.login("password");

      const terminalSerialNumber = fetchTerminalSerialNumber();

      const keyPair = await generateRSAKeyPair(session, terminalSerialNumber);
      console.log("RSA Public Key Handle:", keyPair.publicKey.handle.toString("hex"));
      console.log("RSA Private Key Handle:", keyPair.privateKey.handle.toString("hex"));

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
    } catch (error) {
      console.error("Error in performOperations:", error.message);
    } finally {
      session.logout();
      session.close();
    }
  }
if (mod){
  mod.finalize();
}

}

performOperations().catch((error) => {
  console.error("Error:", error);
});

module.exports = {
  performOperations,
  // other exports...
};
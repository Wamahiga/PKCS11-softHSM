const graphene = require("graphene-pk11");
const { initializeModule, fetchTerminalSerialNumber, mod } = require("./utils");
const { generateRSAKeyPair, findPublicKey, findPrivateKey, generateAESKey } = require("./keyManagement");
const { encryptData, decryptData, wrapAESKey} = require("./encryption");
let session;

async function performOperations() {
    const slot = initializeModule();

    if (slot) {
        session = slot.open(graphene.SessionFlag.RW_SESSION | graphene.SessionFlag.SERIAL_SESSION);

        try {
            session.login("password");
        } catch (error) {
            console.error("Error logging in:", error.message);
            return;
        }

        const terminalSerialNumber = fetchTerminalSerialNumber();

        let keyPair;
        try {
            // Generate RSA key pair
            keyPair = await generateRSAKeyPair(session, terminalSerialNumber);
            console.log("\nRSA Public Key Handle:", keyPair.publicKey.handle.toString("hex"));
            console.log("\nRSA Private Key Handle:", keyPair.privateKey.handle.toString("hex"));
        } catch (error) {
            console.error("Error generating RSA key pair:", error.message);
            return;
        }

        let publicKey, privateKey;
        try {
            // Find RSA keys
            publicKey = findPublicKey(session, terminalSerialNumber);
            privateKey = findPrivateKey(session, terminalSerialNumber);
        } catch (error) {
            console.error("Error finding RSA keys:", error.message);
            return;
        }

        let aesKey;
        try {
            // Generate an AES key
            const aesKeyLabel = "Label";
            aesKey = generateAESKey(session, aesKeyLabel);
            console.log("\nAES Key Handle:", aesKey.handle.toString("hex"));
        } catch (error) {
            console.error("Error generating AES key:", error.message);
            return;
        }

        if (!publicKey || !privateKey) {
            console.error("Public or private key not found for the terminal serial number");
            return;
        }

        const mechanism = { name: "RSA_PKCS" };

        let wrappedKey;
        try {
            // Wrap the AES key with the RSA public key
            wrappedKey = wrapAESKey(session, publicKey, aesKey, mechanism);
            console.log("\nWrapped AES key:", wrappedKey.toString('hex'));
        } catch (error) {
            console.error("Error wrapping AES key:", error.message);
            return;
        }

        const MESSAGE = "HURRAY I WAS HERE!";

        let encryptedData, decryptedMessage;
        try {
            // Encrypt and decrypt the message
            encryptedData = encryptData(session, mechanism, publicKey, Buffer.from(MESSAGE, "utf8"));
            console.log("\nEncrypted:", encryptedData.toString('hex'));
            decryptedMessage = decryptData(session, mechanism, privateKey, encryptedData);
            console.log("\nDecrypted:", decryptedMessage);
        } catch (error) {
            console.error("Error encrypting or decrypting the message:", error.message);
            return;
        }

        session.logout();
        session.close();
    }

    if (mod) {
        mod.finalize();
    }
}

// ... rest of the code ...

performOperations().catch((error) => {
    console.error("Error:", error);
});

module.exports = {
    performOperations,
    // other exports...
};
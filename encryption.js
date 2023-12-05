const graphene = require("graphene-pk11");


function encryptData(session, mechanism, publicKey, dataToEncrypt) {
    try {
        const cipher = session.createCipher(mechanism, publicKey);
        return cipher.once(dataToEncrypt, Buffer.alloc(256));
    } catch (error) {
        console.error("Error encrypting data:", error.message);
        throw error;
    }
}


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

module.exports = {
  encryptData,
  decryptData,
};

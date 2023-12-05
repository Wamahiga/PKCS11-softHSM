const graphene = require("graphene-pk11");

async function generateRSAKeyPair(session, terminalSerialNumber) {
    try {
        // Check if a key pair with the same serial number already exists
        const existingPublicKey = findPublicKey(session, terminalSerialNumber);
        const existingPrivateKey = findPrivateKey(session, terminalSerialNumber);
        // console.log('existingPublicKey:', existingPublicKey);
        // console.log('existingPrivateKey:', existingPrivateKey);

        if (existingPublicKey || existingPrivateKey) {
            throw new Error(`A key pair with the serial number ${terminalSerialNumber} already exists.`);
        }

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

function findPublicKey(session, terminalSerialNumber) {
    try {
        const publicKey = session.find({ class: graphene.ObjectClass.PUBLIC_KEY, label: terminalSerialNumber }).items(0);
        return publicKey.handle ? publicKey : null;
    } catch (error) {
        console.error("Error finding private key:", error.message);
        throw error;
    }PUBLIC_KEY
}

function findPrivateKey(session,terminalSerialNumber) {
    try {
        const privateKey = session.find({ class: graphene.ObjectClass.PRIVATE_KEY, label: terminalSerialNumber }).items(0);
        return privateKey.handle ? privateKey : null;
    } catch (error) {
        console.error("Error finding public key:", error.message);
        throw error;
    }
}

    

module.exports = {
  generateRSAKeyPair,
  findPublicKey,
  findPrivateKey,
};

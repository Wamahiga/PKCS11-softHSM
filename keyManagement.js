const graphene = require("graphene-pk11");

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

function findPublicKey(session, terminalSerialNumber) {
    try {
        return session.find({ class: graphene.ObjectClass.PRIVATE_KEY, label: terminalSerialNumber }).items(0);
      } catch (error) {
        console.error("Error finding private key:", error.message);
        throw error;
      }
    }

function findPrivateKey(session,terminalSerialNumber) {
    try {
        return session.find({ class: graphene.ObjectClass.PUBLIC_KEY, label: terminalSerialNumber }).items(0);
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

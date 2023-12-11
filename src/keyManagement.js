const graphene = require("graphene-pk11");
const {initializeModule, fetchTerminalSerialNumber, mod} = require("./utils");


//Generate keys
async function generateRSAKeyPair(session, terminalSerialNumber) {
    // Check if a key pair with the same serial number already exists
    const existingPublicKey = findPublicKey(session, terminalSerialNumber);
    const existingPrivateKey = findPrivateKey(session, terminalSerialNumber);

    if (existingPublicKey || existingPrivateKey) {
        throw new Error(`A key pair with the serial number ${terminalSerialNumber} already exists.`);
    }
       // Generate RSA key pair
       var keyPair = await session.generateKeyPair(graphene.KeyGenMechanism.RSA, {
        keyType: graphene.KeyType.RSA,
        modulusBits: 1024,
        publicExponent: Buffer.from([3]),
        token: true,
        verify: true,
        encrypt: true,
        wrap: true,
        label: terminalSerialNumber // label for the public key
    }, {
        keyType: graphene.KeyType.RSA,
        token: true,
        sign: true,
        decrypt: true,
        unwrap: true,
        label: terminalSerialNumber // label for the private key
    });


    // // Log the handles
    // console.log("RSA Public Key Handle:", keyPair.publicKey.handle.toString("hex"));
    // console.log("RSA Private Key Handle:", keyPair.privateKey.handle.toString("hex"));

    return keyPair;
}


//find the public key
function findPublicKey(session, terminalSerialNumber) {
    try {
        const publicKey = session.find({ class: graphene.ObjectClass.PUBLIC_KEY, label: terminalSerialNumber }).items(0);
        if (publicKey.handle) {
            // get public key attributes
            var pubKeyAttributes = publicKey.getAttribute({
                modulus: null,
                publicExponent: null,
                label: null
            });

            // console.log("Public Key Attributes:", pubKeyAttributes);
            return publicKey;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error finding public key:", error.message);
        throw error;
    }
}


//find private key
function findPrivateKey(session, terminalSerialNumber) {
    try {
        const privateKey = session.find({ class: graphene.ObjectClass.PRIVATE_KEY, label: terminalSerialNumber }).items(0);
        if (privateKey.handle) {
            // get private key attributes
            var privKeyAttributes = privateKey.getAttribute({
                keyType: null,
                label: null, 
            });

            // console.log("Private Key Attributes:", privKeyAttributes);
            return privateKey;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error finding private key:", error.message);
        throw error;
    }
}


//generate AES keys

function generateAESKey(session, label) {
    // Generate an AES key
    const secretKey = session.generateKey(graphene.KeyGenMechanism.AES, {
        keyType: graphene.KeyType.AES,
        valueLen: 256 / 8, // for AES-256
        token: false,
        encrypt: true,
        decrypt: true,
        wrap: true,
        unwrap: true,
        extractable: true, // Allow the key to be extracted
        label: label
    });

    return secretKey;
}


module.exports = {
    generateRSAKeyPair,
    findPublicKey,
    findPrivateKey,
    generateAESKey,
};

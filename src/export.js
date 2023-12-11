var graphene = require("graphene-pk11");
var { initializeModule } = require("./utils");

var mod = initializeModule();

var slot = mod.getSlots(0);
if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
    var session = slot.open();
    session.login("12345");

    // Generate an AES key
    var aesKey = session.generateKey(graphene.KeyGenMechanism.AES, {
        keyType: graphene.KeyType.AES,
        valueLen: 256 / 8, // for AES-256
        token: false,
        encrypt: true,
        decrypt: true,
        wrap: true,
        unwrap: true
    });

    // Assume publicKey is the RSA public key you have generated
    var publicKey = findPublicKey(session, "YourPublicKeyLabel");

    // Wrap the AES key with the RSA public key
    var mechanism = { name: "RSA_PKCS" };
    var wrappedKey = session.wrapKey(mechanism, publicKey, aesKey);

    console.log("Wrapped AES key:", wrappedKey.toString('hex'));

    session.logout();
    session.close();
} else {
    console.error("Slot is not initialized");
}

mod.finalize();
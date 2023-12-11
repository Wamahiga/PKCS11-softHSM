const graphene = require("graphene-pk11");
const { generateRSAKeyPair, generateAESKey } = require("../src/keyManagement");
const { encryptData, decryptData, wrapAESKey } = require('../src/encryption');

const Module = graphene.Module;
let session;
let keyPair, rsaKeyPair;

beforeAll(() => {
    const lib = "D:\\SoftHSM2\\lib\\softhsm2-x64.dll";
    mod = Module.load(lib, "SoftHSM");
    mod.initialize();

    const slot = mod.getSlots(6);

    if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
        // return slot;
    } else {
        console.error("Slot is not initialized");
        return null;
    }

    session = slot.open(graphene.SessionFlag.RW_SESSION | graphene.SessionFlag.SERIAL_SESSION);
    session.login("password");
});
beforeEach(() => {

});

afterEach(() => {

});

afterAll(() => {
    // let keys = session.find({class: graphene.ObjectClass.PRIVATE_KEY});
    // for(let i = 0; i < keys.length; i++) {
    //     keys.items(i).destroy();
    // }

    // keys = session.find({class: graphene.ObjectClass.PUBLIC_KEY});
    // for(let i = 0; i < keys.length; i++) {
    //     keys.items(i).destroy();
    // }

    session.close();
});



describe('RSA Key Pair Tests', () => {
    const terminalSerialNumber = "232545";
    let aesKey, wrappedKey;
    const aesKeyLabel = "TestAESKey";

    beforeAll(async () => {
        // Generate an AES key
        aesKey = generateAESKey(session, aesKeyLabel);

    });

    beforeEach(async () => {
        keyPair = await generateRSAKeyPair(session, terminalSerialNumber);
        rsaKeyPair = keyPair


    });

    afterAll(() => {
        // Delete the AES key
        session.find({ class: graphene.ObjectClass.SECRET_KEY, label: aesKeyLabel }).items(0).destroy();
    });

    afterEach(() => {
        // Delete the keys after each test
        session.find({ class: graphene.ObjectClass.PRIVATE_KEY, label: terminalSerialNumber }).items(0).destroy();
        session.find({ class: graphene.ObjectClass.PUBLIC_KEY, label: terminalSerialNumber }).items(0).destroy();
    });

    test('Test keys generated successfully', () => {
        // Log the handles of the keys
        console.log("RSA Public Key Handle:", keyPair.publicKey.handle.toString("hex"));
        console.log("RSA Private Key Handle:", keyPair.privateKey.handle.toString("hex"));

        expect(keyPair.privateKey).not.toBeNull();
        expect(keyPair.publicKey).not.toBeNull();

    });

    test('Test private key label', () => {
        const privateKeyLabel = keyPair.privateKey.getAttribute({ label: null });
        console.log('Private Key Label:', privateKeyLabel.label);
        expect(privateKeyLabel.label).toBe(terminalSerialNumber);
    });

    test('Test public key label', () => {
        const publicKeyLabel = keyPair.publicKey.getAttribute({ label: null });
        console.log('Private Key Label:', publicKeyLabel.label);
        expect(publicKeyLabel.label).toBe(terminalSerialNumber);
    });

    test('Test find private key', async () => {
        const privateKey = session.find({ class: graphene.ObjectClass.PRIVATE_KEY, label: terminalSerialNumber }).items(0);

        expect(privateKey).not.toBeNull();
        const privateKeyLabel = privateKey.getAttribute({ label: null });

        expect(privateKeyLabel.label).toBe(terminalSerialNumber);
    });

    test('Test find public key', async () => {
        const publicKey = session.find({ class: graphene.ObjectClass.PUBLIC_KEY, label: terminalSerialNumber }).items(0);
        expect(publicKey).not.toBeNull();

        const publicKeyLabel = publicKey.getAttribute({ label: null });
        expect(publicKeyLabel.label).toBe(terminalSerialNumber);
    });
    test('Test RSA encryption and decryption', async () => {
        const data = Buffer.from('Hello, world!');
        const mechanism = { name: "RSA_PKCS" };
    
        const encryptedData = await encryptData(session, mechanism, keyPair.publicKey, data);
        console.log("\nEncrypted:", encryptedData.toString('hex'));
        const decryptedData = await decryptData(session, mechanism, keyPair.privateKey, encryptedData);
        console.log('Decrypted Data:', decryptedData);
    
        expect(decryptedData).toEqual(data.toString('utf8'));
    });

    test('Test AES key generated successfully', () => {
        expect(aesKey).not.toBeNull();
    });

    test('Test AES key label', () => {
        const keyLabel = aesKey.getAttribute({ label: null });
        expect(keyLabel.label).toBe(aesKeyLabel);
    });

    test('Test wrap AES key with public key', () => {
        // Wrap the AES key with the RSA public key
        const mechanism = { name: "RSA_PKCS" };
        wrappedKey = wrapAESKey(session, rsaKeyPair.publicKey, aesKey, mechanism);

        // Log the wrapped key
        console.log("Wrapped key:", wrappedKey.toString('hex'));

        // Check that the wrapped key is not null
        expect(wrappedKey).not.toBeNull();
    });

});


const graphene = require("graphene-pk11");
const Module = graphene.Module;
let mod;

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

function fetchTerminalSerialNumber() {
      // For now, returning a hardcoded value
  return "9992577534534644906";
}

module.exports = {
    initializeModule,
    fetchTerminalSerialNumber,
    mod,
  };
// src/softHSM.js
const graphene = require('graphene-pk11');
const graphene = require("graphene-pk11");


let mod;

function initializeModule() {
  const lib = "D:\\SoftHSM2\\lib\\softhsm2-x64.dll";
  mod = graphene.Module.load(lib, "SoftHSM");
  mod.initialize();

  const slot = mod.getSlots(4);

  if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
    return slot;
  } else {
    console.error("Slot is not initialized");
    return null;
  }
}

function finalizeModule() {
  mod.finalize();
}

module.exports = {
  initializeModule,
  finalizeModule,
};

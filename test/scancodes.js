"use strict";

const {test, Test} = require('tap')

const {
    ReversedKeymap, SyncFlags, KeyAcquire, KeyRelease, toHumanReadableMods,
    scancodesForSynchronizedMods,
} = require("scancodes");

const layouts = require("reversed_layouts").layouts;

const rkeymapFr = (() => {
  for (const layout of layouts) {
      if (layout.localeName === "fr-FR") {
          return new ReversedKeymap(layout);
      }
  }
})();

const rkeymapUs = (() => {
  for (const layout of layouts) {
      if (layout.localeName === "en-US") {
          return new ReversedKeymap(layout);
      }
  }
})();

const rkeymapDoubleDeadKey = (() => {
  for (const layout of layouts) {
      if (layout.klid === 0x0001045c) {
          return new ReversedKeymap(layout);
      }
  }
})();

// add test comparator
//@{
Test.prototype.addAssert('hexEqual', 2, function (a, b, message, extra) {
    return this.equal(`0x${a.toString(16)}`, `0x${b.toString(16)}`, message, extra);
});

function arrayToHexString(a) {
    if (!a) return a;
    const accu = [];
    for (const n of a) {
        accu.push(`0x${n.toString(16)}`);
    }
    return accu.join(', ');
}

Test.prototype.addAssert('hexArrayEqual', 2, function (a, b, message, extra) {
    return this.equal(arrayToHexString(a), arrayToHexString(b), message, extra);
});
//@}


const NoMod       = 0;
const ShiftMod    = 1 << 0;
const AltGrMod    = 1 << 1;
const CapsLockMod = 1 << 2;
const CtrlMod     = 1 << 3;
const AltMod      = 1 << 4;
// const OEM8Mod     = 1 << 5;
// const KanaMod     = 1 << 6;
// const KanaLockMod = 1 << 7;
const NumLockMod  = 1 << 8;
const RightShiftMod = 1 << 9;
const RightCtrlMod  = 1 << 10;


test('toScancodesAndFlags()', t => {
    test('not character', t => {
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('unknown character for french keyboard <ß>', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("ß", "KeyA", KeyAcquire), undefined);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("ß", "KeyA", KeyRelease), undefined);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <b>', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("b", "KeyB", KeyAcquire), [0x30]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("b", "KeyB", KeyRelease), [0x8030]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <Shift+:> (/)', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2A]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("/", "Period", KeyAcquire), [0x34]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("/", "Period", KeyRelease), [0x8034]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802A]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing shift + : = / (FR to US keyboard)', t => {
        t.hexArrayEqual(rkeymapUs.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2A]);
        t.hexEqual(rkeymapUs.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapUs.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapUs.toScancodesAndFlags("/", "Period", KeyAcquire), [0x802A, 0x35, 0x2A]);
        t.hexEqual(rkeymapUs.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapUs.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapUs.toScancodesAndFlags("/", "Period", KeyRelease), [0x8035]);
        t.hexEqual(rkeymapUs.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapUs.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapUs.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802A]);
        t.hexEqual(rkeymapUs.getModFlags(), 0);
        t.hexEqual(rkeymapUs.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <Enter>', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Enter", "Enter", KeyAcquire), [0x1C]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Enter", "Enter", KeyRelease), [0x801C]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing Escape', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Escape", "Escape", KeyAcquire), [0x01]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Escape", "Escape", KeyRelease), [0x8001]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <A>', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2A]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802a]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <A>; weird case', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2A]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802a]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("a", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <A>; ShiftRight case', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftRight", KeyAcquire), [0x36]);
        t.hexEqual(rkeymapFr.getModFlags(), RightShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymapFr.getModFlags(), RightShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymapFr.getModFlags(), RightShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftRight", KeyRelease), [0x8036]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <A>; ShiftRight + ShiftLeft', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftRight", KeyAcquire), [0x36]);
        t.hexEqual(rkeymapFr.getModFlags(), RightShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2A]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod | RightShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod | RightShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod | RightShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftRight", KeyRelease), [0x8036]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802a]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <a>; ShiftLeft, weird browser case', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2A]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("a", "KeyQ", KeyAcquire), [0x802A, 0x10, 0x2A]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("a", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802a]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <a>; ShiftLeft, interlaced and weird browser case', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2A]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("a", "KeyQ", KeyAcquire), [0x802A, 0x10, 0x2A]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802a]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("a", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <A>; Capslock case', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("CapsLock", "CapsLock", KeyAcquire), [0x3a]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("CapsLock", "CapsLock", KeyRelease), [0x803a]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("CapsLock", "CapsLock", KeyAcquire), [0x3a]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("CapsLock", "CapsLock", KeyRelease), [0x803a]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <a>; Capslock case', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("CapsLock", "CapsLock", KeyAcquire), [0x3a]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("CapsLock", "CapsLock", KeyRelease), [0x803a]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("a", "KeyQ", KeyAcquire), [0x3a, 0x803a, 0x10, 0x3a, 0x803a]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("a", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("CapsLock", "CapsLock", KeyAcquire), [0x3a]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("CapsLock", "CapsLock", KeyRelease), [0x803a]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <A>; Capslock & NumLock case', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("NumLock", "NumLock", KeyAcquire), [0x45]);
        t.hexEqual(rkeymapFr.getModFlags(), NumLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("NumLock", "NumLock", KeyRelease), [0x8045]);
        t.hexEqual(rkeymapFr.getModFlags(), NumLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("CapsLock", "CapsLock", KeyAcquire), [0x3a]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod | NumLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("CapsLock", "CapsLock", KeyRelease), [0x803a]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod | NumLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod | NumLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod | NumLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod | NumLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("A", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymapFr.getModFlags(), CapsLockMod | NumLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("CapsLock", "CapsLock", KeyAcquire), [0x3a]);
        t.hexEqual(rkeymapFr.getModFlags(), NumLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("CapsLock", "CapsLock", KeyRelease), [0x803a]);
        t.hexEqual(rkeymapFr.getModFlags(), NumLockMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("NumLock", "NumLock", KeyAcquire), [0x45]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("NumLock", "NumLock", KeyRelease), [0x8045]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <ô>; Deadkey case', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Dead", "BracketLeft", KeyAcquire), undefined);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Dead", "BracketLeft", KeyRelease), undefined);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        // we send the input
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("ô", "KeyO", KeyAcquire), [0x1a, 0x18]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("o", "KeyO", KeyRelease), [0x8018]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <Ctrl+A>; "Select All" case', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Control", "ControlLeft", KeyAcquire), [0x1D]);
        t.hexEqual(rkeymapFr.getModFlags(), CtrlMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("a", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymapFr.getModFlags(), CtrlMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        // we send the input
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("a", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymapFr.getModFlags(), CtrlMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Control", "ControlLeft", KeyRelease), [0x801D]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <Ctrl+Alt+AltGr>', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Control", "ControlLeft", KeyAcquire), [0x1D]);
        t.hexEqual(rkeymapFr.getModFlags(), CtrlMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        rkeymapFr.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymapFr.getModFlags(), CtrlMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        rkeymapFr.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymapFr.getModFlags(), CtrlMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);


        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Alt", "AltLeft", KeyAcquire), [0x38]);
        t.hexEqual(rkeymapFr.getModFlags(), CtrlMod | AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), AltGrMod);

        rkeymapFr.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymapFr.getModFlags(), CtrlMod | AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        rkeymapFr.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymapFr.getModFlags(), CtrlMod | AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), AltGrMod);


        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Control", "ControlLeft", KeyRelease), [0x801D]);
        t.hexEqual(rkeymapFr.getModFlags(), AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        rkeymapFr.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymapFr.getModFlags(), AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        rkeymapFr.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymapFr.getModFlags(), AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);


        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("AltGraph", "AltRight", KeyAcquire), [0x138]);
        t.hexEqual(rkeymapFr.getModFlags(), AltMod | AltGrMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), AltGrMod);

        rkeymapFr.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymapFr.getModFlags(), AltMod | AltGrMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), AltGrMod);

        rkeymapFr.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymapFr.getModFlags(), AltMod | AltGrMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), AltGrMod);


        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Alt", "AltLeft", KeyRelease), [0x8038]);
        t.hexEqual(rkeymapFr.getModFlags(), AltGrMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), AltGrMod);

        rkeymapFr.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymapFr.getModFlags(), AltGrMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), AltGrMod);

        rkeymapFr.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymapFr.getModFlags(), AltGrMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), AltGrMod);


        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("AltGraph", "AltRight", KeyRelease), [0x8138]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);


        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Alt", "AltLeft", KeyAcquire), [0x38]);
        t.hexEqual(rkeymapFr.getModFlags(), AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        rkeymapFr.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymapFr.getModFlags(), AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        rkeymapFr.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymapFr.getModFlags(), AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);


        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Control", "ControlRight", KeyAcquire), [0x11D]);
        t.hexEqual(rkeymapFr.getModFlags(), RightCtrlMod | AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), AltGrMod);

        rkeymapFr.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymapFr.getModFlags(), RightCtrlMod | AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        rkeymapFr.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymapFr.getModFlags(), RightCtrlMod | AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), AltGrMod);


        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Control", "ControlRight", KeyRelease), [0x811D]);
        t.hexEqual(rkeymapFr.getModFlags(), AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        rkeymapFr.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymapFr.getModFlags(), AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        rkeymapFr.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymapFr.getModFlags(), AltMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);


        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Alt", "AltLeft", KeyRelease), [0x8038]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <Shift>', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2a]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftRight", KeyAcquire), [0x36]);
        t.hexEqual(rkeymapFr.getModFlags(), ShiftMod | RightShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802a]);
        t.hexEqual(rkeymapFr.getModFlags(), RightShiftMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Shift", "ShiftRight", KeyRelease), [0x8036]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <OS>', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("OS", "OSLeft", KeyAcquire), [0x15b]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("OS", "OSRight", KeyAcquire), [0x15c]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("OS", "OSLeft", KeyRelease), [0x815b]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("OS", "OSRight", KeyRelease), [0x815c]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <Meta>', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Meta", "MetaLeft", KeyAcquire), [0x15b]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Meta", "MetaRight", KeyAcquire), [0x15c]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Meta", "MetaLeft", KeyRelease), [0x815b]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Meta", "MetaRight", KeyRelease), [0x815c]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <Ctrl + Backspace>', t => {
        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Control", "ControlLeft", KeyAcquire), [0x1D]);
        t.hexEqual(rkeymapFr.getModFlags(), CtrlMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Backspace", "Backspace", KeyAcquire), [0x0e]);
        t.hexEqual(rkeymapFr.getModFlags(), CtrlMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Backspace", "Backspace", KeyRelease), [0x800e]);
        t.hexEqual(rkeymapFr.getModFlags(), CtrlMod);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapFr.toScancodesAndFlags("Control", "ControlLeft", KeyRelease), [0x801D]);
        t.hexEqual(rkeymapFr.getModFlags(), 0);
        t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing double deak key <~>', t => {
        t.hexArrayEqual(rkeymapDoubleDeadKey.toScancodesAndFlags("Dead", "KeyT", KeyAcquire), undefined);
        t.hexEqual(rkeymapDoubleDeadKey.getModFlags(), 0);
        t.hexEqual(rkeymapDoubleDeadKey.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapDoubleDeadKey.toScancodesAndFlags("Dead", "KeyT", KeyRelease), undefined);
        t.hexEqual(rkeymapDoubleDeadKey.getModFlags(), 0);
        t.hexEqual(rkeymapDoubleDeadKey.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapDoubleDeadKey.toScancodesAndFlags("Dead", "KeyL", KeyAcquire), undefined);
        t.hexEqual(rkeymapDoubleDeadKey.getModFlags(), 0);
        t.hexEqual(rkeymapDoubleDeadKey.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapDoubleDeadKey.toScancodesAndFlags("Dead", "KeyL", KeyRelease), undefined);
        t.hexEqual(rkeymapDoubleDeadKey.getModFlags(), 0);
        t.hexEqual(rkeymapDoubleDeadKey.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapDoubleDeadKey.toScancodesAndFlags("Ꮭ", "KeyQ", KeyAcquire), [0x14, 0x2a, 0x3a, 0x803a, 0x26, 0x802a, 0x3a, 0x803a, 0x1e]);
        t.hexEqual(rkeymapDoubleDeadKey.getModFlags(), 0);
        t.hexEqual(rkeymapDoubleDeadKey.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymapDoubleDeadKey.toScancodesAndFlags("Ꭰ", "KeyQ", KeyRelease), [0x801e]);
        t.hexEqual(rkeymapDoubleDeadKey.getModFlags(), 0);
        t.hexEqual(rkeymapDoubleDeadKey.getVirtualModFlags(), 0);

        t.end();
    });

    t.end();
});

test('Sync', t => {
    rkeymapFr.sync(
        SyncFlags.ShiftLeft
      | SyncFlags.ShiftRight
      | SyncFlags.ControlLeft
      | SyncFlags.NumLock
      | SyncFlags.AltLeft
      | SyncFlags.AltRight
      | SyncFlags.ControlRight
      | SyncFlags.OSLeft
      | SyncFlags.OSRight
      | SyncFlags.CapsLock
    );
    t.hexEqual(rkeymapFr.getModFlags(), ShiftMod
                                      | CtrlMod
                                      | AltMod
                                      | AltGrMod
                                      | CapsLockMod
                                      | NumLockMod
                                      | RightShiftMod
                                      | RightCtrlMod);
    t.hexEqual(rkeymapFr.getVirtualModFlags(), ShiftMod
                                             | AltGrMod
                                             | CapsLockMod);

    rkeymapFr.sync(0);
    t.hexEqual(rkeymapFr.getModFlags(), 0);
    t.hexEqual(rkeymapFr.getVirtualModFlags(), 0);

    rkeymapFr.sync(SyncFlags.NumLock | SyncFlags.AltLeft | SyncFlags.ControlRight);
    t.hexEqual(rkeymapFr.getModFlags(), AltMod | NumLockMod | RightCtrlMod);
    t.hexEqual(rkeymapFr.getVirtualModFlags(), AltGrMod);

    t.end();
});

test('scancodesForSynchronizedMods()', t => {
    t.same(scancodesForSynchronizedMods(SyncFlags.AltLeft | SyncFlags.ShiftRight), [
        KeyRelease | 0x2A,
        KeyAcquire | 0x36,
        KeyRelease | 0x1D,
        KeyRelease | 0x11D,
        KeyAcquire | 0x38,
        KeyRelease | 0x138,
        KeyRelease | 0x15B,
        KeyRelease | 0x15C,
    ]);

    t.end();
});

test('Human readable mods', t => {
    t.equal(toHumanReadableMods(0x000),
        "ShiftLeft: 0\nShiftRight: 0\nCtrlLeft: 0\nCtrlRight: 0\nAlt: 0\nAltGr: 0\n"
      + "OEM8: 0\nKana: 0\nCapsLock: 0\nNumLock: 0\nKanaLock: 0");
    t.equal(toHumanReadableMods(0x001),
        "ShiftLeft: 1\nShiftRight: 0\nCtrlLeft: 0\nCtrlRight: 0\nAlt: 0\nAltGr: 0\n"
      + "OEM8: 0\nKana: 0\nCapsLock: 0\nNumLock: 0\nKanaLock: 0");
    t.equal(toHumanReadableMods(0x002),
        "ShiftLeft: 0\nShiftRight: 0\nCtrlLeft: 0\nCtrlRight: 0\nAlt: 0\nAltGr: 1\n"
      + "OEM8: 0\nKana: 0\nCapsLock: 0\nNumLock: 0\nKanaLock: 0");
    t.equal(toHumanReadableMods(0x004),
        "ShiftLeft: 0\nShiftRight: 0\nCtrlLeft: 0\nCtrlRight: 0\nAlt: 0\nAltGr: 0\n"
      + "OEM8: 0\nKana: 0\nCapsLock: 1\nNumLock: 0\nKanaLock: 0");
    t.equal(toHumanReadableMods(0x008),
        "ShiftLeft: 0\nShiftRight: 0\nCtrlLeft: 1\nCtrlRight: 0\nAlt: 0\nAltGr: 0\n"
      + "OEM8: 0\nKana: 0\nCapsLock: 0\nNumLock: 0\nKanaLock: 0");
    t.equal(toHumanReadableMods(0x010),
        "ShiftLeft: 0\nShiftRight: 0\nCtrlLeft: 0\nCtrlRight: 0\nAlt: 1\nAltGr: 0\n"
      + "OEM8: 0\nKana: 0\nCapsLock: 0\nNumLock: 0\nKanaLock: 0");
    t.equal(toHumanReadableMods(0x020),
        "ShiftLeft: 0\nShiftRight: 0\nCtrlLeft: 0\nCtrlRight: 0\nAlt: 0\nAltGr: 0\n"
      + "OEM8: 1\nKana: 0\nCapsLock: 0\nNumLock: 0\nKanaLock: 0");
    t.equal(toHumanReadableMods(0x040),
        "ShiftLeft: 0\nShiftRight: 0\nCtrlLeft: 0\nCtrlRight: 0\nAlt: 0\nAltGr: 0\n"
      + "OEM8: 0\nKana: 1\nCapsLock: 0\nNumLock: 0\nKanaLock: 0");
    t.equal(toHumanReadableMods(0x080),
        "ShiftLeft: 0\nShiftRight: 0\nCtrlLeft: 0\nCtrlRight: 0\nAlt: 0\nAltGr: 0\n"
      + "OEM8: 0\nKana: 0\nCapsLock: 0\nNumLock: 0\nKanaLock: 1");
    t.equal(toHumanReadableMods(0x100),
        "ShiftLeft: 0\nShiftRight: 0\nCtrlLeft: 0\nCtrlRight: 0\nAlt: 0\nAltGr: 0\n"
      + "OEM8: 0\nKana: 0\nCapsLock: 0\nNumLock: 1\nKanaLock: 0");
    t.equal(toHumanReadableMods(0x200),
        "ShiftLeft: 0\nShiftRight: 1\nCtrlLeft: 0\nCtrlRight: 0\nAlt: 0\nAltGr: 0\n"
      + "OEM8: 0\nKana: 0\nCapsLock: 0\nNumLock: 0\nKanaLock: 0");
    t.equal(toHumanReadableMods(0x400),
        "ShiftLeft: 0\nShiftRight: 0\nCtrlLeft: 0\nCtrlRight: 1\nAlt: 0\nAltGr: 0\n"
      + "OEM8: 0\nKana: 0\nCapsLock: 0\nNumLock: 0\nKanaLock: 0");
    t.equal(toHumanReadableMods(0x800),
        "ShiftLeft: 0\nShiftRight: 0\nCtrlLeft: 0\nCtrlRight: 0\nAlt: 0\nAltGr: 0\n"
      + "OEM8: 0\nKana: 0\nCapsLock: 0\nNumLock: 0\nKanaLock: 0");
    t.equal(toHumanReadableMods(0xfff),
        "ShiftLeft: 1\nShiftRight: 1\nCtrlLeft: 1\nCtrlRight: 1\nAlt: 1\nAltGr: 1\n"
      + "OEM8: 1\nKana: 1\nCapsLock: 1\nNumLock: 1\nKanaLock: 1");

    t.end();
});

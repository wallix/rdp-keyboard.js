const {test, Test} = require('tap')

const {
    ReversedKeymap, SyncFlags, KeyAcquire, KeyRelease, toHumanReadableMods,
} = require("scancodes");

// load fr keyboard
const rkeymap = (() => {
  for (const layout of require("reversed_layouts").layouts) {
      if (layout.localeName === "fr-FR") {
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
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('unknown character for french keyboard <ß>', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("ß", "KeyA", KeyAcquire), undefined);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("ß", "KeyA", KeyRelease), undefined);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <b>', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("b", "KeyB", KeyAcquire), [0x30]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("b", "KeyB", KeyRelease), [0x8030]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <Enter>', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Enter", "Enter", KeyAcquire), [0x1C]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Enter", "Enter", KeyRelease), [0x801C]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing Escape', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Escape", "Escape", KeyAcquire), [0x01]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Escape", "Escape", KeyRelease), [0x8001]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <A>', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2A]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802a]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <A>; weird case', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2A]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802a]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("a", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <A>; ShiftRight case', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftRight", KeyAcquire), [0x36]);
        t.hexEqual(rkeymap.getModFlags(), RightShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymap.getModFlags(), RightShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymap.getModFlags(), RightShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftRight", KeyRelease), [0x8036]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <A>; ShiftRight + ShiftLeft', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftRight", KeyAcquire), [0x36]);
        t.hexEqual(rkeymap.getModFlags(), RightShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2A]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod | RightShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod | RightShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod | RightShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftRight", KeyRelease), [0x8036]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802a]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <a>; ShiftLeft, weird browser case', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2A]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("a", "KeyQ", KeyAcquire), [0x802A, 0x10, 0x2A]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("a", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802a]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <a>; ShiftLeft, interlaced and weird browser case', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2A]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("a", "KeyQ", KeyAcquire), [0x802A, 0x10, 0x2A]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802a]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("a", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <A>; Capslock case', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("CapsLock", "CapsLock", KeyAcquire), [0x3a]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("CapsLock", "CapsLock", KeyRelease), [0x803a]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("CapsLock", "CapsLock", KeyAcquire), [0x3a]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("CapsLock", "CapsLock", KeyRelease), [0x803a]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <a>; Capslock case', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("CapsLock", "CapsLock", KeyAcquire), [0x3a]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("CapsLock", "CapsLock", KeyRelease), [0x803a]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("a", "KeyQ", KeyAcquire), [0x3a, 0x803a, 0x10, 0x3a, 0x803a]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("a", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("CapsLock", "CapsLock", KeyAcquire), [0x3a]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("CapsLock", "CapsLock", KeyRelease), [0x803a]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <A>; Capslock & NumLock case', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("NumLock", "NumLock", KeyAcquire), [0x45]);
        t.hexEqual(rkeymap.getModFlags(), NumLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("NumLock", "NumLock", KeyRelease), [0x8045]);
        t.hexEqual(rkeymap.getModFlags(), NumLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("CapsLock", "CapsLock", KeyAcquire), [0x3a]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod | NumLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("CapsLock", "CapsLock", KeyRelease), [0x803a]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod | NumLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod | NumLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod | NumLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod | NumLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("A", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymap.getModFlags(), CapsLockMod | NumLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), CapsLockMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("CapsLock", "CapsLock", KeyAcquire), [0x3a]);
        t.hexEqual(rkeymap.getModFlags(), NumLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("CapsLock", "CapsLock", KeyRelease), [0x803a]);
        t.hexEqual(rkeymap.getModFlags(), NumLockMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("NumLock", "NumLock", KeyAcquire), [0x45]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("NumLock", "NumLock", KeyRelease), [0x8045]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <ô>; Deadkey case', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Dead", "BracketLeft", KeyAcquire), undefined);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Dead", "BracketLeft", KeyRelease), undefined);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        // we send the input
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("ô", "KeyO", KeyAcquire), [0x1a, 0x18]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("o", "KeyO", KeyRelease), [0x8018]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <Ctrl+A>; "Select All" case', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Control", "ControlLeft", KeyAcquire), [0x1D]);
        t.hexEqual(rkeymap.getModFlags(), CtrlMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("a", "KeyQ", KeyAcquire), [0x10]);
        t.hexEqual(rkeymap.getModFlags(), CtrlMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        // we send the input
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("a", "KeyQ", KeyRelease), [0x8010]);
        t.hexEqual(rkeymap.getModFlags(), CtrlMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Control", "ControlLeft", KeyRelease), [0x801D]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <Ctrl+Alt+AltGr>', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Control", "ControlLeft", KeyAcquire), [0x1D]);
        t.hexEqual(rkeymap.getModFlags(), CtrlMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        rkeymap.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymap.getModFlags(), CtrlMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        rkeymap.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymap.getModFlags(), CtrlMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);


        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Alt", "AltLeft", KeyAcquire), [0x38]);
        t.hexEqual(rkeymap.getModFlags(), CtrlMod | AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), AltGrMod);

        rkeymap.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymap.getModFlags(), CtrlMod | AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        rkeymap.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymap.getModFlags(), CtrlMod | AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), AltGrMod);


        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Control", "ControlLeft", KeyRelease), [0x801D]);
        t.hexEqual(rkeymap.getModFlags(), AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        rkeymap.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymap.getModFlags(), AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        rkeymap.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymap.getModFlags(), AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);


        t.hexArrayEqual(rkeymap.toScancodesAndFlags("AltGraph", "AltRight", KeyAcquire), [0x138]);
        t.hexEqual(rkeymap.getModFlags(), AltMod | AltGrMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), AltGrMod);

        rkeymap.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymap.getModFlags(), AltMod | AltGrMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), AltGrMod);

        rkeymap.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymap.getModFlags(), AltMod | AltGrMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), AltGrMod);


        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Alt", "AltLeft", KeyRelease), [0x8038]);
        t.hexEqual(rkeymap.getModFlags(), AltGrMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), AltGrMod);

        rkeymap.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymap.getModFlags(), AltGrMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), AltGrMod);

        rkeymap.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymap.getModFlags(), AltGrMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), AltGrMod);


        t.hexArrayEqual(rkeymap.toScancodesAndFlags("AltGraph", "AltRight", KeyRelease), [0x8138]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);


        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Alt", "AltLeft", KeyAcquire), [0x38]);
        t.hexEqual(rkeymap.getModFlags(), AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        rkeymap.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymap.getModFlags(), AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        rkeymap.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymap.getModFlags(), AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);


        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Control", "ControlRight", KeyAcquire), [0x11D]);
        t.hexEqual(rkeymap.getModFlags(), RightCtrlMod | AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), AltGrMod);

        rkeymap.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymap.getModFlags(), RightCtrlMod | AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        rkeymap.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymap.getModFlags(), RightCtrlMod | AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), AltGrMod);


        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Control", "ControlRight", KeyRelease), [0x811D]);
        t.hexEqual(rkeymap.getModFlags(), AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        rkeymap.altGrIsCtrlAndAlt = false;
        t.hexEqual(rkeymap.getModFlags(), AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        rkeymap.altGrIsCtrlAndAlt = true;
        t.hexEqual(rkeymap.getModFlags(), AltMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);


        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Alt", "AltLeft", KeyRelease), [0x8038]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <Shift>', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftLeft", KeyAcquire), [0x2a]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftRight", KeyAcquire), [0x36]);
        t.hexEqual(rkeymap.getModFlags(), ShiftMod | RightShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftLeft", KeyRelease), [0x802a]);
        t.hexEqual(rkeymap.getModFlags(), RightShiftMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Shift", "ShiftRight", KeyRelease), [0x8036]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <OS>', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("OS", "OSLeft", KeyAcquire), [0x15b]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("OS", "OSRight", KeyAcquire), [0x15c]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("OS", "OSLeft", KeyRelease), [0x815b]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("OS", "OSRight", KeyRelease), [0x815c]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    test('acquiring and releasing <Meta>', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Meta", "MetaLeft", KeyAcquire), [0x15b]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Meta", "MetaRight", KeyAcquire), [0x15c]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Meta", "MetaLeft", KeyRelease), [0x815b]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Meta", "MetaRight", KeyRelease), [0x815c]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });


    test('acquiring and releasing <Ctrl + Backspace>', t => {
        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Control", "ControlLeft", KeyAcquire), [0x1D]);
        t.hexEqual(rkeymap.getModFlags(), CtrlMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Backspace", "Backspace", KeyAcquire), [0x0e]);
        t.hexEqual(rkeymap.getModFlags(), CtrlMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Backspace", "Backspace", KeyRelease), [0x800e]);
        t.hexEqual(rkeymap.getModFlags(), CtrlMod);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.hexArrayEqual(rkeymap.toScancodesAndFlags("Control", "ControlLeft", KeyRelease), [0x801D]);
        t.hexEqual(rkeymap.getModFlags(), 0);
        t.hexEqual(rkeymap.getVirtualModFlags(), 0);

        t.end();
    });

    t.end();
});

test('Sync', t => {
    rkeymap.sync(
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
    t.hexEqual(rkeymap.getModFlags(), ShiftMod
                                    | CtrlMod
                                    | AltMod
                                    | AltGrMod
                                    | CapsLockMod
                                    | NumLockMod
                                    | RightShiftMod
                                    | RightCtrlMod);
    t.hexEqual(rkeymap.getVirtualModFlags(), ShiftMod
                                           | AltGrMod
                                           | CapsLockMod);

    rkeymap.sync(0);
    t.hexEqual(rkeymap.getModFlags(), 0);
    t.hexEqual(rkeymap.getVirtualModFlags(), 0);

    rkeymap.sync(SyncFlags.NumLock | SyncFlags.AltLeft | SyncFlags.ControlRight);
    t.hexEqual(rkeymap.getModFlags(), AltMod | NumLockMod | RightCtrlMod);
    t.hexEqual(rkeymap.getVirtualModFlags(), AltGrMod);

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

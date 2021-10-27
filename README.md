# Test

```sh
./test.sh
```

# Coverage

```sh
./test.sh --coverage
```

# Uncompress kbdlayout.info.zst

```sh
tar --zstd -xf ./tools/gen_locale/kbdlayout.info.zst
```

# generate lib/reversed_layouts.js

```sh
./tools/gen_reversed_keylayout.sh --all
```

# Install Dependencies

```sh
npm i
```

# Test

```sh
./test.sh
```

# Coverage

```sh
./test.sh --coverage
./test.sh --output-html
```

# Uncompress kbdlayout.info.zst

```sh
tar --zstd -xf ./tools/gen_locale/kbdlayout.info.zst
```

# generate lib/reversed_layouts.js

```sh
./tools/gen_reversed_keylayout.sh --all
```

Readable version with

```sh
DEBUG=1 ./tools/gen_reversed_keylayout.sh --all
```

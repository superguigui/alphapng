[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# alphapng
Very minimal cli tool to separate alpha and rgb channels from a transparent png file. RGB channels will be saved in a compressed jpg file and Alpha channel in a simplified Png. It can be used to reduce image size if you can programmatically combine the channels later (in canvas for an example).

## Installation
npm install alphapng -g

## Usage
From terminal or npm script.
```bash
Usage:
  alphapng png

Params:
  png   input png file to process

Options:
  -h, --help        show help
  -v, --version     show version
  -f, --filename    name of the new png and jpg (no extension, default is "out")
  -q, --quality     jpg compression quality
```

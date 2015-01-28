
## GDAL / Node.js tiling benchmark

This benchmark provides a testcase to start asking the questions like:

> How does GDAL perform when being ask, via multiple threads, to read from a GeoTIFF?

> Are there any bottlenecks or optimizations that can be made to Mapnik's use of GDAL in gdal.input?

> At what point do more threads help performance or hurt it and does this vary predictably by zoom level?

> Do the asynchronous tile requests made by tilelive, which result in non-deterministic order of bbox's passed to RasterIO, have a negative impact on file-system level caching or GDAL's block cache?

> Is the block cache in GDAL helping performance overall? Can the mutex locks used in the cache be tuned to further improve performance?


### Background

This benchmark uses:


- Node.js to talk to Mapnik (via node-mapnik c++ bindings)
- Mapnik to request raster pixels for a given tile from the Mapnik "gdal.input" plugin (shared so)
- The "gdal.input" is linked to libgdal and uses the GDAL C++ API
- Oversampling ratio of 2x is used.
- Once GDAL returns pixels for a given bbox request then Mapnik is used to scale the image down (bilinear) to 512x512 and encode as webp

### Setup

There are two ways to install the dependencies for this benchmark.

#### From binaries

To install from binaries do:

```sh
npm install
```

This will install Mapnik 3.x at 8063fa0 and all dependencies (including GDAL head at 0334c2bed9) bundled inside the latest binary node-mapnik package.

#### Source compile

To enable running the benchmark against a custom Mapnik or GDAL:

- Install libtiff 4.x from source, plus other system packages
- Install GDAL from source ensuring external libtiff is linked
- Install Mapnik from source, ensuring external libtiff is the same as GDAL used (otherwise crashes are likely)
- Install libprotobuf so that `protoc` is on your PATH and libprotobuf-lite is available at a common location or on LD_LIBRARY_PATH
- Build node-mapnik from source:

```sh
npm install mapnik --build-from-source
```

On Ubuntu this looks like:

```sh
sudo apt-get update -y
sudo apt-get install -y build-essential git \
    libboost-filesystem-dev \
    libboost-program-options-dev \
    libboost-python-dev libboost-regex-dev \
    libboost-system-dev libboost-thread-dev \
    libicu-dev \
    libxml2 libxml2-dev \
    libfreetype6 libfreetype6-dev \
    libjpeg-dev \
    libpng-dev \
    libproj-dev \
    python-dev \
    python-nose \
    libsqlite3-dev \
    libharfbuzz-dev \
    libwebp-dev \
    libprotobuf-dev \
    protobuf-compiler
# build tiff
sudo apt-get purge -y libtiff-dev
wget http://download.osgeo.org/libtiff/tiff-4.0.4beta.tar.gz
tar xvf tiff-4.0.4beta.tar.gz
cd tiff-4.0.4beta
./configure \
    --disable-dependency-tracking \
    --disable-cxx \
    --enable-defer-strile-load \
    --enable-chunky-strip-read \
    --with-jpeg-include-dir=/usr/include \
    --with-jpeg-lib-dir=/usr/lib \
    --with-zlib-include-dir=/user/include \
    --with-zlib-lib-dir=/usr/lib \
    --disable-lzma --disable-jbig --disable-mdi \
    --without-x
make -j$(nproc)
sudo make install
sudo ldconfig
cd ../
git clone git@github.com:OSGeo/gdal.git
cd gdal/gdal
# build against external libs that Mapnik also depends on
# to avoid crashes due to gdal using internal copies
./configure --with-libtiff=/usr/local \
  --with-jpeg=/usr/ \
  --with-png=/usr/ \
  --with-libz=/usr/
make -j$(nproc)
sudo make install
sudo ldconfig
cd ../../
git clone git@github.com:mapnik/mapnik.git
./configure INPUT_PLUGINS=csv,gdal,ogr,raster,shape,sqlite
JOBS=$(nproc) make
sudo make install
cd ../
# install node.js
git clone git@github.com:creationix/nvm.git ~/.nvm
source ~/.nvm/nvm.sh
nvm install 0.10.35
git clone git@github.com:mapbox/gdal-tiling-bench.git
cd gdal-tiling-bench
npm install mapnik --build-from-source --loglevel=verbose
```

Finally, install the rest of the pure Javascript dependencies of the benchmark:

```sh
npm install
```

If changes to GDAL or Mapnik are made that change ABI then rebuild node-mapnik like:

```sh
cd ~/gdal/gdal
make install
cd ../../gdal-tiling-bench
./node_modules/mapnik/node_modules/.bin/node-pre-gyp build -C ./node_modules/mapnik/
```

### Running Benchmark

To run the benchmark do:

```sh
wget https://springmeyer.s3.amazonaws.com/90-50-7.tif
node test.js 90-50-7.tif --noop
```

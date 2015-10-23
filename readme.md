# npm-package-downloader 

If you need to mass download NPM packages for any reason (Like an offline storage) this is the package your looking for.
The downloader downloads the specified packages as a tarball, ready to be used with npm storage solutions such as Sinopia.
* Does not require NPM or Sinopia

## Install

```
$ npm install -g npm-package-downloader
```

## Usage

The package allows you to download any number of packages, their dependencies, dev-dependencies and offers verity of options, you can view them all using: 
```
$ npmDownload -h
    
    -p, --packages [packages]  A list of space separated [packages].
    -d, --dependencies         Download dependencies.
    -e, --devDependencies      Download dev dependencies.
    -a, --allVersions          Download all versions of each package.
    -o, --output [directory]   The output [directory].
    -7, --zipIt                7Zips the downloaded files.
```

For example, to download the latest version of `grunt`, version 1.0.0 of `bower` and their dependencies just type:
```
$ npmDownload -p "bower@1.0.0 grunt" -d -o C:\myStorage
```
Or using full option notation:
```
$ npmDownload --packages "bower@1.0.0 grunt" --dependencies --output C:\myStorage
```

### Dependencies
When using the dependencies flag the downloader will download every dependency of each package and every dependency of each dependency... and so on, until there is no more needed dependencies.
 
### Dev Dependencies
See Dependencies ^^

### All Versions
When using the allVersions flag, the downloader will download EVERY version of each package and every version of each dependency.
This could take a while, so be wary.

### 7-Zip
The downloader can package the the downloader files for you using 7-zip, this will create a a `.7z` file in the specified output directory.

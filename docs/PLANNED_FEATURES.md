# Planned Features

## Overview

-   [x] Add more build configuration (entry points etc) [1.](#1)
-   [x] Add support for directly executing javascript build hooks [2.](#2)
-   [ ] Add further build targets [3.](#3)
-   [ ] ~~Add plain javascript support [4.}(#4)~~
-   [ ] Dramatically increase testing coverage [5.](#5)
-   [ ] Allow target node version to be configured [6.](#6)

## 1.

Adding more config such as entrypoints will allow the user to be able to customise the build process more.

## 2.

Adding direct javascript execution in build hooks will make the build process more extensible, and more specific to more circumstances. Both ESM and CommonJS should be supported, as should resolving imported dependencies.

## 3.

Adding targets such as `darwin` and others (i386 too maybe?) would be useful, but testing them is (currently) impossible due to the absence of a mac.

## 4.

Writing plain javascript instead of typescript might be a something to look into.

Update: There is no reason to write in javascript, when a type-safe language like typescript can be used instead.

## 5.

More testing = identifying more bugs = fixing more things = better software

## 6.

Some implementations would benefit from newer node versions (18>=). Shouldn't create too many problems.
Lower versions (<16) may not work due to backwards incompatability.

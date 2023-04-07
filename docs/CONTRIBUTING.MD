# Contributing

## Prerequisites

The following local dependencies are needed in `$PATH`

-   [NodeJS](https://nodejs.org/) >= 16
-   [Go](https://go.dev/) >= 1.18
-   [VHS](https://github.com/charmbracelet/vhs) >= 0.3

## Installing package dependencies

1. Install npm dependencies for all subprojects:

```bash
$ npm run dep
```

2. Install [dotnet](https://dotnet.microsoft.com/en-us/download)

3. Install `docfx`

```bash
$ dotnet tool install -g docfx
```

## Building

All projects are built with `verace`. Each one's configuration allows a unified build command:

```bash
$ verace build-exe
```

## PR Checklist

> Note you must have the latest `verace` build accessible in your `$PATH`. E.g. by running
>
> ```bash
> $ cp bt/bin/verace ~/.local/bin
> ```

1. Code styling

```bash
$ npm run lint
```

2. Testing

```bash
$ npm run test
```

3. VHS Gifs

```bash
$ npm run vhs
```

4. API Reference

```bash
$ npm run api
```

Or run

```bash
$ npm run predep
```

for all of them at once.

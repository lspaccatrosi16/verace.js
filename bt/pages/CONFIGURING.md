All configuration for **Verace.js** lives in the `verace config` file created in each project. Properties prepended with an asterisk are required. The config file can be in two forms: as a `.json` file, or in a `.mjs` file. The default option is the `.mjs` solution as it provides robust typing. The `.json` may be useful in situations in which dynamic config generation is needed.

### `verace.config.mjs`

```js
import { defineConfig } from "verace.js/helpers";

export default defineConfig({
	lang: "ts",
	name: "verace",
	version: "0.0.2",
	targets: ["win64", "linux64"],
	data: {
		foo: "bar",
	},
	hooks: {
		preBuild: "echo hello there",
		postBuild: {
			command: "echo general kenobi",
		},
		prePkg: {
			file: "myhook.js",
		},
	},
	entrypoint: "src/index.ts",
	outDir: "bin",
	ts: {
		skipPkg: true,
		cleanAfterBuild: true,
		produceTypes: true,
		buildDir: "tsc-build",
		test: "npx c8 ava",
		assets: "assets",
		noBytecode: false,
	},
	go: {
		gomod: "lspaccatrosi16/verace.js",
	},
});
```

### `verace.json`

```jsonc
//verace config
{
	"lang": "ts",
	"name": "verace"
	//Rest of the configuration etc.
}
```

> **Note** <br /> > **Verace.js** will not allow building or running if there are errors in your verace config . You should make sure that any custom keys lie in the `data` attribute (see below).

---

### Universal Options

<table>
<tr>
<td>Field</td>
<td>Description</td>
<td>Default</td>
</tr>
<tr>
<td>

`*lang`

</td>
<td>The language of the project.</td>
<td>

`ts` / `go`

</td>
</tr>
<tr>
<td>

`*name`

</td>
<td>The package name.</td>
<td>x</td>
</tr>
<tr>
<td>

`*version`

</td>
<td>

The semver package version. See {@page ./BUILD_TOOL.md [ version ]} for more details.

</td>
<td>x</td>
</tr>
<tr>
<td>

`*targets`

</td>
<td>The build targets for which package will be built for.</td>
<td>

`win64` / `linux64`

</td>
</tr>
<tr>
<td>

`data`

</td>
<td>

Data passed in any format. See {@page ./ADVANCED_USAGE.md [ environment data ]} for more details.

</td>
<td>x</td>
</tr>
<tr>
<td>

`hooks`

</td>
<td>

Sometimes, it is convenient to have code automatically run directly before, or directly after the build process. This can be achieved with using build hooks: Like `npm` scripts, build hooks can be any command, or set of commands. Either a plain string, or an object can be passed to each hook. The object can take either a path to a javascript file (`file`) or a plain command (`command`). The `prePkg` script only applies when building typescript projects, and is applied before the `pkg` step. {@page ./BUILD_PIPELINES.md [ build pipelines ]}

</td>
<td>

```json5
{
	preBuild: "",
	postBuild: "",
	prePkg: "",
}
```

</td>
</tr>
<tr>
<td>

`entrypoint`

</td>
<td>

The path to the entrypoint of the program. Note for `ts`, the `tsconfig.json` needs to be updated too if it is changed.

</td>
<td>

`src/index.ts` / `main.go`

</td>
</tr>
<tr>
<td>

`outDir`

</td>
<td>The path to which compiled binaries are outputted to.</td>

<td>

`bin`

</td>
</tr>
</table>

---

### Typescript specific options

<table>
<tr>
<td>Field</td>
<td>Description</td>
<td>Default</td>
</tr>
<tr>
<td>

`skipPkg`

</td>
<td>

As produing a self contained executable from javascript is not possible due to the choice to use a [JIT](https://hacks.mozilla.org/2017/02/a-crash-course-in-just-in-time-jit-compilers/), a complete nodejs binary has to be included in every binary produced (using [ `vercel/pkg` ](https://github.com/vercel/pkg)). This adds `30-40MB` to each build, which is undesirable in some cases. If the binary is to be run on systems with nodejs already installed, the compilation step can be skipped. If disabled, a bundled javascript file can be distributed instead, which is found in the `dist` folder: e.g. `dist/verace.cjs` .

</td>
<td

`false`

</td>
</tr>
<tr>
<td>

`cleanAfterBuild`

</td>
<td>

If enabled, all temporary files created in the build are removed. If `skipPkg` is `false` then it will also remove the `dist` folder.

</td>
<td>

`false`

</td>
</tr>
<tr>
<td>

`produceTypes`

</td>
<td>

Allows `d.ts` files to be produced. `cleanAfterBuild` must be disabled to make any use of them.

</td>
<td>

`false`

</td>
</tr>
<tr>
<td>

`buildDir`

</td>
<td>The directory to which the unbundled javascript output is written</td>
<td>

`tsc-build`

</td>
</tr>
<tr>
<td>

`test`

</td>
<td>

Similar to build hooks in purpose. Instead of being run before/after the build process, the command is run after the initial `tsc` stage before the files are bundled (see the {@page ./BUILD_PIPELINES.md [ Typescript build pipeline ]} for more details)

</td>
<td>

`""`

</td>
</tr>

<tr>

<td>

`assets`

</td>

<td>

<<<<<<< Updated upstream
Static assets can be embedded into the binary for one-file packaging. They should be places in the folder specified by `assets`, and should be accessed with `path.join(__dirname, "assets/my/path")`. See the [`pkg`](https://github.com/vercel/pkg#snapshot-filesystem) docs for more details. It should be noted that assets are only injected into the binary if `skipPkg` is `false`.
=======
Static assets can be embedded into the binary for one-file packaging. They should be places in the folder specified by `assets`, and should be accessed with `path.join(__dirname, "assets/my/path")`. See the [`pkg`](https://github.com/vercel/pkg#snapshot-filesystem) docs for more details. It should be noted that the assets are only embedded if `skipPkg` is `false`.
>>>>>>> Stashed changes

<td>

`assets`

</td>

</tr>

<tr>

<td>

`noBytecode`

</td>

<td>

This corresponds to the `pkg` options of `--public --no-bytecode`. It should be set if dynamic `import()` statements are used in the code [due to a bug in v8 itself](https://github.com/vercel/pkg/issues/1603#issuecomment-1229274700)

</td>

<td>

`false`

</td>

</tr>

</table>

---

### Go specific options

<table>
<tr>
<td>Field</td>
<td>Description</td>
<td>Default</td>
</tr>
<tr>
<td>

`*gomod`

</td>
<td>The go module path</td>
<td>x</td>
</tr>
</table>

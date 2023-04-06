
import { defineConfig } from "verace.js/helpers";

export default defineConfig(
  {
  name: 'test',
  version: '0.0.1',
  targets: [ 'win64', 'linux64' ],
  data: { foo: 'bar' },
  ts: {},
  lang: 'ts'
}
);
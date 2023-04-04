
//See https://github.com/lspaccatrosi16/verace.js/#readme for detailed documentation

export interface VeraceEnv {
  name: string;
  version: string;
  data: Record<string, unknown>;
}

export default function (env: VeraceEnv) {
  console.log(`Hello world from ${env.name} v${env.version}`);
  console.log("Data:", env.data);
}

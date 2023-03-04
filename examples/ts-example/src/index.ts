//See https://github.com/lspaccatrosi16/fingo.js/#readme for detailed documentation

export interface FingoEnv {
  name: string;
  version: string;
  data: Record<string, unknown>;
}

export default function (env: FingoEnv) {
  console.log(`Hello world from ${env.name} v${env.version}`);
  console.log("Data:", env.data);
}

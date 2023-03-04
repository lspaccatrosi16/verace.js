import fingo from "fingo";

export interface FingoEnv {
  name: string;
  version: string;
}

export default function (env: FingoEnv) {
  fingo(env);
}

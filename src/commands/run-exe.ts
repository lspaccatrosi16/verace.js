import { Command } from "commander";

export default function () {
  const re = new Command("run-exe").description("Runs the current project");

  return re;
}

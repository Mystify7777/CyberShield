import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const serverDir = path.join(rootDir, "server");
const clientDir = path.join(rootDir, "client");
const aiDir = path.join(rootDir, "ai-service");
const isWindows = process.platform === "win32";

const npmCommand = isWindows ? "npm.cmd" : "npm";

const validateServerEnv = spawn(npmCommand, ["run", "predev"], {
  cwd: serverDir,
  stdio: "inherit",
  shell: isWindows
});

const waitForValidation = new Promise((resolve, reject) => {
  validateServerEnv.on("exit", (code, signal) => {
    if (signal || code !== 0) {
      reject(new Error(`Environment validation failed with ${signal || code}`));
      return;
    }

    resolve();
  });
});

await waitForValidation;

const aiPythonCandidates = isWindows
  ? [
      path.join(aiDir, ".venv", "Scripts", "python.exe"),
      path.join(aiDir, ".venv", "Scripts", "python")
    ]
  : [
      path.join(aiDir, ".venv", "bin", "python"),
      path.join(aiDir, ".venv", "bin", "python3")
    ];

const pickExisting = (candidates) => candidates.find((candidate) => fs.existsSync(candidate));
const aiPython = pickExisting(aiPythonCandidates);

const commands = [
  {
    name: "server",
    command: npmCommand,
    args: ["run", "dev"],
    cwd: serverDir
  },
  {
    name: "client",
    command: npmCommand,
    args: ["run", "dev"],
    cwd: clientDir
  }
];

if (!aiPython) {
  console.error("Missing ai-service virtual environment. Create it before running root npm dev.");
  process.exit(1);
}

commands.push({
  name: "ai-service",
  command: aiPython,
  args: ["-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
  cwd: aiDir
});


const children = [];

for (const entry of commands) {
  if (!fs.existsSync(entry.cwd)) {
    console.error(`Directory for ${entry.name} does not exist: ${entry.cwd}`);
    process.exit(1);
  }
  if (!entry.command) {
    console.error(`Command for ${entry.name} is not defined.`);
    process.exit(1);
  }
  const child = spawn(entry.command, entry.args, {
    cwd: entry.cwd,
    stdio: "inherit",
    shell: isWindows
  });

  child.on("exit", (code, signal) => {
    if (signal || code !== 0) {
      console.log(`[${entry.name}] exited with ${signal || code}.`);
      for (const activeChild of children) {
        if (!activeChild.killed) {
          activeChild.kill();
        }
      }
      process.exit(code || 1);
    }
  });

  children.push(child);
}

const shutdown = () => {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const fs = require("fs");
const path = require("path");
const { exec, spawn } = require("child_process");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCode = async (filepath, input = "") => {
  const ext = path.extname(filepath);
  const jobDir = path.dirname(filepath);
  const jobId = path.basename(filepath).split(".")[0];
  const TIME_LIMIT = 3000;

  return new Promise((resolve, reject) => {
    if (ext === ".cpp") {
      const outputFile = path.join(outputPath, `${jobId}.exe`);
      exec(`g++ "${filepath}" -o "${outputFile}"`, (compileErr, stdout, stderr) => {
        if (compileErr || stderr) {
          return reject({
            error: "❌ Compilation Error (C++)",
            stderr: stderr || compileErr.message,
          });
        }

        const run = spawn(outputFile);
        let output = "", errorOutput = "";

        const timeout = setTimeout(() => {
          run.kill("SIGKILL");
          reject({ error: "❌ Time Limit Exceeded (3s)", stderr: "" });
        }, TIME_LIMIT);

        run.stdout.on("data", (data) => output += data.toString());
        run.stderr.on("data", (data) => errorOutput += data.toString());

        run.on("close", (code) => {
          clearTimeout(timeout);
          fs.unlink(outputFile, () => {});
          if (code !== 0) {
            return reject({
              error: "❌ Runtime Error",
              stderr: errorOutput || `Process exited with code ${code}`,
            });
          }
          resolve(output.trim());
        });

        run.stdin.write(input);
        run.stdin.end();
      });
    }

    else if (ext === ".py") {
      const run = spawn("python", [filepath]);
      let output = "", errorOutput = "";

      const timeout = setTimeout(() => {
        run.kill("SIGKILL");
        reject({ error: "❌ Time Limit Exceeded (3s)", stderr: "" });
      }, TIME_LIMIT);

      run.stdout.on("data", (data) => output += data.toString());
      run.stderr.on("data", (data) => errorOutput += data.toString());

      run.on("close", (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          return reject({
            error: "❌ Runtime Error",
            stderr: errorOutput || `Process exited with code ${code}`,
          });
        }
        resolve(output.trim());
      });

      run.stdin.write(input);
      run.stdin.end();
    }

    else if (ext === ".java") {
      const className = "Main";
      exec(`javac "${filepath}"`, (compileErr, stdout, stderr) => {
        if (compileErr || stderr) {
          return reject({
            error: "❌ Compilation Error (Java)",
            stderr: stderr || compileErr.message,
          });
        }

        const run = spawn("java", ["-cp", jobDir, className]);
        let output = "", errorOutput = "";

        const timeout = setTimeout(() => {
          run.kill("SIGKILL");
          reject({ error: "❌ Time Limit Exceeded (3s)", stderr: "" });
        }, TIME_LIMIT);

        run.stdout.on("data", (data) => output += data.toString());
        run.stderr.on("data", (data) => errorOutput += data.toString());

        run.on("close", (code) => {
          clearTimeout(timeout);
          if (code !== 0) {
            return reject({
              error: "❌ Runtime Error",
              stderr: errorOutput || `Process exited with code ${code}`,
            });
          }
          resolve(output.trim());
        });

        run.stdin.write(input);
        run.stdin.end();
      });
    }

    else {
      reject({ error: "❌ Unsupported Language", stderr: "" });
    }
  });
};

module.exports = executeCode;

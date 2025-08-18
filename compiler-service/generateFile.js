const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirCodes = path.join(__dirname, "codes");

if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = (language, code) => {
  const jobId = uuid();
  const jobDir = path.join(dirCodes, jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  let fileName = `${jobId}.${language}`;
  if (language === "java") {
    fileName = "Main.java"; 
  }

  const filePath = path.join(jobDir, fileName);
  fs.writeFileSync(filePath, code);
  return filePath;
};

module.exports = generateFile;

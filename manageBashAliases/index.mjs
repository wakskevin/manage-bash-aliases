import chalk from "chalk";
import fs from "node:fs/promises";
import path from "node:path";
import askQuestion from "../utils/askQuestion.mjs";
import runScript from "../utils/runScript.mjs";

const scriptPath = new URL(import.meta.url).pathname;
const aliasesFilePath = path.join(path.dirname(scriptPath), "aliases.txt");
const sourceScriptPath = path.join(path.dirname(scriptPath), "source_bash.sh");

export default async function manageBashAliases() {
  try {
    const bashAliasesContent = await fs.readFile(aliasesFilePath, "utf8");
    const filePath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      ".bash_aliases"
    );

    try {
      await fs.access(filePath, fs.constants.F_OK);

      const answer = await askQuestion(
        "The ~/.bash_aliases file already exists. Do you want to overwrite it? (y (yes) / n (no)): "
      );

      if (["yes", "y"].includes(answer.toLowerCase())) {
        await writeToFile(filePath, bashAliasesContent);
        console.log(
          chalk.green("The ~/.bash_aliases file has been overwritten.")
        );
      } else {
        console.log(
          chalk.yellow("The ~/.bash_aliases file was not overwritten.")
        );
      }
    } catch {
      await writeToFile(filePath, bashAliasesContent);
      console.log(chalk.green("The ~/.bash_aliases file has been created."));
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

async function writeToFile(filePath, content) {
  try {
    // Convert content to Unix-style line endings and write to file
    const unixContent = content.replace(/\r\n/g, "\n");
    await fs.writeFile(filePath, unixContent, "utf8");
    console.log(chalk.green("File written with Unix-style line endings."));
  } catch (error) {
    console.error(chalk.red(`Error writing file: ${error.message}`));
    return; // Stop further execution if writing fails
  }

  try {
    // Source bashrc
    await runScript(sourceScriptPath);
  } catch (error) {
    console.error(chalk.red(`Error sourcing ~/.bashrc: ${error.message}`));
  }
}

import path from "node:path";
import {
  readDir,
  copyDir,
  spawnNames,
  createRequirementsDirs,
  createFxManifest,
} from "./utils.js";
import { EXCLUDE_FILTER } from "./regexp.js";

// Constans
const inpDir = path.resolve("./cars");
const outDir = path.resolve("./output");

const main = () => {
  createRequirementsDirs(outDir);
  createFxManifest(outDir);
  const cars = readDir(inpDir, EXCLUDE_FILTER);
  cars.forEach((carDir) => {
    readDir(carDir, EXCLUDE_FILTER, true).forEach((subDir) => {
      const subDirName = path.basename(subDir);
      if (subDirName.match(/data/i)) {
        copyDir(subDir, path.resolve(outDir, "data"));
      } else if (subDirName.match(/stream/i)) {
        copyDir(subDir, path.resolve(outDir, "stream"));
      }
    });
  });
};

main() && spawnNames(path.resolve(outDir, "data"));

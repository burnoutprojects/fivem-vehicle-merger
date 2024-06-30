import fs from "node:fs";
import path from "node:path";
import { EXCLUDE_FILTER } from "./regexp.js";

export const readDir = (pathname, excludes = null, onlydir = false) => {
  try {
    const absolutePath = path.resolve(pathname);
    console.log(`Trying to read \`${absolutePath}\` directory`);
    const carsDir = fs.readdirSync(absolutePath);
    const filtered = carsDir
      .filter((entry) => {
        const notMatches = !entry.match(excludes);
        const entryPath = path.resolve(absolutePath, entry);
        const isDir = fs.lstatSync(entryPath).isDirectory();
        return notMatches && onlydir ? notMatches && isDir : notMatches;
      })
      .map((entry) => path.resolve(absolutePath, entry));
    return filtered.sort();
  } catch (err) {
    console.log(err);
  }
};

export const copyDir = (src, dest) => {
  const copy = (copySrc, copyDest) => {
    try {
      readDir(copySrc, EXCLUDE_FILTER).forEach((curSrc) => {
        const curDest = path.resolve(copyDest, path.basename(curSrc));
        const fileStat = fs.lstatSync(curSrc);
        if (fileStat.isDirectory()) {
          console.log(
            `Create directory \`${path.basename(
              curDest
            )}\` in path \`${curDest}\``
          );
          if (!fs.existsSync(curDest)) {
            fs.mkdirSync(path.resolve(curDest), { recursive: true });
          }
          copy(curSrc, curDest);
        } else if (fileStat.isFile()) {
          const filename = path.basename(curDest).toLowerCase();
          let parentDir = path.dirname(curDest);
          if (path.basename(parentDir).toLowerCase() === "data") {
            const dirName = path.dirname(curSrc);
            parentDir = path.resolve(
              copyDest,
              path.basename(dirName.substring(0, dirName.lastIndexOf("/")))
            );
          }

          let curFilePath = path.resolve(parentDir, filename);

          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(path.resolve(parentDir), { recursive: true });
          }
          console.log(
            `Copy file from \`${curSrc}\` to path \`${curFilePath}\``
          );
          fs.createReadStream(curSrc).pipe(fs.createWriteStream(curFilePath));
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  copy(src, dest);
};

export const spawnNames = (dest) => {
  const cars = {};
  const MODEL_NAME_FILTER = /<modelName>(.*)<\/modelName>/dg;
  readDir(dest, null, true).forEach((dir) => {
    console.log(dir);
    readDir(dir).forEach((file) => {
      const carName = path.basename(dir);
      const filePath = path.basename(file);

      if (filePath.includes("vehicles.meta")) {
        const carData = fs.readFileSync(file, "utf8").toString();
        const matches = [...carData.matchAll(MODEL_NAME_FILTER.source)];
        matches.forEach((match) => {
          if (!Object.keys(cars).includes(carName)) {
            cars[carName] = [];
          }
          cars[carName] = [...cars[carName], match[1]];
        });
      }
    });
  });
  console.log(JSON.stringify(cars, null, 2));
};

export const createRequirementsDirs = (outDir) => {
  try {
    const outSubDir = ["data", "stream"];
    console.log("Check if output folder exist");
    if (fs.existsSync(outDir)) {
      console.log("Output directory is removed successfully");
      fs.rmSync(outDir, { recursive: true });
    }
    outSubDir.forEach((sub) => {
      console.log(
        `Create \`${sub}\` directory inside \`${path.basename(
          outDir
        )}\` directory`
      );
      fs.mkdirSync(path.resolve(outDir, sub), { recursive: true });
    });
  } catch (err) {
    console.log(err);
  }
};

export const createFxManifest = (dest) => {
  fs.writeFileSync(
    path.resolve(dest, "fxmanifest.lua"),
    `fx_version 'cerulean'\n\nfiles {\n\t'data/**/carcols.meta',\n\t'data/**/carvariations.meta',\n\t'data/**/handling.meta',\n\t'data/**/vehiclelayouts.meta',\n\t'data/**/vehicles.meta',\n}\n\ndata_file 'VEHICLE_LAYOUTS_FILE'\t'data/**/vehiclelayouts.meta'\ndata_file 'HANDLING_FILE'\t\t\t'data/**/handling.meta'\ndata_file 'VEHICLE_METADATA_FILE'\t'data/**/vehicles.meta'\ndata_file 'CARCOLS_FILE'\t\t\t'data/**/carcols.meta'\ndata_file 'VEHICLE_VARIATION_FILE'\t'data/**/carvariations.meta'`,
    { encoding: "utf8" }
  );
};

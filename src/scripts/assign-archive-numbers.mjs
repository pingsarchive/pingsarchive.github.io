import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";


const archiveDirectory =
  path.resolve("src/content/archive");


if (!fs.existsSync(archiveDirectory)) {
  process.exit(0);
}


const files =
  fs
    .readdirSync(archiveDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) =>
      path.join(
        "src/content/archive",
        file
      )
    );


function getFrontmatter(filePath) {

  const text =
    fs.readFileSync(
      filePath,
      "utf8"
    );


  const match =
    text.match(
      /^---\r?\n([\s\S]*?)\r?\n---([\s\S]*)$/
    );


  if (!match) {
    return null;
  }


  return {
    text,
    frontmatter: match[1],
    body: match[2],
  };

}


function getArchiveNumber(frontmatter) {

  const match =
    frontmatter.match(
      /^archiveNumber:\s*["']?(\d+)["']?\s*$/m
    );


  if (!match) {
    return null;
  }


  const value =
    Number(match[1]);


  return Number.isFinite(value)
    ? value
    : null;

}


function getAddedTime(filePath) {

  try {

    const result =
      execFileSync(
        "git",
        [
          "log",
          "--follow",
          "--diff-filter=A",
          "--format=%ct",
          "--",
          filePath,
        ],
        {
          encoding: "utf8",
        }
      )
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (result.length === 0) {
      return Number.MAX_SAFE_INTEGER;
    }


    return Number(result[result.length - 1]);

  } catch {

    return Number.MAX_SAFE_INTEGER;

  }

}


const records =
  files
    .map((filePath) => {

      const parsed =
        getFrontmatter(filePath);


      if (!parsed) {
        return null;
      }


      return {
        filePath,
        ...parsed,
        number:
          getArchiveNumber(
            parsed.frontmatter
          ),
        added:
          getAddedTime(filePath),
      };

    })
    .filter(Boolean);


const usedNumbers =
  new Map();


for (const record of records) {

  if (record.number === null) {
    continue;
  }


  if (!usedNumbers.has(record.number)) {

    usedNumbers.set(
      record.number,
      record
    );

    continue;
  }


  /*
   * If an accidental duplicate ever occurs,
   * preserve the older file's number.
   */

  const existing =
    usedNumbers.get(record.number);


  if (record.added < existing.added) {

    existing.number = null;

    usedNumbers.set(
      record.number,
      record
    );

  } else {

    record.number = null;

  }

}


let nextNumber =
  Math.max(
    0,
    ...Array.from(
      usedNumbers.keys()
    )
  ) + 1;


const unnumbered =
  records
    .filter(
      (record) =>
        record.number === null
    )
    .sort((a, b) => {

      if (a.added !== b.added) {
        return a.added - b.added;
      }

      return a.filePath.localeCompare(
        b.filePath
      );

    });


for (const record of unnumbered) {

  record.number =
    nextNumber;

  nextNumber++;

}


for (const record of records) {

  let frontmatter =
    record.frontmatter;


  /*
   * Remove the old manual accession field.
   */

  frontmatter =
    frontmatter.replace(
      /^accession:\s*.*(?:\r?\n|$)/gm,
      ""
    );


  /*
   * Remove an existing archiveNumber line so we
   * can write one clean canonical value.
   */

  frontmatter =
    frontmatter.replace(
      /^archiveNumber:\s*.*(?:\r?\n|$)/gm,
      ""
    );


  const formattedNumber =
    String(record.number)
      .padStart(4, "0");


  frontmatter =
    `archiveNumber: "${formattedNumber}"\n${frontmatter}`
      .replace(/\n{3,}/g, "\n\n")
      .trim();


  const output =
    `---\n${frontmatter}\n---${record.body}`;


  if (output !== record.text) {

    fs.writeFileSync(
      record.filePath,
      output,
      "utf8"
    );


    console.log(
      `${formattedNumber}  ${record.filePath}`
    );

  }

}
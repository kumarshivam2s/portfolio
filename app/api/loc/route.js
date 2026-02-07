import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function countLinesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return content.split("\n").length;
  } catch {
    return 0;
  }
}

function countLinesInDirectory(dirPath, extensions = [".js", ".jsx"]) {
  let totalLines = 0;
  let fileCount = 0;

  const excludeDirs = [
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    ".vercel",
  ];

  function traverse(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          if (!excludeDirs.includes(item)) {
            traverse(itemPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          if (extensions.includes(ext)) {
            totalLines += countLinesInFile(itemPath);
            fileCount++;
          }
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  traverse(dirPath);
  return { totalLines, fileCount };
}

export async function GET() {
  try {
    // Get the project root directory
    const projectRoot = process.cwd();

    const { totalLines, fileCount } = countLinesInDirectory(projectRoot);

    return NextResponse.json({
      linesOfCode: totalLines,
      fileCount: fileCount,
    });
  } catch (error) {
    console.error("Error counting lines:", error);
    return NextResponse.json({ linesOfCode: 0, fileCount: 0 }, { status: 500 });
  }
}

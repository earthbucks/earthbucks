import fs from "fs";
import path from "path";
import toml from "toml";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the type for a blog post
interface BlogPost {
  title: string;
  author: string;
  date: string;
  content: string;
  filename: string;
}

// Get all markdown files in the docs/blog directory
const blogDir = path.join(__dirname, "blog");
const filenames = fs
  .readdirSync(blogDir)
  .filter((filename) => filename.endsWith(".md"));

// Parse each file and add it to the blogPosts array
const blogPosts: BlogPost[] = filenames.map((filename) => {
  const filePath = path.join(blogDir, filename);
  const fileContent = fs.readFileSync(filePath, "utf8");

  // Manually extract and parse the frontmatter
  const frontmatterDelimiter = "+++";
  const splitContent = fileContent.split(frontmatterDelimiter);
  const frontmatter = toml.parse(splitContent[1] as string);
  const content = splitContent.slice(2).join(frontmatterDelimiter).trim();

  return {
    filename,
    title: frontmatter.title as string,
    author: frontmatter.author as string,
    date: frontmatter.date as string,
    content,
  };
});

// Write the blogPosts array to a JSON file
const jsonPath = path.join(__dirname, "blog", "index.json");
fs.writeFileSync(jsonPath, JSON.stringify(blogPosts, null, 2));

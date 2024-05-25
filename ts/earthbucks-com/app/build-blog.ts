import fs from "fs";
import path from "path";
import toml from "toml";

export interface BlogPost {
  title: string;
  author: string;
  date: string;
  filename: string;
  content: string;
}

const blogDir = path.join("app", "markdown", "blog");
const filenames = fs
  .readdirSync(blogDir)
  .filter((filename) => filename.endsWith(".md"));

const blogPosts: BlogPost[] = filenames.map((filename) => {
  const filePath = path.join(blogDir, filename);
  const fileContent = fs.readFileSync(filePath, "utf8");

  const frontmatterDelimiter = "+++";
  const splitContent = fileContent.split(frontmatterDelimiter);
  const frontmatter = toml.parse(splitContent[1] as string);

  return {
    filename,
    title: frontmatter.title as string,
    author: frontmatter.author as string,
    date: frontmatter.date as string,
    content: "",
  };
});

const jsonPath = path.join("app", "markdown", "blog", "index.json");
fs.writeFileSync(jsonPath, JSON.stringify(blogPosts, null, 2));

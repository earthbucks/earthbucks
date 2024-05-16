import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import Logo from "~/components/logo";
import blogPosts from "~/blog/index.json";
import { Link, useLoaderData } from "@remix-run/react";
import MyMarkdown from "~/components/my-markdown";
import { $path } from "remix-routes";
import Footer from "~/components/footer";
import fs from "fs";
import path from "path";
import toml from "toml";

interface Article {
  title: string;
  date: string;
  author: string;
  filename: string;
  content: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const filename = "about.md";
  const markdownDir = path.join("app", "markdown");
  const filePath = path.join(markdownDir, `${filename}`);

  const fileContent = fs.readFileSync(filePath, "utf8");

  const frontmatterDelimiter = "+++";
  const splitContent = fileContent.split(frontmatterDelimiter);

  const frontmatter = toml.parse(splitContent[1] as string);

  const article: Article = {
    title: frontmatter.title as string,
    author: frontmatter.author as string,
    date: frontmatter.date as string,
    filename: filename,
    content: splitContent[2] as string,
  };

  return json({ article: article });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const article = data?.article as Article;
  return [
    { title: `${article.title} | EarthBucks` },
    { name: "description", content: "Welcome to EarthBucks!" },
  ];
};

export default function BlogIndex() {
  let loaderData = useLoaderData<typeof loader>();
  let blogPost = loaderData.article as Article;
  return (
    <div>
      <div className="mx-auto my-4">
        <Logo />
      </div>
      <div className="mx-auto my-4 max-w-[500px]">
        <div>
          <h1 className="my-4 text-center text-2xl font-bold text-black dark:text-white">
            {blogPost.title}
          </h1>
          <div className="my-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {blogPost.date} &middot; {blogPost.author}
          </div>
          <div className="text-black dark:text-white">
            <MyMarkdown>{blogPost.content}</MyMarkdown>
          </div>
        </div>
      </div>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <div className="text-center text-black dark:text-white">
        <Link className="text-lg font-bold underline" to={$path("/")}>
          Back to Home
        </Link>
      </div>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}

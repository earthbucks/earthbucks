import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import Logo from "~/components/logo";
import blogPosts from "~/blog/index.json";
import { Link, useLoaderData } from "@remix-run/react";
import MyMarkdown from "~/components/MyMarkdown";
import { $path } from "remix-routes";
import Footer from "~/components/footer";
import fs from "fs";
import path from "path";

interface BlogPost {
  title: string;
  date: string;
  author: string;
  filename: string;
  content: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const filename = params.filename;
  const newBlogPosts: BlogPost[] = blogPosts
    .map((post) => {
      return {
        title: post.title,
        date: post.date,
        author: post.author,
        filename: post.filename,
        content: "",
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .reverse();

  const blogPost = newBlogPosts.find((post) => post.filename === `${filename}`);
  if (!blogPost) {
    throw new Response("Not found", { status: 404 });
  }
  // load content from app/blog/filename
  const blogDir = path.join("app", "blog");
  const filePath = path.join(blogDir, `${filename}`);
  const fileContent = fs.readFileSync(filePath, "utf8").split('+++')[2] as string;
  blogPost.content = fileContent;

  return json({ blogPost });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const blogPost = data?.blogPost as BlogPost;
  return [
    { title: `${blogPost.title} | Blog | EarthBucks` },
    { name: "description", content: "Welcome to EarthBucks!" },
  ];
};

export default function BlogIndex() {
  let loaderData = useLoaderData<typeof loader>();
  let blogPost = loaderData.blogPost as BlogPost;
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
        <Link className="text-lg font-bold underline" to={$path("/blog")}>
          Back to Blog
        </Link>
      </div>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}

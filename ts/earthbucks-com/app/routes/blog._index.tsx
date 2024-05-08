import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import Logo from "~/components/logo";
import blogPosts from "~/blog/index.json";
import { useLoaderData } from "@remix-run/react";

interface BlogPost {
  title: string;
  date: string;
  author: string;
  filename: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const newBlogPosts: BlogPost[] = blogPosts
    .map((post) => {
      return {
        title: post.title,
        date: post.date,
        author: post.author,
        filename: post.filename,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .reverse();
  return json({ blogPosts: newBlogPosts });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Blog | EarthBucks" },
    { name: "description", content: "Welcome to EarthBucks!" },
  ];
};

export default function BlogIndex() {
  let loaderData = useLoaderData<typeof loader>();
  let blogPosts = loaderData.blogPosts;
  return (
    <div>
      <div className="mx-auto my-4">
        <Logo />
      </div>
      <div className="mx-auto my-4 max-w-[400px]">
        <div>
          <h1 className="my-4 text-center text-2xl font-bold text-black dark:text-white">
            Blog
          </h1>
          <div>
            <div className="mb-4 text-black dark:text-white">
              {blogPosts.map((post) => (
                <div key={post.filename} className="mb-4">
                  <a
                    href={`/blog/${post.filename}`}
                    className="text-lg font-semibold leading-3 underline"
                  >
                    {post.title}
                  </a>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {post.date} &middot; {post.author}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import Logo from "~/components/logo";
import blogPosts from "~/markdown/blog/index.json";
import { Link, useLoaderData } from "@remix-run/react";
import Footer from "~/components/footer";
import { $path } from "remix-routes";

interface BlogPost {
  title: string;
  date: string;
  author: string;
  filename: string;
  content: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
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
        <Link to={$path("/")}>
          <Logo />
        </Link>
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

import Markdown from "react-markdown";
import { Link } from "@remix-run/react";

export default function MyMarkdown({ children }: { children: string }) {
  // disable images by replacing "![" with "["
  children = children.replace(/!\[/g, "[");

  return (
    <div className="earthbucks-prose">
      <Markdown
        components={{
          a: ({ children, href }) => {
            return (
              <Link
                to={
                  href
                    ? href.startsWith("./")
                      ? `.${href}` // force remix to handle relative paths correctly
                      : href
                    : href || ""
                }
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.stopPropagation();
                }}
              >
                {children}
              </Link>
            );
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}

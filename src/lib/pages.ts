import fs from "fs";
import matter from "gray-matter";
import path from "path";
import yaml from "js-yaml";

const postsDirectory = path.join(process.cwd(), "content/pages");

export type PageContent = {
  readonly title: string;
  readonly slug: string;
  readonly image: string;
  readonly fullPath: string;
};

let postCache: PageContent[];

export function fetchPageContent(): PageContent[] {

  if (postCache) {
    return postCache;
  }
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((it) => it.endsWith(".mdx"))
    .map((fileName) => {
      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents, {
        engines: {
          yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
        },
      });
      const matterData = matterResult.data as {
        title: string;
        image: string;
        slug: string;
        fullPath: string,
      };
      matterData.fullPath = fullPath;

      const slug = fileName.replace(/\.mdx$/, "");

      // Validate slug string
      if (matterData.slug !== slug) {
        throw new Error(
          "slug field not match with the path of its content source"
        );
      }
      return matterData;
    });

  postCache = allPostsData;
  return postCache;
}


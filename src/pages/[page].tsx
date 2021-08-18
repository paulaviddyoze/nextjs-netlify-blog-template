import { GetStaticProps, GetStaticPaths } from "next";
import renderToString from "next-mdx-remote/render-to-string";
import { MdxRemote } from "next-mdx-remote/types";
import hydrate from "next-mdx-remote/hydrate";
import matter from "gray-matter";
import { fetchPageContent, listPageContent } from "../lib/pages";
import fs from "fs";
import yaml from "js-yaml";
import PageLayout from "../components/PageLayout";

import InstagramEmbed from "react-instagram-embed";
import YouTube from "react-youtube";
import { TwitterTweetEmbed } from "react-twitter-embed";

export type Props = {
  title: string;
  slug: string;
  image: string;
  pages: object[];
  source: MdxRemote.Source;
  builder: object[];
};

const components = { InstagramEmbed, YouTube, TwitterTweetEmbed };
const slugToPostContent = (postContents => {
  let hash = {}
  postContents.forEach(it => hash[it.slug] = it)
  return hash;
})(fetchPageContent());

export default function Post({
  title,
  slug,
  image,
  pages,
  source,
  builder,
}: Props) {
  const content = hydrate(source, { components })
  return (
    <PageLayout
      title={title}
      slug={slug}
      image={image}
      pages={pages}
      builder={builder}
    >
      {content}
    </PageLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = fetchPageContent().map(it => "/" + it.slug);
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const pages = listPageContent();
  const slug = params.page as string;
  const source = fs.readFileSync(slugToPostContent[slug].fullPath, "utf8");
  const { content, data } = matter(source, {
    engines: { yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object }
  });
  const mdxSource = await renderToString(content, { components, scope: data });
  return {
    props: {
      pages,
      title: data.title,
      slug: data.slug,
      image: data.image,
      source: mdxSource,
      builder: data.builder,
    },
  };
};


import { marked } from "marked";
import htmlParser from "html-react-parser";
import type { Route } from "./+types/post";
//https://www.npmjs.com/package/@atproto/api
import { RichText } from "@atproto/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NoRobots.blog" },
    {
      name: "description",
      content:
        "Creative writing and news from the front line of the machine resistance. 100% Human-produced content. No Language Models were used in the production of this weblog.",
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  console.log("PARAMS", params);
  //https://docs.bsky.app/docs/api/com-atproto-repo-list-records
  const url =
    "https://rhizopogon.us-west.host.bsky.network/xrpc/com.atproto.repo.listRecords?repo=norobots.blog&collection=com.whtwnd.blog.entry";
  //"https://rhizopogon.us-west.host.bsky.network/xrpc/com.atproto.repo.listRecords?repo=did%3Aplc%3Ac3zne4g2kcfjgdzbeentnj57&collection=com.whtwnd.blog.entry";
  //"https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=anthonycregan.dev&collection=com.whtwnd.blog.entry"
  const res = await fetch(url);
  const articles = await res.json();
  console.log("ARTICLES", articles);
  console.log("ARTICLES[0]", articles.records[0]);
  if (
    articles.records &&
    articles.records.length > 0 &&
    articles.records[0].value
  ) {
    const articlesList = articles.records[0].value;
    console.log("ARTICLES LIST", articlesList);
    return {
      ...articlesList,
      params: params,
    };
  } else {
    return [];
  }
}

export default function Post({ loaderData }: Route.ComponentProps) {
  const { title, content } = loaderData;
  console.log("loaderData", loaderData);
  // const richTextContent = new RichText({ text: result.content });
  const markdownConverted = marked.parse(
    content
      .replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "")
      .replaceAll(`\\n`, "")
  ) as string;

  const markdownConvertedAndParsed = htmlParser(markdownConverted);
  console.log("markdownConvertedAndParsed ", markdownConvertedAndParsed);
  return (
    <div>
      <h1>{title}</h1>
      <div id="content">{markdownConvertedAndParsed}</div>
    </div>
  );
}

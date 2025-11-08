import { marked } from "marked";
import htmlParser from "html-react-parser";
import type { Route } from "./+types/home";
//https://www.npmjs.com/package/@atproto/api
import { RichText } from "@atproto/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "No-Robots" },
    {
      name: "description",
      content:
        "Creative writing and news from the front line of the resistance. 100% Human-produced content.",
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  //https://docs.bsky.app/docs/api/com-atproto-repo-list-records
  const res = await fetch(
    "https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=anthonycregan.dev&collection=com.whtwnd.blog.entry"
  );
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
    return articlesList;
  } else {
    return [];
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const result = loaderData;
  console.log("result", result);
  const richTextContent = new RichText({ text: result.content });
  console.log("RTC", richTextContent);
  const markdownConverted = marked.parse(
    result.content
      .replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "")
      .replaceAll(`\\n`, "")
  ) as string;

  const markdownConvertedAndParsed = htmlParser(markdownConverted);
  console.log("markdownConvertedAndParsed ", markdownConvertedAndParsed);
  return (
    <div>
      {/* <h1>JSON STATHAM</h1>
      <textarea defaultValue={JSON.stringify(result)}></textarea>
      <textarea defaultValue={result.content}></textarea>
      <p>Basic Content</p>
      {result.content}
      <hr />
      <p>Rich Text</p>
      {richTextContent.text}
      <hr />
      <p>Marked Converted</p>
      {markdownConverted}
      <hr /> */}
      <p>Marked Converted and Parsed</p>
      {markdownConvertedAndParsed}
    </div>
  );
}

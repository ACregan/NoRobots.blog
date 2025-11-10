import { marked } from "marked";
import htmlParser from "html-react-parser";
import type { Route } from "./+types/post";
//https://www.npmjs.com/package/@atproto/api
import { RichText } from "@atproto/api";
import styles from "./post.module.css";
import type { Article } from "~/types/types";

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
  const { articleId } = params;
  //https://docs.bsky.app/docs/api/com-atproto-repo-list-records
  const url =
    "https://rhizopogon.us-west.host.bsky.network/xrpc/com.atproto.repo.listRecords?repo=norobots.blog&collection=com.whtwnd.blog.entry";
  //"https://rhizopogon.us-west.host.bsky.network/xrpc/com.atproto.repo.listRecords?repo=did%3Aplc%3Ac3zne4g2kcfjgdzbeentnj57&collection=com.whtwnd.blog.entry";
  //"https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=anthonycregan.dev&collection=com.whtwnd.blog.entry"
  const res = await fetch(url);
  const articles = await res.json();
  if (articles.records && articles.records.length > 0 && articleId) {
    const articlesList = articles.records;
    const requestedArticle = articlesList.filter(
      (article: Article) => article.cid === articleId
    );
    // console.log("ARTICLES LIST", articlesList);
    // console.log("requestedArticle from LIST", requestedArticle);
    const extractedAuthorDataStartIndex =
      requestedArticle[0].value.content.indexOf("<!--_AUTHOR::") + 13;
    // console.log("START INDEX = ", extractedAuthorDataStartIndex);
    const extractedAuthorDataEndIndex =
      requestedArticle[0].value.content.indexOf("-->");
    // console.log("END INDEX = ", extractedAuthorDataEndIndex);
    const extractedAuthorData = requestedArticle[0].value.content.substring(
      extractedAuthorDataStartIndex,
      extractedAuthorDataEndIndex
    );
    // console.log("VOILA!", extractedAuthorData);
    return {
      article: requestedArticle[0],
      params: params,
      author: extractedAuthorData || "Hugh Mann",
    };
  } else {
    return {
      article: [],
      params: {},
      author: "",
    };
  }
}

export default function Post({ loaderData }: Route.ComponentProps) {
  const { article, params, author } = loaderData;
  const { title, content } = article.value;
  // console.log("loaderData", loaderData);
  // // const richTextContent = new RichText({ text: result.content });
  const markdownConverted = marked.parse(
    content
      .replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "")
      .replaceAll(`\\n`, "")
  ) as string;

  const markdownConvertedAndParsed = htmlParser(markdownConverted);
  // console.log("markdownConvertedAndParsed ", markdownConvertedAndParsed);
  return (
    <div>
      <h1 className={styles.articleHeader}>{title}</h1>
      <p className={styles.author}>By {author}</p>
      <div className={styles.contentContainer}>
        {markdownConvertedAndParsed}
      </div>
    </div>
  );
}

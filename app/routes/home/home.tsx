import type { Route } from "./+types/home";
import ArticleTile from "./ArticleTile/ArticleTile";
import type { Article } from "~/types/types";
//https://www.npmjs.com/package/@atproto/api

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

const fetchArticleData = async () => {
  //https://docs.bsky.app/docs/api/com-atproto-repo-list-records
  const url =
    "https://rhizopogon.us-west.host.bsky.network/xrpc/com.atproto.repo.listRecords?repo=norobots.blog&collection=com.whtwnd.blog.entry";
  //"https://rhizopogon.us-west.host.bsky.network/xrpc/com.atproto.repo.listRecords?repo=did%3Aplc%3Ac3zne4g2kcfjgdzbeentnj57&collection=com.whtwnd.blog.entry";
  //"https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=anthonycregan.dev&collection=com.whtwnd.blog.entry"
  const res = await fetch(url);
  const articles = await res.json();
  if (articles.records && articles.records.length > 0) {
    const articlesList = articles.records;
    let newArticlesList: Article[] = [];
    // console.log(articlesList);
    // Find Author Data where its provided
    articlesList.forEach((article: Article) => {
      // article.value;
      const authorTagCommentStartString = "<!--_AUTHOR::";
      const authorTagCommentEndString = "-->";
      const extractedAuthorDataStartIndex = article.value.content.indexOf(
        authorTagCommentStartString
      );
      // console.log("START INDEX = ", extractedAuthorDataStartIndex);
      const extractedAuthorDataEndIndex = article.value.content.indexOf(
        authorTagCommentEndString
      );
      // console.log("END INDEX = ", extractedAuthorDataEndIndex);
      const extractedAuthorData =
        extractedAuthorDataStartIndex > 0 && extractedAuthorDataEndIndex > 0
          ? article.value.content.substring(
              extractedAuthorDataStartIndex +
                authorTagCommentStartString.length,
              extractedAuthorDataEndIndex
            )
          : "Hugh Mann";
      // console.log("extractedAuthorData", extractedAuthorData);

      newArticlesList.push({
        ...article,
        authorName: extractedAuthorData,
      });
    });
    return {
      articles: newArticlesList,
    };
  } else {
    return {
      articles: [],
    };
  }
};

export async function loader({ params }: Route.LoaderArgs) {
  const articleData = fetchArticleData();
  return articleData;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { articles } = loaderData;
  return (
    <div>
      {articles.map((article: Article) => {
        if (article.value.visibility === "public" || import.meta.env.DEV) {
          return (
            <ArticleTile
              key={article.cid}
              cid={article.cid}
              title={article.value.title}
              content={article.value.content}
              createdAt={article.value.createdAt}
              author={article.authorName}
            />
          );
        }
      })}
    </div>
  );
}

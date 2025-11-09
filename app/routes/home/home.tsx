// import { marked } from "marked";
// import htmlParser from "html-react-parser";
import type { Route } from "./+types/home";
import ArticleTile from "./ArticleTile/ArticleTile";
//https://www.npmjs.com/package/@atproto/api
// import { RichText } from "@atproto/api";

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
  //https://docs.bsky.app/docs/api/com-atproto-repo-list-records
  const url =
    "https://rhizopogon.us-west.host.bsky.network/xrpc/com.atproto.repo.listRecords?repo=norobots.blog&collection=com.whtwnd.blog.entry";
  //"https://rhizopogon.us-west.host.bsky.network/xrpc/com.atproto.repo.listRecords?repo=did%3Aplc%3Ac3zne4g2kcfjgdzbeentnj57&collection=com.whtwnd.blog.entry";
  //"https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=anthonycregan.dev&collection=com.whtwnd.blog.entry"
  const res = await fetch(url);
  const articles = await res.json();
  console.log("ARTICLES", articles);
  console.log("ARTICLES[0]", articles.records);
  if (articles.records && articles.records.length > 0) {
    const articlesList = articles.records;
    console.log("ARTICLES LIST", articlesList);
    return {
      articles: articlesList,
    };
  } else {
    return {
      articles: [],
    };
  }
}

// type ArticleTileProps = {
//   cid: string;
//   title: string;
//   content: string;
//   createdAt: string;
// };

// const ArticleTile = ({ cid, title, content, createdAt }: ArticleTileProps) => {
//   return (
//     <a href={`/post/${cid}`}>
//       <div>
//         <h2>{title}</h2>
//         <div>{content}</div>
//       </div>
//     </a>
//   );
// };

type ArticleValue = {
  $type: string;
  content: string;
  createdAt: Date;
  theme: string;
  title: string;
  visibility: string;
};
type Article = {
  cid: string;
  uri: string;
  value: ArticleValue;
};
export default function Home({ loaderData }: Route.ComponentProps) {
  const { articles } = loaderData;
  console.log("articles", articles);
  return (
    <div>
      {articles.map((article: Article) => {
        return (
          <ArticleTile
            cid={article.cid}
            title={article.value.title}
            content={article.value.content}
            createdAt={article.value.createdAt}
          />
        );
      })}
    </div>
  );
}

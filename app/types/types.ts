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
  authorName?: string;
};

export type { Article };

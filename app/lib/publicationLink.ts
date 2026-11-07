// The <link rel="site.standard.publication"> tag, for pages whose loader
// returns only the Publication's AT URI rather than the whole Publication
// (group and tag pages). Bluesky needs it on every page to draw its
// Standard.site link card. Pages with the whole Publication use the SDK's
// standardSiteLinks / documentMeta instead.
export function publicationLink(publicationUri: string) {
  return [{ tagName: "link", rel: "site.standard.publication", href: publicationUri }];
}

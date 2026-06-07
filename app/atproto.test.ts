import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSite, getArticle } from "./atproto";

const MOCK_DID = "did:plc:abc123test";
const MOCK_PDS = "https://pds.example.com";

type FetchResponse = { ok?: boolean; status?: number; body: unknown };

function setupFetchSequence(...responses: FetchResponse[]) {
  let call = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      const r = responses[call++];
      const ok = r.ok ?? true;
      return {
        ok,
        status: r.status ?? (ok ? 200 : 500),
        statusText: ok ? "OK" : "Error",
        json: async () => r.body,
      };
    }),
  );
}

// Standard 3-call sequence: identity → PDS → record
function withRecord(recordValue: unknown) {
  setupFetchSequence(
    { body: { did: MOCK_DID } },
    {
      body: {
        service: [
          {
            type: "AtprotoPersonalDataServer",
            serviceEndpoint: MOCK_PDS,
          },
        ],
      },
    },
    { body: { value: recordValue } },
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("getSite", () => {
  it("resolves handle → DID → PDS and returns a parsed site", async () => {
    withRecord({ title: "NoRobots", url: "https://norobots.blog", urlPrefix: "article/" });

    const site = await getSite("anthonycregan.dev", "norobots-blog");

    expect(site.title).toBe("NoRobots");
    expect(site.url).toBe("https://norobots.blog");
    expect(site.groups).toEqual([]);
    expect(site.ungroupedArticles).toEqual([]);
  });

  it("skips identity resolution when given a DID directly (2 fetches instead of 3)", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async (call = { n: 0 }) => {
        // Will be called twice: PDS then record
        return {};
      },
    }));

    // Use a tracked mock so we can verify call count
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        calls++;
        if (url.includes("plc.directory")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              service: [{ type: "AtprotoPersonalDataServer", serviceEndpoint: MOCK_PDS }],
            }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({ value: { title: "Site", url: "", urlPrefix: "" } }),
        };
      }),
    );

    await getSite(MOCK_DID, "test-site");
    expect(calls).toBe(2); // PDS lookup + record fetch, no identity resolution
  });

  it("parses groups with nested articles", async () => {
    withRecord({
      title: "Site",
      url: "",
      urlPrefix: "",
      groups: [
        {
          slug: "technology",
          title: "Technology",
          articles: [
            {
              uri: "at://did/app.scribe.article/post-1",
              title: "First Post",
              splashImageUrl: null,
              createdAt: "2024-01-01T00:00:00Z",
            },
          ],
        },
      ],
    });

    const site = await getSite("anthonycregan.dev", "norobots-blog");

    expect(site.groups).toHaveLength(1);
    expect(site.groups[0].slug).toBe("technology");
    expect(site.groups[0].articles[0].title).toBe("First Post");
  });

  it("throws when the record is not found (404)", async () => {
    setupFetchSequence(
      { body: { did: MOCK_DID } },
      {
        body: {
          service: [{ type: "AtprotoPersonalDataServer", serviceEndpoint: MOCK_PDS }],
        },
      },
      { ok: false, status: 404, body: {} },
    );

    await expect(getSite("anthonycregan.dev", "missing-site")).rejects.toThrow();
  });

  it("throws when the handle cannot be resolved", async () => {
    setupFetchSequence({ ok: false, status: 400, body: {} });

    await expect(getSite("invalid-handle.xyz", "site")).rejects.toThrow();
  });
});

describe("getArticle", () => {
  it("fetches and returns a parsed article", async () => {
    withRecord({
      title: "Hello World",
      content: "## Introduction\n\nSome content.",
      url: "hello-world",
      createdAt: "2024-03-15T12:00:00Z",
      synopsis: "A brief intro.",
    });

    const article = await getArticle("anthonycregan.dev", "hello-world");

    expect(article.title).toBe("Hello World");
    expect(article.content).toBe("## Introduction\n\nSome content.");
    expect(article.synopsis).toBe("A brief intro.");
  });

  it("falls back to the article slug when the record has no url field", async () => {
    withRecord({
      title: "Untitled",
      content: "",
      createdAt: "2024-01-01T00:00:00Z",
      // no url field
    });

    const article = await getArticle("anthonycregan.dev", "my-slug");

    expect(article.url).toBe("my-slug");
  });

  it("throws on 404", async () => {
    setupFetchSequence(
      { body: { did: MOCK_DID } },
      {
        body: {
          service: [{ type: "AtprotoPersonalDataServer", serviceEndpoint: MOCK_PDS }],
        },
      },
      { ok: false, status: 404, body: {} },
    );

    await expect(getArticle("anthonycregan.dev", "nonexistent")).rejects.toThrow();
  });
});

# BeforeSell search visibility

These changes make BeforeSell easier to discover and understand. They do not guarantee a search ranking or a recommendation in ChatGPT.

## What the implementation provides

- Public category pages render active listings in the initial HTML, with stable URLs, breadcrumbs, canonical URLs and pagination links. The interactive search and filters remain available through the Search & Filter button. Category URLs carrying filters continue to open the interactive search; tracking parameters alone leave the category page in place.
- The homepage and category directory link directly to public category URLs.
- The selling guide at `/sell-used-products-in-bangladesh` explains free basic ads, optional paid boosts, direct buyer/seller transactions and handover steps. It links to the existing Bangla guide.
- The sitemap includes the selling guide, category directory, public company/help/legal pages, active category pages, active listings and paired English/Bangla articles. Static pages do not claim to have changed every time the sitemap is requested.
- Internal search results, account pages and inactive listing pages carry noindex metadata. Search results and empty categories are excluded from the sitemap.
- Robots rules explicitly allow OAI-SearchBot to crawl public pages and exclude private account and payment paths. GPTBot is a separate crawler and is not explicitly reconfigured here.
- Titles include the brand once. Public informational pages have canonical URLs and their own social metadata. `/social-image` provides the default sharing image.
- Organization data references the existing logo, support contact and official Facebook page. Listing data uses the listing URL and actual active/sold status, with brand/condition taken from the displayed attributes rather than invented values. Product markup is limited to physical-product categories and does not claim an offer expiry or VAT treatment. JSON-LD escapes `<` before being embedded in HTML.
- The homepage no longer displays a hard-coded rating or unsupported growth/audience claims.

## Required deployment configuration

Set `NEXT_PUBLIC_APP_URL` to the public origin, for example `https://www.beforesell.com`, in the production build environment. It is required and must be an absolute HTTP(S) origin without a path, query, fragment or credentials. A trailing slash is accepted and normalized. Missing or malformed values throw a clear error. Do not use a localhost or preview origin in a production build.

Use one public host consistently. Configure your hosting provider to permanently redirect alternate hosts and HTTP requests to the production HTTPS origin. Do not redirect local or preview environments to production.

Robots rules cannot bypass a CDN or firewall. Allow legitimate OAI-SearchBot requests from the IP ranges published in [OpenAI's crawler documentation](https://developers.openai.com/api/docs/bots). Do not trust a user-agent string alone for a firewall bypass.

## Work requiring the owner's accounts

1. Deploy the changes after your own review and testing.
2. Verify the domain in Google Search Console and Bing Webmaster Tools, and submit `https://www.beforesell.com/sitemap.xml` using the actual production origin.
3. Use Search Console to request indexing for the homepage, category directory, selling guide and key populated categories.
4. Track indexing and organic queries such as “sell used products in Bangladesh,” along with visits and completed listings. Search Console data covers Google; use referral analytics for other sources.
5. Keep listings current and remove spam. Keep fees, support details and service descriptions accurate.
6. Earn independent reviews and local coverage through real product use. Ask users for honest feedback and disclose paid coverage. Publish usage or sale statistics only when you can substantiate them.

## Limits and future work

The existing sitemap limit of 45,000 active listings is retained. Before the marketplace exceeds it, add sitemap shards through Next.js `generateSitemaps` and update the submitted sitemap URLs. Category navigation currently includes direct child categories, matching the existing search hierarchy.

No automated tests, build, lint, typecheck, runtime checks or browser/manual testing were run for this change, following the project owner's instructions. No database schema or migration changes are required.

## References

- [OpenAI crawler access](https://developers.openai.com/api/docs/bots)
- [Google AI search and website guidance](https://developers.google.com/search/docs/appearance/ai-features)
- [Google's AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js JSON-LD guidance](https://nextjs.org/docs/app/guides/json-ld)

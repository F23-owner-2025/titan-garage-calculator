# Titan Garage Floors calculator

Browser-only garage-floor estimate calculator. Public source and GitHub Pages hosting are intentional.

## Website

https://f23-owner-2025.github.io/titan-garage-calculator/

GitHub Pages publishes `docs/` from the `main` branch. Push changes to that directory to redeploy. No API token is needed in the website or repository, and rotating the deployment token does not stop the hosted page.

## Pricing

The estimate rate is **$4.75 per square foot**. Change `RATE_CENTS_PER_SQUARE_FOOT` in `docs/calculator.mjs` (integer cents; currently `475`) and update the expected totals in `tests/calculator.test.mjs`.

Examples: 250 sq ft = $1,187.50; 500 sq ft = $2,375.00; 750 sq ft = $3,562.50. Estimates are not binding quotes.

## Development

Requires Node.js for the tests, but no build tools or package installation:

    node --test tests/*.test.mjs
    node --check docs/app.js
    python3 -m http.server 8080 --directory docs

Open http://localhost:8080/ for a local preview. Local images, relative links, and `.nojekyll` allow deployment under a repository path or at a custom-domain root. `nginx.conf` is retained as the optional standalone static-host configuration tested by the source's existing test suite; it is not used by GitHub Pages.

The existing Formspree integration uses a public form ID, not an API credential. Confirm delivery and any Formspree domain allowlist separately after changing domains; publishing the calculator does not prove email delivery.

## Custom domain through Cloudflare

Keep the GitHub Pages URL working before moving an existing domain.

1. In this repository, open **Settings → Pages → Custom domain** and enter the hostname you own, such as `quote.example.com`. Verify ownership under your GitHub account Pages settings when prompted/recommended.
2. In the Cloudflare DNS zone, add a **CNAME** named `quote` pointing to **f23-owner-2025.github.io**. Do not put the repository name, a path, or `https://` in the target.
3. Initially select **DNS only** and **TTL Auto**. Replace only conflicting A/AAAA/CNAME records for this exact hostname. Preserve mail and unrelated service records.
4. Wait for GitHub's DNS check and HTTPS certificate, then enable **Enforce HTTPS** in Settings → Pages.
5. Test the custom-domain page, calculator, images, and lead delivery before retiring the previous host. Leave DNS only unless you deliberately need Cloudflare proxying; if enabling it after certificate issuance, use Full (strict) SSL/TLS and verify again.

This example is for a subdomain. For a root/apex domain, follow GitHub's current apex-domain record instructions instead of copying an outdated IP list:
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

No custom domain is configured by this initial deployment. GitHub Pages has commercial-use restrictions; review them before expanding this test calculator into a business storefront, checkout, or SaaS:
https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

## Security and content

Never commit personal access tokens, `.env` files, credentials, server configuration, or customer submissions. The browser receives the calculator code; the rate and formula are not secret. No customer submissions are stored in this repository. Existing branding and image assets retain their respective owners' rights; making this repository public does not grant a new license to them.

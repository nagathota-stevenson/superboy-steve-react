# Pocket payments and downloads

## Current status

Payment implementation is staged here. It is not deployed or tested with a real Stripe Checkout Session yet. Billing is enabled and the required Google APIs are enabled. The plugin archive is uploaded privately; unauthenticated download was rejected (HTTP 403). Do not publish checkout until the end-to-end checks below pass.

Project: `superboysteve-e6cea`

Private archive: `gs://superboysteve-e6cea.appspot.com/pocket-paid/releases/Pocket-macOS-20260910-73b3ede246a3.zip`

SHA256: `73b3ede246a3bf4b5b20e28ae4ab0cffbea56bf3d7e2b16292348c3a27df6d5a`

The archive contains a DMG installer, installation instructions and checksums. It is an unsigned macOS VST3/AU release, not notarized. Physical Intel testing and official AU validation remain pending. Windows is not included. The installation guide describes the normal macOS Privacy & Security approval flow for a trusted unsigned installer; it does not disable system security.

## Add credentials securely

Use a local terminal, not chat. From this website directory, run each command and paste the requested value into its secret prompt:

```sh
firebase functions:secrets:set STRIPE_SECRET_KEY --project superboysteve-e6cea
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project superboysteve-e6cea
```

Use the Stripe account's secret API key (`sk_...`) for the first command. In Stripe Workbench/Webhooks, create an endpoint for:

`https://us-central1-superboysteve-e6cea.cloudfunctions.net/pocketStripeWebhook`

Subscribe to `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Use that endpoint's signing secret (`whsec_...`) for the second command. Test and live endpoints have different signing secrets. Start with test-mode credentials in an isolated Firebase staging project, then configure live credentials for production. Never put either secret in a Vite variable, source file, screenshot or git. The supplied publishable key is not needed: this integration redirects directly to the server-created hosted Checkout URL.

Nonsecret Firebase parameters are in `functions/.env.example`; copy these to `.env.superboysteve-e6cea` inside `functions` if absent. The archive must remain under the protected `pocket-paid` prefix. Do not generate a public Firebase download token.

## Deployment and IAM

Use Node 22. Run `npm ci` in `functions`, then `npm test`. Build the frontend with the project's normal build command. Deploy backend first:

```sh
firebase deploy --only functions:pocketApi,functions:pocketStripeWebhook --project superboysteve-e6cea
```

Confirm the deployed runtime service account. Give it Storage Object Viewer for the archive bucket and permission to sign blobs as itself (Service Account Token Creator on that service account, not across the project). Ensure its Firebase database access and access to the bound secrets. IAM Credentials API is enabled. Verify these permissions by exercising the paid download endpoint before publishing hosting.

Storage rules already deployed block client access to `pocket-paid/**` while preserving existing public assets. Existing database rules deny public access to orders. Do not replace these with public read rules. Deployment must preserve existing hosting routes and waitlist rules.

After verification, publish the frontend and rewrites:

```sh
firebase deploy --only hosting --project superboysteve-e6cea
```

## Required acceptance checks

- In staging, use Stripe test mode to create an actual Checkout Session. Confirm exactly USD 19.99, quantity one, and no client-supplied price. Check eligible card wallets on supported devices.
- Cancel checkout and confirm return to `/pocket#buy`. Retry an expired checkout and confirm a fresh session is created.
- Complete a test payment. Confirm the signed webhook persists email, session ID, payment status, product, and 1999 cents in private `pocketOrders`.
- Replay the webhook and confirm one order remains paid. Invalid signatures, tampered amounts, wrong currencies and wrong mode must not grant access.
- Visit `/success` without a purchase token and before a verified payment: neither may download. A redirect alone must never grant access.
- Confirm a paid buyer receives a working five-minute signed URL. Confirm direct anonymous bucket access fails and expired links fail.
- Refund a test purchase; creating a new download URL must fail. Previously minted URLs remain valid until their five-minute expiry.
- Test installation in a fresh macOS account, both formats, and actual Intel hardware before claiming verified Intel support.
- Repeat a controlled live purchase/refund with the owner's authorization after switching to live credentials. Do not use test cards in live mode.

Automated policy/signature tests passed; these do not replace the live backend acceptance checks. Dependency audit reported zero vulnerabilities at preparation time.

## Operation and recovery

The server fixes the price at 1999 USD cents. The UI shows $39.99 crossed out and $19.99 with the requested 50% launch discount label. Stripe card Checkout can offer eligible wallets without collecting card information on this website.

A random purchase capability is retained in the buyer's browser session; only its hash is stored server-side. It authorizes status/download requests, independently of redirects. Buyers who close the session or change devices currently need support with their receipt. Verify the receipt in Stripe before manually granting recovery; never expose database records or public archive links. Receipt email delivery and self-service purchase recovery are not implemented. Orders contain an extension point for later licenses.

Downloads recheck Stripe payment/refund state before minting short-lived URLs. Order fulfillment is idempotent. Monitor webhook delivery failures and function errors; retry failed webhook deliveries through Stripe after resolving the cause. Set Firebase budget alerts. Periodically remove expired `pocketCheckoutLimits` entries using their `expiresAt` value; this implementation does not yet schedule cleanup. Define an order data retention policy and publish appropriate support, refund and privacy terms before launch.

References: https://docs.stripe.com/checkout/fulfillment and https://firebase.google.com/docs/functions/config-env

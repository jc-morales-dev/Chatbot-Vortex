# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| 1.0.x | Yes |

## API keys (BYOK)

Chatbot Vortex does **not** hold provider API keys on any server. Keys are
bring-your-own-key (BYOK) and are used only client-side in the browser when the
user pastes them into settings.

- Do not commit API keys, `.env` files with secrets, or hardcoded credentials.
- Default mode is `offline` and ships with no bundled provider key.

## Historical Google API key — owner revocation required

A Google API key previously appeared in repository history. Reachable git
history has been purged of that secret. **The repository owner must still
revoke or rotate any historical Google API key in Google Cloud Console**, even
if GitHub secret scanning already shows the alert as resolved/revoked. This
document does not claim that rotation has already been completed.

### Revoke or rotate in Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) (or
   [Google AI Studio API keys](https://aistudio.google.com/apikey)).
2. Select the project that owned the exposed key.
3. Go to **APIs & Services → Credentials** (or AI Studio API keys list).
4. Locate the historical Google API key that may have been exposed.
5. **Delete** the key, or **Restrict** it and then create a replacement and
   delete the old one (preferred: full revoke/delete).
6. If the key was used for Gemini / Generative Language API, confirm quotas and
   abuse alerts after revocation.
7. Never paste replacement keys into git, issues, or chat logs.

Until the owner completes revocation in Google Cloud, treat any historically
exposed key as untrusted.

## Reporting a Vulnerability

If you discover a security issue, please do not open a public issue first.

Report it privately with:

- affected repository
- reproduction steps
- impact summary
- any proof of concept or logs that help validate the issue

Contact:

- Email: `juliocesarmoralesalvarado9@gmail.com`

Initial response target: within 72 hours.
Fixes will be prepared privately when possible and disclosed after a patch is available.

[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge)](https://aegispass.onrender.com)

# Aegis-Pass
 
A zero-knowledge password manager built as a full-stack portfolio project. Aegis-Pass is designed around one core principle: the server should never be able to read your passwords — not even in theory.
 
All encryption and decryption happens client-side inside a Web Worker. The server stores only ciphertext. Your master password never leaves your device.
 
---
## Live Demo 🔗 https://aegispass.onrender.com


## Tech Stack
 
**Frontend**
- React 19 + TypeScript + Vite
- React Router v7 (background location pattern for modal routes)
- Tailwind CSS v4 + shadcn/ui (New York style)
- react-hook-form + Zod
- Web Crypto API (`crypto.subtle`) — no third-party crypto library

**Backend**
- Django 5 + Django REST Framework
- SimpleJWT with token rotation and blacklisting
- PostgreSQL
- `django-cors-headers`

---

## Features
 
**Vault**
- Create, view, edit, soft delete, and restore vault items
- Item types: Login, Secure Note (extensible to Card, Identity)
- Per-item version history with field-level diff display
- Favourites and Trash with empty-trash / restore-all actions
- Folder organisation — items can belong to one folder
- Toggle favourite with optimistic UI update (no refetch)

**Security**
- Zero-knowledge architecture — server holds no decryptable data
- Client-side password strength analysis (weak, reused, old passwords)
- Password generator using `crypto.getRandomValues()` with configurable character sets and minimum requirements
- Password strength checker with weighted scoring and visual feedback
- Per-device session tracking with individual revocation
- Configurable inactivity timeout (5 / 15 / 30 / 60 minutes)

**UX**
- Modal-based item flow with route-driven navigation (`/vault/item/:id`, `/vault/item/:id/edit`, `/vault/item/:id/history`)
- Collapsible sidebar with memoized nav (no re-render on route change)
- In-memory vault cache with TTL, surgical patch on toggle/delete
- Client-side search with `useMemo` — no network call during search
- Dark / light / system theme

---
 
 
## Project Structure
 
```
aegis-pass/
├── backend/
│   ├── accounts/          # auth, user model, sessions, preferences
│   ├── vault/             # vault items, folders, history
│   ├── core/              # settings, urls, wsgi
│   ├── manage.py
│   └── requirements.txt             
│
├── frontend/
│   └── src/
│       ├── worker/
│       │   ├── worker.ts           # message handler — thin switch
│       │   ├── worker-client.ts    # main thread bridge
│       │   └── utils/
│       │       ├── secure-storage.ts   # isolated in-memory state
│       │       ├── token-manager.ts    # refresh, expiry, inactivity
│       │       ├── crypto-helper.ts    # PBKDF2, HKDF, AES-GCM
│       │       ├── api-helper.ts       # authenticated fetch
│       │       └── vault-analyser.ts   # password health analysis
│       ├── layout/
│       ├── routes/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── hooks/
│       ├── utils/
│       ├── App.css
│       ├── index.css
│       ├── main.tsx
│       └── App.tsx
├── .gitignore     
├── LICENSE     
└── README.md

```
 
---

## Getting Started
 
### Prerequisites
 
- Node.js 20+
- Python 3.12+
- PostgreSQL

### Backend Setup
 
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
 
cp .env.example .env           # fill in SECRET_KEY, DATABASE_URL
python manage.py migrate
python manage.py runserver
```
 
### Frontend Setup
 
```bash
cd frontend
npm install
 
cp .env.example .env.local     # set VITE_API_URL=http://localhost:8000
npm run dev
```
 
### Environment Variables
 
**Backend `.env`**
```
SECRET_KEY=your-django-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/aegispass
COOKIE_SECURE=False            # set True in production
CORS_ALLOWED_ORIGINS=http://localhost:5173
```
 
**Frontend `.env.local`**
```
VITE_API_URL=http://localhost:8000
```
 
---
 
## Running the App
- Open **`http://localhost:5173`** for the frontend.
- The backend runs on **`http://localhost:8000`**.

---

## Screenshots
<p align="center">

  <img 
    src="./frontend/public/dashboard-display.png"
    alt="Dashboard Preview"
    width="1000"
    style="border-radius: 12px;"
  />
  <img 
    src="./frontend/public/landing-page-preview.png"
    alt="Landing Page Preview"
    width="244"
    style="border-radius: 12px;"
  />
  <img 
    src="./frontend/public/password-generator-demo-dark.png"
    alt="Password Generator Preview"
    width="400"
    style="border-radius: 12px;"
  />
</p>

## Key Technical Decisions
 
### Zero-Knowledge Key Derivation
 
When a user registers or logs in, the following happens entirely in the Web Worker:
 
```
master_password
  → PBKDF2(password, salt=email, 600,000 iterations, SHA-256)
  = master_key                          [never stored, never sent]
 
master_key
  → HKDF(info="aegis-pass-encryption-key-v1")
  = encryption_key                      [stored in worker memory only]
 
master_key
  → PBKDF2(master_key, salt=password, 1 iteration)
  = auth_token (base64)                 [sent to server as password]
```
 
The server receives and stores a bcrypt hash of `auth_token`. Even if the database is fully compromised, an attacker cannot reverse `auth_token` to `master_key`, and cannot reverse `master_key` to `encryption_key`.
 
### Web Worker Isolation
 
The `encryption_key` and `access_token` live exclusively in Web Worker module scope. The main thread communicates via `postMessage` and receives only decrypted vault data back — it never holds a key or raw token. On hard refresh, the worker process is killed and both values are gone, requiring the user to re-enter their master password.
 
### Per-Item Encryption
 
Every vault item is encrypted with a fresh 12-byte random IV:
 
```
AES-256-GCM(plaintext, key=encryption_key, iv=crypto.getRandomValues(12 bytes))
```
 
Two fields are encrypted separately per item:
- `encrypted_meta` — name, username, URL (for list views)
- `encrypted_data` — full payload including password (fetched on demand)
This means the server cannot learn anything about a vault item's contents, and decrypting the list does not require decrypting every password.
 
### Token Management
 
- Access tokens (5 min lifetime) stored in worker memory, never in `localStorage` or `sessionStorage`
- Refresh tokens (15 min) in `httpOnly; Secure; SameSite=Strict` cookies
- Proactive refresh scheduled 30 seconds before expiry
- Concurrent refresh requests are queued — only one refresh call is ever in flight
- Inactivity timer in worker: after configurable idle period, `clearAll()` wipes memory and pushes `FORCE_LOGOUT` to main thread

---
 

## Challenges
 
**Refresh token race condition** — Multiple concurrent API calls can each detect an expired access token simultaneously and all try to refresh at once. The `TokenManager` handles this with a subscriber queue: the first caller triggers the refresh, subsequent callers enqueue a callback and wait for the result, then all resolve together with the same new token.
 
**Memoizing the sidebar** — Using `useLocation()` inside the sidebar nav caused the entire sidebar to re-render on every route change — 11ms of unnecessary work per navigation, which manifested as a visible freeze. The fix was removing `useLocation` from the nav component, wrapping it in `React.memo`, and using `NavLink`'s render prop for active state which scopes the location subscription to just the link element.
 
**Cross-route toast delivery** — `react-hot-toast` couldn't show success messages after navigation because the component mounting the `<Toaster>` unmounted before the toast rendered. The fix was a module-level `toastQueue` utility that accepts a message and fires it via `setTimeout` after a short delay, by which point the destination route has mounted and the root-level `<Toaster>` is ready.
 
**Zero-knowledge version history** — Storing encrypted history means every previous version is an opaque blob. The history UI decrypts each entry in the worker, then computes a field-level diff on the plaintext to show what changed rather than the raw encrypted payload.
 
---
 
## What I Would Do Differently
 
- **OPAQUE tokens** instead of JWTs for access tokens — opaque tokens can be revoked server-side instantly, JWTs cannot
- **Argon2id** instead of PBKDF2 — better resistance to GPU/ASIC attacks, now the OWASP recommendation
- **End-to-end test suite** — the worker message protocol and crypto functions would benefit from isolated unit tests before the project grew to this size

---
 
 
## License
 
MIT — see [LICENSE](LICENSE)
 
---
 
*Built by Nilesh — [GitHub](https://github.com/nilesh112233/)
 

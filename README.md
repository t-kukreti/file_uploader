# 📁 File Uploader

A secure cloud file-storage application built with **Node.js, Express, Prisma, PostgreSQL, and Cloudflare R2**.

The application allows users to securely upload, organize, manage, and download files while handling large uploads through **S3-compatible multipart uploads**. It implements persistent upload state, resource-level authorization, signed URLs, and automatic cleanup of expired incomplete uploads.

Core functionality is complete and stable. Resumable downloads, concurrent multipart uploads, and a security monitoring layer are actively being added.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* User registration and login using **Passport.js Local Strategy**
* Password hashing with **bcrypt**
* Persistent login sessions using **Express Session** with a Prisma-backed session store
* Protected routes
* Resource-level ownership checks — users can only access and modify their own files and folders

### 📂 File Management

* Upload files to **Cloudflare R2**
* View file metadata
* Rename files
* Delete files
* Secure file downloads using **signed URLs**
* Upload files directly into folders
* Persistent file status tracking

### 📁 Folder Management

* Create folders
* Rename folders
* Delete folders
* Upload files inside folders
* Automatically remove associated files when a folder is deleted

### 📦 Large File Uploads

Large files are uploaded using **Cloudflare R2 multipart uploads** rather than sending the entire file through the application server.

The upload lifecycle is persisted in PostgreSQL using:

* `UploadSession` and `UploadPart` records
* Multipart upload IDs
* Individual part numbers and ETags
* Upload expiration timestamps
* Upload status tracking

This allows the application to keep track of multipart uploads independently of the server process and resume interrupted uploads without re-uploading completed parts.

### ⏱️ Upload Lifecycle & Cleanup

Incomplete uploads are automatically cleaned up after their expiration time using a scheduled background job that:

1. Finds expired upload sessions
2. Aborts the corresponding R2 multipart upload
3. Removes the associated database records
4. Cascades deletion to associated upload parts

This prevents abandoned multipart uploads and their database records from accumulating indefinitely.

### 🛡️ Security

* Helmet security headers with Content Security Policy
* Express rate limiting (general, auth, and upload-specific tiers)
* Server-side request validation using `express-validator`
* Password hashing using bcrypt
* Session-based authentication with secure cookie configuration
* Resource ownership authorization on every file and folder operation
* Signed URLs for private file downloads — files are never proxied through the server
* No inline JavaScript event handlers (CSP-compliant)
* Global error handling with production message masking

---

## 🏗️ Architecture

The backend follows a layered architecture separating HTTP handling, business logic, storage operations, and database access.

```text
Client
  │
  ▼
Routes
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ├──────────────► Cloudflare R2
  │
  ▼
Database Queries
  │
  ▼
PostgreSQL
```

**Routes** — Define endpoints and attach middleware (authentication, validation).

**Controllers** — Handle HTTP requests and responses.

**Services** — Contain business logic and storage operations (multipart upload handling, R2 interaction).

**Database Layer** — Prisma queries responsible for interacting with PostgreSQL.

---

## 📦 Multipart Upload Architecture

For large files, the application uses Cloudflare R2's S3-compatible multipart upload API. The application server handles zero file bytes — only metadata and presigned URLs.

```text
                Client
                  │
                  │ 1. Start upload
                  ▼
             Application
                  │
          Create File record
          Create UploadSession
                  │
                  ▼
             Cloudflare R2
          Create Multipart Upload
                  │
                  ▼
                Client
                  │
       ┌──────────┼──────────┐
       │          │          │
     Part 1     Part 2     Part 3 ...
  (direct to R2, bypasses server)
       │          │          │
       └──────────┼──────────┘
                  │
                  ▼
          Store part metadata
          (part number + ETag)
                  │
                  ▼
        Complete Multipart Upload
                  │
                  ▼
          Mark File as READY
```

The database tracks the full upload state:

```text
File
 │
 └── UploadSession
       │
       ├── UploadPart
       ├── UploadPart
       └── UploadPart
```

### Upload States

```text
File:            UPLOADING → READY | FAILED
UploadSession:   IN_PROGRESS → COMPLETED | ABORTED | EXPIRED | PAUSED
```

Persisting state allows interrupted uploads to resume from the last completed part.

---

## ☁️ Cloud Storage

Files are stored in **Cloudflare R2** — S3-compatible object storage with no egress fees.

The bucket is kept private. All file access uses short-lived presigned URLs generated server-side after verifying ownership. The application server never proxies file bytes on upload or download.

---

## 🗄️ Database

**PostgreSQL** via **Prisma ORM** handles schema management, queries, relationships, and cascading deletes.

```text
User
 ├── Files
 ├── Folders
 └── UploadSessions

Folder
 └── Files

File
 ├── UploadSession
 │     └── UploadParts
 └── Shares
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Storage | Cloudflare R2 (S3-compatible) |
| Auth | Passport.js, Express Session, bcrypt |
| Validation | express-validator |
| Security | Helmet, express-rate-limit |
| Scheduling | node-cron |
| Frontend | EJS, CSS, Vanilla JS |

---

## 📂 Project Structure

```text
.
├── config/          # Passport strategy
├── controllers/     # HTTP request handlers
├── db/              # Prisma query functions
├── jobs/            # Scheduled background jobs
├── lib/             # Shared instances (Prisma, R2 client)
├── middleware/       # Auth, rate limiting
├── prisma/          # Schema and migrations
├── public/          # Static assets (CSS, JS)
├── routes/          # Express routers
├── services/        # Business logic, R2 operations
├── validators/      # express-validator rules
├── views/           # EJS templates
└── app.js           # App entry point
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd file-uploader
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Cloudflare R2

1. Create a [Cloudflare account](https://cloudflare.com)
2. Create an R2 bucket and set public access to **disabled** (private)
3. Go to R2 → Manage R2 API Tokens → create a token with Object Read & Write permissions scoped to your bucket
4. Save the Access Key ID and Secret Access Key
5. Configure CORS on the bucket for your frontend origin

### 4. Configure environment variables

Create a `.env` file — do not commit this to version control:

```env
DATABASE_URL=
SESSION_SECRET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
NODE_ENV=development
```

### 5. Set up the database

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Start the application

```bash
# Development
npm run dev

# Production
npm start
```

---

## 🔒 Security Considerations

**Authentication** — Passwords are hashed with bcrypt before being persisted. Never stored in plaintext.

**Authorization** — Every file and folder operation verifies ownership independently of authentication. An authenticated user cannot access another user's resources.

**Signed URLs** — Files are stored privately. Downloads use time-limited presigned URLs. No permanent public object URLs are exposed.

**Upload Verification** — After multipart upload completes, file metadata (name, type, size) is verified against the original upload session to detect any mismatch.

**Rate Limiting** — Three separate limiters: general (all routes), auth (login/register), and upload-specific.

**Input Validation** — Server-side validation on all user-controlled input before processing.

**HTTP Security Headers** — Helmet configures security headers including a strict Content Security Policy.

**CSP Compliance** — Client-side JavaScript avoids inline event handlers.

---

## 🧹 Automatic Upload Cleanup

Uploads can be abandoned due to network failure, tab close, or client-side error. A scheduled job handles cleanup:

```text
Expired UploadSession
        │
        ▼
Abort R2 Multipart Upload
        │
        ▼
Delete File record
        │
        ▼
Cascade → UploadSession → UploadParts
```

This keeps both R2 and PostgreSQL in a consistent state with no orphaned data.

---

## 📚 What I Learned

This project was built to go beyond basic CRUD and explore how a real backend handles file storage at scale.

Key concepts explored:

* Layered Express application architecture
* Authentication vs authorization — and why both matter independently
* Session-based authentication with secure cookie configuration
* Resource-level access control (not just route-level)
* Relational database design with Prisma and PostgreSQL
* Cascading deletes and referential integrity
* Object storage with Cloudflare R2 and S3-compatible APIs
* Multipart uploads for large files — why the server should never touch the bytes
* Persisting upload state to survive server restarts and network failures
* Presigned URLs for private file access
* Rate limiting strategies (tiered by route sensitivity)
* Content Security Policy and CSP-compliant JavaScript
* Background scheduled jobs for cleanup
* Separating storage logic from application logic

---

## 🔮 Future Improvements

* Resumable downloads via HTTP Range requests
* Concurrent multipart chunk uploads (parallel parts)
* Security monitoring layer with real-time anomaly detection
* File sharing via expiring public links
* Email notifications
* Background job queues with BullMQ and Redis
* File previews and thumbnails
* Storage usage quotas per user
* Comprehensive automated test suite
* Observability and application metrics

---

## 📄 License

MIT
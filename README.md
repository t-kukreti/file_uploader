# 📁 File Uploader

A secure cloud file storage application built with **Node.js**, **Express**, **Prisma**, **PostgreSQL**, and **Supabase Storage**. Users can register, upload files, organize them into folders, rename and delete files/folders, and securely download their files.

## 🚀 Features

### Authentication
- User registration and login using Passport.js (Local Strategy)
- Password hashing with bcrypt
- Persistent login sessions using Prisma Session Store
- Protected routes

### File Management
- Upload files to cloud storage (Supabase Storage)
- Download files using signed URLs
- Rename files
- Delete files
- View file metadata
- Upload files inside folders

### Folder Management
- Create folders
- Rename folders
- Delete folders
- Automatically removes associated cloud files when a folder is deleted

### Security
- Helmet for secure HTTP headers
- Express Rate Limiting
- Server-side validation using express-validator
- Flash error messages
- Global error handling
- Ownership checks to prevent unauthorized access
- CSP-compatible client-side JavaScript (no inline event handlers)

### User Experience
- Responsive interface
- Clean dashboard
- Rename and delete confirmations
- Error pages
- Flash validation messages

---

## 🛠 Tech Stack

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Passport.js
- Express Session
- Express Validator

### Storage

- Supabase Storage

### Frontend

- EJS
- CSS
- Vanilla JavaScript

---

## 📂 Project Structure

```
.
├── config/
├── controllers/
├── db/
├── generated/
├── lib/
├── middleware/
├── prisma/
├── public/
│   ├── css/
│   └── js/
├── routes/
├── services/
├── validators/
├── views/
└── app.js
```

---

## ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/your-username/file-uploader.git
cd file-uploader
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
DATABASE_URL=

SESSION_SECRET=

SUPABASE_URL=

SUPABASE_SERVICE_ROLE_KEY=

PORT=8000
```

Run Prisma migrations

```bash
npx prisma migrate deploy
```

Generate Prisma Client

```bash
npx prisma generate
```

Start the application

```bash
npm start
```

or during development

```bash
node --watch app.js
```

---

## 📸 Screenshots


---

## 🔒 Security Features

- Passwords hashed using bcrypt
- Session-based authentication
- Protected routes
- Rate limiting
- Helmet security headers
- Input validation
- Ownership authorization
- Signed download URLs
- Global error handling

---

## 📖 What I Learned

During this project I learned:

- Authentication using Passport.js
- Session management
- Prisma ORM
- PostgreSQL relationships
- Cloud file storage with Supabase
- Express middleware
- MVC architecture
- Form validation
- Secure file handling
- Security best practices using Helmet and Rate Limiting
- Content Security Policy (CSP) and modern client-side event handling

---

## 🔮 Future Improvements

- Search files
- Sort files by date/name/size
- Folder nesting
- Drag & drop uploads
- Multiple file upload
- File sharing with links
- User storage quota
- Profile settings
- Dark mode
- JWT authentication for API support

---

## License

This project is open source and available under the MIT License.

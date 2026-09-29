# file-uploader

A stripped-down Google Drive-inspired file storage application built with **Node.js, Express, EJS, PostgreSQL, Prisma, Passport.js, Multer, and Cloudinary**.

The project allows authenticated users to upload and organize files into folders, while also providing temporary public sharing links for entire folder trees.

## Features

### Authentication

- User registration and login
- Password hashing with `bcryptjs`
- Session-based authentication with Passport.js
- Persistent sessions using PostgreSQL and Prisma
- Protected application routes

### File Management

- Upload files to Cloudinary
- Maximum file size of 10 MB
- File type validation
- File details page
- Open and download uploaded files
- Files stored in PostgreSQL with their Cloudinary URLs

### Folder Management

- Create folders
- Create nested subfolders
- Upload files directly into folders
- Browse folders and their contents
- Folder hierarchy using a self-referencing Prisma relation

### Folder Sharing

- Generate public sharing links for folders
- Choose an expiration period for each share link
- Cryptographically random share tokens
- Public access without authentication
- Share links automatically expire
- Browse the entire shared folder tree
- Navigate through shared subfolders using the same share token

### UI

- Responsive layout
- Dashboard-style interface
- Folder cards
- File lists
- Authentication pages
- Public shared-folder interface
- Upload and validation error messages

## Tech Stack

| Technology           | Purpose               |
| -------------------- | --------------------- |
| Node.js              | Runtime               |
| Express              | Web framework         |
| EJS                  | Server-side rendering |
| PostgreSQL           | Database              |
| Prisma               | ORM                   |
| Passport.js          | Authentication        |
| bcryptjs             | Password hashing      |
| express-session      | Session management    |
| Prisma Session Store | Persistent sessions   |
| Multer               | File upload handling  |
| Cloudinary           | File storage          |
| CSS                  | Styling               |

## Project Structure

```text
File-Uploader/
├── config/
│   ├── cloudinary.js
│   └── passport.js
│
├── controllers/
│   └── controller.js
│
├── generated/
│   └── prisma/
│
├── lib/
│   └── prisma.js
│
├── middleware/
│   ├── auth.js
│   └── upload.js
│
├── prisma/
│   └── schema.prisma
│
├── public/
│   └── styles.css
│
├── routes/
│   └── routes.js
│
├── views/
│   ├── file.ejs
│   ├── folder.ejs
│   ├── index.ejs
│   ├── login.ejs
│   ├── share.ejs
│   ├── shared-folder.ejs
│   └── sign-up.ejs
│
├── .env
├── app.js
├── package.json
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd File-Uploader
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME"

SESSION_SECRET="your-session-secret"

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

Do not commit `.env` to Git.

### 4. Set up the database

Run the Prisma migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

### 5. Start the application

```bash
npm start
```

The application should be available at:

```text
http://localhost:3000
```

## File Uploads

Uploaded files are sent directly to Cloudinary using `multer-storage-cloudinary`.

Currently supported file types include:

- JPEG
- PNG
- WebP
- PDF
- TXT
- ZIP
- DOC
- DOCX
- XLS
- XLSX
- MP4

Maximum upload size:

```text
10 MB
```

## Folder Sharing

When a user shares a folder, the application:

1. Verifies that the folder belongs to the logged-in user.
2. Generates a secure random share token.
3. Calculates an expiration date.
4. Stores the token and expiration date on the folder.
5. Generates a public URL.

Example:

```text
/share/folders/<share-token>
```

The public user does not need an account.

Subfolders use the same share token:

```text
/share/folders/<share-token>/<folder-id>
```

Every public request checks the original shared folder's expiration date.

## Database Structure

The main Prisma models are:

```text
User
 ├── File[]
 └── Folder[]

Folder
 ├── File[]
 ├── children Folder[]
 └── parent Folder?

File
 └── Folder?

Session
```

Folders use a self-referencing relationship to support nested folder structures.

A folder can also contain:

```text
shareToken
shareExpiresAt
```

which are used for temporary public sharing.

## Authentication Flow

Authentication uses:

```text
Passport Local Strategy
        ↓
bcrypt password verification
        ↓
express-session
        ↓
Prisma Session Store
        ↓
PostgreSQL
```

Protected routes use the `requireAuth` middleware.

## Public Sharing Flow

```text
Authenticated User
        │
        ▼
Select Folder
        │
        ▼
Choose Expiration
        │
        ▼
Generate Random Token
        │
        ▼
Store Token + Expiration
        │
        ▼
Public Share URL
        │
        ▼
Unauthenticated User
        │
        ▼
Expiration Check
        │
        ▼
Browse Shared Folder Tree
```

## Future Improvements

Possible future additions:

- Delete files and folders
- Rename files and folders
- Search
- Breadcrumb navigation
- File previews
- Folder deletion with cascading contents
- Revoke share links
- Better Cloudinary download handling
- File metadata such as MIME type
- Storage usage indicators
- Drag-and-drop uploads
- Improved mobile UI
- Webpack-based frontend asset bundling

## Learning Goals

This project was built to practice:

- Express.js
- MVC-style application structure
- Authentication and sessions
- PostgreSQL
- Prisma ORM
- Relational database design
- Self-referencing database relationships
- File uploads
- Cloud-based file storage
- Middleware
- Public/private route authorization
- Server-side rendering with EJS
- REST-style routing
- Basic responsive frontend development

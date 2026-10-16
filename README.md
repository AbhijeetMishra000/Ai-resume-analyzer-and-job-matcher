# Resume AI

An interview-ready resume analysis and practice app with a Node/Express backend and a Vite + React frontend.

## Highlights
- Upload and parse resumes (PDF) on the backend.
- AI-powered analysis and interview prep workflows.
- Modern React frontend with Tailwind CSS.

## Repo Structure
- `Backend` Node/Express API
- `Frontend` Vite + React client

## Tech Stack
- Backend: Express, MongoDB/Mongoose, Google GenAI, JWT, Multer, Puppeteer
- Frontend: React, React Router, Vite, Tailwind CSS, Axios

## Getting Started

### Prerequisites
- Node.js 18+ recommended
- npm 9+ recommended

### Install Dependencies
```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### Configure Environment
Create a `Backend/.env` file with the required keys. Typical values include:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_genai_key
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000
```

If you have additional keys in your local setup, include them here as needed.

### Run Locally
```bash
# Backend
cd Backend
npm run dev

# Frontend (new terminal)
cd Frontend
npm run dev
```

### Build Frontend
```bash
cd Frontend
npm run build
```

## Notes
- The backend uses `puppeteer` and `pdf-parse` for PDF processing.
- If you see install warnings, they are usually safe to ignore, but `npm audit fix` can resolve most issues.

## Scripts
### Backend
- `npm run dev` Start the API with nodemon

### Frontend
- `npm run dev` Start Vite dev server
- `npm run build` Production build
- `npm run preview` Preview production build
- `npm run lint` Lint codebase

## License
ISC

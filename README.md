# Next.js Project

This project is built with [Next.js](https://nextjs.org), [React](https://react.dev), and [TypeScript](https://www.typescriptlang.org/).

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```
   - If you run into an error about requiring a canary version of `next`, also run
     ```bash
     npm install next@canary
     ```

3. **Set up environment variables:**

Create a `.env` file at the top-level and ask the repo owner for the secrets

4. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000) to view the app.
   - You can also see the `swagger` for API testing at [http://localhost:3000/doc](http://localhost:3000/doc) 

## Basic File Structure

```
├── app/                # Main application pages and components
│   └── page.tsx        # Root page component
├── components/         # Reusable React components
├── public/             # Static assets (images, fonts, etc.)
├── styles/             # Global and modular CSS/SCSS files
├── types/              # TypeScript type definitions
├── package.json        # Project metadata and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```
Read more about the structure of the `app` directory [here](https://nextjs.org/docs/app/api-reference/file-conventions)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)


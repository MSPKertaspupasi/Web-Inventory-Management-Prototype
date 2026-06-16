# Web Inventory Management Prototype

## Setup Instructions

### 1. Install Dependencies

Run the following command to install all required dependencies:

```bash
npm i
```

### 2. Install Supabase Agent Skills (Optional)

Supabase Agent Skills provide AI coding tools with ready-made instructions, scripts, and resources for working with Supabase more accurately and efficiently:

```bash
npx skills add supabase/agent-skills
```

### 3. Database Connection

**Connection Details:**

```
Host: db.afjvdjdqrxsttcxvqron.supabase.co
Port: 5432
Database: postgres
User: postgres
```

**Connection String:**

```
postgresql://postgres:[YOUR-PASSWORD]@db.afjvdjdqrxsttcxvqron.supabase.co:5432/postgres
```

> ⚠️ **Security Note:** Never commit your database password to version control. Use environment variables instead. Create a `.env` file (add to `.gitignore`) with your connection string.

### 4. Start Development Server

Run the development server with:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Project Structure

This is a Web-based Inventory Management system built as a prototype.

## Dependencies

- See `package.json` for the complete list of dependencies

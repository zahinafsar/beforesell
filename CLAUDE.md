Read .claude/memory.txt for more context on this project.
After work update .claude/memory.txt with new contexts.

# BeforeSell - Bikroy.com Competitor

## Project Overview
Full-featured classifieds marketplace for Bangladesh. Bikroy.com competitor with modern tech stack.

## Tech Stack
- Next.js 16 (App Router, SSR)
- shadcn/ui + Tailwind CSS
- React Query
- Prisma + PostgreSQL
- Cloudinary (images)
- Resend (email)
- JWT auth (httpOnly cookies)

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Lint code
- `npx prisma studio` - Database GUI
- `npx prisma db push` - Push schema changes
- `npx prisma db seed` - Seed categories & locations

## Structure
- `/app/(auth)/*` - Auth pages (login, register, etc.)
- `/app/(main)/*` - Public pages (home, search, listings)
- `/app/dashboard/*` - Protected user pages
- `/app/api/*` - API routes
- `/components/ui/*` - shadcn components
- `/components/*` - Feature components
- `/lib/*` - Utilities (prisma, auth, cloudinary, email)
- `/hooks/*` - React hooks
- `/prisma/*` - Schema & migrations

## Key Patterns
- Server components by default, "use client" only for interactivity
- React Query for client-side fetching w/ mutations
- Zod for all validation
- JWT in httpOnly cookie, verify in middleware
- Cloudinary for all image uploads (max 20/listing)
- Use named export only
- Properly use utils, hooks folders
- Use snack-case for file names
- Try to create as less components as possible
- **Never use raw `fetch()` for JSON API calls** — use `api()` from `@/lib/api` (typed via next-ts-api)
- FormData uploads (images) are the only exception where raw `fetch()` is acceptable

## BD Location Data
- 8 Divisions: Barishal, Chattogram, Dhaka, Khulna, Mymensingh, Rajshahi, Rangpur, Sylhet
- 64 Districts mapped to divisions

## Categories
Electronics, Vehicles, Property, Jobs, Fashion, Pets, Home & Living, Hobbies/Sports, Business, Education, Services, Agriculture, Essentials
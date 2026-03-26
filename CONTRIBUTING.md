# Contributing to Mosque Management System (MMS)

First off, open-source or not, thank you for considering contributing to the Mosque Management System! ❤️

This document provides guidelines and conventions for contributing to the repository.

## 🛠 Prerequisites

Ensure you have the following installed:

- [Bun](https://bun.sh/) (latest version)
- Node.js (v20+ recommended)
- PostgreSQL (via Docker or Neon DB)

## 🏗 Project Structure

This is a Bun-based monorepo:

- `backend/` - Hono + Drizzle ORM + Cloudflare Workers
- `frontend/` - React 19 + Vite + Mantine UI
- `packages/shared/` - Shared types, Zod schemas, and utilities
- `docs/` - Project documentation and task plans

## 🚀 Getting Started

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd mosque-system
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Fill in the required values in .env
   ```

4. **Run development servers:**
   ```bash
   bun run dev
   ```

## 🌿 Branching Strategy

We use a feature-branch workflow. Please adhere to the following naming conventions:

- `feature/<issue-number>-<short-description>` (e.g., `feature/TASK-001-project-skeleton`)
- `fix/<issue-number>-<short-description>`
- `chore/<short-description>`
- `docs/<short-description>`

## 📝 Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools and libraries

## ✨ Coding Standards

### Linting & Formatting

- The project uses **ESLint** and **Prettier**.
- Pre-commit hooks will automatically lint and format your code using **Husky** and **lint-staged**.
- Run `bun run lint` before committing to ensure there are no warnings.
- Run `bun run typecheck` to ensure TypeScript typings are sound.

### TypeScript

- Use strict typing. Avoid `any`.
- Define shared interfaces and types in `packages/shared/src/types`.

## ✅ Pull Request Guidelines

1. **Keep PRs focused:** Submit pull requests that address a single issue or feature.
2. **Write tests:** Ensure new features or fixes are well-tested.
3. **Update documentation:** Modify `README.md` or files in `docs/` if your change affects usage or architecture.
4. **Pass all checks:** The CI will run linting, typechecking, and tests. Make sure they all pass:
   - `bun run lint`
   - `bun run typecheck`
   - `bun run test` (if applicable)

Thank you for helping us build a better system!

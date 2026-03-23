# NoteMaster Frontend ↔ Backend API wiring

## Required environment variable (local preview)

The frontend calls the backend directly from the browser, so you must provide:

- `NEXT_PUBLIC_NOTES_API_BASE_URL` (no trailing slash)

Examples:

- `NEXT_PUBLIC_NOTES_API_BASE_URL=http://localhost:3001`
- `NEXT_PUBLIC_NOTES_API_BASE_URL=https://vscode-internal-XXXX...:3001`

A sample file is provided at `.env.example`.

## Backend routes used by the frontend client

The client in `src/lib/api/client.ts` calls these backend endpoints:

### Notes

- `GET /notes?q=...&limit=...&offset=...`
  - Response: `{ items: Note[], total: number, limit: number, offset: number }`
- `POST /notes`
  - Request: `{ title: string, content: string, tag_ids: string[] }`
  - Response: `Note`
- `PUT /notes/{note_id}`
  - Request: `{ title?: string, content?: string }`
  - Response: `Note`
- `DELETE /notes/{note_id}`
  - Response: `204 No Content`

### Tags

- `GET /tags?q=...`
  - Response: `{ items: Tag[], total: number }`
- `POST /tags`
  - Request: `{ name: string }`
  - Response: `Tag`
- `DELETE /tags/{tag_id}`
  - Response: `204 No Content`

## CORS

Backend CORS is controlled by:

- `ALLOWED_ORIGINS` (comma-separated list of allowed origins)

If you're running locally, include:

- `http://localhost:3000`

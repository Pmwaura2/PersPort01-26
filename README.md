# Editable Engineering Portfolio

A multi-page engineering portfolio with:

- a Python backend
- a browser-based form admin editor
- JSON-driven site content
- media upload support for images and videos
- dynamic page backgrounds and project showcases

## Run

1. In this folder, run `python app.py`
2. Open `http://127.0.0.1:8000`
3. Open `http://127.0.0.1:8000/admin.html` to edit content through forms

## Environment Variables

- `PORT`: server port, defaults to `8000`
- `HOST`: bind host, defaults to `0.0.0.0`
- `DATA_DIR`: optional root directory for content/media storage
- `ADMIN_USERNAME`: optional basic auth username for `admin.html` and write APIs
- `ADMIN_PASSWORD`: optional basic auth password for `admin.html` and write APIs

## How Editing Works

- Public pages fetch content from `content/site-content.json`
- The admin page saves updates through `/api/content`
- Uploaded media is stored under `media/uploads/`
- Health check endpoint: `/health`

## Seeded Files

- Resume copied to `media/resume/Peter-Mwaura-Resume.pdf`
- Main editable data lives in `content/site-content.json`

## Production Upgrades To Add Later

- a real database instead of local JSON
- cloud storage/CDN for media
- deployment hosting and a custom domain
- analytics, SEO metadata, and a contact form backend

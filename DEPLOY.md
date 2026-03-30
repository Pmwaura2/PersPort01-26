# Deploying The Portfolio

This site currently runs as a small Python app with local JSON storage.

## Best fit platforms

- Render
- Railway
- Fly.io
- Any VPS that can run `python app.py`

## Before deploying

1. Replace placeholder content in `content/site-content.json`
2. Add real media files under `media/uploads/` or upload them through `admin.html`
3. Set admin credentials as environment variables before exposing `admin.html` publicly
4. Decide whether you want to keep JSON storage or move to a database

## Minimal deployment steps

1. Push this folder to GitHub
2. Create a web service on your hosting platform
3. Set the environment variables:

```bash
HOST=0.0.0.0
DATA_DIR=/opt/render/project/src
ADMIN_USERNAME=your-admin-user
ADMIN_PASSWORD=your-strong-password
```

4. Set the start command to:

```bash
python app.py
```

5. Make sure the platform exposes the app on the port it provides

## Render shortcut

This repo now includes [render.yaml](C:\Users\pmwau\OneDrive\Documents\Playground\render.yaml), so Render can auto-detect the service settings. You still need to fill in:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

It also defines `healthCheckPath: /health`, which matches the app's health endpoint.

## Persistent storage note

Render's filesystem is ephemeral by default. The current Blueprint is deployable on the free plan, but uploaded files and saved edits will not survive a redeploy or restart there.

According to Render's current docs, persistent disks are available only on paid web services and are attached from the Render Dashboard. If you upgrade to a paid plan, mount a disk and point `DATA_DIR` at that mount path.

## Recommended production upgrades

- Replace local JSON with Postgres or another database
- Store media in cloud storage instead of the local filesystem
- Add a real contact form backend
- Add analytics and SEO metadata

## What still needs your input

- Your final content
- Your hosting platform preference
- Your real LinkedIn, GitHub, and email
- Any videos/images you want used as backgrounds or project showcases

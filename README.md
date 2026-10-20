<div align="center">

# 🔗 LinkPulse — Enterprise Link Management

**Shorten links · Generate branded QR codes · Track engagement**

A link-management dashboard for creating short URLs, organizing links, generating QR codes, and viewing visitor analytics.

[![Live Demo](https://img.shields.io/badge/Live-Demo-00C9E8?style=for-the-badge&logo=vercel&logoColor=white)](https://hot-wheels-snip-link.vercel.app)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-008CC1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## 📌 Problem Statement

Long URLs are inconvenient to share and manage, while basic links provide limited insight into visitor engagement. Teams also need an easy way to organize links, create branded QR codes, and understand how their links are being used.

## 💡 Solution

**LinkPulse** brings link creation, real redirects, QR customization, organization tools, and visitor analytics together in one dashboard.

## ✨ Features

- **Short link creation** with optional custom slugs and labels.
- **Real redirects** from short URLs to their destination.
- **URL verification** before creating a link.
- **QR Studio Pro** with color presets, custom foreground/background colors, error-correction settings, and a center badge.
- **QR export** with PNG and SVG options.
- **Analytics dashboard** with click trends, peak engagement hours, device types, operating systems, and browsers.
- **Link organization** with folders, campaigns, and tags.
- **Advanced controls in the UI** for expiry dates, click limits, password protection, A/B testing, and UTM parameters.
- **Import/export controls** for link data.

> **Note:** The dashboard includes several advanced controls. Verify each feature end-to-end before claiming it is fully operational in the submitted build.

## 🖼️ Screenshots

### Overview & Shortener
Create a short link, copy it, generate its QR code, or test the redirect.

![LinkPulse overview and shortener](screenshots/overview-shortener.png)

### QR Studio Pro
Customize a QR code and preview the design.

![LinkPulse QR Studio](screenshots/qr-studio.png)

### Analytics Dashboard
Review click trends and visitor environment breakdowns.

![LinkPulse analytics dashboard](screenshots/analytics-dashboard.png)

### QR Customization
The QR Studio supports color presets and custom colors.

![LinkPulse QR customization](screenshots/qr-studio-custom.png)

## 🌐 Live Demo

**Production URL:** https://hot-wheels-snip-link.vercel.app

The production health endpoint is available at:

https://hot-wheels-snip-link.vercel.app/api/health

## 🧰 Tech Stack

- **Frontend:** React / TypeScript *(confirm exact framework and versions from the repository)*
- **API:** Node.js / TypeScript
- **Database:** Neon PostgreSQL
- **Deployment:** Vercel
- **Version control:** Git and GitHub
- **QR functionality:** QR generation, customization, and export

Before submission, confirm the exact dependencies and scripts in `package.json` and update this section to match the codebase.

## 🚀 Setup Instructions

### Prerequisites

- Node.js version supported by the project
- npm
- A Neon PostgreSQL database (or a compatible PostgreSQL connection)

### 1. Clone the repository

```bash
git clone https://github.com/Gaurav-Pathak-code/Hot-Wheels_Snip-link.git
cd Hot-Wheels_Snip-link
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the database

Create a local `.env` file in the project root:

```env
DATABASE_URL="your_neon_postgresql_connection_string"
```

Replace the placeholder with your own connection string. **Never commit `.env` or publish database credentials.** In Vercel, add `DATABASE_URL` under Project Settings → Environment Variables.

### 4. Start the app

Check `package.json` for the exact scripts. During local testing, the frontend and API were available at:

- Frontend: `http://127.0.0.1:5173`
- API health check: `http://127.0.0.1:3001/api/health`

Run the project's actual frontend and API scripts in separate terminals if its setup requires two processes. Do not assume these ports or commands if the scripts have changed.

### 5. Verify the API

Open `http://127.0.0.1:3001/api/health` while the local API is running. A healthy response should report `status: ok` and identify Neon PostgreSQL storage.

## 🔐 GitHub & Environment Rules

- Keep the repository **public** if required by the hackathon.
- Follow the required repository naming convention: `teamname-projectname`.
- Keep `.env` files out of Git.
- Store production secrets in Vercel Environment Variables.
- Commit regularly using clear messages, for example `feat: add QR export` or `fix: handle database connection`.
- Each team member should commit from their own GitHub account, as required by the event.

Suggested `.gitignore` entries (merge with the project's existing rules):

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
.next/
coverage/
.DS_Store
```

## 👥 Team

Add your team members and their contributions before submission.

| Team member | Contribution |
|---|---|
| Add name | Add contribution |
| Add name | Add contribution |

## 🗺️ Future Improvements

- [ ] Add a short demo video or GIF.
- [ ] Document exact install/run commands from `package.json`.
- [ ] Test every advanced control end-to-end.
- [ ] Add automated tests for link creation, redirects, and click tracking.
- [ ] Add a mobile QR-scanning demo.

## 📄 License

Add the license required by your team or hackathon.

---

<div align="center">

**Built with curiosity, teamwork, and plenty of debugging. 🚀**

</div>

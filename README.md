# 🌍 Landly

[![CI](https://github.com/Mazot/landly-client/actions/workflows/ci.yml/badge.svg)](https://github.com/Mazot/landly-client/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Mazot/landly-client/branch/master/graph/badge.svg)](https://codecov.io/gh/Mazot/landly-client)

**Find your people in a new country.**

Landly is a map for people who have moved abroad. It gathers what a newcomer looks for in the first weeks — an embassy or consulate, a shop with food from home, a doctor or a lawyer who speaks your language, a community to meet — in one place, checked by moderators and by the community itself.

## Who it is for

- **Newcomers** who need to find help, services and company in their language.
- **People who already live there** and want to pay it forward: add a place they know, recommend a helper, leave a review.

## How it works

**A corridor is the heart of Landly.** You pick where you come from and where you live now — say *Russia → Germany* — and the whole app speaks about that pair of countries: the map opens on the destination, the places are the ones that serve that community. Guests can browse everything; an account is needed to add, save and review.

### The map

Embassies and consulates, businesses, helpers, communities and volunteers on one map. Search and filter by type, spoken language, "open now", rating, verified places and who added them. Pick a place and a panel opens beside the map; open its full page for everything else.

### A place

What a place page tells you:

- who it is, its type, address, and whether it is open right now (in the place's own time zone);
- directions, phone, email, website and messengers;
- languages spoken, services, photos, opening hours;
- for an embassy or consulate, the network of related offices;
- what the community says — recent check-ins with tips, and reviews with a rating breakdown;
- who added the place and when.

### Adding and editing places

Anyone with an account can add a place: pick it on Google Maps or drop a pin, describe it, set the hours and add photos. A new place appears on the map at once, marked *pending review*, and becomes a regular one when a moderator approves it. The person who added a place can edit it later; editing a place that is already live sends it back to review, so approved information never changes unchecked. Moderators can ask for changes, and the note shows up in the author's account.

### Your account

Your profile and counters, the languages you speak, your places and recommendations with where each one stands in moderation, and your corridors.

### Languages

English, Russian and Ukrainian.

## What is built, what is next

| | |
|---|---|
| ✅ Done | Sign in and sign up (email or Google), the map with filters and corridors, the place panel and page, adding and editing places with photos, the account and profile editing — each on phone, tablet and desktop |
| 🔜 Next | People (recommended helpers), countries, saved places, writing reviews and reporting a problem, a full photo gallery |

Landly Client is the web app. It talks to [landly-server](../landly-server), which owns the data, the moderation rules and the accounts.

## Run it locally

You need Node.js 22.13+ (24 recommended), a running [landly-server](../landly-server) and a Google Maps Platform browser key.

```bash
npm install
cp .env.example .env   # fill in the values, see below
npm run dev            # http://localhost:5173
```

| Variable | What it is |
|---|---|
| `VITE_API_URL` | Where landly-server lives, e.g. `http://localhost:8080` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps browser key (Maps JavaScript API + Places API), restricted by HTTP referrer |
| `VITE_GOOGLE_MAPS_MAP_ID` | Optional Google map style ID |

The server's `FRONTEND_ORIGIN` must be this app's address (`http://localhost:5173`).

## For contributors

`npm test` runs the tests, `npm run lint` and `npm run build` check the code, `npm run storybook` opens the design-system catalogue. How the code is organised and the rules for working in it are in [AGENTS.md](AGENTS.md); the design system has its own [README](src/components/ui/README.md).

# Epic Hospital System (demo)

A mock hospital EHR, built as part of the **SPHERE** health information exchange prototype — a conceptual framework for exchanging patient records across independently-run healthcare systems without replacing any of them.

This is a stand-in for a real hospital system like Epic: its own login, its own patient records, its own native data shapes. It is never modified to add SPHERE-specific logic — the [interconnect](https://github.com/abeyjoshy/sphre-interconnect) talks to it purely through this API, the same way any external client would.

Full write-up of the SPHERE framework and prototype: **https://abeyjoshy.com/sphere.html**

## Role in the SPHERE ecosystem

| Repo | Role |
|---|---|
| **epic-hospital-demo** (this repo) | Mock hospital EHR (MongoDB), Node.js/Express |
| [sphere-gateway](https://github.com/abeyjoshy/sphere-gateway) | The cloud SPHERE service this system connects to |
| [evolve-gp-demo](https://github.com/abeyjoshy/evolve-gp-demo) | A second mock system (a GP practice), with deliberately different native field names |
| [sphre-interconnect](https://github.com/abeyjoshy/sphre-interconnect) | Maps Epic's native records to/from HL7 FHIR and syncs them with SPHERE |

## Connecting to SPHERE

The connection to SPHERE happens entirely through an embedded widget, served by SPHERE itself and loaded as an iframe in the UI (`public/epic.html`). A doctor's SPHERE login is completely separate from their Epic login: the widget's iframe origin means Epic's own page and backend never see the doctor's SPHERE credentials.

## API surface

```
POST   /epic/login
GET    /epic/patients
GET    /epic/patients/:mrn
POST   /epic/patients
POST   /epic/patients/:mrn/diagnoses
POST   /epic/patients/:mrn/medications
POST   /epic/patients/:mrn/allergies
```

Authentication here is intentionally minimal (plaintext credential check, no session token) — this system stands in for "a hospital's own login already exists"; the real security boundary in this prototype is SPHERE's own JWT auth on the SPHERE side.

## Tech stack

Node.js · Express · MongoDB / Mongoose

## Running locally

```bash
npm install
cp .env.example .env   # fill in your own Mongo connection details and SPHERE_BASE_URL
npm run seed             # creates demo doctors and patients
npm start                 # listens on PORT (default 4000)
```

## Status

A research prototype demonstrating one half of a two-hospital SPHERE exchange scenario. See [evolve-gp-demo](https://github.com/abeyjoshy/evolve-gp-demo) for the second system, and the [full write-up](https://abeyjoshy.com/sphere.html) for the complete architecture.

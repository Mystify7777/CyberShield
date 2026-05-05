# Demo Showcase Mode (Commit 11)

Use this to populate realistic demo content before interviews or product walkthroughs.

## Commands

Seed demo data:

```bash
npm --prefix server run seed:demo
```

Reset and reseed demo data:

```bash
npm --prefix server run seed:demo:reset
```

## Seeded Dataset

- Reports: 10
- Articles: 5
- Forum posts: 5
- Memes: 5
- Accounts: 2 users + 1 admin

## Demo Accounts

- Admin: `admin@demo.cybershield.local`
- User 1: `user1@demo.cybershield.local`
- User 2: `user2@demo.cybershield.local`
- Password (all): `DemoPass123!`

## Notes

- Seeded records are prefixed with `[DEMO]` for safe cleanup.
- Reseed flow first removes existing `[DEMO]` records, then re-inserts a fresh dataset.
- Do not use these accounts in production.

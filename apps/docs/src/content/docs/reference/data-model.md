---
title: Data model
description: The Prisma schema TurboPaste runs on.
---

The schema is split across two files under `packages/db/prisma/schema/`:

- `auth.prisma`: Better Auth models (`User`, `Session`, `Account`, `Verification`).
- `paste.prisma`: `Paste`, `Report`, `ApiKey`.

The Prisma client is generated to `packages/db/prisma/generated/client` and re-exported as the default export of `@turbopaste/db`.

## `User` (extends Better Auth)

```prisma
model User {
    id            String    @id
    name          String
    email         String    @unique
    emailVerified Boolean   @default(false)
    image         String?
    role          String    @default("user")  // "user" | "admin"
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
    sessions      Session[]
    accounts      Account[]
    pastes        Paste[]
    apiKeys       ApiKey[]
    reports       Report[]

    @@map("user")
}
```

`role` is the only non-default field added by TurboPaste. It's surfaced into the session via Better Auth `user.additionalFields`.

## `Paste`

```prisma
model Paste {
    id            String    @id // 10-char nanoid
    title         String?
    content       String    // 1 MB cap enforced in code
    language      String    @default("plaintext")
    visibility    String    @default("public")  // public | unlisted | private
    burnAfterRead Boolean   @default(false)
    passwordHash  String?   // scrypt salt:hash
    expiresAt     DateTime?
    views         Int       @default(0)
    hidden        Boolean   @default(false)
    hiddenReason  String?
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
    userId        String?   // null = anonymous
    user          User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
    reports       Report[]

    @@index([userId])
    @@index([visibility, hidden, createdAt])
    @@index([expiresAt])
    @@map("paste")
}
```

Notes:

- `userId` is nullable to allow anonymous pastes. `onDelete: SetNull` means deleting a user preserves their public pastes (orphaned but still readable).
- `expiresAt` has its own index so a future background sweeper could query by it efficiently. Right now expiration is lazy.
- `passwordHash` stores `<salt>:<derived>` from `node:crypto` `scryptSync(password, salt, 64)`.

## `Report`

```prisma
model Report {
    id         String   @id @default(cuid())
    pasteId    String
    paste      Paste    @relation(fields: [pasteId], references: [id], onDelete: Cascade)
    reporterId String?
    reporter   User?    @relation(fields: [reporterId], references: [id], onDelete: SetNull)
    reporterIp String?
    reason     String   // spam | malware | phishing | illegal | personal-info | other
    details    String?
    status     String   @default("open")  // open | dismissed | actioned
    createdAt  DateTime @default(now())

    @@index([pasteId])
    @@index([status, createdAt])
    @@map("report")
}
```

`onDelete: Cascade` on `pasteId` means deleting a paste removes its reports, there's no orphan report state.

## `ApiKey`

```prisma
model ApiKey {
    id         String    @id @default(cuid())
    userId     String
    user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
    name       String
    prefix     String   // first 11 chars, for display
    hash       String    @unique    // sha256 of the full key
    lastUsedAt DateTime?
    createdAt  DateTime  @default(now())
    revokedAt  DateTime?

    @@index([userId])
    @@map("api_key")
}
```

Keys are stored hashed; the raw key is only ever returned once (at creation) and shown to the user. The middleware looks up keys by `hash`, not by `id`, so a leaked DB cannot be replayed against the API.

## Hashing

| Secret      | Algorithm                                      |
| ----------- | ---------------------------------------------- |
| Password    | `scrypt(password, salt, 64)`, 16-byte salt     |
| API key     | `sha256(key)`                                  |

Both implementations live in [`packages/api/src/lib/paste.ts`](https://github.com/TurboPaste/TurboPaste/blob/main/packages/api/src/lib/paste.ts).

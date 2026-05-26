# Changelog

## [1.0.1](https://github.com/TurboPaste/TurboPaste/compare/turbopaste-v1.0.0...turbopaste-v1.0.1) (2026-05-26)


### 📖 Documentation

* document docker images and compose-based self-hosting ([218d587](https://github.com/TurboPaste/TurboPaste/commit/218d58718d11bf9d8e9b51b90570b2b71161dba8))


### 🤖 CI

* upgrade github actions using actions-up ([898acea](https://github.com/TurboPaste/TurboPaste/commit/898aceafdad6315c42f5fd977d1a551f68f503e4))
* upgrade github actions using actions-up ([3ca908b](https://github.com/TurboPaste/TurboPaste/commit/3ca908b0c7f0d633d753a95d221cda5a177340cc))


### 🧹 Maintenance

* add .dockerignore ([3be4fdb](https://github.com/TurboPaste/TurboPaste/commit/3be4fdbdecbed3dc198b826a016133f8cde3017d))
* add db:deploy script for applying migrations in production ([00f0df8](https://github.com/TurboPaste/TurboPaste/commit/00f0df85bf39e2d45af3fbd57a7720c64e137be9))
* add Docker image and nginx config for docs app ([27e645b](https://github.com/TurboPaste/TurboPaste/commit/27e645b7666a589e944298d113045c974f3357f5))
* add Docker image, and runtime entrypoint for server app ([f1fe7f1](https://github.com/TurboPaste/TurboPaste/commit/f1fe7f13f53164c86ac67904f7d4a5dcf95fab97))
* add Docker image, nginx config, and runtime entrypoint for web app ([50ceb22](https://github.com/TurboPaste/TurboPaste/commit/50ceb22ed06f4230c9c557f750367f0c38dab820))
* add Docker images ([cf64764](https://github.com/TurboPaste/TurboPaste/commit/cf64764ad0ad52afd8cec0195633b6d092ecfbbf))
* add initial Prisma migration and db:pull script ([25e11e2](https://github.com/TurboPaste/TurboPaste/commit/25e11e2c8db0f7c87bbe8b97b3816c672c376105))
* add root docker-compose for postgres, server, web, and docs ([5d273b9](https://github.com/TurboPaste/TurboPaste/commit/5d273b9c362a9abf7d4635df76d2cd853cf0366a))
* broaden .gitignore env file patterns ([501703f](https://github.com/TurboPaste/TurboPaste/commit/501703fbf5f19dc8704bcca4f94b7369cc951d63))
* enable pnpm workspace package injection and allow @turbopaste/db builds ([923b119](https://github.com/TurboPaste/TurboPaste/commit/923b119d6ffc313ebb51bfb325b3ac835b793b15))
* replace noExternal with deps.alwaysBundle in tsdown config ([026b8b8](https://github.com/TurboPaste/TurboPaste/commit/026b8b81c66a5805cd5d80fca76292d2c2deb094))
* run prisma migrate deploy on server container startup ([27951f3](https://github.com/TurboPaste/TurboPaste/commit/27951f3fd89ea4003254662612310eecc8b0f584))
* tsdown always bundle turbopaste ([45a511a](https://github.com/TurboPaste/TurboPaste/commit/45a511aee641bf802551db9d0c36c6d3f67935c9))
* use branding favicons across web and docs apps ([aa2efb1](https://github.com/TurboPaste/TurboPaste/commit/aa2efb13253c3f3ef4798646fabad62240dd6f61))

## 1.0.0 (2026-05-24)


### 🚀 Features

* **api:** add tRPC routers for paste, report, admin, apiKey ([88eed63](https://github.com/TurboPaste/TurboPaste/commit/88eed6375e9e882e0d4bdc57c524a64118ce3b21))
* **auth:** wrap Better Auth with Prisma ([13efc1f](https://github.com/TurboPaste/TurboPaste/commit/13efc1ff61dccfd7935b235455bb35bba33861e4))
* **config:** add shared tsconfig base ([801b804](https://github.com/TurboPaste/TurboPaste/commit/801b8045f0d777a5b77d0b623d518b3041131dbf))
* **db:** add Prisma schema and Postgres setup ([9bb8dab](https://github.com/TurboPaste/TurboPaste/commit/9bb8dabf5e155c08463de213f3b2c81882370d1c))
* **docs:** add Astro Starlight docs site ([14375c6](https://github.com/TurboPaste/TurboPaste/commit/14375c671f5bf8719e427610d6156025df9345f1))
* **env:** add typed env package for server and web ([4ed761f](https://github.com/TurboPaste/TurboPaste/commit/4ed761f27cc1471e69facbf151725e88f76e8daa))
* **server:** add Hono server with Better Auth, tRPC, and public REST API ([829ea3c](https://github.com/TurboPaste/TurboPaste/commit/829ea3c843919ec79689d0a371f0eba6bf651b73))
* **ui:** add shadcn-style component library and Tailwind theme ([0236c72](https://github.com/TurboPaste/TurboPaste/commit/0236c72d072a8b889f0154aa2520be1c28dd0977))
* **web:** add i18n with English and Turkish, language switcher, browser detection ([5b30fe2](https://github.com/TurboPaste/TurboPaste/commit/5b30fe27767f462c25e307db620f7b61ce009e0d))
* **web:** add web app with TanStack Router, tRPC client, Shiki, and PWA ([ba56039](https://github.com/TurboPaste/TurboPaste/commit/ba5603993e089f8bf7d915a469322ff8ed88a7e0))


### 📖 Documentation

* add project README with architecture, quick start, and self-hosting ([886d137](https://github.com/TurboPaste/TurboPaste/commit/886d13738cc5b82e3c92a2c54dac932dfe39b09d))


### 🤖 CI

* add CI and release workflows ([07273fe](https://github.com/TurboPaste/TurboPaste/commit/07273fe914a2fb3b0bc155028443bfa2dd8c39a6))
* add dummy environment variables ([596f213](https://github.com/TurboPaste/TurboPaste/commit/596f21368406c536aae037847dc16e941a8f9a5a))
* add GitHub issue forms and pull request template ([96a86be](https://github.com/TurboPaste/TurboPaste/commit/96a86bebaa8502a36dbbcd7da9aaab7e2894cb42))
* use release-please and conventional commits ([e795bc6](https://github.com/TurboPaste/TurboPaste/commit/e795bc677589d2c8d9e8e02370c96d330c6a3718))


### 🧹 Maintenance

* add app icons ([aec176e](https://github.com/TurboPaste/TurboPaste/commit/aec176e5c93ae98288697e8ddf9305d176f3647f))
* enforce LF line endings via gitattributes ([cd81acc](https://github.com/TurboPaste/TurboPaste/commit/cd81acc1f1666657a7f482a7972850631476d4d9))
* prepare for v1.0.0 release ([cde4ca5](https://github.com/TurboPaste/TurboPaste/commit/cde4ca54ddb8df1f7c67eefaa51f7c48922a2c60))
* scaffold project from create-better-t-stack ([e49434e](https://github.com/TurboPaste/TurboPaste/commit/e49434e84da7910f4b7371a2f1da193cb48f0103))

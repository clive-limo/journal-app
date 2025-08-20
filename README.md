# Journal App

### Install Dependencies

```
npm i
```

### Prisma DB

Copy the .env samples to get started:

```
cp apps/api/.env.sample apps/api/.env
cp packages/database/.env.sample packages/database/.env
```
Connect to Postgres and run: 

```
npm run prisma:migrate
```

### Build

```
npm run build
```

### Run in Development Mode

```
npm run dev
```
# AlbumRanker

## Development

### Environment Variables

The app requires some environment variabels to be present in order to run. Create an `.env` file in the root of the project that contains the values listed in `.env.example`.

### Initialize Prisma

Initialize a local database for prisma to connect to during development.

```
npx prisma db push
```

This will create a SQLite database at `prisma/data.db`.

### Install Dependencies

```
npm i
```

### Run the app

```
npm run dev
```

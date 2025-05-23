import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './migrations',
	dialect: 'postgresql',
	verbose: true,
});

import { neon } from '@neondatabase/serverless';

// Initialize the neon client
export const sql = neon(process.env.DATABASE_URL!);
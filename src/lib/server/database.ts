import Database from 'better-sqlite3';

// Users in the database use a password hash field to match the design.
export type DbUser = {
	email: string;
	passwordHash: string;
};

// Single SQLite file used for the coursework prototype.
const DB_PATH = 'biasdoc.db';

class AppDatabase {
	private static instance: AppDatabase;
	private db: any;

	private constructor() {
		this.db = new Database(DB_PATH);
		this.initialiseSchema();
	}

	static getInstance(): AppDatabase {
		if (!AppDatabase.instance) {
			AppDatabase.instance = new AppDatabase();
		}
		return AppDatabase.instance;
	}

	private initialiseSchema() {
		// Users table – matches the design section (id, email, password_hash, created_at).
		this.db
			.prepare(
				`CREATE TABLE IF NOT EXISTS users (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					email TEXT UNIQUE NOT NULL,
					password_hash TEXT NOT NULL,
					created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
				);`
			)
			.run();

		// Analyses table – stores results linked back to a user via user_id.
		this.db
			.prepare(
				`CREATE TABLE IF NOT EXISTS analyses (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id INTEGER NOT NULL,
					input_text TEXT NOT NULL,
					bias_score REAL,
					bias_type TEXT,
					summary TEXT,
					sources TEXT,
					created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
				);`
			)
			.run();
	}

	createUser(user: DbUser): void {
		const stmt = this.db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
		stmt.run(user.email.trim().toLowerCase(), user.passwordHash);
	}

	findUserByEmail(email: string): DbUser | null {
		const stmt = this.db.prepare('SELECT email, password_hash FROM users WHERE email = ?');
		const row = stmt.get(email.trim().toLowerCase());
		if (!row) return null;
		return { email: row.email, passwordHash: row.password_hash } satisfies DbUser;
	}

	userExists(email: string): boolean {
		const stmt = this.db.prepare('SELECT 1 FROM users WHERE email = ? LIMIT 1');
		const row = stmt.get(email.trim().toLowerCase());
		return !!row;
	}
}

export const appDatabase = AppDatabase.getInstance();


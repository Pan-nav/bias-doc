import Database from 'better-sqlite3';

// User record for sign-up / sign-in (email + stored credential).
export type DbUser = {
	email: string;
	password: string;
};

const DB_PATH = 'biasdoc.db';

// Analyses table – mirrors the design diagram:
// id, user_id, input_text, bias_score, bias_type, summary, sources, created_at.
export type DbAnalysis = {
	id: number;
	userId: number;
	inputText: string;
	biasScore: number;
	biasType: string;
	summary: string;
	sources: string;
	createdAt: string;
};

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
		// Users table: id, email, password, created_at.
		this.db
			.prepare(
				`CREATE TABLE IF NOT EXISTS users (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					email TEXT UNIQUE NOT NULL,
					password TEXT NOT NULL,
					created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
				);`
			)
			.run();

		// Ensure there is at least one user row so analyses can always link to a valid user_id.
		const anyUser = this.db.prepare('SELECT id FROM users LIMIT 1').get();
		if (!anyUser) {
			this.db
				.prepare('INSERT INTO users (email, password) VALUES (?, ?)')
				.run('demo@example.com', 'demo-password');
		}

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

	createUser(user: DbUser): number {
		const stmt = this.db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
		const result = stmt.run(user.email.trim().toLowerCase(), user.password);
		return Number(result.lastInsertRowid);
	}

	findUserByEmail(email: string): (DbUser & { id: number }) | null {
		const stmt = this.db.prepare('SELECT id, email, password FROM users WHERE email = ?');
		const row = stmt.get(email.trim().toLowerCase()) as
			| { id: number; email: string; password: string }
			| undefined;
		if (!row) return null;
		return { id: row.id, email: row.email, password: row.password };
	}

	getUserById(id: number): { id: number; email: string } | null {
		const stmt = this.db.prepare('SELECT id, email FROM users WHERE id = ?');
		const row = stmt.get(id) as { id: number; email: string } | undefined;
		if (!row) return null;
		return { id: row.id, email: row.email };
	}

	userExists(email: string): boolean {
		const stmt = this.db.prepare('SELECT 1 FROM users WHERE email = ? LIMIT 1');
		const row = stmt.get(email.trim().toLowerCase());
		return !!row;
	}

	createAnalysis(
		userId: number,
		inputText: string,
		options: {
			biasScore: number;
			biasType: string;
			summary: string;
			sources: string;
		}
	): number {
		const stmt = this.db.prepare(
			`INSERT INTO analyses (user_id, input_text, bias_score, bias_type, summary, sources)
			 VALUES (?, ?, ?, ?, ?, ?)`
		);
		const result = stmt.run(
			userId,
			inputText,
			options.biasScore,
			options.biasType,
			options.summary,
			options.sources
		);
		return Number(result.lastInsertRowid);
	}

	getAnalysesForUser(userId: number): DbAnalysis[] {
		const stmt = this.db.prepare(
			`SELECT id, user_id, input_text, bias_score, bias_type, summary, sources, created_at
			 FROM analyses
			 WHERE user_id = ?
			 ORDER BY created_at ASC`
		);
		const rows = stmt.all(userId) as any[];
		return rows.map((row) => ({
			id: row.id,
			userId: row.user_id,
			inputText: row.input_text,
			biasScore: row.bias_score ?? 0,
			biasType: row.bias_type ?? '',
			summary: row.summary ?? '',
			sources: row.sources ?? '',
			createdAt: row.created_at
		}));
	}
}

export const appDatabase = AppDatabase.getInstance();


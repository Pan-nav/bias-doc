import Database from 'better-sqlite3';

// Users in the database use a password hash field to match the design.
export type DbUser = {
	email: string;
	passwordHash: string;
};

// Single SQLite file used for the coursework prototype.
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

		// Ensure there is at least one user row so analyses can always link to a valid user_id.
		const anyUser = this.db.prepare('SELECT id FROM users LIMIT 1').get();
		if (!anyUser) {
			this.db
				.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
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

	createUser(user: DbUser): void {
		const stmt = this.db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
		stmt.run(user.email.trim().toLowerCase(), user.passwordHash);
	}

	findUserByEmail(email: string): DbUser | null {
		const stmt = this.db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?');
		const row = stmt.get(email.trim().toLowerCase());
		if (!row) return null;
		return { email: row.email, passwordHash: row.password_hash } satisfies DbUser;
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

	getAnalysisById(id: number): DbAnalysis | null {
		const stmt = this.db.prepare(
			`SELECT id, user_id, input_text, bias_score, bias_type, summary, sources, created_at
			 FROM analyses
			 WHERE id = ?`
		);
		const row = stmt.get(id) as any;
		if (!row) return null;
		return {
			id: row.id,
			userId: row.user_id,
			inputText: row.input_text,
			biasScore: row.bias_score ?? 0,
			biasType: row.bias_type ?? '',
			summary: row.summary ?? '',
			sources: row.sources ?? '',
			createdAt: row.created_at
		};
	}
}

export const appDatabase = AppDatabase.getInstance();


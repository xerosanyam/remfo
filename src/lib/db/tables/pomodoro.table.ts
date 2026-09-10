import { db } from '$lib/db/turso.db';
import { pomodoroSessionTable } from '$lib/db/turso.schema';

export const insertPomodoroSession = async (values: {
	id: string;
	userId: string;
	task?: string | null;
	duration: number;
	startedAt: Date;
	endedAt: Date;
	completed: boolean;
}) => {
	console.time('insertPomodoroSession');
	// The activity row for a completed session is written by the log_pomodoro_session trigger
	// (migrations/0004), not from here, matching how card activity is logged.
	await db.insert(pomodoroSessionTable).values(values);
	console.timeEnd('insertPomodoroSession');
};

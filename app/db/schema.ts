import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  timestamp,
  integer,
  numeric,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ─── users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const usersRelations = relations(users, ({ many }) => ({
  workouts: many(workouts),
}));

// ─── exercise_catalog ─────────────────────────────────────────────────────────

export const exerciseCatalog = pgTable('exercise_catalog', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull().unique(),
  muscleGroup: varchar('muscle_group', { length: 100 }).notNull(),
  secondaryMuscleGroup: varchar('secondary_muscle_group', { length: 100 }),
  equipment: varchar('equipment', { length: 100 }),
  category: varchar('category', { length: 50 }),
  instructions: text('instructions'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const exerciseCatalogRelations = relations(exerciseCatalog, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

// ─── workouts ─────────────────────────────────────────────────────────────────

export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  name: varchar('name', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, { fields: [workouts.userId], references: [users.id] }),
  workoutExercises: many(workoutExercises),
}));

// ─── workout_exercises ────────────────────────────────────────────────────────

export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    workoutId: uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id').notNull().references(() => exerciseCatalog.id, { onDelete: 'restrict' }),
    orderIndex: integer('order_index').notNull(),
    notes: text('notes'),
  },
  (table) => [
    uniqueIndex('workout_exercises_workout_order_uidx').on(table.workoutId, table.orderIndex),
  ],
);

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, { fields: [workoutExercises.workoutId], references: [workouts.id] }),
  exercise: one(exerciseCatalog, { fields: [workoutExercises.exerciseId], references: [exerciseCatalog.id] }),
  sets: many(sets),
}));

// ─── sets ─────────────────────────────────────────────────────────────────────

export const sets = pgTable(
  'sets',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    workoutExerciseId: uuid('workout_exercise_id').notNull().references(() => workoutExercises.id, { onDelete: 'cascade' }),
    setNumber: integer('set_number').notNull(),
    reps: integer('reps'),
    weightKg: numeric('weight_kg', { precision: 6, scale: 2 }),
    durationSeconds: integer('duration_seconds'),
    restSeconds: integer('rest_seconds'),
    rpe: numeric('rpe', { precision: 3, scale: 1 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  },
  (table) => [
    uniqueIndex('sets_exercise_set_number_uidx').on(table.workoutExerciseId, table.setNumber),
  ],
);

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

// ─── inferred types ───────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ExerciseCatalog = typeof exerciseCatalog.$inferSelect;
export type NewExerciseCatalog = typeof exerciseCatalog.$inferInsert;

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;

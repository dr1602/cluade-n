import 'dotenv/config'
import { drizzle } from 'drizzle-orm/neon-http'
import { exerciseCatalog } from '../app/db/schema'

const db = drizzle(process.env.DATABASE_URL!)

const exercises = [
  { name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', category: 'Push' },
  { name: 'Squat', muscleGroup: 'Legs', equipment: 'Barbell', category: 'Legs' },
  { name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell', category: 'Pull' },
  { name: 'Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell', category: 'Push' },
  { name: 'Barbell Row', muscleGroup: 'Back', equipment: 'Barbell', category: 'Pull' },
  { name: 'Pull-up', muscleGroup: 'Back', equipment: 'Bodyweight', category: 'Pull' },
  { name: 'Dip', muscleGroup: 'Chest', equipment: 'Bodyweight', category: 'Push' },
  { name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', category: 'Pull' },
  { name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', category: 'Legs' },
  { name: 'Bicep Curl', muscleGroup: 'Arms', equipment: 'Dumbbell', category: 'Pull' },
  { name: 'Tricep Pushdown', muscleGroup: 'Arms', equipment: 'Cable', category: 'Push' },
  { name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', category: 'Core' },
]

async function main() {
  await db.insert(exerciseCatalog).values(exercises).onConflictDoNothing()
  console.log(`Seeded ${exercises.length} exercises (existing names skipped).`)
}

main()

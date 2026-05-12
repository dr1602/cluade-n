import { currentUser } from '@clerk/nextjs/server'

export async function auth(): Promise<{ user: { id: string } } | null> {
  const user = await currentUser()
  if (!user) return null
  return { user: { id: user.id } }
}

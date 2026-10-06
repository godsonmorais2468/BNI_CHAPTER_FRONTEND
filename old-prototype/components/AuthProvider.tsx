import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from '../lib/auth'
import type { User } from '../lib/auth'
import { MEMBERS } from '../data/mock'

const KEY = 'bni-chapter:user'

function readUser(): User | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

/* Prototype sign-in: any number signs you in as the chapter President. */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readUser)

  function signIn(phone: string) {
    const me = MEMBERS[0]
    const next: User = { memberId: me.id, name: me.name, role: me.role ?? 'Member', phone }
    setUser(next)
    try {
      sessionStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* storage blocked — stay signed in for this tab only */
    }
  }

  function signOut() {
    setUser(null)
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* nothing stored */
    }
  }

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>
}

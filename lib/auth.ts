export interface User {
  id: string
  name: string
  email: string
  role: "user" | "doctor" | "admin"
}

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userData = localStorage.getItem("user_data")
  return userData ? JSON.parse(userData) : null
}

export const setStoredUser = (user: User, token: string) => {
  localStorage.setItem("user_data", JSON.stringify(user))
  localStorage.setItem("auth_token", token)
}

export const clearStoredUser = () => {
  localStorage.removeItem("user_data")
  localStorage.removeItem("auth_token")
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("auth_token")
}

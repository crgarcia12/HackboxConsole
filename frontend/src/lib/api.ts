// API helper functions

export async function login(username: string, password: string) {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Login failed')
  }

  const data = await response.json()
  return {
    success: true,
    user: {
      username: data.username,
      role: data.role
    }
  }
}

export async function logout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  })
}

export async function getCurrentChallenge() {
  const response = await fetch('/api/challenge/current', {
    credentials: 'include'
  })
  if (!response.ok) throw new Error('Failed to fetch current challenge')
  return response.json()
}

export async function getChallengeList() {
  const response = await fetch('/api/challenge/list', {
    credentials: 'include'
  })
  if (!response.ok) throw new Error('Failed to fetch challenge list')
  return response.json()
}

export async function getSolutionList() {
  const response = await fetch('/api/solution/list', {
    credentials: 'include'
  })
  if (!response.ok) throw new Error('Failed to fetch solution list')
  return response.json()
}

export async function setCurrentChallenge(challengeNum: number) {
  const response = await fetch('/api/challenge/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challenge: challengeNum }),
    credentials: 'include'
  })
  if (!response.ok) throw new Error('Failed to set current challenge')
  return response.json()
}

export async function setChallenge(challengeNum: number) {
  return setCurrentChallenge(challengeNum)
}

export async function fetchMarkdown(path: string) {
  const response = await fetch(path, {
    credentials: 'include'
  })
  if (!response.ok) throw new Error('Failed to fetch markdown')
  return response.text()
}

export async function getCredentials() {
  const response = await fetch('/api/credentials', {
    credentials: 'include'
  })
  if (!response.ok) throw new Error('Failed to fetch credentials')
  return response.json()
}

export async function getTenants() {
  const response = await fetch('/api/tenant/list', {
    credentials: 'include'
  })
  if (!response.ok) throw new Error('Failed to fetch tenants')
  return response.json()
}

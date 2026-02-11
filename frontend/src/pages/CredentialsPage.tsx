import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCredentials } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KeyRound } from 'lucide-react'

interface Credential {
  name: string
  value: string
  type?: string
}

export default function CredentialsPage() {
  const { isAuthenticated } = useAuth()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      getCredentials()
        .then(data => {
          setCredentials(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please log in to view credentials</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Credentials</h1>
      
      {loading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading credentials...</p>
          </CardContent>
        </Card>
      ) : credentials.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <KeyRound className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No credentials available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {credentials.map((cred, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{cred.name}</span>
                  {cred.type && <Badge variant="secondary">{cred.type}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <code className="block bg-secondary p-3 rounded text-sm font-mono break-all">
                  {cred.value}
                </code>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

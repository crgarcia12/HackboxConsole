import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Shield } from 'lucide-react'

export default function TechleadPage() {
  const { role } = useAuth()
  const [tenants, setTenants] = useState([])

  useEffect(() => {
    if (role === 'techlead') {
      fetch('/api/tenant/list', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setTenants(data))
        .catch(() => {})
    }
  }, [role])

  if (role !== 'techlead') {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">This page is only accessible to Tech Leads.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Tech Lead Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Tenant Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tenants.length === 0 ? (
              <p className="text-muted-foreground">No tenants found</p>
            ) : (
              tenants.map((tenant: string, idx: number) => (
                <div key={idx} className="flex items-center justify-between border-b pb-2">
                  <span>{tenant}</span>
                  <Button size="sm" variant="outline">Manage</Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

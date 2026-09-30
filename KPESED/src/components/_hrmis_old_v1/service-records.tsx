'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Search, Building2, Plus, MapPin, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/hrmis/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import type { SafeUser } from '@/lib/auth'

interface ServiceRecord {
  id: string
  recordType: string | null
  effectiveDate: string
  orderNo: string | null
  orderDate: string | null
  issuingAuthority: string | null
  remarks: string | null
  fromDesignation?: { title: string; bps: string } | null
  toDesignation?: { title: string; bps: string } | null
  fromSchool?: { name: string } | null
  toSchool?: { name: string } | null
  fromBps?: string | null
  toBps?: string | null
}

interface EmployeeWithSR {
  id: string
  personalNo: string
  fullName: string
  designation?: { title: string; bps: string } | null
  school?: { name: string } | null
  district?: { name: string } | null
  serviceRecords: ServiceRecord[]
}

export function ServiceRecordsModule({ user }: { user: SafeUser }) {
  const [search, setSearch] = React.useState('')
  const [results, setResults] = React.useState<EmployeeWithSR[] | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function doSearch(q?: string) {
    const query = (q ?? search).trim()
    if (!query) return
    setLoading(true)
    try {
      const res = await fetch(`/api/employees?search=${encodeURIComponent(query)}&pageSize=20`, { cache: 'no-store' })
      const data = await res.json()
      setResults(data.items || [])
    } catch (err) {
      console.error(err)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  async function fetchDetail(id: string) {
    try {
      const res = await fetch(`/api/employees/${id}`, { cache: 'no-store' })
      const data = await res.json()
      if (results) {
        setResults(results.map((r) => r.id === id ? { ...data.employee } : r))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Service Records</h2>
        <p className="text-sm text-muted-foreground">
          View employment history, transfers, and promotions of staff.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" /> Search Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter name, personal number, or CNIC…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={() => doSearch()} disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && results.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon={<Search className="h-6 w-6 text-muted-foreground" />}
              title="No employees found"
              description="Try a different search term."
            />
          </CardContent>
        </Card>
      )}

      {results && results.length > 0 && (
        <div className="space-y-4">
          {results.map((emp) => (
                <Card key={emp.id} onMouseEnter={() => !emp.serviceRecords?.length && fetchDetail(emp.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#016B3A] to-[#01411C] text-sm font-bold uppercase text-white">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{emp.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-mono">{emp.personalNo}</span>
                            {emp.designation?.title && ` · ${emp.designation.title}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {emp.serviceRecords?.length || 0} record(s)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!emp.serviceRecords?.length ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">No service records. Hover to load.</p>
                    ) : (
                      <ol className="relative ml-3 border-l-2 border-[#01411C]/30 pl-6 space-y-3">
                        {emp.serviceRecords.map((sr, i) => (
                          <li key={sr.id} className="relative">
                            <div className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-[#C9A96E] ring-4 ring-white" />
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold uppercase">{sr.recordType || 'Record'} #{i + 1}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(sr.effectiveDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="mt-1 text-sm">
                              <p>
                                <span className="text-muted-foreground">Designation:</span>{' '}
                                {sr.fromDesignation?.title || '—'} → <strong>{sr.toDesignation?.title || '—'}</strong>
                              </p>
                              <p>
                                <span className="text-muted-foreground">School:</span>{' '}
                                {sr.fromSchool?.name || '—'} → <strong>{sr.toSchool?.name || '—'}</strong>
                              </p>
                              {sr.orderNo && (
                                <p className="text-xs text-muted-foreground">
                                  Order: <span className="font-mono">{sr.orderNo}</span> · {sr.orderDate ? new Date(sr.orderDate).toLocaleDateString() : ''}
                                </p>
                              )}
                              {sr.issuingAuthority && (
                                <p className="text-xs text-muted-foreground">Authority: {sr.issuingAuthority}</p>
                              )}
                              {sr.remarks && (
                                <p className="mt-1 rounded bg-muted/40 px-2 py-1 text-xs">{sr.remarks}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </CardContent>
                </Card>
              ))}
        </div>
      )}
    </div>
  )
}

export default ServiceRecordsModule

'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable, type Column } from '@/components/hrmis/ui/data-table'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { BPS_LABELS } from '@/lib/constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface CrudField {
  name: string
  label: string
  type: 'text' | 'number' | 'textarea' | 'select' | 'bps'
  options?: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
}

export interface CrudConfig {
  title: string
  description: string
  apiBase: string
  fields: CrudField[]
  itemNameField: string // which field is the "title" of an item
}

interface CrudManagerProps {
  config: CrudConfig
}

export function CrudManager({ config }: CrudManagerProps) {
  const { title, description, apiBase, fields, itemNameField } = config
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any | null>(null)
  const [form, setForm] = React.useState<Record<string, any>>({})
  const [saving, setSaving] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(apiBase, { cache: 'no-store' })
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  React.useEffect(() => { fetchData() }, [fetchData])

  function openCreate() {
    const empty: Record<string, any> = {}
    fields.forEach((f) => (empty[f.name] = ''))
    setForm(empty)
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(item: any) {
    setForm({ ...item })
    setEditing(item)
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const method = editing ? 'PUT' : 'POST'
      const body: any = { ...form }
      fields.forEach((f) => {
        if (f.type === 'number' && body[f.name] !== '') body[f.name] = Number(body[f.name])
      })
      const res = await fetch(apiBase, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to save')
        return
      }
      toast.success(editing ? 'Updated' : 'Created')
      setFormOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this record?')) return
    try {
      const res = await fetch(`${apiBase}?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete')
        return
      }
      toast.success('Deleted')
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const columns: Column<any>[] = [
    ...fields.slice(0, 4).map((f) => ({
      key: f.name,
      header: f.label,
      cell: (row: any) => <span className="text-sm">{String(row[f.name] ?? '—')}</span>,
    })),
    {
      key: '_actions',
      header: () => <span className="text-right">Actions</span>,
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (row: any) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(row.id)} title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          rowKey={(r) => r.id}
          maxHeight="max-h-[50vh]"
        />

        {formOpen && (
          <Dialog open onOpenChange={(o) => !o && setFormOpen(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? `Edit ${title}` : `New ${title}`}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                {fields.map((f) => (
                  <div key={f.name} className="space-y-1">
                    <Label className="text-xs">{f.label}{f.required && ' *'}</Label>
                    {f.type === 'text' && (
                      <Input
                        value={form[f.name] ?? ''}
                        onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                        placeholder={f.placeholder}
                        required={f.required}
                      />
                    )}
                    {f.type === 'number' && (
                      <Input
                        type="number"
                        value={form[f.name] ?? ''}
                        onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                        required={f.required}
                      />
                    )}
                    {f.type === 'textarea' && (
                      <Textarea
                        value={form[f.name] ?? ''}
                        onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                        rows={3}
                      />
                    )}
                    {f.type === 'select' && (
                      <Select value={form[f.name] || '_none'} onValueChange={(v) => setForm((p) => ({ ...p, [f.name]: v === '_none' ? '' : v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">—</SelectItem>
                          {f.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    {f.type === 'bps' && (
                      <Select value={form[f.name] || '_none'} onValueChange={(v) => setForm((p) => ({ ...p, [f.name]: v === '_none' ? '' : v }))}>
                        <SelectTrigger><SelectValue placeholder="Select BPS" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">—</SelectItem>
                          {BPS_LABELS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}

export default CrudManager

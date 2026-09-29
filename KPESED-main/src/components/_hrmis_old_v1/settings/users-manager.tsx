'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable, type Column } from '@/components/hrmis/ui/data-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { USER_ROLES } from '@/lib/constants'
import type { SafeUser } from '@/lib/auth'

interface UserItem {
  id: string
  username: string
  fullName: string
  email: string | null
  phone: string | null
  role: string
  isActive: boolean
  avatarUrl: string | null
  lastLogin: string | null
  createdAt: string
}

export function UsersManager({ currentUser }: { currentUser: SafeUser }) {
  const [items, setItems] = React.useState<UserItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<UserItem | null>(null)
  const [form, setForm] = React.useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'employee',
    isActive: true,
    password: '',
  })
  const [saving, setSaving] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users', { cache: 'no-store' })
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchData() }, [fetchData])

  function openCreate() {
    setForm({ username: '', fullName: '', email: '', phone: '', role: 'employee', isActive: true, password: '' })
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(item: UserItem) {
    setForm({
      username: item.username,
      fullName: item.fullName,
      email: item.email || '',
      phone: item.phone || '',
      role: item.role,
      isActive: item.isActive,
      password: '',
    })
    setEditing(item)
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const method = editing ? 'PUT' : 'POST'
      const body: any = { ...form }
      const res = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed')
        return
      }
      toast.success(editing ? 'User updated' : 'User created')
      setFormOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (id === currentUser.id) {
      toast.error('Cannot delete your own account')
      return
    }
    if (!confirm('Delete this user?')) return
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed')
        return
      }
      toast.success('Deleted')
      fetchData()
    } catch (err) { console.error(err) }
  }

  const columns: Column<UserItem>[] = [
    {
      key: 'user',
      header: 'User',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.fullName}</p>
          <p className="text-xs text-muted-foreground">@{row.username}</p>
        </div>
      ),
    },
    { key: 'email', header: 'Email', cell: (row) => <span className="text-xs">{row.email || '—'}</span> },
    {
      key: 'role',
      header: 'Role',
      cell: (row) => <Badge variant="outline" className="uppercase text-[#016B3A]">{row.role}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant="outline" className={row.isActive ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}>
          {row.isActive ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      cell: (row) => <span className="text-xs">{row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'actions',
      header: () => <span className="text-right">Actions</span>,
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(row.id)} title="Delete" disabled={row.id === currentUser.id}>
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
            <h3 className="text-lg font-bold">System Users</h3>
            <p className="text-xs text-muted-foreground">Manage administrator and staff accounts</p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add User
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
                <DialogTitle>{editing ? 'Edit User' : 'New User'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Full Name *</Label>
                  <Input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Username *</Label>
                    <Input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} disabled={!!editing} required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{editing ? 'New Password' : 'Password *'}</Label>
                    <Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder={editing ? 'Leave blank to keep' : ''} required={!editing} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.isActive} onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
                  <Label>Account Active</Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {editing ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}

export default UsersManager

'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Save } from 'lucide-react'
import {
  BPS_LABELS, GENDERS, EMPLOYEE_TYPES, EMPLOYMENT_TYPES, EMPLOYEE_STATUS,
} from '@/lib/constants'
import type { SafeUser } from '@/lib/auth'

interface EmployeeFormProps {
  employeeId: string | null
  onClose: () => void
  onSaved: () => void
  districts: { id: string; name: string }[]
  designations: { id: string; title: string; bps: string }[]
  schools: { id: string; name: string }[]
}

type FormState = Record<string, any>

const emptyForm: FormState = {
  personalNo: '',
  fullName: '',
  fatherName: '',
  husbandName: '',
  cnic: '',
  dateOfBirth: '',
  gender: 'male',
  maritalStatus: 'married',
  religion: 'Islam',
  nationality: 'Pakistani',
  bloodGroup: '',
  email: '',
  phone: '',
  emergencyContact: '',
  permanentAddress: '',
  currentAddress: '',
  employeeType: 'teaching',
  employmentType: 'permanent',
  status: 'active',
  designationId: '',
  departmentId: '',
  schoolId: '',
  districtId: '',
  bps: '',
  dateOfJoining: '',
  dateOfRetirement: '',
  dateOfAppointment: '',
  appointmentNature: '',
  qualification: '',
  specialization: '',
  professionalQualification: '',
  experienceYears: '',
  bankAccountNo: '',
  bankName: '',
  bankBranch: '',
  pensionAccountNo: '',
  disability: '',
  disabilityPercentage: '',
  minority: false,
  photoUrl: '',
  remarks: '',
}

export function EmployeeForm({ employeeId, onClose, onSaved, districts, designations, schools }: EmployeeFormProps) {
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [loading, setLoading] = React.useState(false)
  const [fetching, setFetching] = React.useState(!!employeeId)

  React.useEffect(() => {
    if (!employeeId) {
      setForm(emptyForm)
      setFetching(false)
      return
    }
    setFetching(true)
    fetch(`/api/employees/${employeeId}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const e = d.employee
        if (e) {
          setForm({
            ...emptyForm,
            ...e,
            dateOfBirth: e.dateOfBirth ? e.dateOfBirth.substring(0, 10) : '',
            dateOfJoining: e.dateOfJoining ? e.dateOfJoining.substring(0, 10) : '',
            dateOfRetirement: e.dateOfRetirement ? e.dateOfRetirement.substring(0, 10) : '',
            dateOfAppointment: e.dateOfAppointment ? e.dateOfAppointment.substring(0, 10) : '',
            experienceYears: e.experienceYears ?? '',
            disabilityPercentage: e.disabilityPercentage ?? '',
          })
        }
      })
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [employeeId])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = employeeId ? `/api/employees/${employeeId}` : '/api/employees'
      const method = employeeId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to save')
        return
      }
      toast.success(employeeId ? 'Employee updated' : 'Employee created')
      onSaved()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save employee')
    } finally {
      setLoading(false)
    }
  }

  const Input2 = (props: { label: string; name: keyof typeof form; type?: string; placeholder?: string; full?: boolean }) => (
    <div className={props.full ? 'sm:col-span-2' : ''}>
      <Label className="text-xs">{props.label}</Label>
      <Input
        type={props.type || 'text'}
        value={form[props.name] ?? ''}
        onChange={(e) => update(props.name, e.target.value as any)}
        placeholder={props.placeholder}
        disabled={loading || fetching}
        className="mt-1"
      />
    </div>
  )

  const Sel = (props: { label: string; name: keyof typeof form; options: { value: string; label: string }[]; placeholder?: string; full?: boolean }) => (
    <div className={props.full ? 'sm:col-span-2' : ''}>
      <Label className="text-xs">{props.label}</Label>
      <Select value={form[props.name] || '_none'} onValueChange={(v) => update(props.name, (v === '_none' ? '' : v) as any)} disabled={loading || fetching}>
        <SelectTrigger className="mt-1"><SelectValue placeholder={props.placeholder || 'Select'} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_none">—</SelectItem>
          {props.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{employeeId ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          <DialogDescription>
            Fill out the form to {employeeId ? 'update' : 'create'} an employee record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[65vh] px-6 py-4">
            {fetching ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <Tabs defaultValue="personal">
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="employment">Employment</TabsTrigger>
                  <TabsTrigger value="qualification">Qualification</TabsTrigger>
                  <TabsTrigger value="bank">Bank</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Input2({ label: 'Personal No', name: 'personalNo', placeholder: 'Auto-generated if empty' })}
                    {Input2({ label: 'Full Name *', name: 'fullName', placeholder: 'e.g. Muhammad Ahmed Khan' })}
                    {Input2({ label: "Father's Name", name: 'fatherName' })}
                    {Input2({ label: "Husband's Name", name: 'husbandName' })}
                    {Input2({ label: 'CNIC', name: 'cnic', placeholder: '1410112345671' })}
                    {Input2({ label: 'Date of Birth', name: 'dateOfBirth', type: 'date' })}
                    {Sel({ label: 'Gender', name: 'gender', options: GENDERS.map((g) => ({ value: g.value, label: g.label })) })}
                    {Sel({ label: 'Marital Status', name: 'maritalStatus', options: [
                      { value: 'single', label: 'Single' },
                      { value: 'married', label: 'Married' },
                      { value: 'widowed', label: 'Widowed' },
                      { value: 'divorced', label: 'Divorced' },
                    ] })}
                    {Sel({ label: 'Religion', name: 'religion', options: [
                      { value: 'Islam', label: 'Islam' },
                      { value: 'Christianity', label: 'Christianity' },
                      { value: 'Hinduism', label: 'Hinduism' },
                      { value: 'Other', label: 'Other' },
                    ] })}
                    {Input2({ label: 'Nationality', name: 'nationality' })}
                    {Input2({ label: 'Blood Group', name: 'bloodGroup', placeholder: 'e.g. O+, A+' })}
                    {Input2({ label: 'Disability', name: 'disability', placeholder: 'If any' })}
                    {Input2({ label: 'Disability %', name: 'disabilityPercentage', type: 'number' })}
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="mt-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Input2({ label: 'Email', name: 'email', type: 'email' })}
                    {Input2({ label: 'Phone', name: 'phone' })}
                    {Input2({ label: 'Emergency Contact', name: 'emergencyContact' })}
                    {Input2({ label: 'Permanent Address', name: 'permanentAddress', full: true })}
                    {Input2({ label: 'Current Address', name: 'currentAddress', full: true })}
                  </div>
                </TabsContent>

                <TabsContent value="employment" className="mt-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Sel({ label: 'Employee Type', name: 'employeeType', options: EMPLOYEE_TYPES.map((t) => ({ value: t.value, label: t.label })) })}
                    {Sel({ label: 'Employment Type', name: 'employmentType', options: EMPLOYMENT_TYPES.map((t) => ({ value: t.value, label: t.label })) })}
                    {Sel({ label: 'Status', name: 'status', options: Object.entries(EMPLOYEE_STATUS).map(([k, v]) => ({ value: k, label: v.label })) })}
                    {Sel({ label: 'BPS', name: 'bps', options: BPS_LABELS })}
                    {Sel({ label: 'Designation', name: 'designationId', options: designations.map((d) => ({ value: d.id, label: d.title })) })}
                    {Sel({ label: 'District', name: 'districtId', options: districts.map((d) => ({ value: d.id, label: d.name })) })}
                    {Sel({ label: 'School', name: 'schoolId', options: schools.map((s) => ({ value: s.id, label: s.name })) })}
                    {Input2({ label: 'EMIS Code', name: 'emisCode' })}
                    {Input2({ label: 'Date of Appointment', name: 'dateOfAppointment', type: 'date' })}
                    {Input2({ label: 'Date of Joining', name: 'dateOfJoining', type: 'date' })}
                    {Input2({ label: 'Date of Retirement', name: 'dateOfRetirement', type: 'date' })}
                    {Input2({ label: 'Appointment Nature', name: 'appointmentNature', placeholder: 'e.g. Initial / Contract' })}
                  </div>
                </TabsContent>

                <TabsContent value="qualification" className="mt-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Input2({ label: 'Highest Qualification', name: 'qualification', placeholder: 'e.g. M.A Education' })}
                    {Input2({ label: 'Specialization', name: 'specialization' })}
                    {Input2({ label: 'Professional Qualification', name: 'professionalQualification', placeholder: 'e.g. B.Ed' })}
                    {Input2({ label: 'Experience (Years)', name: 'experienceYears', type: 'number' })}
                  </div>
                </TabsContent>

                <TabsContent value="bank" className="mt-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Input2({ label: 'Bank Account No', name: 'bankAccountNo' })}
                    {Input2({ label: 'Bank Name', name: 'bankName' })}
                    {Input2({ label: 'Bank Branch', name: 'bankBranch' })}
                    {Input2({ label: 'Pension Account No', name: 'pensionAccountNo' })}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </ScrollArea>

          <DialogFooter className="border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading || fetching}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {employeeId ? 'Save Changes' : 'Create Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EmployeeForm

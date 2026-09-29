'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, Building2, Banknote, Heart, Pencil, Printer,
} from 'lucide-react'
import { StatusBadge } from '@/components/hrmis/ui/status-badge'
import { EMPLOYEE_STATUS, GENDERS, EMPLOYEE_TYPES, EMPLOYMENT_TYPES, BPS_LABELS } from '@/lib/constants'

interface EmployeeDetailProps {
  employeeId: string
  onClose: () => void
  onEdit: () => void
}

interface Employee {
  id: string
  personalNo: string
  emisCode: string | null
  fullName: string
  fatherName: string | null
  husbandName: string | null
  cnic: string | null
  dateOfBirth: string | null
  gender: string
  maritalStatus: string | null
  religion: string | null
  nationality: string | null
  bloodGroup: string | null
  email: string | null
  phone: string | null
  emergencyContact: string | null
  permanentAddress: string | null
  currentAddress: string | null
  employeeType: string
  employmentType: string
  status: string
  bps: string | null
  dateOfJoining: string | null
  dateOfRetirement: string | null
  dateOfAppointment: string | null
  appointmentNature: string | null
  qualification: string | null
  specialization: string | null
  professionalQualification: string | null
  experienceYears: number | null
  bankAccountNo: string | null
  bankName: string | null
  bankBranch: string | null
  pensionAccountNo: string | null
  disability: string | null
  disabilityPercentage: number | null
  minority: boolean
  photoUrl: string | null
  remarks: string | null
  designation: { id: string; title: string; bps: string } | null
  department: { id: string; name: string } | null
  district: { id: string; name: string } | null
  school: { id: string; name: string; emisCode: string } | null
  serviceRecords: any[]
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? '—'}</p>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 pb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#01411C]/10 text-[#01411C]">{icon}</div>
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 pl-1">{children}</div>
    </div>
  )
}

export function EmployeeDetail({ employeeId, onClose, onEdit }: EmployeeDetailProps) {
  const [emp, setEmp] = React.useState<Employee | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    fetch(`/api/employees/${employeeId}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setEmp(d.employee); setLoading(false) } })
      .catch((e) => { console.error(e); if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [employeeId])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center justify-between gap-3 pr-8">
            <span>Employee Profile</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              <Button size="sm" onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            View comprehensive employee record.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : !emp ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Employee not found</div>
          ) : (
            <div className="space-y-6 p-6">
              {/* Header card */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#016B3A] to-[#01411C] text-3xl font-bold uppercase text-white shadow-md">
                  {emp.fullName.charAt(0)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{emp.fullName}</h3>
                    <StatusBadge status={emp.status} statusMap={EMPLOYEE_STATUS} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {emp.designation?.title || 'No designation'} {emp.bps && `· ${BPS_LABELS.find((b) => b.value === emp.bps)?.label || emp.bps}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Personal No: <span className="font-mono">{emp.personalNo}</span> · CNIC: <span className="font-mono">{emp.cnic || '—'}</span>
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {emp.district && <Badge variant="outline">{emp.district.name}</Badge>}
                    {emp.school && <Badge variant="outline">{emp.school.name}</Badge>}
                    {emp.department && <Badge variant="outline">{emp.department.name}</Badge>}
                  </div>
                </div>
              </div>

              <Separator />

              <Section title="Personal Information" icon={<User className="h-4 w-4" />}>
                <Field label="Full Name" value={emp.fullName} />
                <Field label="Father's Name" value={emp.fatherName} />
                <Field label="Husband's Name" value={emp.husbandName} />
                <Field label="CNIC" value={<span className="font-mono">{emp.cnic}</span>} />
                <Field label="Date of Birth" value={formatDate(emp.dateOfBirth)} />
                <Field label="Gender" value={GENDERS.find((g) => g.value === emp.gender)?.label || emp.gender} />
                <Field label="Marital Status" value={emp.maritalStatus} />
                <Field label="Religion" value={emp.religion} />
                <Field label="Nationality" value={emp.nationality} />
                <Field label="Blood Group" value={emp.bloodGroup} />
                <Field label="Disability" value={emp.disability ? `${emp.disability} (${emp.disabilityPercentage}%)` : '—'} />
                <Field label="Minority" value={emp.minority ? 'Yes' : 'No'} />
              </Section>

              <Separator />

              <Section title="Contact Information" icon={<Phone className="h-4 w-4" />}>
                <Field label="Email" value={emp.email} />
                <Field label="Phone" value={emp.phone} />
                <Field label="Emergency Contact" value={emp.emergencyContact} />
                <Field label="Permanent Address" value={emp.permanentAddress} />
                <Field label="Current Address" value={emp.currentAddress} />
              </Section>

              <Separator />

              <Section title="Employment Information" icon={<Briefcase className="h-4 w-4" />}>
                <Field label="Designation" value={emp.designation?.title} />
                <Field label="BPS" value={emp.bps ? BPS_LABELS.find((b) => b.value === emp.bps)?.label : '—'} />
                <Field label="Employee Type" value={EMPLOYEE_TYPES.find((t) => t.value === emp.employeeType)?.label || emp.employeeType} />
                <Field label="Employment Type" value={EMPLOYMENT_TYPES.find((t) => t.value === emp.employmentType)?.label || emp.employmentType} />
                <Field label="Department" value={emp.department?.name} />
                <Field label="District" value={emp.district?.name} />
                <Field label="School" value={emp.school?.name} />
                <Field label="EMIS Code" value={emp.emisCode || emp.school?.emisCode} />
                <Field label="Date of Appointment" value={formatDate(emp.dateOfAppointment)} />
                <Field label="Date of Joining" value={formatDate(emp.dateOfJoining)} />
                <Field label="Date of Retirement" value={formatDate(emp.dateOfRetirement)} />
                <Field label="Appointment Nature" value={emp.appointmentNature} />
              </Section>

              <Separator />

              <Section title="Qualifications" icon={<GraduationCap className="h-4 w-4" />}>
                <Field label="Highest Qualification" value={emp.qualification} />
                <Field label="Specialization" value={emp.specialization} />
                <Field label="Professional Qual." value={emp.professionalQualification} />
                <Field label="Experience (Years)" value={emp.experienceYears} />
              </Section>

              <Separator />

              <Section title="Bank & Pension" icon={<Banknote className="h-4 w-4" />}>
                <Field label="Bank Account No" value={<span className="font-mono">{emp.bankAccountNo}</span>} />
                <Field label="Bank Name" value={emp.bankName} />
                <Field label="Bank Branch" value={emp.bankBranch} />
                <Field label="Pension Account No" value={<span className="font-mono">{emp.pensionAccountNo}</span>} />
              </Section>

              {emp.serviceRecords && emp.serviceRecords.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 pb-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#01411C]/10 text-[#01411C]"><Building2 className="h-4 w-4" /></div>
                      <h4 className="text-sm font-semibold">Service History ({emp.serviceRecords.length})</h4>
                    </div>
                    <ul className="space-y-2 pl-1">
                      {emp.serviceRecords.map((sr, i) => (
                        <li key={sr.id} className="rounded-md border p-3 text-xs">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold uppercase">{sr.recordType || 'Record'} #{i + 1}</p>
                            <span className="text-muted-foreground">{formatDate(sr.effectiveDate)}</span>
                          </div>
                          <p className="mt-1">
                            {sr.fromDesignation?.title || '—'} → <strong>{sr.toDesignation?.title || '—'}</strong>
                          </p>
                          {sr.orderNo && <p className="text-muted-foreground">Order: {sr.orderNo}</p>}
                          {sr.issuingAuthority && <p className="text-muted-foreground">Authority: {sr.issuingAuthority}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default EmployeeDetail

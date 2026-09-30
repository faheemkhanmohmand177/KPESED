'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Printer, GraduationCap, X } from 'lucide-react'

interface PayslipProps {
  payrollId: string
  onClose: () => void
}

interface Payroll {
  id: string
  month: number
  year: number
  basicPay: number
  houseRentAllowance: number
  conveyanceAllowance: number
  medicalAllowance: number
  adhocReliefAllowance: number
  specialAllowance: number
  otherAllowances: number
  incomeTax: number
  gpFund: number
  insurance: number
  loanRecovery: number
  eobi: number
  otherDeductions: number
  status: string
  paidDate: string | null
  bankReference: string | null
  remarks: string | null
  employee: {
    fullName: string
    personalNo: string
    cnic: string | null
    bps: string | null
    designation?: { title: string } | null
    district?: { name: string } | null
    school?: { name: string } | null
    bankAccountNo: string | null
    bankName: string | null
  }
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">Rs {Number(value).toLocaleString()}</span>
    </div>
  )
}

export function Payslip({ payrollId, onClose }: PayslipProps) {
  const [p, setP] = React.useState<Payroll | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`/api/payroll/${payrollId}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setP(d.payroll))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [payrollId])

  const earnings = p ? ([
    { label: 'Basic Pay', value: p.basicPay },
    { label: 'House Rent Allowance', value: p.houseRentAllowance },
    { label: 'Conveyance Allowance', value: p.conveyanceAllowance },
    { label: 'Medical Allowance', value: p.medicalAllowance },
    { label: 'Adhoc Relief Allowance', value: p.adhocReliefAllowance },
    { label: 'Special Allowance', value: p.specialAllowance },
    { label: 'Other Allowances', value: p.otherAllowances },
  ]) : []
  const deductions = p ? ([
    { label: 'Income Tax', value: p.incomeTax },
    { label: 'GP Fund', value: p.gpFund },
    { label: 'Insurance', value: p.insurance },
    { label: 'Loan Recovery', value: p.loanRecovery },
    { label: 'EOBI', value: p.eobi },
    { label: 'Other Deductions', value: p.otherDeductions },
  ]) : []

  const totalE = earnings.reduce((s, e) => s + e.value, 0)
  const totalD = deductions.reduce((s, e) => s + e.value, 0)
  const net = totalE - totalD

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-base font-semibold">Payslip</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[75vh]">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Loading payslip…</div>
          ) : !p ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Payslip not found</div>
          ) : (
            <div className="px-6 py-4 print:px-0">
              {/* Letterhead */}
              <div className="flex items-center gap-4 border-b-2 border-[#01411C] pb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#016B3A] to-[#01411C] text-white">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#01411C]">KPESE HRMIS</h2>
                  <p className="text-xs text-muted-foreground">Elementary &amp; Secondary Education Department, Govt. of Khyber Pakhtunkhwa</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Pay Period</p>
                  <p className="text-base font-semibold">{MONTH_NAMES[p.month - 1]} {p.year}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-muted-foreground">Status</p>
                  <p className="text-base font-semibold capitalize">{p.status}</p>
                </div>
              </div>

              {/* Employee info */}
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
                <div><p className="text-[10px] uppercase text-muted-foreground">Name</p><p className="font-medium">{p.employee.fullName}</p></div>
                <div><p className="text-[10px] uppercase text-muted-foreground">Personal No</p><p className="font-mono">{p.employee.personalNo}</p></div>
                <div><p className="text-[10px] uppercase text-muted-foreground">Designation</p><p>{p.employee.designation?.title || '—'}</p></div>
                <div><p className="text-[10px] uppercase text-muted-foreground">BPS</p><p>{p.employee.bps?.replace('bps_', 'BPS-') || '—'}</p></div>
                <div><p className="text-[10px] uppercase text-muted-foreground">CNIC</p><p className="font-mono">{p.employee.cnic || '—'}</p></div>
                <div><p className="text-[10px] uppercase text-muted-foreground">Bank</p><p>{p.employee.bankName || '—'} {p.employee.bankAccountNo ? `· ${p.employee.bankAccountNo}` : ''}</p></div>
              </div>

              {/* Earnings & deductions */}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase text-emerald-700">Earnings</p>
                  {earnings.map((e) => <Row key={e.label} label={e.label} value={String(e.value)} />)}
                  <div className="mt-2 flex items-center justify-between border-t border-emerald-200 pt-2 text-sm font-bold text-emerald-800">
                    <span>Gross Earnings</span><span className="font-mono">Rs {totalE.toLocaleString()}</span>
                  </div>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase text-red-700">Deductions</p>
                  {deductions.map((e) => <Row key={e.label} label={e.label} value={String(e.value)} />)}
                  <div className="mt-2 flex items-center justify-between border-t border-red-200 pt-2 text-sm font-bold text-red-800">
                    <span>Total Deductions</span><span className="font-mono">Rs {totalD.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net pay */}
              <div className="mt-4 flex items-center justify-between rounded-lg bg-[#01411C] p-4 text-white">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/70">Net Pay</p>
                  <p className="text-sm text-white/60">{MONTH_NAMES[p.month - 1]} {p.year}</p>
                </div>
                <p className="font-mono text-2xl font-bold">Rs {net.toLocaleString()}</p>
              </div>

              {p.bankReference && (
                <p className="mt-3 text-xs text-muted-foreground">Bank Reference: {p.bankReference}</p>
              )}

              <p className="mt-6 text-center text-[10px] text-muted-foreground">
                This is a computer-generated payslip and does not require a signature. · KPESE HRMIS
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default Payslip

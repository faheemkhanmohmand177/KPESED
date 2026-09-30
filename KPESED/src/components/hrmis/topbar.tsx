'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  Menu, X, LogOut, ChevronDown, User as UserIcon, CloudDownload, ClipboardList,
  FileVideo, FileText, MonitorSmartphone, ExternalLink, Search, Edit3, Save,
  LayoutGrid, MousePointerClick, LogIn,
} from 'lucide-react'
import type { SafeUser } from '@/lib/auth'
import { NAV_TREE, type NavItem } from '@/lib/portal-navigation'

interface TopbarProps {
  user: SafeUser
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onLogout: () => void
  onNavigate: (module: string) => void
}

type DialogKind = 'tutorial' | 'manual' | 'password' | 'install' | null

export function Topbar({ user, sidebarOpen, onToggleSidebar, onLogout, onNavigate }: TopbarProps) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [dialog, setDialog] = React.useState<DialogKind>(null)
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
      toast.success('Integrated EMIS has been installed.')
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true)
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  React.useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function installApp() {
    if (installed) {
      toast.info('Integrated EMIS is already installed on this device.')
      return
    }
    if (installPrompt) {
      try {
        await installPrompt.prompt()
        const choice = await installPrompt.userChoice
        if (choice.outcome === 'accepted') setInstallPrompt(null)
        else toast.info('Install dismissed — you can install any time from this button.')
      } catch {
        setDialog('install')
      }
      return
    }
    // No native prompt available (browser already dismissed it once, iOS
    // Safari, or PWA requirements not met yet) — show manual instructions.
    setDialog('install')
  }

  const openDialog = (kind: DialogKind) => { setMenuOpen(false); setDialog(kind) }
  const go = (module: string) => { setMenuOpen(false); onNavigate(module) }
  const openModule = (module: string) => { setDialog(null); setMenuOpen(false); onNavigate(module) }

  return (
    <>
      {/* Blue masthead. Height comes from --apex-header-h (globals.css):
          56px on phones and 52px on desktop, like the live APEX top bar. */}
      <header className="t-Header sticky top-0 z-30 flex shrink-0 items-center gap-1.5 border-b border-[#0d47a1] bg-[#1565c0] px-2 text-white sm:px-3">
        <div className="t-Header-branding flex min-w-0 items-center gap-1.5">
          {/* On phones the toggle is the solid white square with the blue
              X — exactly like the live portal's mobile masthead. On desktop
              the live portal always shows the hamburger, open or closed. */}
          <button type="button" onClick={onToggleSidebar} title="Main Navigation" aria-label="Main Navigation" aria-expanded={sidebarOpen} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] bg-white text-[#1565c0] shadow-sm transition-colors hover:bg-white/90 lg:h-9 lg:w-9 lg:rounded lg:bg-transparent lg:text-white lg:shadow-none lg:hover:bg-white/15">
            {/* Mobile: X while the drawer is open, hamburger when closed;
                Desktop: always the hamburger, like the live portal. */}
            <X className="h-5 w-5 lg:hidden" style={{ display: sidebarOpen ? undefined : 'none' }} />
            <Menu className="h-5 w-5 lg:hidden" style={{ display: sidebarOpen ? 'none' : undefined }} />
            <Menu className="hidden h-[22px] w-[22px] lg:block" />
          </button>
          <a href="/?module=home" onClick={(e) => { e.preventDefault(); go('home') }} className="flex min-w-0 items-center gap-2 text-white">
            <img src="/hrmis/logo.jpg" alt="KPESE" width={28} height={34} className="h-[32px] w-[26px] shrink-0 object-contain lg:h-[36px] lg:w-[30px]" />
            <span className="truncate text-lg font-semibold lg:text-xl">Integrated EMIS</span>
          </a>
        </div>

        {/* Header actions — icon-only on phones (like the live site), with
            labels appearing from the lg breakpoint up. */}
        <nav className="ml-auto flex items-center gap-0.5 text-[13px] text-white/90 lg:gap-1.5 lg:text-[15px]">
          <button type="button" onClick={installApp} aria-label="Install App" className="flex items-center gap-1.5 whitespace-nowrap rounded px-1.5 py-1.5 text-white/90 hover:bg-white/15 lg:px-2.5"><CloudDownload className="h-[18px] w-[18px] lg:h-5 lg:w-5" /><span className="hidden lg:inline">Install App</span></button>
          <button type="button" onClick={() => go('dps-rankings')} aria-label="District Performance ScoreCard" className="flex items-center gap-1.5 whitespace-nowrap rounded px-1.5 py-1.5 text-white/90 hover:bg-white/15 lg:px-2.5"><ClipboardList className="h-[18px] w-[18px] lg:h-5 lg:w-5" /><span className="hidden lg:inline">District Performance ScoreCard</span></button>
          <button type="button" onClick={() => openDialog('tutorial')} aria-label="hris tutorial" className="flex items-center gap-1.5 whitespace-nowrap rounded px-1.5 py-1.5 text-white/90 hover:bg-white/15 lg:px-2.5"><FileVideo className="h-[18px] w-[18px] lg:h-5 lg:w-5" /><span className="hidden lg:inline">hris tutorial</span></button>
          <button type="button" onClick={() => openDialog('manual')} aria-label="iEMIS User Manual" className="flex items-center gap-1.5 whitespace-nowrap rounded px-1.5 py-1.5 text-white/90 hover:bg-white/15 lg:px-2.5"><FileText className="h-[18px] w-[18px] lg:h-5 lg:w-5" /><span className="hidden lg:inline">iEMIS User Manual</span></button>
        </nav>

        <div className="relative ml-1 shrink-0" ref={menuRef}>
          <button type="button" onClick={() => setMenuOpen((v) => !v)} title={`${user.username} / ${user.role}`} aria-haspopup="menu" aria-expanded={menuOpen} className="flex items-center gap-1.5 rounded px-1.5 py-1.5 text-white hover:bg-white/15 lg:px-2.5">
            <UserIcon className="h-[19px] w-[19px] lg:h-5 lg:w-5" /><span className="hidden min-w-0 truncate lg:inline"><span className="font-medium">{user.username}</span><span className="mx-1 text-white/60">/</span><span>{user.role}</span></span><ChevronDown className="h-4 w-4 text-white/70 lg:h-4 lg:w-4" />
          </button>
          {menuOpen && <div role="menu" className="absolute right-0 z-50 mt-1 w-[260px] max-w-[calc(100vw-1.5rem)] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            <div className="border-b border-gray-100 px-3 py-2"><div className="truncate text-sm font-semibold text-gray-800">{user.fullName}</div><div className="mt-0.5 text-[11px] text-gray-500">Role: <span className="font-medium">{formatRole(user.role)}</span></div></div>
            <button type="button" role="menuitem" onClick={() => openDialog('password')} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"><UserIcon className="h-4 w-4" />Change Password</button>
            <button type="button" role="menuitem" onClick={onLogout} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Sign Out</button>
          </div>}
        </div>
      </header>
      {dialog && <PortalDialog kind={dialog} user={user} onClose={() => setDialog(null)} onNavigate={openModule} />}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Shared dialog chrome                                                */
/* ------------------------------------------------------------------ */

function DialogShell({ title, onClose, width = 'max-w-2xl', children }: { title: string; onClose: () => void; width?: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-2 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`flex max-h-[94vh] w-full ${width} flex-col rounded border border-gray-300 bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#f9f9f9] px-4 py-3">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-gray-500 hover:text-gray-800" aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* HRIS Tutorial center — topic list + step-by-step content            */
/* ------------------------------------------------------------------ */

const GROUP_GUIDES: Record<string, { intro: string; steps: string[] }> = {
  'office-school-mis': {
    intro: 'Maintain school and office profiles, produce office/school reports, publish monthly school data certificates and submit stories for social media.',
    steps: [
      'Open Office/School Profile(s) to review or update your school record, then press Save.',
      'Use Office/School Reports for Basic Facilities, Security Measures, Rooms, PTC, Commodities and IT Lab prints.',
      'Upload the monthly certificate from School Data Certificates before the deadline.',
      'Add news items under Content for Social Media with the Create button.',
    ],
  },
  'hr-mis': {
    intro: 'Employee directory, daily teacher attendance and leave reporting for your school or office.',
    steps: [
      'Use Employee Profiles to search staff by name, CNIC, personnel number or EMIS code.',
      'Mark daily Teacher Attendance, then save the sheet before 10:00 AM.',
      'Teachers Attendance Report and Employee Leaves Report give printable audits of both workflows.',
    ],
  },
  'students-mis': {
    intro: 'Everything about students: profiles, enrolment campaigns, attendance, class updates, promotion and migration.',
    steps: [
      'Search Students Profiles by student ID, name or class.',
      'Record Enrolment Campaign Targets, then enter Daily Students Enrolment during the campaign window.',
      'Use Student Attendance for the daily register and Students Class Update for section changes.',
      'Promote classes at session end with Student Promotion (Manual) or the Double Shift variant.',
    ],
  },
  'ssr': {
    intro: 'School Self Reporting (SSR) — submit the SSR form and print any of its sixteen audit reports.',
    steps: [
      'Fill the School Self Report (SSR) Form for your school and save each section.',
      'Open any SSR report (staff, buildings, facilities, enrollment and more) for a printable view.',
    ],
  },
  'assets-mis': {
    intro: 'Register school assets, record their details and print consolidated asset reports.',
    steps: [
      'Create each item with Asset Profile (type, category, donor, availability).',
      'Record quantities and condition in Asset Details.',
      'Use Assets Report for a district-wide print with filters.',
    ],
  },
  'survey-tree-form': {
    intro: 'Environment Friendly Trees survey — count the trees planted inside the school premises.',
    steps: ['Open the survey grid, fill tree counts per species, then Save Record.'],
  },
  'ptc-mis': {
    intro: 'Parent Teacher Council finances — headwise available amount and demand lists.',
    steps: [
      'PTC HEADWISE AVAILABLE AMOUNT is an editable grid: press Edit, update the amounts, then Save.',
      'PTC Schools List (Demand) lists schools that demanded PTC funds.',
    ],
  },
  'ptc-hiring': {
    intro: 'PTC Hiring (Talent Pool) — applicants who applied for PTC teaching positions.',
    steps: ['Open Applicants List (PTC) to review applicants and their credentials.'],
  },
  'textbook-board': {
    intro: 'Free textbook demand for the academic session.',
    steps: [
      'Free Textbook Demand List shows the class-wise demand submitted by schools.',
      'Book Demand Details break the demand down by title and quantity.',
    ],
  },
  'monitoring-dashboard': {
    intro: 'Monitoring Dashboard — compares ASC field values with iEMIS values as charts.',
    steps: ['Press Edit to update the ASC values, then Save to refresh the charts.'],
  },
  'dengue-control-campaign': {
    intro: 'Dengue Control Campaign — weekly inspection records for the school.',
    steps: ['Use Add Dengue Control Campaign to log each inspection with date and findings.'],
  },
  'dps': {
    intro: 'District Performance ScoreCard — how fast your school updates iEMIS against district targets.',
    steps: [
      'DPS - Rankings shows every district score.',
      'The three iEMIS Updation reports break the score into Office-School, HR and Enrollment updates.',
    ],
  },
}

function TutorialCenter({ onClose, onNavigate }: { onClose: () => void; onNavigate: (m: string) => void }) {
  const topics: Array<{ id: string; label: string }> = [
    { id: 'getting-started', label: 'Getting Started' },
    ...NAV_TREE.map((group) => ({ id: group.id, label: group.label })),
  ]
  const [topic, setTopic] = React.useState('getting-started')

  const leavesOf = (group: NavItem): NavItem[] => {
    if (!group.children) return group.module ? [group] : []
    return group.children.flatMap((child) => (child.children ? (child.module ? [child, ...leavesOf(child)] : leavesOf(child)) : [child]))
  }

  const group = NAV_TREE.find((g) => g.id === topic)
  const guide = group ? GROUP_GUIDES[group.id] : undefined
  const leaves = group ? leavesOf(group) : []

  return (
    <DialogShell title="HRIS Tutorial" onClose={onClose} width="max-w-5xl">
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <aside className="hrmis-scroll w-full shrink-0 overflow-y-auto border-b border-gray-200 bg-[#fafafa] sm:w-[270px] sm:border-b-0 sm:border-r">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tutorial Topics</div>
          {topics.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTopic(t.id)}
              className={`block w-full truncate px-3 py-2.5 text-left text-[13px] transition-colors ${topic === t.id ? 'bg-[#1565c0] font-semibold text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {t.label}
            </button>
          ))}
        </aside>

        <div className="hrmis-scroll min-h-0 flex-1 overflow-y-auto p-4 text-sm text-gray-700">
          {topic === 'getting-started' ? (
            <div className="space-y-4">
              <p className="text-[15px] font-semibold text-gray-800">Welcome to Integrated EMIS</p>
              <p>Integrated EMIS is the Education Management Information System of the KP Elementary &amp; Secondary Education Department. Follow the steps below to get productive in minutes, then pick any module from the left list for its detailed walkthrough.</p>
              <ol className="space-y-3">
                {[
                  { icon: LogIn, title: '1. Sign in', text: 'Enter the username and password issued by your DEO office, then press Sign In. School admins land on the portal home.' },
                  { icon: LayoutGrid, title: '2. Open a module', text: 'Use the dark navigation tree on the left. Click a group (Office/School MIS, HR MIS, Students MIS, SSR, Assets, PTC, Textbook Board, Monitoring, Dengue, DPS) and choose a feature.' },
                  { icon: Search, title: '3. Work with reports', text: 'Every report page has filters, a search box, a Rows selector (50/100/500/All) and an Actions menu. Press Download to export the current view to CSV.' },
                  { icon: Edit3, title: '4. Enter data', text: 'Pages with a red Create/Add button open an entry form with the exact fields used by the department. Fill the form and press the save button — the row appears instantly in the report.' },
                  { icon: Save, title: '5. Save your work', text: 'Editable grids (PTC headwise, Tree Survey, Monitoring) use Edit / Save / Add Row buttons in the toolbar. Always press Save before leaving the page.' },
                  { icon: MonitorSmartphone, title: '6. Install the app', text: 'Press Install App in the blue bar to add Integrated EMIS to your desktop or phone home screen — it then works like a native app.' },
                ].map((s) => (
                  <li key={s.title} className="flex gap-3 rounded border border-gray-200 bg-white p-3">
                    <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#1565c0]" />
                    <div><div className="font-semibold text-gray-800">{s.title}</div><div className="mt-0.5 text-[13px]">{s.text}</div></div>
                  </li>
                ))}
              </ol>
              <div className="rounded border border-blue-200 bg-blue-50 p-3 text-[13px] text-blue-900">
                Tip: press <b>hris tutorial</b> any time from the blue bar — this window opens with the full module list on the left.
              </div>
            </div>
          ) : group ? (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-gray-800">{group.label}</p>
                {guide && <p className="mt-1">{guide.intro}</p>}
              </div>
              {guide && (
                <div className="rounded border border-gray-200 bg-[#fafafa] p-3">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-gray-800"><MousePointerClick className="h-4 w-4 text-[#1565c0]" />How to use it</div>
                  <ol className="list-decimal space-y-1.5 pl-5 text-[13px]">{guide.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                </div>
              )}
              <div>
                <div className="mb-2 font-semibold text-gray-800">Features in this module ({leaves.length})</div>
                <div className="divide-y divide-gray-100 overflow-hidden rounded border border-gray-200">
                  {leaves.map((leaf) => (
                    <div key={leaf.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-gray-800">{leaf.label}</div>
                        {leaf.label !== group.label && <div className="text-[11px] text-gray-400">{leaf.parent || group.label}</div>}
                      </div>
                      <button type="button" className="apex-btn shrink-0" onClick={() => onNavigate(leaf.module || group.id)}>
                        Open <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DialogShell>
  )
}

/* ------------------------------------------------------------------ */
/* iEMIS User Manual                                                   */
/* ------------------------------------------------------------------ */

function ManualDialog({ onClose }: { onClose: () => void }) {
  const openPdf = () => { window.open('/hrmis/iEMIS-User-Manual.pdf', '_blank', 'noopener') }
  const sections: Array<{ title: string; items: string[] }> = [
    { title: '1. Signing in', items: ['Open the portal address supplied by your DEO office.', 'Type the username and password issued to your school or office.', 'Press Sign In. If the password is forgotten, contact the EMIS focal person to reset it.'] },
    { title: '2. Main navigation', items: ['The dark left tree lists 12 module groups and 58 features.', 'Click a group name to expand it, then click a feature to open it.', 'The hamburger icon in the blue bar collapses or expands the tree.'] },
    { title: '3. Working with reports', items: ['Filters at the top narrow the report (district, tehsil, gender, status, dates).', 'The search box filters rows by any word; press Search to apply.', 'Rows switches page size (50, 100, 500, All).', 'Actions opens column and download options; Download exports CSV.'] },
    { title: '4. Data entry', items: ['Red buttons such as Create, Add Employee or Add Row open entry forms.', 'Fields marked with * are required by the department.', 'Press the save button once — a green confirmation appears and the row shows in the report.', 'Pencil and bin icons in each row edit or remove that record.'] },
    { title: '5. Attendance', items: ['Teacher Attendance and Student Attendance open the daily register.', 'Pick date, shift and class, mark Present/Absent/Leave, then press Save.', 'Summary chips at the top refresh immediately after saving.'] },
    { title: '6. School Self Reporting (SSR)', items: ['Fill the SSR form section by section and save each part.', 'Sixteen SSR reports provide printable audits of the submitted data.'] },
    { title: '7. Support', items: ['For account issues contact the District Education Office (EMIS focal person).', 'For data corrections use the edit action on the relevant record.'] },
  ]
  return (
    <DialogShell title="iEMIS User Manual" onClose={onClose}>
      <div className="hrmis-scroll min-h-0 flex-1 overflow-y-auto p-4 text-sm text-gray-700">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded border border-blue-200 bg-blue-50 p-3">
          <div className="text-[13px] text-blue-900"><b>Integrated EMIS User Manual</b> — the complete printable guide (PDF).</div>
          <button type="button" className="apex-btn apex-btn--primary" onClick={openPdf}><FileText className="h-3.5 w-3.5" />Open PDF Manual</button>
        </div>
        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="mb-1.5 font-semibold text-gray-800">{section.title}</h3>
              <ol className="list-decimal space-y-1 pl-5 text-[13px]">{section.items.map((item) => <li key={item}>{item}</li>)}</ol>
            </section>
          ))}
        </div>
      </div>
    </DialogShell>
  )
}

/* ------------------------------------------------------------------ */
/* Install-app instructions (fallback when no native prompt exists)    */
/* ------------------------------------------------------------------ */

function InstallDialog({ onClose }: { onClose: () => void }) {
  const platforms: Array<{ title: string; steps: string[] }> = [
    { title: 'Chrome / Edge — Desktop', steps: ['Click the install icon (screen with arrow) at the right end of the address bar, or', 'open the browser menu (⋮ / ⋯) and choose "Install Integrated EMIS…".'] },
    { title: 'Android — Chrome', steps: ['Open the browser menu (⋮) at the top right.', 'Tap "Add to Home screen" / "Install app", then confirm Install.'] },
    { title: 'iPhone / iPad — Safari', steps: ['Tap the Share button (square with arrow).', 'Scroll and tap "Add to Home Screen", then tap Add.'] },
  ]
  return (
    <DialogShell title="Install Integrated EMIS" onClose={onClose} width="max-w-xl">
      <div className="hrmis-scroll min-h-0 flex-1 overflow-y-auto p-4 text-sm text-gray-700">
        <div className="mb-4 flex items-start gap-3 rounded border border-blue-200 bg-blue-50 p-3">
          <MonitorSmartphone className="mt-0.5 h-6 w-6 shrink-0 text-[#1565c0]" />
          <div className="text-[13px] text-blue-900">Install Integrated EMIS on your device for full-screen, app-like access. Choose the instructions for your browser below.</div>
        </div>
        <div className="space-y-4">
          {platforms.map((p) => (
            <section key={p.title}>
              <h3 className="mb-1.5 font-semibold text-gray-800">{p.title}</h3>
              <ol className="list-decimal space-y-1 pl-5 text-[13px]">{p.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </section>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-gray-500">The installed app opens in its own window, offline-caches the shell, and shows the Integrated EMIS icon on your home screen or desktop.</p>
      </div>
    </DialogShell>
  )
}

/* ------------------------------------------------------------------ */
/* Change password dialog                                              */
/* ------------------------------------------------------------------ */

function PortalDialog({ kind, user, onClose, onNavigate }: { kind: Exclude<DialogKind, null>; user: SafeUser; onClose: () => void; onNavigate: (m: string) => void }) {
  const [current, setCurrent] = React.useState('')
  const [next, setNext] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (next.length < 8) return toast.error('New password must be at least 8 characters.')
    if (next !== confirm) return toast.error('New passwords do not match.')
    setBusy(true)
    const response = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ currentPassword: current, newPassword: next }) })
    const body = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) return toast.error(body.error || 'Unable to update password.')
    toast.success('Password updated successfully.')
    onClose()
  }

  if (kind === 'tutorial') return <TutorialCenter onClose={onClose} onNavigate={onNavigate} />
  if (kind === 'manual') return <ManualDialog onClose={onClose} />
  if (kind === 'install') return <InstallDialog onClose={onClose} />

  return (
    <DialogShell title="Change Password - Dialog" onClose={onClose}>
      <form onSubmit={updatePassword} className="space-y-3 p-5">
        <label className="block text-sm">Current Password<input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="apex-input mt-1" required /></label>
        <label className="block text-sm">New Password<input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="apex-input mt-1" minLength={8} required /></label>
        <label className="block text-sm">Confirm Password<input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="apex-input mt-1" minLength={8} required /></label>
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="apex-btn">Cancel</button><button type="submit" disabled={busy} className="apex-btn apex-btn--primary">{busy ? 'Updating…' : 'Update Password'}</button></div>
      </form>
    </DialogShell>
  )
}

function formatRole(role: string): string {
  if (!role) return ''
  if (role === role.toUpperCase() && /[A-Z]/.test(role)) return role
  return role.split(/\s+/).map((word) => word ? word[0].toUpperCase() + word.slice(1) : word).join(' ')
}

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

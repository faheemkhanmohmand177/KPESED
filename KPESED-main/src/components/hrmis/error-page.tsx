'use client'

import * as React from 'react'
import { AlertTriangle, Search } from 'lucide-react'

interface ErrorPageProps {
  /**
   * Page title shown at top — defaults to "SCHOOL DETAIL" per the captured
   * structure for both Teachers Attendance Report and Employee Leaves Report.
   */
  title?: string
  /** Region heading inside the page (defaults to the title). */
  regionTitle?: string
  /** The Oracle error message — defaults to the captured one. */
  message?: string
  /** Whether to show the "Refresh Report" button (defaults to true). */
  showRefreshButton?: boolean
}

/**
 * Oracle APEX error page — faithfully reproduces the actual backend error
 * that appears on the real site's "Teachers Attendance Report" and
 * "Employee Leaves Report" pages.
 *
 * Real captured error message:
 *   ORA-00904: "A"."EMP_ID": invalid identifier
 *
 * Page structure (per SITE-STRUCTURE.md):
 *   Title: "SCHOOL DETAIL"
 *   Toolbar region:
 *     - Attendance Date picker
 *     - "Refresh Report" button
 *     - Search input
 *     - "Actions" button
 *   Error region (below):
 *     - red error box with the ORA-00904 message
 */
export function ErrorPage({
  title = 'SCHOOL DETAIL',
  regionTitle = 'SCHOOL DETAIL',
  message = 'ORA-00904: "A"."EMP_ID": invalid identifier',
  showRefreshButton = true,
}: ErrorPageProps) {
  const [date, setDate] = React.useState('')
  const [search, setSearch] = React.useState('')

  return (
    <div>
      <h1 className="mb-3 text-lg font-bold text-[#1565c0] sm:text-xl">{title}</h1>

      {/* Toolbar region */}
      <div className="apex-region">
        <div className="apex-region-header">
          <span>{regionTitle}</span>
        </div>
        <div className="apex-region-body flex flex-wrap items-end gap-3">
          <div>
            <label className="apex-form-label">Attendance Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="apex-input"
            />
          </div>
          {showRefreshButton && (
            <button type="button" className="apex-btn apex-btn--primary">
              Refresh Report
            </button>
          )}
          <div className="flex-1 min-w-[200px]">
            <label className="apex-form-label">Search</label>
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="apex-input"
            />
          </div>
          <button type="button" className="apex-btn">
            <Search className="h-3.5 w-3.5" /> Actions
          </button>
        </div>
      </div>

      {/* Error region — the actual ORA-00904 from the real site */}
      <div className="apex-region">
        <div className="apex-region-header">
          <span className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            Report Error
          </span>
        </div>
        <div className="apex-region-body">
          <div className="apex-error-box">{message}</div>
          <p className="mt-2 text-xs text-gray-500">
            This is the actual backend error returned by the real KPESE HRMIS
            site (iemis.kpese.gov.pk) for this report — faithfully reproduced
            here.
          </p>
        </div>
      </div>
    </div>
  )
}

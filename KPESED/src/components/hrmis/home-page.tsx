'use client'

import * as React from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { ROWS_PER_PAGE } from '@/lib/constants'

/**
 * Home/Dashboard page — faithfully matches 02-home.html (post-login landing).
 *
 * Captured structure (real iemis.kpese.gov.pk):
 *   <div role="region" aria-label="Dashboard" class="t-Region t-Region--noPadding
 *        t-Region--hideHeader t-Region--noBorder ...">
 *     <!-- header hidden, body empty -->
 *   </div>
 *   <div role="region" aria-label="<b class='blinking-text'>New EMIS Code List</b>"
 *        class="t-Region t-Region--hideShow ... is-collapsed">
 *     <div class="t-Region-header">
 *       <button class="t-Region-titleButton" aria-expanded="false">
 *         <b class="blinking-text">New EMIS Code List</b>
 *       </button>
 *     </div>
 *     <div class="t-Region-body a-Collapsible-content" style="display: none;">
 *       <!-- IRR toolbar + empty state -->
 *       <div class="a-IRR-toolbar">
 *         <button title="Select columns to search">...</button>
 *         <input title="Search Report" type="search">
 *         <button>Search</button>
 *         <select title="Rows">1/5/10/15/20/25/50/100/1000/All</select>
 *         <button>Actions</button>
 *       </div>
 *       <div class="a-IRR-noDataMsg">
 *         <span>New/Rejected EMIS Code List Data Not Found …!</span>
 *       </div>
 *     </div>
 *   </div>
 *
 * Behavior: starts collapsed (matches real site) — user clicks to expand it and
 * sees the IRR toolbar + empty-state message.
 */
export function HomePage() {
  // The real site starts with this region collapsed (is-collapsed).
  const [collapsed, setCollapsed] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [pageSize, setPageSize] = React.useState<string>('50')

  return (
    <div className="t-Body-contentInner">
      {/* Region 1: Dashboard (hidden header + empty body — present for ARIA but invisible) */}
      <div
        role="region"
        aria-label="Dashboard"
        className="t-Region t-Region--noPadding t-Region--hideHeader t-Region--noBorder t-Region--scrollBody t-Form--slimPadding margin-bottom-sm"
      >
        <div className="t-Region-header sr-only">
          <h2 className="t-Region-title">Dashboard</h2>
        </div>
        <div className="t-Region-bodyWrap">
          <div className="t-Region-body">
            {/* The real region body is empty */}
          </div>
        </div>
      </div>

      {/* Region 2: New EMIS Code List — collapsible, collapsed-by-default, blinking title */}
      <div
        role="region"
        aria-label="New EMIS Code List"
        className={`t-Region t-Region--hideShow t-Region--noPadding t-Region--hideShowIconsMath ${collapsed ? 'is-collapsed' : 'is-expanded'} i-h240 t-Region--accent1 t-Region--scrollBody margin-bottom-sm a-Collapsible js-apex-region`}
      >
        <div className="t-Region-header apex-region-header" style={{ background: '#f9f9f9' }}>
          <div className="t-Region-headerItems t-Region-headerItems--controls">
            <span className="t-Button t-Button--icon t-Button--hideShow inline-flex items-center">
              {collapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              )}
            </span>
          </div>
          <div className="t-Region-headerItems t-Region-headerItems--title flex-1">
            <h2 className="t-Region-title a-Collapsible-heading text-base">
              <button
                type="button"
                className="t-Region-titleButton bg-transparent p-0 cursor-pointer"
                aria-controls="new-emis-code-list-content"
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((v) => !v)}
              >
                <b className="blinking-text">New EMIS Code List</b>
              </button>
            </h2>
          </div>
          <div className="t-Region-headerItems t-Region-headerItems--buttons" />
        </div>

        {!collapsed && (
          <div
            id="new-emis-code-list-content"
            className="t-Region-body a-Collapsible-content apex-region-body"
            role="region"
            aria-hidden={collapsed}
          >
            <div className="a-IRR-container">
              {/* IRR toolbar — search + rows + actions */}
              <div
                role="search"
                aria-label="Search bar of New EMIS Code List"
                className="a-IRR-controls flex flex-wrap items-end gap-2 mb-2"
              >
                <button
                  type="button"
                  title="Select columns to search"
                  aria-label="Select columns to search"
                  className="apex-btn"
                >
                  Select columns to search
                </button>
                <div className="flex-1 min-w-[180px]">
                  <label className="apex-form-label">Search Report</label>
                  <input
                    type="search"
                    title="Search Report"
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="apex-input"
                  />
                </div>
                <button type="button" className="apex-btn apex-btn--primary">
                  Search
                </button>
                <div>
                  <label className="apex-form-label">Rows</label>
                  <select
                    title="Rows"
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="apex-select w-[80px] sm:w-[90px]"
                  >
                    {ROWS_PER_PAGE.map((v) => (
                      <option key={String(v)} value={String(v)}>{v}</option>
                    ))}
                  </select>
                </div>
                <button type="button" className="apex-btn">
                  Actions
                </button>
              </div>

              {/* Empty state — faithful message */}
              <div role="region" aria-label="Message" className="a-IRR-noDataMsg text-center py-10">
                <div className="a-IRR-noDataMsg-icon flex items-center justify-center mb-2">
                  <span className="text-4xl text-gray-300" aria-hidden>⚠</span>
                </div>
                <span className="a-IRR-noDataMsg-text text-sm text-gray-500 italic">
                  New/Rejected EMIS Code List Data Not Found …!
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

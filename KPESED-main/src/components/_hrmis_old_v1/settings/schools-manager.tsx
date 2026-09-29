'use client'

import * as React from 'react'
import { CrudManager } from './crud-manager'

// Schools need a district selector that loads from API, so we wrap and pre-load districts.
export function SchoolsManager() {
  const [districts, setDistricts] = React.useState<{ value: string; label: string }[]>([])

  React.useEffect(() => {
    fetch('/api/districts').then((r) => r.json()).then((d) => {
      setDistricts((d.items || []).map((x: any) => ({ value: x.id, label: x.name })))
    }).catch(console.error)
  }, [])

  return (
    <CrudManager
      config={{
        title: 'Schools',
        description: 'Manage registered educational institutions',
        apiBase: '/api/schools',
        itemNameField: 'name',
        fields: [
          { name: 'name', label: 'School Name', type: 'text', required: true, placeholder: 'e.g. Govt High School No.1' },
          { name: 'emisCode', label: 'EMIS Code', type: 'text', required: true, placeholder: 'e.g. PSH-001' },
          {
            name: 'schoolType', label: 'Type', type: 'select',
            options: [
              { value: 'primary', label: 'Primary' },
              { value: 'middle', label: 'Middle' },
              { value: 'high', label: 'High' },
              { value: 'higher_secondary', label: 'Higher Secondary' },
            ],
          },
          {
            name: 'gender', label: 'Gender', type: 'select',
            options: [
              { value: 'boys', label: 'Boys' },
              { value: 'girls', label: 'Girls' },
              { value: 'mixed', label: 'Mixed' },
            ],
          },
          { name: 'districtId', label: 'District', type: 'select', options: districts },
          { name: 'address', label: 'Address', type: 'textarea' },
          { name: 'establishedYear', label: 'Established Year', type: 'number' },
        ],
      }}
    />
  )
}

export default SchoolsManager

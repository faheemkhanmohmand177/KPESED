'use client'

import { CrudManager } from './crud-manager'

export function DistrictsManager() {
  return (
    <CrudManager
      config={{
        title: 'Districts',
        description: 'Manage administrative districts of KP',
        apiBase: '/api/districts',
        itemNameField: 'name',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Peshawar' },
          { name: 'code', label: 'Code', type: 'text', placeholder: 'e.g. PSH' },
          {
            name: 'region', label: 'Region', type: 'select',
            options: [
              { value: 'Central', label: 'Central' },
              { value: 'Northern', label: 'Northern' },
              { value: 'Southern', label: 'Southern' },
            ],
          },
        ],
      }}
    />
  )
}

export default DistrictsManager

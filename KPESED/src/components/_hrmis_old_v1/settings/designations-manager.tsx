'use client'

import { CrudManager } from './crud-manager'

export function DesignationsManager() {
  return (
    <CrudManager
      config={{
        title: 'Designations',
        description: 'Manage job designations and BPS scales',
        apiBase: '/api/designations',
        itemNameField: 'title',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Secondary School Teacher' },
          { name: 'bps', label: 'BPS', type: 'bps', required: true },
          {
            name: 'category', label: 'Category', type: 'select',
            options: [
              { value: 'teaching', label: 'Teaching' },
              { value: 'non_teaching', label: 'Non-Teaching' },
              { value: 'admin', label: 'Administrative' },
              { value: 'support', label: 'Support' },
            ],
          },
          { name: 'description', label: 'Description', type: 'textarea' },
        ],
      }}
    />
  )
}

export default DesignationsManager

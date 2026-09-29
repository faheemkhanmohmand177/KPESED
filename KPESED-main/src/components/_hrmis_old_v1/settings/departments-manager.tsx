'use client'

import { CrudManager } from './crud-manager'

export function DepartmentsManager() {
  return (
    <CrudManager
      config={{
        title: 'Departments',
        description: 'Manage organizational departments',
        apiBase: '/api/departments',
        itemNameField: 'name',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Education Department' },
          { name: 'code', label: 'Code', type: 'text', placeholder: 'e.g. EDU' },
          { name: 'description', label: 'Description', type: 'textarea' },
        ],
      }}
    />
  )
}

export default DepartmentsManager

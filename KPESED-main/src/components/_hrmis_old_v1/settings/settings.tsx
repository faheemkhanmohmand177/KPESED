'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Briefcase, MapPin, School, Users, Settings as SettingsIcon } from 'lucide-react'
import { DesignationsManager } from './designations-manager'
import { DepartmentsManager } from './departments-manager'
import { DistrictsManager } from './districts-manager'
import { SchoolsManager } from './schools-manager'
import { UsersManager } from './users-manager'
import type { SafeUser } from '@/lib/auth'

export function SettingsModule({ user }: { user: SafeUser }) {
  if (user.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <SettingsIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-lg font-semibold">Access Denied</p>
          <p className="text-sm text-muted-foreground">Only administrators can manage system settings.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage master data and user accounts.</p>
      </div>

      <Tabs defaultValue="designations">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="designations" className="gap-2"><Briefcase className="h-4 w-4" /> Designations</TabsTrigger>
          <TabsTrigger value="departments" className="gap-2"><Building2 className="h-4 w-4" /> Departments</TabsTrigger>
          <TabsTrigger value="districts" className="gap-2"><MapPin className="h-4 w-4" /> Districts</TabsTrigger>
          <TabsTrigger value="schools" className="gap-2"><School className="h-4 w-4" /> Schools</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Users</TabsTrigger>
        </TabsList>

        <TabsContent value="designations" className="mt-4">
          <DesignationsManager />
        </TabsContent>
        <TabsContent value="departments" className="mt-4">
          <DepartmentsManager />
        </TabsContent>
        <TabsContent value="districts" className="mt-4">
          <DistrictsManager />
        </TabsContent>
        <TabsContent value="schools" className="mt-4">
          <SchoolsManager />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UsersManager currentUser={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsModule

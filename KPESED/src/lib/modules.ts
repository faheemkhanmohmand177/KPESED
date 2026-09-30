import { flattenNav } from './portal-navigation'

export type ModuleStatus = 'built' | 'shell'

export interface ModuleMeta {
  id: string
  title: string
  parent: string
  status: ModuleStatus
}

export const MODULES: Record<string, ModuleMeta> = {
  home: { id: 'home', title: 'Dashboard', parent: 'Home', status: 'built' },
  'dps-rankings': { id: 'dps-rankings', title: 'DPS - Rankings', parent: 'District Performance ScoreCard', status: 'built' },
  ...Object.fromEntries(
    flattenNav().map((item) => [item.module, {
      id: item.module!,
      title: item.label,
      parent: item.parent,
      // Built modules: dedicated screens backed by real tables. Everything
      // else renders the faithful captured APEX workspace (real-modules.ts).
      status: [
        'office-school-list', 'employee-search', 'teacher-attendance',
        'students-search', 'student-data-uploading', 'target-student-enrolment',
        'daily-students-enrolment', 'students-class_update',
        'asset-profile', 'assets-detail', 'assets-report',
      ].includes(item.module!) ? ('built' as const) : ('shell' as const),
    }]),
  ),
}

export const MODULE_LIST: ModuleMeta[] = Object.values(MODULES)

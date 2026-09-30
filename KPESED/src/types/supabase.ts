/**
 * Supabase Database Type Definitions
 * Generated types for the HRMIS database schema (see /supabase/schema.sql)
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'admin' | 'hr' | 'dde' | 'deo' | 'employee'
export type GenderType = 'male' | 'female' | 'other'
export type EmployeeType = 'teaching' | 'non_teaching' | 'admin' | 'support'
export type EmployeeStatus = 'active' | 'inactive' | 'suspended' | 'retired' | 'resigned'
export type EmploymentType = 'permanent' | 'contract' | 'daily_wage' | 'ad_hoc'
export type LeaveType = 'casual' | 'sick' | 'earned' | 'maternity' | 'paternity' | 'hajj' | 'study' | 'without_pay'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'leave' | 'holiday'
export type TransferStatus = 'pending' | 'approved' | 'rejected' | 'completed'
export type PayrollStatus = 'draft' | 'processed' | 'paid' | 'cancelled'

export type DesignationLevel =
  | 'bps_01' | 'bps_05' | 'bps_07' | 'bps_09' | 'bps_11'
  | 'bps_12' | 'bps_14' | 'bps_15' | 'bps_16' | 'bps_17'
  | 'bps_18' | 'bps_19' | 'bps_20' | 'bps_21' | 'bps_22'

export interface Database {
  public: {
    Tables: {
      districts: {
        Row: { id: string; name: string; code: string; region: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; code: string; region?: string | null }
        Update: { name?: string; code?: string; region?: string | null }
      }
      tehsils: {
        Row: { id: string; district_id: string | null; name: string; code: string; created_at: string; updated_at: string }
        Insert: { id?: string; district_id?: string | null; name: string; code: string }
        Update: { district_id?: string | null; name?: string; code?: string }
      }
      schools: {
        Row: {
          id: string; emis_code: string; name: string; school_type: string | null; gender: string | null
          district_id: string | null; tehsil_id: string | null; address: string | null
          latitude: number | null; longitude: number | null; established_year: number | null
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; emis_code: string; name: string; school_type?: string | null; gender?: string | null
          district_id?: string | null; tehsil_id?: string | null; address?: string | null
          latitude?: number | null; longitude?: number | null; established_year?: number | null
        }
        Update: Partial<Database['public']['Tables']['schools']['Insert']>
      }
      designations: {
        Row: { id: string; title: string; bps: DesignationLevel; category: string | null; description: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; title: string; bps: DesignationLevel; category?: string | null; description?: string | null }
        Update: { title?: string; bps?: DesignationLevel; category?: string | null; description?: string | null }
      }
      departments: {
        Row: { id: string; name: string; code: string; description: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; code: string; description?: string | null }
        Update: { name?: string; code?: string; description?: string | null }
      }
      profiles: {
        Row: {
          id: string; username: string; full_name: string; email: string | null; cnic: string | null
          phone: string | null; role: UserRole; avatar_url: string | null
          designation_id: string | null; department_id: string | null; school_id: string | null
          district_id: string | null; is_active: boolean; last_login: string | null
          created_at: string; updated_at: string
        }
        Insert: {
          id: string; username: string; full_name: string; email?: string | null; cnic?: string | null
          phone?: string | null; role?: UserRole; avatar_url?: string | null
          designation_id?: string | null; department_id?: string | null; school_id?: string | null
          district_id?: string | null; is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      employees: {
        Row: {
          id: string; personal_no: string; emis_code: string | null; full_name: string
          father_name: string | null; husband_name: string | null; cnic: string
          date_of_birth: string | null; gender: GenderType; marital_status: string | null
          religion: string | null; nationality: string; blood_group: string | null
          email: string | null; phone: string | null; emergency_contact: string | null
          permanent_address: string | null; current_address: string | null
          employee_type: EmployeeType; employment_type: EmploymentType; status: EmployeeStatus
          designation_id: string | null; department_id: string | null; school_id: string | null
          district_id: string | null; tehsil_id: string | null; bps: DesignationLevel | null
          date_of_joining: string | null; date_of_retirement: string | null; date_of_appointment: string | null
          appointment_nature: string | null; qualification: string | null; specialization: string | null
          professional_qualification: string | null; experience_years: number | null
          bank_account_no: string | null; bank_name: string | null; bank_branch: string | null
          pension_account_no: string | null; disability: string | null; disability_percentage: number | null
          minority: boolean; photo_url: string | null; documents: Json | null; remarks: string | null
          created_by: string | null; created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['employees']['Row']> & {
          personal_no: string; full_name: string; cnic: string
        }
        Update: Partial<Database['public']['Tables']['employees']['Row']>
      }
      service_records: {
        Row: {
          id: string; employee_id: string; record_type: string | null
          from_designation_id: string | null; to_designation_id: string | null
          from_school_id: string | null; to_school_id: string | null
          from_bps: DesignationLevel | null; to_bps: DesignationLevel | null
          effective_date: string; order_no: string | null; order_date: string | null
          issuing_authority: string | null; remarks: string | null; document_url: string | null
          created_by: string | null; created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['service_records']['Row']> & {
          employee_id: string; effective_date: string
        }
        Update: Partial<Database['public']['Tables']['service_records']['Row']>
      }
      attendance: {
        Row: {
          id: string; employee_id: string; attendance_date: string
          status: AttendanceStatus; check_in: string | null; check_out: string | null
          remarks: string | null; marked_by: string | null; created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['attendance']['Row']> & {
          employee_id: string; attendance_date: string
        }
        Update: Partial<Database['public']['Tables']['attendance']['Row']>
      }
      leaves: {
        Row: {
          id: string; employee_id: string; leave_type: LeaveType
          from_date: string; to_date: string; no_of_days: number; reason: string
          status: LeaveStatus; applied_date: string; approved_date: string | null
          approved_by: string | null; rejection_reason: string | null; attachment_url: string | null
          remarks: string | null; created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['leaves']['Row']> & {
          employee_id: string; leave_type: LeaveType; from_date: string; to_date: string
          no_of_days: number; reason: string
        }
        Update: Partial<Database['public']['Tables']['leaves']['Row']>
      }
      leave_balances: {
        Row: {
          id: string; employee_id: string; year: number
          casual_total: number; casual_used: number; sick_total: number; sick_used: number
          earned_total: number; earned_used: number; maternity_total: number; maternity_used: number
          hajj_total: number; hajj_used: number; created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['leave_balances']['Row']> & {
          employee_id: string; year: number
        }
        Update: Partial<Database['public']['Tables']['leave_balances']['Row']>
      }
      transfers: {
        Row: {
          id: string; employee_id: string
          from_school_id: string | null; to_school_id: string | null
          from_district_id: string | null; to_district_id: string | null
          from_designation_id: string | null; to_designation_id: string | null
          transfer_type: string | null; reason: string; status: TransferStatus
          applied_date: string; approved_date: string | null; effective_date: string | null
          approved_by: string | null; order_no: string | null; order_date: string | null
          remarks: string | null; attachment_url: string | null; created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['transfers']['Row']> & {
          employee_id: string; reason: string
        }
        Update: Partial<Database['public']['Tables']['transfers']['Row']>
      }
      payroll: {
        Row: {
          id: string; employee_id: string; month: number; year: number
          basic_pay: number; house_rent_allowance: number; conveyance_allowance: number
          medical_allowance: number; adhoc_relief_allowance: number; special_allowance: number
          other_allowances: number; income_tax: number; gp_fund: number; insurance: number
          loan_recovery: number; eobi: number; other_deductions: number
          status: PayrollStatus; processed_date: string | null; paid_date: string | null
          bank_reference: string | null; remarks: string | null; created_by: string | null
          created_at: string; updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['payroll']['Row']> & {
          employee_id: string; month: number; year: number; basic_pay: number
        }
        Update: Partial<Database['public']['Tables']['payroll']['Row']>
      }
      notifications: {
        Row: {
          id: string; user_id: string; title: string; message: string
          type: string | null; category: string | null; is_read: boolean
          link: string | null; metadata: Json | null; created_at: string
        }
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & {
          user_id: string; title: string; message: string
        }
        Update: Partial<Database['public']['Tables']['notifications']['Row']>
      }
      audit_log: {
        Row: {
          id: string; user_id: string | null; action: string; entity: string
          entity_id: string | null; old_values: Json | null; new_values: Json | null
          ip_address: string | null; user_agent: string | null; created_at: string
        }
        Insert: Partial<Database['public']['Tables']['audit_log']['Row']> & {
          action: string; entity: string
        }
        Update: Partial<Database['public']['Tables']['audit_log']['Row']>
      }
    }
    Views: {
      vw_employee_summary: {
        Row: {
          district_name: string | null; school_name: string | null; designation: string | null
          employee_count: number; male_count: number; female_count: number
          active_count: number; teaching_count: number; non_teaching_count: number
        }
      }
      vw_leave_summary: {
        Row: {
          year: number; month: number; leave_type: string; status: string
          total_applications: number; total_days: number
        }
      }
      vw_payroll_summary: {
        Row: {
          year: number; month: number; status: string; employee_count: number
          total_basic: number; total_deductions: number; total_earnings: number; total_net_pay: number
        }
      }
      vw_attendance_summary: {
        Row: {
          attendance_date: string; district_id: string | null
          present_count: number; absent_count: number; late_count: number; leave_count: number
        }
      }
    }
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      gender_type: GenderType
      employee_type: EmployeeType
      employee_status: EmployeeStatus
      employment_type: EmploymentType
      leave_type: LeaveType
      leave_status: LeaveStatus
      attendance_status: AttendanceStatus
      transfer_status: TransferStatus
      payroll_status: PayrollStatus
      designation_level: DesignationLevel
    }
  }
}

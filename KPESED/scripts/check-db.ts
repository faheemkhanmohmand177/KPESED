import { db } from '../src/lib/db'

async function main() {
  const empCount = await db.employee.count()
  const userCount = await db.user.count()
  const desigCount = await db.designation.count()
  const schoolCount = await db.school.count()
  const districtCount = await db.district.count()
  const deptCount = await db.department.count()
  console.log('Employees:', empCount)
  console.log('Users:', userCount)
  console.log('Designations:', desigCount)
  console.log('Schools:', schoolCount)
  console.log('Districts:', districtCount)
  console.log('Departments:', deptCount)
  const admin = await db.user.findFirst({ where: { username: 'admin' } })
  console.log('Admin user exists:', !!admin)
  if (admin) console.log('Admin role:', admin.role)
}

main().catch(console.error).finally(() => db.$disconnect())

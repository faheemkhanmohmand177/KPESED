import { db } from '../src/lib/db'

async function main() {
  const emp = await db.employee.findFirst({
    include: { designation: true, district: true, school: true }
  })
  console.log(JSON.stringify(emp, null, 2))
  console.log('---')
  const desig = await db.designation.findMany({ take: 5 })
  console.log('Designations sample:', desig)
  console.log('---')
  const districts = await db.district.findMany({ take: 5 })
  console.log('Districts sample:', districts)
}

main().catch(console.error).finally(() => db.$disconnect())

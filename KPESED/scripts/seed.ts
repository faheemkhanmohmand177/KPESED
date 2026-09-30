import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding HRMIS Portal — reference data only (NO employees)')

  // 1. Admin user — Khan (user logs in with this)
  const adminPassword = await bcrypt.hash('112345678', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'Khan' },
    update: {
      role: 'Admin',
      emisCode: null,
      schoolName: null,
      district: null,
    },
    create: {
      username: 'Khan',
      password: adminPassword,
      fullName: 'Khan Administrator',
      email: 'admin@hrmis-portal.local',
      phone: '112345678',
      role: 'Admin',
    },
  })
  console.log(`  ✓ Admin user: ${admin.username} (${admin.role})`)

  // 2. Districts — KPK districts (reference data)
  const districts = [
    { name: 'MOHMAND', code: 'MHD', division: 'PESHAWAR', region: 'North' },
    { name: 'PESHAWAR', code: 'PSH', division: 'PESHAWAR', region: 'Central' },
    { name: 'MARDAN', code: 'MRD', division: 'MARDAN', region: 'Central' },
    { name: 'CHARSADDA', code: 'CHA', division: 'PESHAWAR', region: 'Central' },
    { name: 'NOWSHERA', code: 'NWR', division: 'PESHAWAR', region: 'Central' },
    { name: 'KOHAT', code: 'KHT', division: 'KOHAT', region: 'South' },
    { name: 'DERA ISMAIL KHAN', code: 'DIK', division: 'DIKHAN', region: 'South' },
    { name: 'BANNU', code: 'BNN', division: 'BANNU', region: 'South' },
    { name: 'ABBOTTABAD', code: 'ATD', division: 'HAZARA', region: 'Hazara' },
    { name: 'MANSEHRA', code: 'MNS', division: 'HAZARA', region: 'Hazara' },
    { name: 'SWAT', code: 'SWT', division: 'MALAKAND', region: 'North' },
    { name: 'DIR UPPER', code: 'DIR', division: 'MALAKAND', region: 'North' },
    { name: 'DIR LOWER', code: 'DLR', division: 'MALAKAND', region: 'North' },
    { name: 'CHITRAL', code: 'CHT', division: 'MALAKAND', region: 'North' },
    { name: 'BUNER', code: 'BNR', division: 'MALAKAND', region: 'North' },
    { name: 'SWABI', code: 'SWB', division: 'MARDAN', region: 'Central' },
    { name: 'BAJOUR', code: 'BJR', division: 'MALAKAND', region: 'North' },
    { name: 'KHYBER', code: 'KHB', division: 'PESHAWAR', region: 'North' },
    { name: 'KURRAM', code: 'KRM', division: 'KOHAT', region: 'South' },
    { name: 'ORAKZAI', code: 'ORK', division: 'KOHAT', region: 'South' },
    { name: 'NORTH WAZIRISTAN', code: 'NWZ', division: 'BANNU', region: 'South' },
    { name: 'SOUTH WAZIRISTAN', code: 'SWR', division: 'DIKHAN', region: 'South' },
    { name: 'HANGU', code: 'HNG', division: 'KOHAT', region: 'South' },
    { name: 'LAKKI MARWAT', code: 'LKM', division: 'BANNU', region: 'South' },
    { name: 'TANK', code: 'TNK', division: 'DIKHAN', region: 'South' },
    { name: 'TORGHAR', code: 'TRG', division: 'HAZARA', region: 'Hazara' },
    { name: 'KOLAI PALAS', code: 'KPL', division: 'HAZARA', region: 'Hazara' },
    { name: 'SHANGLA', code: 'SHG', division: 'MALAKAND', region: 'North' },
    { name: 'HARIPUR', code: 'HPU', division: 'HAZARA', region: 'Hazara' },
    { name: 'BATTAGRAM', code: 'BTG', division: 'HAZARA', region: 'Hazara' },
  ]

  const districtMap: Record<string, string> = {}
  for (const d of districts) {
    const district = await prisma.district.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    })
    districtMap[d.name] = district.id
  }
  console.log(`  ✓ ${districts.length} districts`)

  // 3. Tehsils
  const tehsils = [
    { name: 'UPPER MOHMAND', districtCode: 'MHD' },
    { name: 'LOWER MOHMAND', districtCode: 'MHD' },
    { name: 'PESHAWAR CITY', districtCode: 'PSH' },
    { name: 'PESHAWAR RURAL', districtCode: 'PSH' },
    { name: 'MARDAN', districtCode: 'MRD' },
    { name: 'SWAT', districtCode: 'SWT' },
    { name: 'ABBOTTABAD', districtCode: 'ATD' },
  ]
  const tehsilMap: Record<string, string> = {}
  for (const t of tehsils) {
    const existing = await prisma.tehsil.findUnique({ where: { name: t.name } })
    if (existing) {
      tehsilMap[t.name] = existing.id
    } else {
      const tehsil = await prisma.tehsil.create({
        data: { name: t.name, districtId: districtMap[t.districtCode] },
      })
      tehsilMap[t.name] = tehsil.id
    }
  }
  console.log(`  ✓ ${tehsils.length} tehsils`)

  // 4. Union Councils
  const ucs = [{ name: 'VC DURBA KHEL-1', tehsilName: 'UPPER MOHMAND', districtCode: 'MHD' }]
  const ucMap: Record<string, string> = {}
  for (const u of ucs) {
    const uc = await prisma.unionCouncil.create({
      data: { name: u.name, tehsilId: tehsilMap[u.tehsilName], districtId: districtMap[u.districtCode] },
    })
    ucMap[u.name] = uc.id
  }

  // 5. Designations — full BPS-1 to BPS-22 list (reference data)
  const designations = [
    { title: 'PST', bps: 12, category: 'Teaching', level: 'PRIMARY' },
    { title: 'CT', bps: 12, category: 'Teaching', level: 'MIDDLE' },
    { title: 'CT-IT', bps: 12, category: 'Teaching', level: 'MIDDLE' },
    { title: 'DM', bps: 14, category: 'Teaching', level: 'MIDDLE' },
    { title: 'AT', bps: 14, category: 'Teaching', level: 'MIDDLE' },
    { title: 'PET', bps: 14, category: 'Teaching', level: 'MIDDLE' },
    { title: 'TT', bps: 14, category: 'Teaching', level: 'MIDDLE' },
    { title: 'SST-GENERAL', bps: 16, category: 'Teaching', level: 'HIGH' },
    { title: 'SST-BIO', bps: 16, category: 'Teaching', level: 'HIGH' },
    { title: 'SUBJECT SPECIALIST', bps: 17, category: 'Teaching', level: 'HIGH' },
    { title: 'SENIOR SUBJECT SPECIALIST', bps: 18, category: 'Teaching', level: 'HIGHER SECONDARY' },
    { title: 'PRINCIPAL', bps: 19, category: 'Admin', level: 'HIGHER SECONDARY' },
    { title: 'HEADMASTER', bps: 18, category: 'Admin', level: 'HIGH' },
    { title: 'HEADMISTRESS', bps: 18, category: 'Admin', level: 'HIGH' },
    { title: 'SENIOR HEADMASTER', bps: 19, category: 'Admin', level: 'HIGHER SECONDARY' },
    { title: 'DEO', bps: 19, category: 'Admin', level: 'DISTRICT' },
    { title: 'DDEO', bps: 18, category: 'Admin', level: 'DISTRICT' },
    { title: 'ADEO', bps: 17, category: 'Admin', level: 'DISTRICT' },
    { title: 'DIRECTOR', bps: 20, category: 'Admin', level: 'PROVINCIAL' },
    { title: 'CLERK', bps: 11, category: 'Non-Teaching', level: 'OFFICE' },
    { title: 'SENIOR CLERK', bps: 14, category: 'Non-Teaching', level: 'OFFICE' },
    { title: 'JUNIOR CLERK', bps: 7, category: 'Non-Teaching', level: 'OFFICE' },
    { title: 'COMPUTER OPERATOR', bps: 12, category: 'Non-Teaching', level: 'OFFICE' },
    { title: 'ACCOUNTANT', bps: 14, category: 'Non-Teaching', level: 'OFFICE' },
    { title: 'NAIB QASID', bps: 5, category: 'Support', level: 'OFFICE' },
    { title: 'BEARER', bps: 1, category: 'Support', level: 'OFFICE' },
    { title: 'SWEEPER', bps: 1, category: 'Support', level: 'OFFICE' },
    { title: 'CHOWKIDAR', bps: 1, category: 'Support', level: 'OFFICE' },
    { title: 'MALI', bps: 1, category: 'Support', level: 'OFFICE' },
  ]
  const designationMap: Record<string, string> = {}
  for (const d of designations) {
    const existing = await prisma.designation.findUnique({ where: { title: d.title } })
    if (existing) {
      designationMap[d.title] = existing.id
    } else {
      const des = await prisma.designation.create({ data: d })
      designationMap[d.title] = des.id
    }
  }
  console.log(`  ✓ ${designations.length} designations`)

  // 6. Notifications — welcome only
  await prisma.notification.createMany({
    data: [
      { userId: admin.id, title: 'Welcome to HRMIS Portal', message: 'You have successfully logged in. Use the sidebar to navigate to Employee Profiles and add your staff.', type: 'success', category: 'system', isRead: false, link: '/home' },
    ],
  })

  console.log('\n✅ Seed completed successfully!')
  console.log('🔐 Login credentials:')
  console.log('   Username: Khan')
  console.log('   Password: 112345678')
  console.log('\n📋 Reference data loaded (districts, designations, tehsils)')
  console.log('   → NO employees seeded — add them yourself via Supabase or the UI')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

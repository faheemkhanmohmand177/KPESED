import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const elevatedRoles = new Set(['Admin', 'DEO', 'DDEO'])

function scopedEmis(user: Awaited<ReturnType<typeof getCurrentUser>>, requested?: string | null) {
  if (!user) return null
  return elevatedRoles.has(user.role) ? (requested?.trim() || null) : user.emisCode
}

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const view = url.searchParams.get('view') || 'profile'
  const search = url.searchParams.get('search')?.trim() || ''
  const emisCode = scopedEmis(user, url.searchParams.get('emisCode'))
  const assetType = url.searchParams.get('type')?.trim() || ''
  const category = url.searchParams.get('category')?.trim() || ''
  const assetName = url.searchParams.get('assetName')?.trim() || ''

  if (view === 'lookups') {
    const [districts, schools, types, categories, names] = await Promise.all([
      db.district.findMany({ select: { name: true }, orderBy: { name: 'asc' }, take: 500 }),
      db.school.findMany({ where: emisCode ? { emisCode } : undefined, select: { emisCode: true, name: true, gender: true, schoolType: true }, orderBy: { name: 'asc' }, take: 500 }),
      db.asset.findMany({ select: { assetType: true }, distinct: ['assetType'], orderBy: { assetType: 'asc' }, take: 50 }),
      db.asset.findMany({ where: assetType ? { assetType } : undefined, select: { category: true }, distinct: ['category'], orderBy: { category: 'asc' }, take: 200 }),
      db.asset.findMany({ where: { ...(assetType ? { assetType } : {}), ...(category ? { category } : {}) }, select: { assetName: true }, distinct: ['assetName'], orderBy: { assetName: 'asc' }, take: 500 }),
    ])
    return NextResponse.json({
      districts: districts.map((x) => x.name),
      schools,
      types: types.map((x) => x.assetType),
      categories: categories.map((x) => x.category).filter(Boolean),
      assetNames: names.map((x) => x.assetName),
    })
  }

  const where = {
    ...(emisCode ? { emisCode } : {}),
    ...(assetType ? { assetType } : {}),
    ...(category ? { category } : {}),
    ...(assetName ? { assetName } : {}),
  }
  const all = await db.asset.findMany({ where, orderBy: [{ purchaseDate: 'desc' }, { assetName: 'asc' }], take: 5000 })
  const needle = search.toLowerCase()
  const filtered = needle ? all.filter((asset) => JSON.stringify(asset).toLowerCase().includes(needle)) : all

  if (view === 'details') {
    return NextResponse.json({ total: filtered.length, records: filtered.map((asset) => ({
      id: asset.id, serialNumber: asset.assetCode || asset.id.slice(0, 8), assetCode: asset.assetCode, assetName: asset.assetName,
      assetType: asset.assetType, category: asset.category, availability: asset.availability, status: asset.status,
    })) })
  }
  if (view === 'report') {
    return NextResponse.json({ total: filtered.length, records: filtered.map((asset) => ({
      id: asset.id, district: asset.district, schoolName: asset.schoolName, schoolLevel: null, emisCode: asset.emisCode,
      schoolGender: asset.schoolGender, assetType: asset.assetType, category: asset.category, assetName: asset.assetName,
      status: asset.status, totalAsset: asset.quantity,
    })) })
  }
  return NextResponse.json({ total: filtered.length, records: filtered })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const requestedEmis = typeof body?.emisCode === 'string' ? body.emisCode.trim() : ''
  const emisCode = scopedEmis(user, requestedEmis)
  if (!emisCode) return NextResponse.json({ error: 'A school EMIS code is required.' }, { status: 400 })
  const school = await db.school.findUnique({ where: { emisCode } })
  if (!school) return NextResponse.json({ error: 'School not found.' }, { status: 404 })
  const assetName = typeof body?.assetName === 'string' ? body.assetName.trim() : ''
  const assetType = typeof body?.assetType === 'string' ? body.assetType.trim() : ''
  const quantity = Number(body?.quantity)
  if (!assetName || !['CONSUMABLE', 'FIXED/MOVABLE'].includes(assetType) || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ error: 'Asset Name, Type, and a positive whole Quantity are required.' }, { status: 400 })
  }
  const asset = await db.asset.create({ data: {
    schoolId: school.id, emisCode, schoolName: school.name, district: user.district || null, schoolGender: school.gender,
    assetCode: typeof body?.assetCode === 'string' && body.assetCode.trim() ? body.assetCode.trim() : `ASSET-${emisCode}-${Date.now()}`,
    assetName, assetType, category: typeof body?.category === 'string' ? body.category.trim() || null : null,
    donatedBy: typeof body?.donatedBy === 'string' ? body.donatedBy.trim() || null : null,
    purchaseDate: body?.purchaseDate ? new Date(body.purchaseDate) : new Date(), quantity,
    status: body?.status === 'NON-FUNCTIONAL' ? 'NON-FUNCTIONAL' : 'FUNCTIONAL',
    availability: ['ISSUED', 'DEPLETED'].includes(body?.availability) ? body.availability : 'AVAILABLE', createdById: user.id,
  } })
  return NextResponse.json({ asset }, { status: 201 })
}

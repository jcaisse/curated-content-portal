import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const buildInfoPath = path.join(process.cwd(), 'public', 'build-info.json')
    let info: any = { sha: 'unknown', builtAt: null }
    if (fs.existsSync(buildInfoPath)) {
      const fileContent = fs.readFileSync(buildInfoPath, 'utf8')
      info = JSON.parse(fileContent)
    }
    return NextResponse.json({ ...info, serverTime: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ sha: 'unknown', error: 'read-failed' }, { status: 200 })
  }
}







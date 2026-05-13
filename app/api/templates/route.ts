import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'public', 'templates')
    
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true })
      return NextResponse.json({ images: [] })
    }

    const files = fs.readdirSync(templatesDir)
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)
    })

    const images = imageFiles.map(file => ({
      name: file,
      path: `/templates/${file}`
    }))

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error reading templates:', error)
    return NextResponse.json({ images: [] })
  }
}

import type { FontOptions } from '@miconfont/convert'
import { Buffer } from 'node:buffer'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import serveStatic from '@fastify/static'
import { convertComponents, convertFont } from '@miconfont/convert'
import archiver from 'archiver'
import fastify from 'fastify'
import { getExtname, scanSvgFilePaths } from './utils'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distPath = join(__dirname, '../..', 'client/dist')

const server = fastify({
  logger: true,
})

server.register(serveStatic, {
  root: distPath,
  prefix: '/',
})

server.post('/scan', async (request) => {
  try {
    const iconList = await scanSvgFilePaths((request.body as any).inputPath)
    const font = await convertFont(iconList, request.body as any)
    const ttfBase64 = Buffer.from(font.fontBuffer.ttf).toString('base64')
    const woffBase64 = Buffer.from(font.fontBuffer.woff).toString('base64')
    const woff2Base64 = Buffer.from(font.fontBuffer.woff2).toString('base64')
    return { success: true, iconList, css: font.cssString, ttfBase64, woffBase64, woff2Base64 }
  }
  catch (error) {
    return { success: false, iconList: [], error }
  }
})

server.post('/exportFont', async (request, reply) => {
  const iconList = await scanSvgFilePaths((request.body as any).inputPath)
  const font = await convertFont(iconList, request.body as any)

  const archive = archiver('zip', {
    zlib: { level: 9 },
  })

  archive.append(font.fontBuffer.ttf, { name: `${(request.body as FontOptions).name}.ttf` })
  archive.append(font.fontBuffer.woff, { name: `${(request.body as FontOptions).name}.woff` })
  archive.append(font.fontBuffer.woff2, { name: `${(request.body as FontOptions).name}.woff2` })
  archive.append(font.cssString, { name: `${(request.body as FontOptions).name}.css` })

  reply.raw.setHeader('Content-Type', 'application/zip')
  reply.raw.setHeader('Content-Disposition', `attachment; filename=${(request.body as FontOptions).name}.zip`)

  archive.pipe(reply.raw)
  archive.finalize()

  archive.on('finish', () => {
    reply.raw.end()
  })
  archive.on('error', () => {
    reply.code(500).send({ error: 'Failed to generate ZIP archive' })
  })
})

server.post('/exportComponent', async (request, reply) => {
  const options = request.body as any
  const iconList = await scanSvgFilePaths(options.inputPath)
  const components = await convertComponents(iconList, options)
  const ext = options.extname || getExtname(options.framework)

  const archive = archiver('zip', {
    zlib: { level: 9 },
  })
  components.forEach((component) => {
    archive.append(component.componentContent, { name: `${component.name}.${ext}` })
  })

  reply.raw.setHeader('Content-Type', 'application/zip')
  reply.raw.setHeader('Content-Disposition', `attachment; filename=components.zip`)

  archive.pipe(reply.raw)
  archive.finalize()

  archive.on('finish', () => {
    reply.raw.end()
  })
  archive.on('error', () => {
    reply.code(500).send({ error: 'Failed to generate ZIP archive' })
  })
})

async function start() {
  server.listen({
    port: 80,
    host: '0.0.0.0',
  }, (err, address) => {
    if (err) {
      server.log.error(err)
      process.exit(1)
    }
    console.log(`Server running at ${address}`)
  })
}

start()

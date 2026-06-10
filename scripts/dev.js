import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const isWindows = process.platform === 'win32'
const viteBin = resolve('node_modules', 'vite', 'bin', 'vite.js')
const apiPort = Number(process.env.PORT ?? 8787)
const vitePort = 3000

function runProcess(command, args) {
  try {
    const { execFileSync } = require('node:child_process')
    return execFileSync(command, args, { encoding: 'utf8' })
  } catch {
    return ''
  }
}

function getListeningPids(port) {
  if (isWindows) {
    const output = runProcess('netstat', ['-ano', '-p', 'TCP'])
    if (!output) return []
    const lines = output.split(/\r?\n/)
    const pids = new Set()
    for (const line of lines) {
      const trimmed = line.trim()
      const match = trimmed.match(
        new RegExp(`^TCP\\s+[^\\s]+\\:${port}\\s+[^\\s]+\\s+LISTENING\\s+(\\d+)$`),
      )
      if (match) {
        pids.add(match[1])
      }
    }
    return Array.from(pids)
  }

  return runProcess('lsof', [
    '-tiTCP:' + String(port),
    '-sTCP:LISTEN',
    '-n',
    '-P',
  ])
    .split(/\s+/)
    .filter(Boolean)
}

function getCommand(pid) {
  if (isWindows) {
    const output = runProcess('wmic', [
      'process',
      'where',
      `ProcessId=${pid}`,
      'get',
      'CommandLine',
      '/value',
    ])
    return output.replace(/^CommandLine=/, '').trim()
  }

  return runProcess('ps', ['-p', pid, '-o', 'command=']).trim()
}

function releaseStalePort(port, expectedCommandPart, label) {
  for (const pid of getListeningPids(port)) {
    const command = getCommand(pid)

    if (!command.includes(expectedCommandPart)) {
      console.error(
        `[node] Port ${port} is already used by another process: ${
          command || pid
        }`,
      )
      process.exit(1)
    }

    console.info(`[node] Stopping stale ${label} on port ${port} (pid ${pid})`)
    try {
      process.kill(Number(pid), 'SIGTERM')
    } catch {
      // Process may have already exited.
    }
  }
}

releaseStalePort(apiPort, 'server/index.js', 'API server')
releaseStalePort(vitePort, 'vite', 'Vite server')

const processes = [
  spawn(process.execPath, ['server/index.js'], { stdio: 'inherit' }),
  spawn(process.execPath, [viteBin], { stdio: 'inherit' }),
]

function stopAll(exitCode = 0) {
  for (const child of processes) {
    if (!child.killed) {
      child.kill()
    }
  }

  process.exit(exitCode)
}

for (const child of processes) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      stopAll(code)
    }
  })
}

process.on('SIGINT', () => stopAll(0))
process.on('SIGTERM', () => stopAll(0))

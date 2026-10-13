<script setup lang="ts">
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import bashIcon from 'simple-icons/icons/gnubash.svg?raw'
import cIcon from 'simple-icons/icons/c.svg?raw'
import cppIcon from 'simple-icons/icons/cplusplus.svg?raw'
import csharpIcon from 'simple-icons/icons/dotnet.svg?raw'
import cssIcon from 'simple-icons/icons/css.svg?raw'
import dockerIcon from 'simple-icons/icons/docker.svg?raw'
import goIcon from 'simple-icons/icons/go.svg?raw'
import htmlIcon from 'simple-icons/icons/html5.svg?raw'
import javaIcon from 'simple-icons/icons/openjdk.svg?raw'
import javascriptIcon from 'simple-icons/icons/javascript.svg?raw'
import jsonIcon from 'simple-icons/icons/json.svg?raw'
import kotlinIcon from 'simple-icons/icons/kotlin.svg?raw'
import luaIcon from 'simple-icons/icons/lua.svg?raw'
import markdownIcon from 'simple-icons/icons/markdown.svg?raw'
import phpIcon from 'simple-icons/icons/php.svg?raw'
import pythonIcon from 'simple-icons/icons/python.svg?raw'
import rubyIcon from 'simple-icons/icons/ruby.svg?raw'
import rustIcon from 'simple-icons/icons/rust.svg?raw'
import sassIcon from 'simple-icons/icons/sass.svg?raw'
import svelteIcon from 'simple-icons/icons/svelte.svg?raw'
import swiftIcon from 'simple-icons/icons/swift.svg?raw'
import typescriptIcon from 'simple-icons/icons/typescript.svg?raw'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import lua from 'highlight.js/lib/languages/lua'
import makefile from 'highlight.js/lib/languages/makefile'
import markdown from 'highlight.js/lib/languages/markdown'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import scss from 'highlight.js/lib/languages/scss'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import 'highlight.js/styles/github.css'
import {
  Check, ChevronDown, ChevronRight, CircleAlert, Clock3, Code2, Copy, Eye,
  ExternalLink, FileImage, FileText, Folder,
  FolderOpen, HardDrive, LoaderCircle, LogOut, RefreshCw, Search,
  ShieldCheck, Star, X
} from '@lucide/vue'

type Repository = {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  default_branch: string
  stargazers_count: number
  language: string | null
  private: boolean
  owner: { login: string; avatar_url: string }
}

type TreeEntry = {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url: string
}

type ExplorerItem = {
  name: string
  path: string
  type: 'file' | 'dir'
  size: number
  sha?: string
  url?: string
}

type GitHubUser = {
  login: string
  avatar_url: string
  html_url: string
}

type Toast = { id: number; message: string; kind: 'success' | 'error' | 'info' }
type DependencyPullRequest = { number: number; title: string; html_url: string; user: { login: string } }
type OutdatedDependency = { name: string; current: string; latest: string; manifestPath: string }

for (const [name, language] of Object.entries({ bash, c, cpp, csharp, css, dockerfile, go, java, javascript, json, kotlin, lua, makefile, markdown, php, python, ruby, rust, scss, sql, swift, typescript, xml, yaml })) {
  hljs.registerLanguage(name, language)
}

const repositoryUrl = ref('')
const repositoryInput = ref<HTMLInputElement | null>(null)
const repository = shallowRef<Repository | null>(null)
const tree = ref<TreeEntry[]>([])
const currentPath = ref('')
const filterText = ref('')
const activeFile = shallowRef<ExplorerItem | null>(null)
const previewText = ref('')
const previewHtml = ref('')
const previewImage = ref('')
const websiteDocument = ref('')
const htmlPreviewMode = ref<'website' | 'source'>('website')
const previewError = ref('')
const previewLoading = ref(false)
const loadingRepository = ref(false)
const copyingRepository = ref(false)
const selectionMode = ref(false)
const selectedPaths = ref<string[]>([])
const deletingFiles = ref(false)
const configuringDependencies = ref(false)
const loadingDependencyPullRequests = ref(false)
const dependencyPullRequestsLoaded = ref(false)
const dependencyPullRequests = ref<DependencyPullRequest[]>([])
const scanningDependencies = ref(false)
const dependencyScanComplete = ref(false)
const outdatedDependencies = ref<OutdatedDependency[]>([])
const createdPullRequest = shallowRef<{ title: string; url: string } | null>(null)
const copyUrl = ref('')
const copyLinkLabel = ref('Open your independent copy')
const copyProgress = ref('')
const token = ref('')
const tokenInput = ref('')
const user = shallowRef<GitHubUser | null>(null)
const userRepositories = ref<Repository[]>([])
const refreshingProfile = ref(false)
const showAuth = ref(false)
const showRepositoryPicker = ref(false)
const repositorySearch = ref('')
const toasts = ref<Toast[]>([])
const rateLimit = ref('GitHub API ready')
let toastId = 0

const apiBase = 'https://api.github.com'

const visibleItems = computed<ExplorerItem[]>(() => {
  if (!repository.value) return []
  const prefix = currentPath.value ? `${currentPath.value}/` : ''
  const children = new Map<string, ExplorerItem>()

  for (const entry of tree.value) {
    if (!entry.path.startsWith(prefix)) continue
    const remainder = entry.path.slice(prefix.length)
    if (!remainder) continue
    const slash = remainder.indexOf('/')
    if (slash >= 0) {
      const name = remainder.slice(0, slash)
      children.set(name, { name, path: `${prefix}${name}`, type: 'dir', size: 0 })
    } else if (entry.type === 'blob') {
      children.set(remainder, {
        name: remainder,
        path: entry.path,
        type: 'file',
        size: entry.size || 0,
        sha: entry.sha,
        url: entry.url
      })
    }
  }

  return [...children.values()]
    .filter(item => item.name.toLowerCase().includes(filterText.value.trim().toLowerCase()))
    .sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1)
})

const breadcrumbs = computed(() => {
  const parts = currentPath.value.split('/').filter(Boolean)
  return parts.map((label, index) => ({ label, path: parts.slice(0, index + 1).join('/') }))
})

const filteredRepositories = computed(() => {
  const query = repositorySearch.value.trim().toLowerCase()
  return userRepositories.value.filter(repo => repo.full_name.toLowerCase().includes(query))
})

const dependencyEcosystems = computed(() => {
  const entries: Array<{ ecosystem: string; directory: string }> = []
  const add = (ecosystem: string, filePath: string) => {
    const parent = filePath.includes('/') ? filePath.slice(0, filePath.lastIndexOf('/')) : ''
    const directory = parent ? `/${parent}` : '/'
    if (!entries.some(entry => entry.ecosystem === ecosystem && entry.directory === directory)) entries.push({ ecosystem, directory })
  }

  for (const entry of tree.value) {
    if (entry.type !== 'blob') continue
    const path = entry.path.toLowerCase()
    const name = path.split('/').pop() || ''
    if (name === 'package.json') add('npm', entry.path)
    else if (/^(requirements.*\.txt|pyproject\.toml|setup\.py)$/.test(name)) add('pip', entry.path)
    else if (name === 'go.mod') add('gomod', entry.path)
    else if (name === 'cargo.toml') add('cargo', entry.path)
    else if (name === 'gemfile') add('bundler', entry.path)
    else if (name === 'composer.json') add('composer', entry.path)
    else if (name === 'pom.xml') add('maven', entry.path)
    else if (/^build\.gradle(\.kts)?$/.test(name)) add('gradle', entry.path)
    else if (/\.csproj$/.test(name)) add('nuget', entry.path)
    else if (/^dockerfile(\..+)?$/.test(name)) add('docker', entry.path)
    else if (/\.tf$/.test(name)) add('terraform', entry.path)
    else if (path.startsWith('.github/workflows/') && /\.ya?ml$/.test(name)) add('github-actions', '.github/workflows/workflow.yml')
  }
  return entries
})

const hasDependabotConfig = computed(() => tree.value.some(entry => ['.github/dependabot.yml', '.github/dependabot.yaml'].includes(entry.path)))

const dependabotConfig = computed(() => [
  'version: 2',
  'updates:',
  ...dependencyEcosystems.value.flatMap(({ ecosystem, directory }) => [
    `  - package-ecosystem: "${ecosystem}"`,
    `    directory: "${directory}"`,
    '    schedule:',
    '      interval: "weekly"',
    '    open-pull-requests-limit: 10'
  ])
].join('\n') + '\n')

const fileKind = computed(() => {
  const name = activeFile.value?.name.toLowerCase() || ''
  if (/\.(png|jpe?g|gif|webp|svg|ico|avif)$/.test(name)) return 'image'
  if (/\.(md|markdown)$/.test(name) || ['readme', 'changelog'].includes(name)) return 'markdown'
  if (/\.html?$/.test(name)) return 'html'
  if (['dockerfile', 'makefile'].includes(name)) return 'code'
  if (/\.(txt|log|csv|env|gitignore|ya?ml|toml|xml|json|css|scss|js|jsx|mjs|cjs|ts|tsx|mts|cts|py|pyw|java|c|cc|cpp|cxx|h|hpp|hxx|cs|go|rs|sh|bash|sql|kt|swift|lua|php|rb|vue|svelte)$/.test(name)) return 'code'
  return 'binary'
})

type LanguageInfo = { label: string; mark: string; slug: string; highlight: string | null }

const languageMap: Record<string, LanguageInfo> = {
  bash: { label: 'Bash', mark: '$', slug: 'bash', highlight: 'bash' },
  bashrc: { label: 'Bash', mark: '$', slug: 'bash', highlight: 'bash' },
  c: { label: 'C', mark: 'C', slug: 'c', highlight: 'c' },
  cc: { label: 'C++', mark: 'C+', slug: 'cpp', highlight: 'cpp' },
  cjs: { label: 'JavaScript', mark: 'JS', slug: 'javascript', highlight: 'javascript' },
  cpp: { label: 'C++', mark: 'C+', slug: 'cpp', highlight: 'cpp' },
  cts: { label: 'TypeScript', mark: 'TS', slug: 'typescript', highlight: 'typescript' },
  cs: { label: 'C#', mark: 'C#', slug: 'csharp', highlight: 'csharp' },
  cxx: { label: 'C++', mark: 'C+', slug: 'cpp', highlight: 'cpp' },
  css: { label: 'CSS', mark: '3', slug: 'css', highlight: 'css' },
  dockerfile: { label: 'Dockerfile', mark: 'D', slug: 'docker', highlight: 'dockerfile' },
  go: { label: 'Go', mark: 'Go', slug: 'go', highlight: 'go' },
  h: { label: 'C', mark: 'C', slug: 'c', highlight: 'c' },
  hpp: { label: 'C++', mark: 'C+', slug: 'cpp', highlight: 'cpp' },
  hxx: { label: 'C++', mark: 'C+', slug: 'cpp', highlight: 'cpp' },
  html: { label: 'HTML', mark: '5', slug: 'html', highlight: 'xml' },
  htm: { label: 'HTML', mark: '5', slug: 'html', highlight: 'xml' },
  java: { label: 'Java', mark: 'J', slug: 'java', highlight: 'java' },
  js: { label: 'JavaScript', mark: 'JS', slug: 'javascript', highlight: 'javascript' },
  jsx: { label: 'React JSX', mark: 'JS', slug: 'javascript', highlight: 'javascript' },
  json: { label: 'JSON', mark: '{}', slug: 'json', highlight: 'json' },
  kt: { label: 'Kotlin', mark: 'K', slug: 'kotlin', highlight: 'kotlin' },
  lua: { label: 'Lua', mark: 'Lu', slug: 'lua', highlight: 'lua' },
  make: { label: 'Makefile', mark: 'Mk', slug: 'makefile', highlight: 'makefile' },
  makefile: { label: 'Makefile', mark: 'Mk', slug: 'makefile', highlight: 'makefile' },
  md: { label: 'Markdown', mark: 'M↓', slug: 'markdown', highlight: 'markdown' },
  mjs: { label: 'JavaScript', mark: 'JS', slug: 'javascript', highlight: 'javascript' },
  mts: { label: 'TypeScript', mark: 'TS', slug: 'typescript', highlight: 'typescript' },
  php: { label: 'PHP', mark: 'php', slug: 'php', highlight: 'php' },
  py: { label: 'Python', mark: 'Py', slug: 'python', highlight: 'python' },
  pyw: { label: 'Python', mark: 'Py', slug: 'python', highlight: 'python' },
  readme: { label: 'Markdown', mark: 'M↓', slug: 'markdown', highlight: 'markdown' },
  changelog: { label: 'Markdown', mark: 'M↓', slug: 'markdown', highlight: 'markdown' },
  rb: { label: 'Ruby', mark: 'Rb', slug: 'ruby', highlight: 'ruby' },
  rs: { label: 'Rust', mark: 'Rs', slug: 'rust', highlight: 'rust' },
  scss: { label: 'SCSS', mark: 'S', slug: 'sass', highlight: 'scss' },
  sh: { label: 'Shell', mark: '$', slug: 'bash', highlight: 'bash' },
  sql: { label: 'SQL', mark: 'DB', slug: 'sql', highlight: 'sql' },
  svg: { label: 'SVG', mark: '◇', slug: 'html', highlight: 'xml' },
  swift: { label: 'Swift', mark: 'S', slug: 'swift', highlight: 'swift' },
  svelte: { label: 'Svelte', mark: 'S', slug: 'vue', highlight: 'xml' },
  ts: { label: 'TypeScript', mark: 'TS', slug: 'typescript', highlight: 'typescript' },
  tsx: { label: 'React TSX', mark: 'TS', slug: 'typescript', highlight: 'typescript' },
  txt: { label: 'Plain text', mark: 'TXT', slug: 'text', highlight: null },
  xml: { label: 'XML', mark: '<>', slug: 'html', highlight: 'xml' },
  yaml: { label: 'YAML', mark: 'Y', slug: 'yaml', highlight: 'yaml' },
  yml: { label: 'YAML', mark: 'Y', slug: 'yaml', highlight: 'yaml' },
  vue: { label: 'Vue', mark: 'V', slug: 'vue', highlight: 'xml' },
}

const languageInfo = computed<LanguageInfo>(() => {
  const name = activeFile.value?.name.toLowerCase() || ''
  const extension = name.includes('.') ? name.split('.').pop() || '' : name
  const language = languageMap[extension] || { label: 'Plain text', mark: 'TXT', slug: 'text', highlight: null }
  return language.highlight && !hljs.getLanguage(language.highlight)
    ? { ...language, highlight: null }
    : language
})

const languageIcons: Record<string, string> = {
  bash: bashIcon,
  c: cIcon,
  cpp: cppIcon,
  csharp: csharpIcon,
  css: cssIcon,
  docker: dockerIcon,
  go: goIcon,
  html: htmlIcon,
  java: javaIcon,
  javascript: javascriptIcon,
  json: jsonIcon,
  kotlin: kotlinIcon,
  lua: luaIcon,
  markdown: markdownIcon,
  php: phpIcon,
  python: pythonIcon,
  ruby: rubyIcon,
  rust: rustIcon,
  sass: sassIcon,
  svelte: svelteIcon,
  swift: swiftIcon,
  typescript: typescriptIcon,
}

const languageBrandColors: Record<string, string> = {
  bash: '#4eaa25', c: '#536a8c', cpp: '#00599c', csharp: '#512bd4',
  css: '#663399', docker: '#2496ed', go: '#00add8', html: '#e34f26',
  java: '#ed8b00', javascript: '#d8b900', json: '#626d78', kotlin: '#7f52ff',
  lua: '#000080', markdown: '#4b5563', php: '#777bb4', python: '#3776ab',
  ruby: '#cc342d', rust: '#8d4a36', sass: '#cc6699', svelte: '#ff3e00',
  swift: '#f05138', typescript: '#3178c6',
}

const languageIconSvg = computed(() => languageIcons[languageInfo.value.slug] || '')

const highlightedCode = computed(() => {
  if (!languageInfo.value.highlight) return ''
  try {
    const html = hljs.highlight(previewText.value, { language: languageInfo.value.highlight }).value
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['span'], ALLOWED_ATTR: ['class'] })
  } catch {
    return ''
  }
})

function notify(message: string, kind: Toast['kind'] = 'info') {
  const id = ++toastId
  toasts.value.push({ id, message, kind })
  window.setTimeout(() => { toasts.value = toasts.value.filter(toast => toast.id !== id) }, 4200)
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function parseVersion(value: string) {
  const match = value.trim().match(/^[v=~^<>\s]*(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/)
  return match ? { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]), prerelease: Boolean(match[4]) } : null
}

function versionIsNewer(candidate: string, current: string) {
  const next = parseVersion(candidate)
  const installed = parseVersion(current)
  if (!next || !installed) return false
  if (next.major !== installed.major) return next.major > installed.major
  if (next.minor !== installed.minor) return next.minor > installed.minor
  if (next.patch !== installed.patch) return next.patch > installed.patch
  return installed.prerelease && !next.prerelease
}

function rangeAllowsVersion(spec: string, latest: string) {
  const trimmed = spec.trim()
  const installed = parseVersion(trimmed.replace(/^[~^]/, ''))
  const candidate = parseVersion(latest)
  if (!installed || !candidate) return false
  if (trimmed.startsWith('^')) {
    const ceiling = installed.major > 0
      ? { major: installed.major + 1, minor: 0, patch: 0 }
      : installed.minor > 0
        ? { major: 0, minor: installed.minor + 1, patch: 0 }
        : { major: 0, minor: 0, patch: installed.patch + 1 }
    return candidate.major < ceiling.major || candidate.major === ceiling.major && (candidate.minor < ceiling.minor || candidate.minor === ceiling.minor && candidate.patch < ceiling.patch)
  }
  if (trimmed.startsWith('~')) return candidate.major === installed.major && candidate.minor === installed.minor && candidate.patch >= installed.patch
  return false
}

async function githubRequest<T>(path: string, init: RequestInit = {}): Promise<{ data: T; response: Response }> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/vnd.github+json')
  headers.set('X-GitHub-Api-Version', '2022-11-28')
  if (token.value) headers.set('Authorization', `Bearer ${token.value}`)
  if (init.body) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${apiBase}${path}`, { ...init, headers })
  const remaining = response.headers.get('x-ratelimit-remaining')
  const limit = response.headers.get('x-ratelimit-limit')
  if (remaining && limit) rateLimit.value = `API ${remaining} / ${limit}`

  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const message = (data as { message?: string } | null)?.message
    if (response.status === 401) throw new Error('GitHub rejected this token. Sign in again with a valid token.')
    if (response.status === 403 && remaining === '0') throw new Error('GitHub API rate limit reached. Try again later or sign in.')
    if (response.status === 404) throw new Error('Repository or file not found, or it is not accessible with this token.')
    throw new Error(message || `GitHub request failed (HTTP ${response.status}).`)
  }
  return { data: data as T, response }
}

function parseRepositoryUrl(value: string) {
  try {
    const url = new URL(value.trim())
    if (url.hostname.toLowerCase() !== 'github.com') return null
    const [owner, rawName] = url.pathname.split('/').filter(Boolean)
    if (!owner || !rawName) return null
    return { owner, name: rawName.replace(/\.git$/i, '') }
  } catch {
    return null
  }
}

async function loadRepository(value = repositoryUrl.value) {
  const parsed = parseRepositoryUrl(value)
  if (!parsed) {
    notify('Paste a valid public GitHub repository URL.', 'error')
    return
  }

  loadingRepository.value = true
  repositoryUrl.value = `https://github.com/${parsed.owner}/${parsed.name}`
  repository.value = null
  tree.value = []
  selectedPaths.value = []
  selectionMode.value = false
  dependencyPullRequests.value = []
  dependencyPullRequestsLoaded.value = false
  outdatedDependencies.value = []
  dependencyScanComplete.value = false
  createdPullRequest.value = null
  currentPath.value = ''
  activeFile.value = null
  previewText.value = ''
  previewHtml.value = ''
  previewImage.value = ''
  copyUrl.value = ''
  copyLinkLabel.value = 'Open your independent copy'

  try {
    const { data: details } = await githubRequest<Repository>(`/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.name)}`)
    const { data: branch } = await githubRequest<{ commit: { commit: { tree: { sha: string } } } }>(`/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.name)}/branches/${encodeURIComponent(details.default_branch)}`)
    const { data: treeData } = await githubRequest<{ tree: TreeEntry[]; truncated: boolean }>(`/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.name)}/git/trees/${branch.commit.commit.tree.sha}?recursive=1`)
    repository.value = details
    tree.value = treeData.tree.filter(entry => entry.type === 'blob' || entry.type === 'tree')
    if (treeData.truncated) notify('This repository is very large; GitHub returned a partial file tree.', 'info')
    if (!tree.value.length) notify('Repository loaded, but it has no files to show.', 'info')
  } catch (error) {
    notify(errorMessage(error), 'error')
  } finally {
    loadingRepository.value = false
  }
}

function openFolder(path: string) {
  currentPath.value = path
  activeFile.value = null
  previewText.value = ''
  previewHtml.value = ''
  previewImage.value = ''
  previewError.value = ''
}

function decodeContent(content: string) {
  const binary = atob(content.replace(/\s/g, ''))
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function rawGitHubUrl(path: string) {
  const repo = repository.value
  if (!repo) throw new Error('No repository is selected.')
  const repoPath = repo.full_name.split('/').map(encodeURIComponent).join('/')
  const branch = repo.default_branch.split('/').map(encodeURIComponent).join('/')
  const filePath = path.split('/').filter(Boolean).map(encodeURIComponent).join('/')
  return `https://raw.githubusercontent.com/${repoPath}/${branch}/${filePath}${path.endsWith('/') ? '/' : ''}`
}

function rawGitHubDirectoryUrl(filePath: string) {
  const directory = filePath.split('/').slice(0, -1).join('/')
  return rawGitHubUrl(directory ? `${directory}/` : '')
}

function githubBlobDirectoryUrl(filePath: string) {
  const repo = repository.value
  if (!repo) throw new Error('No repository is selected.')
  const branch = repo.default_branch.split('/').map(encodeURIComponent).join('/')
  const directory = filePath.split('/').slice(0, -1).filter(Boolean).map(encodeURIComponent).join('/')
  return `https://github.com/${repo.full_name}/blob/${branch}/${directory ? `${directory}/` : ''}`
}

async function fetchPublicRawText(url: string) {
  if (repository.value?.private) throw new Error('Private files must be loaded directly from GitHub.')
  const target = new URL(url)
  if (target.hostname !== 'raw.githubusercontent.com') throw new Error('The public file fallback only accepts raw GitHub URLs.')

  const proxy = new URL('https://anycors.vercel.app/v2/cors')
  proxy.searchParams.set('u', target.href)
  const response = await fetch(proxy)
  if (!response.ok) throw new Error(`Public file preview failed (HTTP ${response.status}).`)
  return response.text()
}

async function fetchPreviewText(item: ExplorerItem) {
  const repo = repository.value
  if (!repo) throw new Error('No repository is selected.')
  const path = item.path.split('/').map(encodeURIComponent).join('/')
  const query = new URLSearchParams({ ref: repo.default_branch })
  const apiPath = `/repos/${repo.full_name}/contents/${path}?${query}`

  try {
    const { data } = await githubRequest<{ content?: string; encoding?: string }>(apiPath)
    if (data.content && data.encoding === 'base64') return decodeContent(data.content)

    if (repo.private) {
      const response = await fetch(`${apiBase}${apiPath}`, {
        headers: { Accept: 'application/vnd.github.raw+json', Authorization: `Bearer ${token.value}` }
      })
      if (!response.ok) throw new Error(`GitHub could not load this file (HTTP ${response.status}).`)
      return response.text()
    }
  } catch (error) {
    if (repo.private) throw error
  }

  return fetchPublicRawText(rawGitHubUrl(item.path))
}

async function renderMarkdown(markdown: string, filePath: string) {
  const parsed = new DOMParser().parseFromString(await marked.parse(markdown), 'text/html')
  const rawBase = rawGitHubDirectoryUrl(filePath)
  const blobBase = githubBlobDirectoryUrl(filePath)

  parsed.querySelectorAll('img[src]').forEach(image => {
    const src = image.getAttribute('src')
    if (src && !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(src)) image.setAttribute('src', new URL(src, rawBase).href)
  })
  parsed.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href')
    if (href && !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) link.setAttribute('href', new URL(href, blobBase).href)
  })

  return DOMPurify.sanitize(parsed.body.innerHTML)
}

function prepareWebsiteDocument(source: string, filePath: string) {
  const parsed = new DOMParser().parseFromString(source, 'text/html')
  parsed.querySelectorAll('base').forEach(base => base.remove())
  const base = parsed.createElement('base')
  base.href = rawGitHubDirectoryUrl(filePath)
  parsed.head.prepend(base)
  const referrer = parsed.createElement('meta')
  referrer.name = 'referrer'
  referrer.content = 'no-referrer'
  parsed.head.append(referrer)
  return `<!doctype html>${parsed.documentElement.outerHTML}`
}

async function openFile(item: ExplorerItem) {
  if (!repository.value) return
  activeFile.value = item
  previewText.value = ''
  previewHtml.value = ''
  previewImage.value = ''
  websiteDocument.value = ''
  htmlPreviewMode.value = 'website'
  previewError.value = ''
  previewLoading.value = true

  try {
    if (item.size > 5_000_000) {
      previewError.value = 'This file is too large to preview here. Use Download to open it.'
      return
    }

    if (fileKind.value === 'image') {
      const path = item.path.split('/').map(encodeURIComponent).join('/')
      const query = new URLSearchParams({ ref: repository.value.default_branch })
      const { data } = await githubRequest<{ content?: string; encoding?: string; type?: string }>(`/repos/${repository.value.full_name}/contents/${path}?${query}`)
      if (!data.content || data.encoding !== 'base64') throw new Error('GitHub did not return an image preview.')
      const extension = item.name.split('.').pop()?.toLowerCase() || 'png'
      const mime = extension === 'svg' ? 'image/svg+xml' : `image/${extension === 'jpg' ? 'jpeg' : extension}`
      previewImage.value = `data:${mime};base64,${data.content.replace(/\s/g, '')}`
    } else if (['markdown', 'code', 'html'].includes(fileKind.value)) {
      previewText.value = await fetchPreviewText(item)
      if (fileKind.value === 'markdown') previewHtml.value = await renderMarkdown(previewText.value, item.path)
      if (fileKind.value === 'html') websiteDocument.value = prepareWebsiteDocument(previewText.value, item.path)
    } else {
      previewError.value = 'GitHub cannot preview this binary file. Use Download to open it.'
    }
  } catch (error) {
    previewError.value = errorMessage(error)
  } finally {
    previewLoading.value = false
  }
}

async function signIn() {
  const providedToken = tokenInput.value.trim()
  if (!providedToken) {
    notify('Enter a GitHub personal access token first.', 'error')
    return
  }

  const previousToken = token.value
  token.value = providedToken
  try {
    const { data: account } = await githubRequest<GitHubUser>('/user')
    user.value = account
    tokenInput.value = ''
    showAuth.value = false
    notify(`Connected as ${account.login}. The token stays in this browser session only.`, 'success')
    void loadUserRepositories()
  } catch (error) {
    token.value = previousToken
    notify(errorMessage(error), 'error')
  }
}

async function loadUserRepositories() {
  if (!token.value) return false
  try {
    const repositories: Repository[] = []
    for (let page = 1; page <= 20; page++) {
      const { data } = await githubRequest<Repository[]>(`/user/repos?per_page=100&sort=updated&page=${page}`)
      repositories.push(...data)
      if (data.length < 100) break
    }
    userRepositories.value = repositories
    return true
  } catch (error) {
    notify(errorMessage(error), 'error')
    return false
  }
}

async function refreshGitHubProfile() {
  if (!token.value || refreshingProfile.value) return
  refreshingProfile.value = true
  try {
    const { data: account } = await githubRequest<GitHubUser>('/user')
    user.value = account
    if (await loadUserRepositories()) notify('GitHub profile and repositories refreshed.', 'success')
  } catch (error) {
    notify(errorMessage(error), 'error')
  } finally {
    refreshingProfile.value = false
  }
}

function signOut() {
  token.value = ''
  user.value = null
  userRepositories.value = []
  notify('Signed out. Public repository browsing is still available.', 'info')
}

async function copyRepository() {
  if (!repository.value) return
  if (!user.value || !token.value) {
    showAuth.value = true
    notify('Sign in with a GitHub token to create your copy.', 'info')
    return
  }
  if (repository.value.owner.login.toLowerCase() === user.value.login.toLowerCase()) {
    notify('This repository is already under your GitHub account.', 'info')
    return
  }

  copyingRepository.value = true
  copyUrl.value = ''
  copyLinkLabel.value = 'Open your independent copy'
  copyProgress.value = 'Checking your account…'
  let destinationUrl = ''
  try {
    const targetPath = `/repos/${encodeURIComponent(user.value.login)}/${encodeURIComponent(repository.value.name)}`
    try {
      const { data: existing } = await githubRequest<Repository>(targetPath)
      copyUrl.value = existing.html_url
      copyLinkLabel.value = 'Open existing repository'
      copyProgress.value = ''
      notify(`A repository named ${existing.name} already exists in your account.`, 'info')
      void loadUserRepositories()
      return
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('not found')) throw error
    }

    copyProgress.value = 'Creating an independent repository…'
    const { data: destination } = await githubRequest<Repository>('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name: repository.value.name,
        description: repository.value.description,
        private: repository.value.private,
        auto_init: true,
        default_branch: repository.value.default_branch
      })
    })
    destinationUrl = destination.html_url

    const { data: initialBranch } = await githubRequest<{ commit: { sha: string; commit: { tree: { sha: string } } } }>(`/repos/${destination.full_name}/branches/${encodeURIComponent(destination.default_branch)}`)

    const sourceBlobs = tree.value.filter(entry => entry.type === 'blob')
    const destinationEntries: Array<{ path: string; mode: string; type: 'blob'; sha: string | null }> = []
    for (const [index, entry] of sourceBlobs.entries()) {
      copyProgress.value = `Copying files ${index + 1} of ${sourceBlobs.length}…`
      const { data: blob } = await githubRequest<{ content: string; encoding: string }>(`/repos/${repository.value.full_name}/git/blobs/${entry.sha}`)
      const { data: copiedBlob } = await githubRequest<{ sha: string }>(`/repos/${destination.full_name}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: blob.content.replace(/\s/g, ''), encoding: blob.encoding })
      })
      destinationEntries.push({ path: entry.path, mode: entry.mode, type: 'blob', sha: copiedBlob.sha })
    }

    copyProgress.value = 'Writing the copied files…'
    if (!sourceBlobs.some(entry => entry.path.toLowerCase() === 'readme.md')) {
      destinationEntries.push({ path: 'README.md', mode: '100644', type: 'blob', sha: null })
    }
    const { data: newTree } = await githubRequest<{ sha: string }>(`/repos/${destination.full_name}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: initialBranch.commit.commit.tree.sha, tree: destinationEntries })
    })
    const { data: commit } = await githubRequest<{ sha: string }>(`/repos/${destination.full_name}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({ message: `Copy ${repository.value.full_name}`, tree: newTree.sha, parents: [initialBranch.commit.sha] })
    })
    const branchRef = destination.default_branch.split('/').map(encodeURIComponent).join('/')
    await githubRequest(`/repos/${destination.full_name}/git/refs/heads/${branchRef}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha })
    })
    copyUrl.value = destination.html_url
    copyProgress.value = ''
    notify('Independent default-branch copy created. Other branches, source history, and fork relationship were not copied.', 'success')
    await loadUserRepositories()
  } catch (error) {
    copyProgress.value = ''
    if (destinationUrl) {
      copyUrl.value = destinationUrl
      copyLinkLabel.value = 'Inspect partial repository'
    }
    notify(destinationUrl ? `Copy stopped: ${errorMessage(error)} Open the destination to inspect the partial copy.` : errorMessage(error), 'error')
  } finally {
    copyingRepository.value = false
  }
}

async function createChangePullRequest(title: string, body: string, changes: Array<{ path: string; content?: string; remove?: boolean }>) {
  const repo = repository.value
  if (!repo || !user.value) throw new Error('Connect a GitHub account and select a repository first.')

  const { data: branch } = await githubRequest<{ commit: { sha: string; commit: { tree: { sha: string } } } }>(`/repos/${repo.full_name}/branches/${encodeURIComponent(repo.default_branch)}`)
  const branchName = `gitview/${Date.now()}`
  await githubRequest(`/repos/${repo.full_name}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: branch.commit.sha })
  })

  const entries = await Promise.all(changes.map(async change => {
    if (change.remove) return { path: change.path, mode: '100644', type: 'blob', sha: null }
    if (change.content === undefined) throw new Error(`No content was provided for ${change.path}.`)
    const content = btoa(unescape(encodeURIComponent(change.content)))
    const { data: blob } = await githubRequest<{ sha: string }>(`/repos/${repo.full_name}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content, encoding: 'base64' })
    })
    return { path: change.path, mode: '100644', type: 'blob', sha: blob.sha }
  }))
  const { data: newTree } = await githubRequest<{ sha: string }>(`/repos/${repo.full_name}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: branch.commit.commit.tree.sha, tree: entries })
  })
  const { data: commit } = await githubRequest<{ sha: string }>(`/repos/${repo.full_name}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message: title, tree: newTree.sha, parents: [branch.commit.sha] })
  })
  const encodedBranch = branchName.split('/').map(encodeURIComponent).join('/')
  await githubRequest(`/repos/${repo.full_name}/git/refs/heads/${encodedBranch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha })
  })
  const { data: pullRequest } = await githubRequest<{ html_url: string }>(`/repos/${repo.full_name}/pulls`, {
    method: 'POST',
    body: JSON.stringify({ title, body, head: `${repo.owner.login}:${branchName}`, base: repo.default_branch })
  })
  createdPullRequest.value = { title, url: pullRequest.html_url }
  return pullRequest.html_url
}

function toggleSelectedPath(path: string) {
  selectedPaths.value = selectedPaths.value.includes(path)
    ? selectedPaths.value.filter(selected => selected !== path)
    : [...selectedPaths.value, path]
}

async function deleteSelectedPaths() {
  const repo = repository.value
  if (!repo || !selectedPaths.value.length) return
  if (!user.value || !token.value) {
    showAuth.value = true
    notify('Connect a GitHub account to create a deletion pull request.', 'info')
    return
  }

  const selected = [...selectedPaths.value]
  const files = new Set<string>()
  for (const path of selected) {
    const isDirectory = tree.value.some(entry => entry.path === path && entry.type === 'tree')
    if (isDirectory) {
      for (const entry of tree.value) if (entry.type === 'blob' && entry.path.startsWith(`${path}/`)) files.add(entry.path)
    } else if (tree.value.some(entry => entry.type === 'blob' && entry.path === path)) {
      files.add(path)
    }
  }
  if (!files.size) {
    notify('The selection contains no files to delete.', 'error')
    return
  }
  if (!window.confirm(`Create a pull request deleting ${files.size} file${files.size === 1 ? '' : 's'} from ${repo.full_name}? The changes will not be merged automatically.`)) return

  deletingFiles.value = true
  try {
    const changes = [...files].map(path => ({ path, remove: true }))
    await createChangePullRequest(`Delete ${files.size} selected file${files.size === 1 ? '' : 's'}`, `Bulk deletion requested in GitView. Review the file changes before merging.\n\nDeleted files: ${files.size}`, changes)
    selectedPaths.value = []
    selectionMode.value = false
    activeFile.value = null
    notify('Deletion pull request created for review.', 'success')
  } catch (error) {
    notify(errorMessage(error), 'error')
  } finally {
    deletingFiles.value = false
  }
}

async function enableDependencyUpdates() {
  const repo = repository.value
  if (!repo) return
  if (!user.value || !token.value) {
    showAuth.value = true
    notify('Connect a GitHub account to enable dependency updates.', 'info')
    return
  }
  if (!dependencyEcosystems.value.length) {
    notify('No supported dependency manifests were found in this repository.', 'error')
    return
  }
  if (tree.value.some(entry => entry.path === '.github/dependabot.yml')) {
    notify('This repository already has a Dependabot configuration.', 'info')
    return
  }

  configuringDependencies.value = true
  try {
    await createChangePullRequest(
      'Enable scheduled dependency updates',
      'Add a Dependabot configuration for the dependency manifests detected in this repository. Merge this pull request to enable weekly dependency update pull requests.',
      [{ path: '.github/dependabot.yml', content: dependabotConfig.value }]
    )
    notify('Dependabot configuration pull request created.', 'success')
  } catch (error) {
    notify(errorMessage(error), 'error')
  } finally {
    configuringDependencies.value = false
  }
}

async function loadDependencyPullRequests() {
  const repo = repository.value
  if (!repo) return
  if (!token.value) {
    showAuth.value = true
    notify('Connect a GitHub account to check dependency pull requests.', 'info')
    return
  }
  loadingDependencyPullRequests.value = true
  try {
    const { data } = await githubRequest<DependencyPullRequest[]>(`/repos/${repo.full_name}/pulls?state=open&per_page=100`)
    dependencyPullRequests.value = data.filter(pull => pull.user.login.toLowerCase().includes('dependabot'))
    dependencyPullRequestsLoaded.value = true
  } catch (error) {
    notify(errorMessage(error), 'error')
  } finally {
    loadingDependencyPullRequests.value = false
  }
}

async function readRepositoryJson(path: string) {
  const repo = repository.value
  if (!repo) throw new Error('No repository is selected.')
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  const query = new URLSearchParams({ ref: repo.default_branch })
  const { data } = await githubRequest<{ content?: string; encoding?: string }>(`/repos/${repo.full_name}/contents/${encodedPath}?${query}`)
  if (!data.content || data.encoding !== 'base64') throw new Error(`Could not read ${path}.`)
  return JSON.parse(decodeContent(data.content)) as Record<string, unknown>
}

async function checkOutdatedDependencies() {
  const repo = repository.value
  if (!repo) return
  const manifests = tree.value.filter(entry => entry.type === 'blob' && entry.path.split('/').pop() === 'package.json')
  if (!manifests.length) {
    notify('No npm package.json manifests were found.', 'info')
    outdatedDependencies.value = []
    dependencyScanComplete.value = true
    return
  }

  scanningDependencies.value = true
  dependencyScanComplete.value = false
  outdatedDependencies.value = []
  try {
    const candidates: Array<{ name: string; spec: string; manifestPath: string; lockPath?: string }> = []
    const candidateKeys = new Set<string>()
    for (const manifest of manifests) {
      const packageData = await readRepositoryJson(manifest.path)
      const directory = manifest.path.includes('/') ? manifest.path.slice(0, manifest.path.lastIndexOf('/') + 1) : ''
      const localLock = `${directory}package-lock.json`
      const rootLock = 'package-lock.json'
      const lockPath = tree.value.some(entry => entry.type === 'blob' && entry.path === localLock)
        ? localLock
        : tree.value.some(entry => entry.type === 'blob' && entry.path === rootLock) ? rootLock : undefined
      for (const section of ['dependencies', 'devDependencies', 'optionalDependencies']) {
        const dependencies = packageData[section]
        if (!dependencies || typeof dependencies !== 'object') continue
        for (const [name, spec] of Object.entries(dependencies)) {
          const key = `${manifest.path}:${name}`
          if (typeof spec === 'string' && /^[~^]?v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(spec.trim()) && !candidateKeys.has(key)) {
            candidateKeys.add(key)
            candidates.push({ name, spec, manifestPath: manifest.path, lockPath })
          }
        }
      }
    }

    const lockCache = new Map<string, Promise<Record<string, unknown>>>()
    const found: OutdatedDependency[] = []
    for (let start = 0; start < candidates.length; start += 8) {
      const batch = candidates.slice(start, start + 8)
      await Promise.all(batch.map(async candidate => {
        try {
          let current = candidate.spec
          let hasLockedVersion = false
          if (candidate.lockPath) {
            let lockRequest = lockCache.get(candidate.lockPath)
            if (!lockRequest) {
              lockRequest = readRepositoryJson(candidate.lockPath)
              lockCache.set(candidate.lockPath, lockRequest)
            }
            const lock = await lockRequest
            const packages = lock.packages as Record<string, { version?: string }> | undefined
            const locked = packages?.[`node_modules/${candidate.name}`]?.version
            if (locked) {
              current = locked
              hasLockedVersion = true
            }
          }
          const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(candidate.name)}/latest`
          const response = await fetch(registryUrl, { headers: { Accept: 'application/vnd.npm.install-v1+json' } })
          if (!response.ok) return
          const latest = (await response.json() as { version?: string }).version
          if (latest && versionIsNewer(latest, current) && (hasLockedVersion || !rangeAllowsVersion(candidate.spec, latest))) {
            found.push({ name: candidate.name, current, latest, manifestPath: candidate.manifestPath })
          }
        } catch {}
      }))
    }
    outdatedDependencies.value = found.sort((left, right) => left.name.localeCompare(right.name))
    dependencyScanComplete.value = true
    notify(`Checked npm dependencies. ${found.length} outdated package${found.length === 1 ? '' : 's'} found.`, 'success')
  } catch (error) {
    notify(errorMessage(error), 'error')
  } finally {
    scanningDependencies.value = false
  }
}

function chooseRepository(repo: Repository) {
  showRepositoryPicker.value = false
  repositoryUrl.value = repo.html_url
  void loadRepository(repo.html_url)
}

function fileIcon(item: ExplorerItem) {
  if (item.type === 'dir') return Folder
  if (/\.(png|jpe?g|gif|webp|svg|ico|avif)$/i.test(item.name)) return FileImage
  if (/\.(md|markdown|txt|log)$/i.test(item.name)) return FileText
  return Code2
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`
}

function copyPath(path: string) {
  void navigator.clipboard.writeText(path).then(() => notify('Path copied.', 'success'))
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="GitView home" @click.prevent="repository ? openFolder('') : undefined">
        <span class="brand-mark"><GitHubMark :size="19" /></span>
        <span>GitView</span><span class="brand-tag">EXPLORER</span>
      </a>
      <form class="repo-search" @submit.prevent="loadRepository()">
        <Search :size="16" />
        <input ref="repositoryInput" v-model="repositoryUrl" aria-label="GitHub repository URL" placeholder="https://github.com/username/repo" spellcheck="false">
        <button class="load-button" type="submit" :disabled="loadingRepository">
          <LoaderCircle v-if="loadingRepository" class="spin" :size="15" />
          <span v-else>Load repo</span>
        </button>
      </form>
      <div class="account-area">
        <button v-if="user" class="account-chip" type="button" @click="showRepositoryPicker = true" :title="`Signed in as ${user.login}`">
          <img :src="user.avatar_url" :alt="`${user.login} avatar`"><span>{{ user.login }}</span><ChevronDown :size="14" />
        </button>
        <button v-if="user" class="icon-button" type="button" title="Refresh GitHub profile and repositories" aria-label="Refresh GitHub profile and repositories" :disabled="refreshingProfile" @click="refreshGitHubProfile">
          <RefreshCw :size="15" :class="{ spin: refreshingProfile }" />
        </button>
        <button v-if="user" class="icon-button" type="button" title="Sign out" aria-label="Sign out" @click="signOut"><LogOut :size="16" /></button>
        <button v-else class="sign-in-button" type="button" @click="showAuth = true"><GitHubMark :size="15" /> Sign in</button>
      </div>
    </header>

    <main class="workspace" :class="{ 'has-repository': repository }">
      <aside v-if="repository" class="sidebar">
        <div class="repo-card-head">
          <div class="repo-avatar"><GitHubMark :size="17" /></div>
          <div class="repo-heading">
            <span class="repo-owner">{{ repository.owner.login }}</span>
            <strong>{{ repository.name }}</strong>
          </div>
          <a class="icon-button repo-external" :href="repository.html_url" target="_blank" rel="noreferrer" title="Open on GitHub"><ExternalLink :size="15" /></a>
        </div>
        <div class="repo-summary">
          <p>{{ repository.description || 'No repository description.' }}</p>
          <div class="repo-stats">
            <span><Star :size="13" /> {{ repository.stargazers_count.toLocaleString() }}</span>
            <span><span class="branch-dot" /> {{ repository.default_branch }}</span>
            <span v-if="repository.language">{{ repository.language }}</span>
          </div>
        </div>
        <div class="tree-title-row">
          <span>FILES</span>
          <span class="tree-title-actions">
            <span class="tree-count">{{ visibleItems.length }}</span>
            <button class="manage-files-button" type="button" @click="selectionMode = !selectionMode; selectedPaths = []">{{ selectionMode ? 'Cancel' : 'Select' }}</button>
          </span>
        </div>
        <label class="tree-search"><Search :size="14" /><input v-model="filterText" placeholder="Filter this folder" aria-label="Filter files"></label>
        <nav class="breadcrumbs" aria-label="Repository path">
          <button type="button" :class="{ active: !currentPath }" @click="openFolder('')">{{ repository.name }}</button>
          <template v-for="crumb in breadcrumbs" :key="crumb.path">
            <ChevronRight :size="12" />
            <button type="button" :class="{ active: crumb.path === currentPath }" @click="openFolder(crumb.path)">{{ crumb.label }}</button>
          </template>
        </nav>
        <div v-if="selectionMode" class="bulk-toolbar">
          <span>{{ selectedPaths.length }} selected</span>
          <button type="button" :disabled="!selectedPaths.length || deletingFiles" @click="deleteSelectedPaths">{{ deletingFiles ? 'Preparing PR…' : 'Create delete PR' }}</button>
        </div>
        <div class="file-tree">
          <div v-for="item in visibleItems" :key="item.path" class="file-entry-row">
            <input v-if="selectionMode" class="file-selection-checkbox" type="checkbox" :checked="selectedPaths.includes(item.path)" :aria-label="`Select ${item.path} for deletion`" @change="toggleSelectedPath(item.path)">
            <button class="file-row" :class="{ selected: activeFile?.path === item.path || selectedPaths.includes(item.path) }" type="button" @click="item.type === 'dir' ? openFolder(item.path) : openFile(item)">
              <component :is="item.type === 'dir' ? Folder : fileIcon(item)" :size="15" :stroke-width="1.8" :class="item.type === 'dir' ? 'folder-icon' : 'file-icon'" />
              <span class="file-name" :title="item.name">{{ item.name }}</span>
              <span v-if="item.type === 'file'" class="file-size">{{ formatBytes(item.size) }}</span>
              <ChevronRight v-else :size="13" class="folder-chevron" />
            </button>
          </div>
          <div v-if="!visibleItems.length" class="tree-empty"><FolderOpen :size="20" /><span>{{ filterText ? 'No matching files' : 'This folder is empty' }}</span></div>
        </div>
        <footer class="sidebar-footer"><span class="status-dot" />{{ rateLimit }}</footer>
      </aside>

      <section class="preview-area">
        <div v-if="!repository && !loadingRepository" class="welcome-view">
          <div class="welcome-copy">
            <div class="eyebrow"><span class="eyebrow-line" /> GITHUB REPOSITORY TOOLS</div>
            <h1>See the whole<br><span>repository.</span></h1>
            <p>Browse repositories, inspect files, and create an independent copy in your GitHub account.</p>
            <form class="welcome-search" @submit.prevent="loadRepository()">
              <GitHubMark :size="17" />
              <input v-model="repositoryUrl" aria-label="GitHub repository URL" placeholder="github.com/owner/repository" spellcheck="false">
              <button type="submit" :disabled="loadingRepository"><LoaderCircle v-if="loadingRepository" class="spin" :size="16" /><span v-else>Explore <ChevronRight :size="15" /></span></button>
            </form>
            <div class="welcome-footnote"><ShieldCheck :size="15" /> Public repositories work without sign in. Copying requires your GitHub token.</div>
          </div>
          <div class="welcome-art" aria-hidden="true">
            <div class="art-window">
              <div class="art-window-bar"><i /><i /><i /><span>repository tree</span><Code2 :size="15" /></div>
              <div class="art-line"><Folder :size="15" /><b>src</b><span>folder</span></div>
              <div class="art-line nested"><Code2 :size="15" /><b>app.vue</b><span>8.4 KB</span></div>
              <div class="art-line nested"><Code2 :size="15" /><b>composables</b><span>folder</span></div>
              <div class="art-line"><FileText :size="15" /><b>README.md</b><span>2.1 KB</span></div>
              <div class="art-line"><FileImage :size="15" /><b>package.json</b><span>1.2 KB</span></div>
              <div class="art-foot"><span class="status-dot" /> 142 files indexed</div>
            </div>
            <div class="art-stamp"><HardDrive :size="16" /><span>INDEPENDENT<br>REPO COPY</span></div>
          </div>
        </div>

        <div v-else-if="loadingRepository" class="loading-view">
          <LoaderCircle class="spin" :size="28" /><strong>Reading repository tree</strong><span>Fetching folders and files from GitHub…</span>
        </div>

        <template v-else-if="repository">
          <div v-if="!activeFile" class="repository-overview">
            <div class="overview-topline"><span>REPOSITORY</span><span class="public-badge">{{ repository.private ? 'PRIVATE' : 'PUBLIC' }}</span></div>
            <h1>{{ repository.name }}</h1>
            <p class="overview-description">{{ repository.description || 'A GitHub repository ready to explore.' }}</p>
            <div class="overview-meta">
              <span><GitHubMark :size="15" /> {{ repository.full_name }}</span>
              <span><Star :size="14" /> {{ repository.stargazers_count.toLocaleString() }} stars</span>
              <span><HardDrive :size="14" /> {{ tree.filter(entry => entry.type === 'blob').length }} files</span>
            </div>
            <div class="overview-actions">
              <button class="copy-repo-button" type="button" :disabled="copyingRepository" @click="copyRepository">
                <LoaderCircle v-if="copyingRepository" class="spin" :size="17" />
                <HardDrive v-else :size="17" />
                {{ copyingRepository ? 'Copying repository…' : 'Create an independent copy' }}
              </button>
              <a class="secondary-action" :href="repository.html_url" target="_blank" rel="noreferrer">View on GitHub <ExternalLink :size="14" /></a>
            </div>
            <section class="automation-panel" aria-labelledby="dependency-heading">
              <div class="automation-heading">
                <div><span class="eyebrow">DEPENDENCIES</span><h2 id="dependency-heading">Scheduled updates</h2></div>
                <span class="automation-count">{{ dependencyEcosystems.length }} ecosystems detected</span>
              </div>
              <p>Open a pull request to configure GitHub Dependabot. After it is merged, GitHub checks these manifests weekly and opens dependency update pull requests.</p>
              <div class="automation-actions">
                <button class="automation-button" type="button" :disabled="scanningDependencies" @click="checkOutdatedDependencies">
                  <LoaderCircle v-if="scanningDependencies" class="spin" :size="14" /><span v-else>Scan npm dependencies</span>
                </button>
                <button class="automation-button primary" type="button" :disabled="configuringDependencies || !dependencyEcosystems.length || hasDependabotConfig" @click="enableDependencyUpdates">
                  <LoaderCircle v-if="configuringDependencies" class="spin" :size="14" /><span v-else>{{ hasDependabotConfig ? 'Dependabot configured' : 'Configure Dependabot' }}</span>
                </button>
                <button class="automation-button" type="button" :disabled="loadingDependencyPullRequests" @click="loadDependencyPullRequests">
                  <LoaderCircle v-if="loadingDependencyPullRequests" class="spin" :size="14" /><span v-else>Check open update PRs</span>
                </button>
              </div>
              <div v-if="dependencyScanComplete && !outdatedDependencies.length" class="automation-empty">No outdated npm dependencies found.</div>
              <div v-for="dependency in outdatedDependencies" :key="`${dependency.manifestPath}:${dependency.name}`" class="dependency-result">
                <span class="dependency-name">{{ dependency.name }}</span><span>{{ dependency.current }} <ChevronRight :size="12" /> {{ dependency.latest }}</span><small>{{ dependency.manifestPath }}</small>
              </div>
              <a v-if="createdPullRequest" class="automation-pr" :href="createdPullRequest.url" target="_blank" rel="noreferrer"><Check :size="14" /> {{ createdPullRequest.title }} <ExternalLink :size="12" /></a>
              <div v-if="dependencyPullRequestsLoaded && !dependencyPullRequests.length" class="automation-empty">No open Dependabot pull requests.</div>
              <a v-for="pull in dependencyPullRequests" :key="pull.number" class="automation-pr" :href="pull.html_url" target="_blank" rel="noreferrer"><span>#{{ pull.number }}</span>{{ pull.title }}<ExternalLink :size="12" /></a>
            </section>
            <div v-if="copyProgress" class="copy-progress"><LoaderCircle class="spin" :size="14" />{{ copyProgress }}</div>
            <a v-if="copyUrl" class="fork-success" :href="copyUrl" target="_blank" rel="noreferrer"><Check :size="16" /> {{ copyLinkLabel }} <ExternalLink :size="13" /></a>
            <div class="overview-divider" />
            <div class="folder-prompt"><FolderOpen :size="16" /><span>Choose a folder or file from the tree to explore its contents.</span></div>
          </div>

          <div v-else class="file-preview">
            <div class="preview-toolbar">
              <div class="preview-file-title"><component :is="fileIcon(activeFile)" :size="17" /><span>{{ activeFile.path }}</span></div>
              <div class="preview-toolbar-actions">
                <button class="icon-button" type="button" title="Copy file path" aria-label="Copy file path" @click="copyPath(activeFile.path)"><Copy :size="15" /></button>
                <a class="icon-button" :href="`https://github.com/${repository.full_name}/blob/${encodeURIComponent(repository.default_branch)}/${activeFile.path.split('/').map(encodeURIComponent).join('/')}`" target="_blank" rel="noreferrer" title="Open on GitHub"><ExternalLink :size="15" /></a>
                <a class="download-action" :href="`https://raw.githubusercontent.com/${repository.full_name}/${encodeURIComponent(repository.default_branch)}/${activeFile.path.split('/').map(encodeURIComponent).join('/')}`" target="_blank" rel="noreferrer">Download</a>
              </div>
            </div>
            <div class="preview-submeta"><span>{{ formatBytes(activeFile.size) }}</span><span class="meta-separator">/</span><span>{{ fileKind === 'code' || fileKind === 'html' ? languageInfo.label : fileKind }}</span><span class="meta-separator">/</span><span>{{ repository.default_branch }}</span></div>
            <div v-if="fileKind === 'html'" class="html-view-controls" role="group" aria-label="HTML preview mode">
              <button type="button" :class="{ active: htmlPreviewMode === 'website' }" @click="htmlPreviewMode = 'website'"><Eye :size="14" /> Website</button>
              <button type="button" :class="{ active: htmlPreviewMode === 'source' }" @click="htmlPreviewMode = 'source'"><Code2 :size="14" /> Source</button>
            </div>
            <div v-if="fileKind === 'code' || fileKind === 'markdown' || (fileKind === 'html' && htmlPreviewMode === 'source')" class="language-banner">
              <span v-if="languageIconSvg" class="language-icon" :style="{ color: languageBrandColors[languageInfo.slug] || '#53657f' }" aria-hidden="true" v-html="languageIconSvg" />
              <span v-else class="language-mark">{{ languageInfo.mark }}</span>
              <strong>{{ languageInfo.label }}</strong><span class="language-banner-hint">{{ languageInfo.highlight ? 'Syntax highlighted' : 'Plain text' }}</span>
            </div>
            <div v-if="previewLoading" class="file-loading"><LoaderCircle class="spin" :size="23" /><span>Loading file…</span></div>
            <div v-else-if="previewError" class="preview-message"><CircleAlert :size="19" /><span>{{ previewError }}</span></div>
            <img v-else-if="previewImage" class="image-preview" :src="previewImage" :alt="activeFile.name">
            <article v-else-if="fileKind === 'markdown' && previewHtml" class="markdown-preview" v-html="previewHtml" />
            <iframe v-else-if="fileKind === 'html' && htmlPreviewMode === 'website' && websiteDocument" class="website-preview" :srcdoc="websiteDocument" :title="`Website preview for ${activeFile.name}`" sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-modals" referrerpolicy="no-referrer" />
            <pre v-else-if="previewText" class="code-preview"><code v-if="highlightedCode" class="hljs" v-html="highlightedCode" /><code v-else>{{ previewText }}</code></pre>
            <div v-else class="preview-message"><FileText :size="19" /><span>No preview is available for this file.</span></div>
          </div>
        </template>
      </section>
    </main>

    <div v-if="showAuth" class="modal-backdrop" @click.self="showAuth = false">
      <section class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-heading">
        <div class="dialog-heading"><div class="dialog-mark"><GitHubMark :size="20" /></div><button class="icon-button" type="button" aria-label="Close" @click="showAuth = false"><X :size="18" /></button></div>
        <h2 id="auth-heading">Connect your GitHub</h2>
        <p class="dialog-copy">Use a personal access token to create repositories, browse private repositories, and manage files. Your token is sent directly to GitHub and held in memory only.</p>
        <form class="auth-form" @submit.prevent="signIn">
          <label for="github-token">Personal access token</label>
          <input id="github-token" v-model="tokenInput" type="password" autocomplete="off" placeholder="github_pat_…">
          <span class="input-hint">Grant repository read/write access and repository creation permission. <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">Create one <ExternalLink :size="12" /></a></span>
          <button class="copy-repo-button auth-submit" type="submit"><ShieldCheck :size="16" /> Connect securely</button>
        </form>
        <div class="security-note"><ShieldCheck :size="15" /><span>GitView has no server-side token storage. Signing out clears the token immediately.</span></div>
      </section>
    </div>

    <div v-if="showRepositoryPicker" class="modal-backdrop" @click.self="showRepositoryPicker = false">
      <section class="repo-dialog" role="dialog" aria-modal="true" aria-labelledby="repos-heading">
        <div class="repo-dialog-heading"><div><span class="eyebrow">GITHUB ACCOUNT</span><h2 id="repos-heading">Your repositories</h2></div><button class="icon-button" type="button" aria-label="Close" @click="showRepositoryPicker = false"><X :size="18" /></button></div>
        <label class="picker-search"><Search :size="15" /><input v-model="repositorySearch" placeholder="Search repositories" aria-label="Search repositories"></label>
        <div class="picker-list">
          <button v-for="repo in filteredRepositories" :key="repo.id" class="picker-row" type="button" @click="chooseRepository(repo)">
            <span class="picker-repo-icon"><GitHubMark :size="16" /></span><span class="picker-repo-info"><strong>{{ repo.full_name }}</strong><small>{{ repo.description || 'No description' }}</small></span><ChevronRight :size="15" />
          </button>
          <div v-if="!filteredRepositories.length" class="picker-empty">No repositories found.</div>
        </div>
      </section>
    </div>

    <TransitionGroup name="toast" tag="div" class="toast-stack" aria-live="polite">
      <div v-for="toast in toasts" :key="toast.id" class="toast-message" :class="toast.kind"><Check v-if="toast.kind === 'success'" :size="16" /><CircleAlert v-else-if="toast.kind === 'error'" :size="16" /><Clock3 v-else :size="16" /><span>{{ toast.message }}</span></div>
    </TransitionGroup>
  </div>
</template>

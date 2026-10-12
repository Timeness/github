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
  FolderOpen, GitFork, HardDrive, LoaderCircle, LogOut, Search,
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
const forkUrl = ref('')
const forkProgress = ref('')
const token = ref('')
const tokenInput = ref('')
const user = shallowRef<GitHubUser | null>(null)
const userRepositories = ref<Repository[]>([])
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
  currentPath.value = ''
  activeFile.value = null
  previewText.value = ''
  previewHtml.value = ''
  previewImage.value = ''
  forkUrl.value = ''

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
  if (!token.value) return
  try {
    const { data } = await githubRequest<Repository[]>('/user/repos?per_page=100&sort=updated')
    userRepositories.value = data
  } catch (error) {
    notify(errorMessage(error), 'error')
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
  forkUrl.value = ''
  forkProgress.value = 'Checking your account…'
  try {
    const targetPath = `/repos/${encodeURIComponent(user.value.login)}/${encodeURIComponent(repository.value.name)}`
    const existingResponse = await fetch(`${apiBase}${targetPath}`, {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token.value}`, 'X-GitHub-Api-Version': '2022-11-28' }
    })
    if (existingResponse.ok) {
      const existing = await existingResponse.json() as Repository
      forkUrl.value = existing.html_url
      notify(`A repository named ${existing.name} already exists in your account.`, 'info')
      return
    }
    if (existingResponse.status !== 404) {
      const details = await existingResponse.json().catch(() => null) as { message?: string } | null
      throw new Error(details?.message || `Could not check your GitHub account (HTTP ${existingResponse.status}).`)
    }

    forkProgress.value = 'Creating full repository copy…'
    const { data: fork } = await githubRequest<Repository & { html_url: string }>(`/repos/${repository.value.full_name}/forks`, {
      method: 'POST',
      body: JSON.stringify({ name: repository.value.name, default_branch_only: false })
    })
    forkUrl.value = fork.html_url
    forkProgress.value = 'Waiting for GitHub to finish…'

    let ready = false
    for (let attempt = 0; attempt < 15; attempt++) {
      const check = await fetch(`${apiBase}/repos/${encodeURIComponent(user.value.login)}/${encodeURIComponent(repository.value.name)}`, {
        headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token.value}`, 'X-GitHub-Api-Version': '2022-11-28' }
      })
      if (check.ok) { ready = true; break }
      await new Promise(resolve => window.setTimeout(resolve, 2000))
    }
    forkProgress.value = ''
    notify(ready ? 'Repository copied with its original name and branches.' : 'GitHub accepted the copy request. It may take a little longer to finish.', 'success')
    void loadUserRepositories()
  } catch (error) {
    forkProgress.value = ''
    notify(errorMessage(error), 'error')
  } finally {
    copyingRepository.value = false
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
          <span>FILES</span><span class="tree-count">{{ visibleItems.length }}</span>
        </div>
        <label class="tree-search"><Search :size="14" /><input v-model="filterText" placeholder="Filter this folder" aria-label="Filter files"></label>
        <nav class="breadcrumbs" aria-label="Repository path">
          <button type="button" :class="{ active: !currentPath }" @click="openFolder('')">{{ repository.name }}</button>
          <template v-for="crumb in breadcrumbs" :key="crumb.path">
            <ChevronRight :size="12" />
            <button type="button" :class="{ active: crumb.path === currentPath }" @click="openFolder(crumb.path)">{{ crumb.label }}</button>
          </template>
        </nav>
        <div class="file-tree">
          <button v-for="item in visibleItems" :key="item.path" class="file-row" :class="{ selected: activeFile?.path === item.path }" type="button" @click="item.type === 'dir' ? openFolder(item.path) : openFile(item)">
            <component :is="item.type === 'dir' ? Folder : fileIcon(item)" :size="15" :stroke-width="1.8" :class="item.type === 'dir' ? 'folder-icon' : 'file-icon'" />
            <span class="file-name" :title="item.name">{{ item.name }}</span>
            <span v-if="item.type === 'file'" class="file-size">{{ formatBytes(item.size) }}</span>
            <ChevronRight v-else :size="13" class="folder-chevron" />
          </button>
          <div v-if="!visibleItems.length" class="tree-empty"><FolderOpen :size="20" /><span>{{ filterText ? 'No matching files' : 'This folder is empty' }}</span></div>
        </div>
        <footer class="sidebar-footer"><span class="status-dot" />{{ rateLimit }}</footer>
      </aside>

      <section class="preview-area">
        <div v-if="!repository && !loadingRepository" class="welcome-view">
          <div class="welcome-copy">
            <div class="eyebrow"><span class="eyebrow-line" /> GITHUB REPOSITORY EXPLORER</div>
            <h1>See the whole<br><span>repository.</span></h1>
            <p>Browse every folder, inspect files, and make a complete copy to your GitHub account without leaving this workspace.</p>
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
            <div class="art-stamp"><GitFork :size="16" /><span>FULL REPO<br>COPY</span></div>
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
                <GitFork v-else :size="17" />
                {{ copyingRepository ? 'Copying repository…' : 'Copy repository to my GitHub' }}
              </button>
              <a class="secondary-action" :href="repository.html_url" target="_blank" rel="noreferrer">View on GitHub <ExternalLink :size="14" /></a>
            </div>
            <div v-if="forkProgress" class="copy-progress"><LoaderCircle class="spin" :size="14" />{{ forkProgress }}</div>
            <a v-if="forkUrl" class="fork-success" :href="forkUrl" target="_blank" rel="noreferrer"><Check :size="16" /> Open your repository copy <ExternalLink :size="13" /></a>
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
        <p class="dialog-copy">Use a personal access token to create repository copies and browse your private repositories. Your token is sent directly to GitHub and held in memory only.</p>
        <form class="auth-form" @submit.prevent="signIn">
          <label for="github-token">Personal access token</label>
          <input id="github-token" v-model="tokenInput" type="password" autocomplete="off" placeholder="github_pat_…">
          <span class="input-hint">A token with repository access is needed to create forks. <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">Create one <ExternalLink :size="12" /></a></span>
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

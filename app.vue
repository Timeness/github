<script setup lang="ts">
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import bashIcon from 'simple-icons/icons/gnubash.svg?raw'
import adaIcon from 'simple-icons/icons/ada.svg?raw'
import arduinoIcon from 'simple-icons/icons/arduino.svg?raw'
import cIcon from 'simple-icons/icons/c.svg?raw'
import cppIcon from 'simple-icons/icons/cplusplus.svg?raw'
import csharpIcon from 'simple-icons/icons/dotnet.svg?raw'
import clojureIcon from 'simple-icons/icons/clojure.svg?raw'
import crystalIcon from 'simple-icons/icons/crystal.svg?raw'
import cssIcon from 'simple-icons/icons/css.svg?raw'
import dartIcon from 'simple-icons/icons/dart.svg?raw'
import dockerIcon from 'simple-icons/icons/docker.svg?raw'
import elmIcon from 'simple-icons/icons/elm.svg?raw'
import elixirIcon from 'simple-icons/icons/elixir.svg?raw'
import erlangIcon from 'simple-icons/icons/erlang.svg?raw'
import fortranIcon from 'simple-icons/icons/fortran.svg?raw'
import fsharpIcon from 'simple-icons/icons/fsharp.svg?raw'
import goIcon from 'simple-icons/icons/go.svg?raw'
import graphqlIcon from 'simple-icons/icons/graphql.svg?raw'
import haskellIcon from 'simple-icons/icons/haskell.svg?raw'
import haxeIcon from 'simple-icons/icons/haxe.svg?raw'
import htmlIcon from 'simple-icons/icons/html5.svg?raw'
import javaIcon from 'simple-icons/icons/openjdk.svg?raw'
import javascriptIcon from 'simple-icons/icons/javascript.svg?raw'
import juliaIcon from 'simple-icons/icons/julia.svg?raw'
import jsonIcon from 'simple-icons/icons/json.svg?raw'
import kotlinIcon from 'simple-icons/icons/kotlin.svg?raw'
import luaIcon from 'simple-icons/icons/lua.svg?raw'
import markdownIcon from 'simple-icons/icons/markdown.svg?raw'
import nimIcon from 'simple-icons/icons/nim.svg?raw'
import ocamlIcon from 'simple-icons/icons/ocaml.svg?raw'
import perlIcon from 'simple-icons/icons/perl.svg?raw'
import phpIcon from 'simple-icons/icons/php.svg?raw'
import pythonIcon from 'simple-icons/icons/python.svg?raw'
import racketIcon from 'simple-icons/icons/racket.svg?raw'
import rIcon from 'simple-icons/icons/r.svg?raw'
import rubyIcon from 'simple-icons/icons/ruby.svg?raw'
import rustIcon from 'simple-icons/icons/rust.svg?raw'
import sassIcon from 'simple-icons/icons/sass.svg?raw'
import scalaIcon from 'simple-icons/icons/scala.svg?raw'
import svelteIcon from 'simple-icons/icons/svelte.svg?raw'
import swiftIcon from 'simple-icons/icons/swift.svg?raw'
import typescriptIcon from 'simple-icons/icons/typescript.svg?raw'
import vueIcon from 'simple-icons/icons/vuedotjs.svg?raw'
import valaIcon from 'simple-icons/icons/vala.svg?raw'
import webassemblyIcon from 'simple-icons/icons/webassembly.svg?raw'
import zigIcon from 'simple-icons/icons/zig.svg?raw'
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/github.css'
import {
  Check, ChevronDown, ChevronRight, CircleAlert, Clock3, Code2, Copy, Eye,
  ExternalLink, FileImage, FileText, Folder,
  FolderOpen, GitFork, HardDrive, LoaderCircle, LogOut, RefreshCw, Search,
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
type ConfirmationRequest = { title: string; message: string; confirmLabel: string; tone: 'danger' | 'primary'; requiredText?: string }
type DependencyPullRequest = { number: number; title: string; html_url: string; user: { login: string }; head: { sha: string } }

type HighlightLanguageFactory = Parameters<typeof hljs.registerLanguage>[1]
const highlightLanguageLoaders: Record<string, () => Promise<unknown>> = {
  ada: () => import('highlight.js/lib/languages/ada'),
  arduino: () => import('highlight.js/lib/languages/arduino'),
  awk: () => import('highlight.js/lib/languages/awk'),
  bash: () => import('highlight.js/lib/languages/bash'),
  c: () => import('highlight.js/lib/languages/c'),
  clojure: () => import('highlight.js/lib/languages/clojure'),
  cpp: () => import('highlight.js/lib/languages/cpp'),
  csharp: () => import('highlight.js/lib/languages/csharp'),
  crystal: () => import('highlight.js/lib/languages/crystal'),
  css: () => import('highlight.js/lib/languages/css'),
  dart: () => import('highlight.js/lib/languages/dart'),
  d: () => import('highlight.js/lib/languages/d'),
  dockerfile: () => import('highlight.js/lib/languages/dockerfile'),
  elm: () => import('highlight.js/lib/languages/elm'),
  elixir: () => import('highlight.js/lib/languages/elixir'),
  erlang: () => import('highlight.js/lib/languages/erlang'),
  fortran: () => import('highlight.js/lib/languages/fortran'),
  fsharp: () => import('highlight.js/lib/languages/fsharp'),
  go: () => import('highlight.js/lib/languages/go'),
  graphql: () => import('highlight.js/lib/languages/graphql'),
  groovy: () => import('highlight.js/lib/languages/groovy'),
  haskell: () => import('highlight.js/lib/languages/haskell'),
  haxe: () => import('highlight.js/lib/languages/haxe'),
  ini: () => import('highlight.js/lib/languages/ini'),
  java: () => import('highlight.js/lib/languages/java'),
  javascript: () => import('highlight.js/lib/languages/javascript'),
  json: () => import('highlight.js/lib/languages/json'),
  julia: () => import('highlight.js/lib/languages/julia'),
  kotlin: () => import('highlight.js/lib/languages/kotlin'),
  lisp: () => import('highlight.js/lib/languages/lisp'),
  lua: () => import('highlight.js/lib/languages/lua'),
  makefile: () => import('highlight.js/lib/languages/makefile'),
  markdown: () => import('highlight.js/lib/languages/markdown'),
  matlab: () => import('highlight.js/lib/languages/matlab'),
  nix: () => import('highlight.js/lib/languages/nix'),
  nim: () => import('highlight.js/lib/languages/nim'),
  objectivec: () => import('highlight.js/lib/languages/objectivec'),
  ocaml: () => import('highlight.js/lib/languages/ocaml'),
  perl: () => import('highlight.js/lib/languages/perl'),
  php: () => import('highlight.js/lib/languages/php'),
  powershell: () => import('highlight.js/lib/languages/powershell'),
  prolog: () => import('highlight.js/lib/languages/prolog'),
  python: () => import('highlight.js/lib/languages/python'),
  r: () => import('highlight.js/lib/languages/r'),
  ruby: () => import('highlight.js/lib/languages/ruby'),
  rust: () => import('highlight.js/lib/languages/rust'),
  scala: () => import('highlight.js/lib/languages/scala'),
  scheme: () => import('highlight.js/lib/languages/scheme'),
  scss: () => import('highlight.js/lib/languages/scss'),
  shell: () => import('highlight.js/lib/languages/shell'),
  sql: () => import('highlight.js/lib/languages/sql'),
  swift: () => import('highlight.js/lib/languages/swift'),
  typescript: () => import('highlight.js/lib/languages/typescript'),
  vala: () => import('highlight.js/lib/languages/vala'),
  verilog: () => import('highlight.js/lib/languages/verilog'),
  vhdl: () => import('highlight.js/lib/languages/vhdl'),
  wasm: () => import('highlight.js/lib/languages/wasm'),
  xml: () => import('highlight.js/lib/languages/xml'),
  x86asm: () => import('highlight.js/lib/languages/x86asm'),
  yaml: () => import('highlight.js/lib/languages/yaml')
}

async function loadHighlightLanguage(name: string) {
  if (hljs.getLanguage(name)) return true
  const loader = highlightLanguageLoaders[name]
  if (!loader) return false
  const module = await loader() as Record<string, unknown>
  const factory = (typeof module.default === 'function' ? module.default : Object.values(module).find(value => typeof value === 'function')) as HighlightLanguageFactory | undefined
  if (!factory) return false
  hljs.registerLanguage(name, factory)
  return true
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
const deletingRepository = ref(false)
const configuringDependencies = ref(false)
const loadingDependencyPullRequests = ref(false)
const dependencyPullRequestsLoaded = ref(false)
const dependencyPullRequests = ref<DependencyPullRequest[]>([])
const dependencyPullRequestMode = ref<'dependabot' | 'all'>('dependabot')
const selectedDependencyPullNumbers = ref<number[]>([])
const dependencyPullRequestAction = ref<'close' | 'merge' | null>(null)
const dependencyPullRequestProgress = ref('')
const createdPullRequest = shallowRef<{ title: string; url: string } | null>(null)
const copyUrl = ref('')
const copyLinkLabel = ref('Open your independent copy')
const copyProgress = ref('')
const forkingRepository = ref(false)
const forkUrl = ref('')
const forkProgress = ref('')
const token = ref('')
const tokenInput = ref('')
const user = shallowRef<GitHubUser | null>(null)
const userRepositories = ref<Repository[]>([])
const refreshingProfile = ref(false)
const showAuth = ref(false)
const showRepositoryPicker = ref(false)
const repositorySearch = ref('')
const toasts = ref<Toast[]>([])
const confirmation = shallowRef<ConfirmationRequest | null>(null)
const confirmationText = ref('')
const rateLimit = ref('GitHub API ready')
let settleConfirmation: ((confirmed: boolean) => void) | null = null
let toastId = 0

const apiBase = 'https://api.github.com'
const savedTokenStorageKey = 'gitview.github-token.v1'
const tokenKeyDatabase = 'gitview-auth'
const tokenKeyStore = 'keys'
const tokenKeyId = 'github-token'

type EncryptedToken = { version: 1; iv: string; ciphertext: string }

function openTokenKeyDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(tokenKeyDatabase, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(tokenKeyStore)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Could not open secure token storage.'))
  })
}

async function getTokenEncryptionKey() {
  const database = await openTokenKeyDatabase()
  try {
    const request = database.transaction(tokenKeyStore, 'readonly').objectStore(tokenKeyStore).get(tokenKeyId)
    return await new Promise<CryptoKey | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as CryptoKey | undefined)
      request.onerror = () => reject(request.error || new Error('Could not read the token encryption key.'))
    })
  } finally {
    database.close()
  }
}

async function putTokenEncryptionKey(key: CryptoKey) {
  const database = await openTokenKeyDatabase()
  try {
    const transaction = database.transaction(tokenKeyStore, 'readwrite')
    transaction.objectStore(tokenKeyStore).put(key, tokenKeyId)
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error || new Error('Could not save the token encryption key.'))
      transaction.onabort = () => reject(transaction.error || new Error('Saving the token encryption key was cancelled.'))
    })
  } finally {
    database.close()
  }
}

async function deleteTokenEncryptionKey() {
  const database = await openTokenKeyDatabase()
  try {
    const transaction = database.transaction(tokenKeyStore, 'readwrite')
    transaction.objectStore(tokenKeyStore).delete(tokenKeyId)
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error || new Error('Could not remove the token encryption key.'))
      transaction.onabort = () => reject(transaction.error || new Error('Removing the token encryption key was cancelled.'))
    })
  } finally {
    database.close()
  }
}

function encodeBase64(bytes: Uint8Array) {
  return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
}

function decodeBase64(value: string) {
  return Uint8Array.from(atob(value), character => character.charCodeAt(0))
}

async function saveEncryptedToken(tokenValue: string) {
  if (!globalThis.crypto?.subtle) throw new Error('Encrypted login storage requires a secure browser context (HTTPS or localhost).')
  const key = await globalThis.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
  await putTokenEncryptionKey(key)
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(tokenValue))
  const record: EncryptedToken = { version: 1, iv: encodeBase64(iv), ciphertext: encodeBase64(new Uint8Array(ciphertext)) }
  localStorage.setItem(savedTokenStorageKey, JSON.stringify(record))
}

async function readSavedToken() {
  const stored = localStorage.getItem(savedTokenStorageKey)
  if (!stored) return null
  if (!globalThis.crypto?.subtle) throw new Error('Encrypted login storage requires a secure browser context (HTTPS or localhost).')

  const record = JSON.parse(stored) as EncryptedToken
  if (record.version !== 1 || !record.iv || !record.ciphertext) throw new Error('Saved login data is invalid.')
  const key = await getTokenEncryptionKey()
  if (!key) throw new Error('Saved login encryption key is missing.')
  const plaintext = await globalThis.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: decodeBase64(record.iv) },
    key,
    decodeBase64(record.ciphertext)
  )
  return new TextDecoder().decode(plaintext)
}

async function removeSavedToken() {
  localStorage.removeItem(savedTokenStorageKey)
  await deleteTokenEncryptionKey()
}

async function restoreSavedSession() {
  let savedToken: string | null
  try {
    savedToken = await readSavedToken()
  } catch (error) {
    try { await removeSavedToken() } catch {}
    notify(`Saved login could not be decrypted: ${errorMessage(error)} Sign in again.`, 'error')
    return
  }
  if (!savedToken) return

  token.value = savedToken
  try {
    const { data: account } = await githubRequest<GitHubUser>('/user')
    user.value = account
    await loadUserRepositories()
  } catch (error) {
    token.value = ''
    if (errorMessage(error).includes('GitHub rejected this token')) {
      try { await removeSavedToken() } catch {}
      notify('Saved GitHub token is no longer valid. Sign in again.', 'error')
    } else {
      notify(`Could not restore your GitHub session: ${errorMessage(error)}`, 'error')
    }
  }
}

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
    else if (path.startsWith('.github/workflows/') && /\.ya?ml$/.test(name)) add('github-actions', 'workflow.yml')
  }
  return entries
})

const allDependencyPullRequestsSelected = computed(() => dependencyPullRequests.value.length > 0 && dependencyPullRequests.value.every(pull => selectedDependencyPullNumbers.value.includes(pull.number)))

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
  if (/^\.env(?:\.|$)/.test(name)) return 'code'
  if (/\.(md|markdown)$/.test(name) || ['readme', 'changelog'].includes(name)) return 'markdown'
  if (/\.html?$/.test(name)) return 'html'
  const extension = name.includes('.') ? name.split('.').pop() || '' : name
  if (extension === 'wasm') return 'binary'
  if (languageMap[extension] || highlightLanguageLoaders[extension]) return 'code'
  if (/\.(txt|log|csv|gitignore|ya?ml|toml|xml|json|ini|cfg|conf|properties)$/.test(name)) return 'code'
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
  awk: { label: 'AWK', mark: 'Awk', slug: 'awk', highlight: 'awk' },
  clj: { label: 'Clojure', mark: 'Clj', slug: 'clojure', highlight: 'clojure' },
  cljs: { label: 'ClojureScript', mark: 'Cljs', slug: 'clojure', highlight: 'clojure' },
  cljc: { label: 'Clojure', mark: 'Clj', slug: 'clojure', highlight: 'clojure' },
  cr: { label: 'Crystal', mark: 'Cr', slug: 'crystal', highlight: 'crystal' },
  dart: { label: 'Dart', mark: 'Dart', slug: 'dart', highlight: 'dart' },
  ex: { label: 'Elixir', mark: 'Ex', slug: 'elixir', highlight: 'elixir' },
  exs: { label: 'Elixir', mark: 'Ex', slug: 'elixir', highlight: 'elixir' },
  erl: { label: 'Erlang', mark: 'Er', slug: 'erlang', highlight: 'erlang' },
  hrl: { label: 'Erlang', mark: 'Er', slug: 'erlang', highlight: 'erlang' },
  f: { label: 'Fortran', mark: 'F', slug: 'fortran', highlight: 'fortran' },
  f03: { label: 'Fortran', mark: 'F', slug: 'fortran', highlight: 'fortran' },
  f90: { label: 'Fortran', mark: 'F', slug: 'fortran', highlight: 'fortran' },
  f95: { label: 'Fortran', mark: 'F', slug: 'fortran', highlight: 'fortran' },
  for: { label: 'Fortran', mark: 'F', slug: 'fortran', highlight: 'fortran' },
  fs: { label: 'F#', mark: 'F#', slug: 'fsharp', highlight: 'fsharp' },
  fsi: { label: 'F#', mark: 'F#', slug: 'fsharp', highlight: 'fsharp' },
  fsx: { label: 'F#', mark: 'F#', slug: 'fsharp', highlight: 'fsharp' },
  gradle: { label: 'Gradle', mark: 'Gr', slug: 'groovy', highlight: 'groovy' },
  groovy: { label: 'Groovy', mark: 'Gr', slug: 'groovy', highlight: 'groovy' },
  gvy: { label: 'Groovy', mark: 'Gr', slug: 'groovy', highlight: 'groovy' },
  hs: { label: 'Haskell', mark: 'Hs', slug: 'haskell', highlight: 'haskell' },
  lhs: { label: 'Haskell', mark: 'Hs', slug: 'haskell', highlight: 'haskell' },
  jl: { label: 'Julia', mark: 'Jl', slug: 'julia', highlight: 'julia' },
  kts: { label: 'Kotlin', mark: 'Kt', slug: 'kotlin', highlight: 'kotlin' },
  m: { label: 'Objective-C', mark: 'ObjC', slug: 'objectivec', highlight: 'objectivec' },
  mm: { label: 'Objective-C++', mark: 'ObjC', slug: 'objectivec', highlight: 'objectivec' },
  mat: { label: 'MATLAB', mark: 'Mat', slug: 'matlab', highlight: 'matlab' },
  matlab: { label: 'MATLAB', mark: 'Mat', slug: 'matlab', highlight: 'matlab' },
  ml: { label: 'OCaml', mark: 'ML', slug: 'ocaml', highlight: 'ocaml' },
  mli: { label: 'OCaml', mark: 'ML', slug: 'ocaml', highlight: 'ocaml' },
  nim: { label: 'Nim', mark: 'Nim', slug: 'nim', highlight: 'nim' },
  nims: { label: 'Nim', mark: 'Nim', slug: 'nim', highlight: 'nim' },
  pl: { label: 'Perl', mark: 'Pl', slug: 'perl', highlight: 'perl' },
  pm: { label: 'Perl', mark: 'Pm', slug: 'perl', highlight: 'perl' },
  ps1: { label: 'PowerShell', mark: 'PS', slug: 'powershell', highlight: 'powershell' },
  psm1: { label: 'PowerShell', mark: 'PS', slug: 'powershell', highlight: 'powershell' },
  r: { label: 'R', mark: 'R', slug: 'r', highlight: 'r' },
  scala: { label: 'Scala', mark: 'Sc', slug: 'scala', highlight: 'scala' },
  sc: { label: 'Scala', mark: 'Sc', slug: 'scala', highlight: 'scala' },
  sol: { label: 'Solidity', mark: 'Sol', slug: 'solidity', highlight: 'solidity' },
  tf: { label: 'Terraform', mark: 'Tf', slug: 'terraform', highlight: 'hcl' },
  tfvars: { label: 'Terraform', mark: 'Tf', slug: 'terraform', highlight: 'hcl' },
  toml: { label: 'TOML', mark: 'Toml', slug: 'toml', highlight: 'toml' },
  zig: { label: 'Zig', mark: 'Zig', slug: 'zig', highlight: null },
  zsh: { label: 'Zsh', mark: 'Zsh', slug: 'bash', highlight: 'bash' },
  ada: { label: 'Ada', mark: 'Ada', slug: 'ada', highlight: 'ada' },
  adb: { label: 'Ada', mark: 'Ada', slug: 'ada', highlight: 'ada' },
  ads: { label: 'Ada', mark: 'Ada', slug: 'ada', highlight: 'ada' },
  ino: { label: 'Arduino', mark: 'Ino', slug: 'arduino', highlight: 'arduino' },
  asm: { label: 'Assembly', mark: 'ASM', slug: 'assembly', highlight: 'x86asm' },
  s: { label: 'Assembly', mark: 'ASM', slug: 'assembly', highlight: 'x86asm' },
  bzl: { label: 'Starlark', mark: 'Bzl', slug: 'bazel', highlight: 'python' },
  bazel: { label: 'Starlark', mark: 'Bzl', slug: 'bazel', highlight: 'python' },
  cbl: { label: 'COBOL', mark: 'Cob', slug: 'cobol', highlight: null },
  cob: { label: 'COBOL', mark: 'Cob', slug: 'cobol', highlight: null },
  d: { label: 'D', mark: 'D', slug: 'd', highlight: 'd' },
  elm: { label: 'Elm', mark: 'Elm', slug: 'elm', highlight: 'elm' },
  gql: { label: 'GraphQL', mark: 'GQL', slug: 'graphql', highlight: 'graphql' },
  graphql: { label: 'GraphQL', mark: 'GQL', slug: 'graphql', highlight: 'graphql' },
  hx: { label: 'Haxe', mark: 'Hx', slug: 'haxe', highlight: 'haxe' },
  ini: { label: 'INI', mark: 'INI', slug: 'ini', highlight: 'ini' },
  cfg: { label: 'Config', mark: 'CFG', slug: 'ini', highlight: 'ini' },
  conf: { label: 'Config', mark: 'CFG', slug: 'ini', highlight: 'ini' },
  properties: { label: 'Properties', mark: 'Prop', slug: 'ini', highlight: 'properties' },
  lisp: { label: 'Lisp', mark: 'Lisp', slug: 'lisp', highlight: 'lisp' },
  lsp: { label: 'Lisp', mark: 'Lisp', slug: 'lisp', highlight: 'lisp' },
  nix: { label: 'Nix', mark: 'Nix', slug: 'nix', highlight: 'nix' },
  pro: { label: 'Prolog', mark: 'Pro', slug: 'prolog', highlight: 'prolog' },
  prolog: { label: 'Prolog', mark: 'Pro', slug: 'prolog', highlight: 'prolog' },
  rkt: { label: 'Racket', mark: 'Rkt', slug: 'racket', highlight: 'racket' },
  scm: { label: 'Scheme', mark: 'Scm', slug: 'scheme', highlight: 'scheme' },
  ss: { label: 'Scheme', mark: 'Scm', slug: 'scheme', highlight: 'scheme' },
  vala: { label: 'Vala', mark: 'Vala', slug: 'vala', highlight: 'vala' },
  v: { label: 'Verilog', mark: 'V', slug: 'verilog', highlight: 'verilog' },
  sv: { label: 'SystemVerilog', mark: 'SV', slug: 'verilog', highlight: 'verilog' },
  vhd: { label: 'VHDL', mark: 'VHDL', slug: 'vhdl', highlight: 'vhdl' },
  vhdl: { label: 'VHDL', mark: 'VHDL', slug: 'vhdl', highlight: 'vhdl' },
  wat: { label: 'WebAssembly', mark: 'Wasm', slug: 'webassembly', highlight: 'wasm' },
  wast: { label: 'WebAssembly', mark: 'Wasm', slug: 'webassembly', highlight: 'wasm' },
}

const languageInfo = computed<LanguageInfo>(() => {
  const name = activeFile.value?.name.toLowerCase() || ''
  const extension = name.includes('.') ? name.split('.').pop() || '' : name
  return languageMap[extension] || {
    label: extension ? extension.toUpperCase() : 'Plain text',
    mark: extension ? extension.slice(0, 4).toUpperCase() : 'TXT',
    slug: extension,
    highlight: highlightLanguageLoaders[extension] ? extension : null
  }
})

const languageIcons: Record<string, string> = {
  ada: adaIcon,
  arduino: arduinoIcon,
  bash: bashIcon,
  c: cIcon,
  cpp: cppIcon,
  csharp: csharpIcon,
  css: cssIcon,
  clojure: clojureIcon,
  crystal: crystalIcon,
  dart: dartIcon,
  docker: dockerIcon,
  elm: elmIcon,
  elixir: elixirIcon,
  erlang: erlangIcon,
  fortran: fortranIcon,
  fsharp: fsharpIcon,
  go: goIcon,
  graphql: graphqlIcon,
  haxe: haxeIcon,
  haskell: haskellIcon,
  html: htmlIcon,
  java: javaIcon,
  javascript: javascriptIcon,
  julia: juliaIcon,
  json: jsonIcon,
  kotlin: kotlinIcon,
  lua: luaIcon,
  markdown: markdownIcon,
  nim: nimIcon,
  ocaml: ocamlIcon,
  perl: perlIcon,
  php: phpIcon,
  python: pythonIcon,
  racket: racketIcon,
  r: rIcon,
  ruby: rubyIcon,
  rust: rustIcon,
  sass: sassIcon,
  scala: scalaIcon,
  svelte: svelteIcon,
  swift: swiftIcon,
  typescript: typescriptIcon,
  vue: vueIcon,
  vala: valaIcon,
  webassembly: webassemblyIcon,
  zig: zigIcon,
}

const languageBrandColors: Record<string, string> = {
  ada: '#02f88c', arduino: '#00878f', bash: '#4eaa25', c: '#536a8c', cpp: '#00599c', csharp: '#512bd4',
  css: '#663399', clojure: '#5881d8', crystal: '#000100', dart: '#0175c2', docker: '#2496ed', elm: '#60b5cc', elixir: '#4b275f', erlang: '#a90533', fortran: '#734f96', fsharp: '#378bba', go: '#00add8', graphql: '#e10098', haskell: '#5e5086', haxe: '#df7900', html: '#e34f26',
  java: '#ed8b00', javascript: '#d8b900', json: '#626d78', julia: '#9558b2', kotlin: '#7f52ff',
  lua: '#000080', markdown: '#4b5563', nim: '#ffe953', ocaml: '#ec6813', perl: '#39457e', php: '#777bb4', python: '#3776ab', r: '#276dc3',
  racket: '#9f1d20', ruby: '#cc342d', rust: '#8d4a36', sass: '#cc6699', scala: '#dc322f', svelte: '#ff3e00',
  swift: '#f05138', typescript: '#3178c6', vala: '#7239b3', vue: '#42b883', webassembly: '#654ff0', zig: '#f7a41d',
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

function requestConfirmation(request: ConfirmationRequest) {
  if (settleConfirmation) return Promise.resolve(false)
  return new Promise<boolean>(resolve => {
    settleConfirmation = resolve
    confirmationText.value = ''
    confirmation.value = request
  })
}

function resolveConfirmation(confirmed: boolean) {
  const settle = settleConfirmation
  settleConfirmation = null
  confirmation.value = null
  confirmationText.value = ''
  settle?.(confirmed)
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
  selectedPaths.value = []
  selectionMode.value = false
  dependencyPullRequests.value = []
  dependencyPullRequestsLoaded.value = false
  dependencyPullRequestMode.value = 'dependabot'
  selectedDependencyPullNumbers.value = []
  dependencyPullRequestProgress.value = ''
  createdPullRequest.value = null
  currentPath.value = ''
  activeFile.value = null
  previewText.value = ''
  previewHtml.value = ''
  previewImage.value = ''
  copyUrl.value = ''
  copyLinkLabel.value = 'Open your independent copy'
  forkUrl.value = ''
  forkProgress.value = ''

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
      const source = await fetchPreviewText(item)
      if (languageInfo.value.highlight) await loadHighlightLanguage(languageInfo.value.highlight)
      previewText.value = source
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
    let remembered = false
    let storageError = ''
    try {
      await saveEncryptedToken(providedToken)
      remembered = true
    } catch (error) {
      storageError = errorMessage(error)
      try { await removeSavedToken() } catch {}
    }
    user.value = account
    tokenInput.value = ''
    showAuth.value = false
    notify(remembered
      ? `Connected as ${account.login}. This browser will remember you until you sign out.`
      : `Connected as ${account.login}, but this browser could not save the encrypted session: ${storageError}`,
    remembered ? 'success' : 'info')
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

async function signOut() {
  token.value = ''
  user.value = null
  userRepositories.value = []
  try {
    await removeSavedToken()
  } catch (error) {
    notify(`Signed out, but browser encryption-key cleanup failed: ${errorMessage(error)}`, 'error')
    return
  }
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

async function forkRepository() {
  const source = repository.value
  const account = user.value
  if (!source || forkingRepository.value || copyingRepository.value) return
  if (!account || !token.value) {
    showAuth.value = true
    notify('Sign in with a GitHub token to fork this repository.', 'info')
    return
  }
  if (source.owner.login.toLowerCase() === account.login.toLowerCase()) {
    notify('This repository is already under your account; GitHub cannot fork it to the same owner.', 'info')
    return
  }

  forkingRepository.value = true
  forkUrl.value = ''
  forkProgress.value = 'Checking for an existing fork…'
  try {
    const targetPath = `/repos/${encodeURIComponent(account.login)}/${encodeURIComponent(source.name)}`
    try {
      const { data: existing } = await githubRequest<Repository & { fork?: boolean; parent?: { full_name: string } }>(targetPath)
      if (existing.fork && existing.parent?.full_name.toLowerCase() === source.full_name.toLowerCase()) {
        forkUrl.value = existing.html_url
        forkProgress.value = ''
        notify('This repository is already forked to your account.', 'info')
        await loadUserRepositories()
        return
      }
      throw new Error(`A repository named ${source.name} already exists in your account, so GitHub cannot create a fork with that name.`)
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('not found')) throw error
    }

    forkProgress.value = 'Requesting GitHub fork…'
    const { data: fork } = await githubRequest<Repository>(`/repos/${source.full_name}/forks`, {
      method: 'POST',
      body: JSON.stringify({ name: source.name })
    })
    forkUrl.value = fork.html_url
    forkProgress.value = ''
    notify('GitHub fork created. GitHub is copying the repository now.', 'success')
    await loadUserRepositories()
  } catch (error) {
    forkProgress.value = ''
    notify(errorMessage(error), 'error')
  } finally {
    forkingRepository.value = false
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

function selectedRepositoryFiles() {
  const files = new Set<string>()
  for (const path of selectedPaths.value) {
    const isDirectory = tree.value.some(entry => entry.path === path && entry.type === 'tree')
    if (isDirectory) {
      for (const entry of tree.value) if (entry.type === 'blob' && entry.path.startsWith(`${path}/`)) files.add(entry.path)
    } else if (tree.value.some(entry => entry.type === 'blob' && entry.path === path)) {
      files.add(path)
    }
  }
  return [...files]
}

async function deleteSelectedPaths() {
  const repo = repository.value
  if (!repo || !selectedPaths.value.length) return
  if (!user.value || !token.value) {
    showAuth.value = true
    notify('Connect a GitHub account to create a deletion pull request.', 'info')
    return
  }
  const files = selectedRepositoryFiles()
  if (!files.length) {
    notify('The selection contains no files to delete.', 'error')
    return
  }
  const confirmed = await requestConfirmation({
    title: 'Create deletion pull request?',
    message: `This will propose deleting ${files.length} selected file${files.length === 1 ? '' : 's'} from ${repo.full_name}. The repository will not change unless the pull request is merged.`,
    confirmLabel: 'Create pull request',
    tone: 'danger'
  })
  if (!confirmed) return

  deletingFiles.value = true
  try {
    const changes = files.map(path => ({ path, remove: true }))
    await createChangePullRequest(`Delete ${files.length} selected file${files.length === 1 ? '' : 's'}`, `Bulk deletion requested in GitView. Review the file changes before merging.\n\nDeleted files: ${files.length}`, changes)
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

async function permanentlyDeleteSelectedFiles() {
  const repo = repository.value
  if (!repo || !selectedPaths.value.length || deletingFiles.value) return
  if (!user.value || !token.value) {
    showAuth.value = true
    notify('Connect a GitHub account to delete repository files.', 'info')
    return
  }

  const files = selectedRepositoryFiles()
  if (!files.length) {
    notify('The selection contains no files to delete.', 'error')
    return
  }
  const confirmed = await requestConfirmation({
    title: 'Delete selected files permanently?',
    message: `This will commit deletion of ${files.length} selected file${files.length === 1 ? '' : 's'} from ${repo.full_name} directly to its default branch. This cannot be undone from GitView. Type the repository name to continue.`,
    confirmLabel: 'Delete files permanently',
    tone: 'danger',
    requiredText: repo.full_name
  })
  if (!confirmed) return

  deletingFiles.value = true
  try {
    const branchName = repo.default_branch.split('/').map(encodeURIComponent).join('/')
    const { data: branch } = await githubRequest<{ commit: { sha: string; commit: { tree: { sha: string } } } }>(`/repos/${repo.full_name}/branches/${branchName}`)
    const deletions = files.map(path => ({
      path,
      mode: tree.value.find(entry => entry.type === 'blob' && entry.path === path)?.mode || '100644',
      type: 'blob',
      sha: null
    }))
    const { data: updatedTree } = await githubRequest<{ sha: string }>(`/repos/${repo.full_name}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: branch.commit.commit.tree.sha, tree: deletions })
    })
    const { data: commit } = await githubRequest<{ sha: string }>(`/repos/${repo.full_name}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({ message: `Delete ${files.length} selected file${files.length === 1 ? '' : 's'}`, tree: updatedTree.sha, parents: [branch.commit.sha] })
    })
    await githubRequest(`/repos/${repo.full_name}/git/refs/heads/${branchName}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha })
    })
    selectionMode.value = false
    selectedPaths.value = []
    activeFile.value = null
    await loadRepository(repo.html_url)
    notify(`${files.length} file${files.length === 1 ? '' : 's'} deleted from ${repo.default_branch}.`, 'success')
  } catch (error) {
    notify(errorMessage(error), 'error')
  } finally {
    deletingFiles.value = false
  }
}

async function deleteRepository() {
  const repo = repository.value
  if (!repo || deletingRepository.value) return
  if (!user.value || !token.value) {
    showAuth.value = true
    notify('Sign in with a GitHub token to delete a repository.', 'info')
    return
  }
  if (repo.owner.login.toLowerCase() !== user.value.login.toLowerCase()) {
    notify('Only the repository owner can delete this repository.', 'error')
    return
  }

  const confirmed = await requestConfirmation({
    title: 'Permanently delete this repository?',
    message: `This permanently deletes ${repo.full_name}, including all files, branches, issues, and pull requests. This cannot be undone. Type the repository name below to continue.`,
    confirmLabel: 'Delete repository',
    tone: 'danger',
    requiredText: repo.full_name
  })
  if (!confirmed) return

  deletingRepository.value = true
  try {
    const path = repo.full_name.split('/').map(encodeURIComponent).join('/')
    await githubRequest(`/repos/${path}`, { method: 'DELETE' })
    repository.value = null
    tree.value = []
    repositoryUrl.value = ''
    currentPath.value = ''
    activeFile.value = null
    selectedPaths.value = []
    selectionMode.value = false
    previewText.value = ''
    previewHtml.value = ''
    previewImage.value = ''
    websiteDocument.value = ''
    await loadUserRepositories()
    notify(`${repo.full_name} was permanently deleted.`, 'success')
  } catch (error) {
    notify(errorMessage(error), 'error')
  } finally {
    deletingRepository.value = false
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
  if (hasDependabotConfig.value) {
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

async function loadDependencyPullRequests(mode: 'dependabot' | 'all' = 'dependabot', excludedNumbers: number[] = []) {
  const repo = repository.value
  if (!repo) return
  if (!token.value) {
    showAuth.value = true
    notify('Connect a GitHub account to check dependency pull requests.', 'info')
    return
  }
  loadingDependencyPullRequests.value = true
  try {
    const openPullRequests: DependencyPullRequest[] = []
    for (let page = 1; page <= 20; page++) {
      const { data } = await githubRequest<DependencyPullRequest[]>(`/repos/${repo.full_name}/pulls?state=open&per_page=100&page=${page}`, { cache: 'no-store' })
      openPullRequests.push(...data)
      if (data.length < 100) break
    }
    dependencyPullRequestMode.value = mode
    dependencyPullRequests.value = openPullRequests.filter(pull =>
      (mode === 'all' || pull.user.login.toLowerCase().includes('dependabot')) && !excludedNumbers.includes(pull.number)
    )
    selectedDependencyPullNumbers.value = []
    dependencyPullRequestsLoaded.value = true
  } catch (error) {
    notify(errorMessage(error), 'error')
  } finally {
    loadingDependencyPullRequests.value = false
  }
}

function toggleDependencyPullRequest(number: number) {
  selectedDependencyPullNumbers.value = selectedDependencyPullNumbers.value.includes(number)
    ? selectedDependencyPullNumbers.value.filter(selected => selected !== number)
    : [...selectedDependencyPullNumbers.value, number]
}

function toggleAllDependencyPullRequests() {
  selectedDependencyPullNumbers.value = allDependencyPullRequestsSelected.value
    ? []
    : dependencyPullRequests.value.map(pull => pull.number)
}

async function updateSelectedDependencyPullRequests(action: 'close' | 'merge') {
  const repo = repository.value
  if (!repo || dependencyPullRequestAction.value) return
  const selected = dependencyPullRequests.value.filter(pull => selectedDependencyPullNumbers.value.includes(pull.number))
  if (!selected.length) return
  if (!token.value) {
    showAuth.value = true
    notify('Connect a GitHub account to update pull requests.', 'info')
    return
  }

  const confirmed = await requestConfirmation({
    title: `${action === 'merge' ? 'Merge' : 'Close'} selected pull requests?`,
    message: `${action === 'merge' ? 'Squash-merge' : 'Close'} ${selected.length} ${dependencyPullRequestMode.value === 'all' ? '' : 'Dependabot '}pull request${selected.length === 1 ? '' : 's'} in ${repo.full_name}?`,
    confirmLabel: action === 'merge' ? 'Merge pull requests' : 'Close pull requests',
    tone: action === 'merge' ? 'primary' : 'danger'
  })
  if (!confirmed) return

  dependencyPullRequestAction.value = action
  let succeeded = 0
  const succeededPullNumbers: number[] = []
  const failures: string[] = []
  try {
    for (const [index, pull] of selected.entries()) {
      dependencyPullRequestProgress.value = `${action === 'merge' ? 'Merging' : 'Closing'} ${index + 1} of ${selected.length}…`
      try {
        if (action === 'close') {
          await githubRequest(`/repos/${repo.full_name}/pulls/${pull.number}`, {
            method: 'PATCH',
            body: JSON.stringify({ state: 'closed' })
          })
        } else {
          const { data } = await githubRequest<{ merged: boolean; message?: string }>(`/repos/${repo.full_name}/pulls/${pull.number}/merge`, {
            method: 'PUT',
            body: JSON.stringify({ merge_method: 'squash', sha: pull.head.sha })
          })
          if (!data.merged) throw new Error(data.message || 'GitHub did not merge this pull request.')
        }
        succeeded++
        succeededPullNumbers.push(pull.number)
        dependencyPullRequests.value = dependencyPullRequests.value.filter(item => item.number !== pull.number)
        selectedDependencyPullNumbers.value = selectedDependencyPullNumbers.value.filter(number => number !== pull.number)
      } catch (error) {
        failures.push(`#${pull.number}: ${errorMessage(error)}`)
      }
    }

    await loadDependencyPullRequests(dependencyPullRequestMode.value, succeededPullNumbers)
    const resultMessage = `${succeeded} pull request${succeeded === 1 ? '' : 's'} ${action === 'merge' ? 'merged' : 'closed'}.`
    if (failures.length) notify(`${resultMessage} ${failures.length} failed: ${failures[0]}`, succeeded ? 'info' : 'error')
    else notify(resultMessage, 'success')
  } finally {
    dependencyPullRequestProgress.value = ''
    dependencyPullRequestAction.value = null
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

async function copyConfirmationText() {
  const value = confirmation.value?.requiredText
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
    notify(`${value} copied.`, 'success')
  } catch (error) {
    notify(`Could not copy repository name: ${errorMessage(error)}`, 'error')
  }
}

onMounted(() => { void restoreSavedSession() })
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
          <div class="bulk-toolbar-actions">
            <button type="button" :disabled="!selectedPaths.length || deletingFiles" @click="deleteSelectedPaths">Create delete PR</button>
            <button type="button" class="permanent-delete-button" :disabled="!selectedPaths.length || deletingFiles" @click="permanentlyDeleteSelectedFiles">Delete now</button>
          </div>
        </div>
        <div class="file-tree">
          <div v-for="item in visibleItems" :key="item.path" class="file-entry-row">
            <UCheckbox v-if="selectionMode" class="file-selection-checkbox" size="sm" :model-value="selectedPaths.includes(item.path)" :aria-label="`Select ${item.path} for deletion`" @update:model-value="toggleSelectedPath(item.path)" />
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
            <div class="eyebrow"><span class="eyebrow-line" /> YOUR GITHUB WORKSPACE</div>
            <h1>Find your next<br><span>repository.</span></h1>
            <p>Browse code, manage dependency updates, and create independent repository copies from one focused workspace.</p>
            <form class="welcome-search" @submit.prevent="loadRepository()">
              <GitHubMark :size="17" />
              <input v-model="repositoryUrl" aria-label="GitHub repository URL" placeholder="Paste a GitHub repository URL" spellcheck="false">
              <button type="submit" :disabled="loadingRepository"><LoaderCircle v-if="loadingRepository" class="spin" :size="16" /><span v-else>Explore <ChevronRight :size="15" /></span></button>
            </form>
            <div class="welcome-footnote"><ShieldCheck :size="15" /> Explore public repositories instantly. Sign in to manage private repos and repository actions.</div>
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
              <button class="copy-repo-button" type="button" :disabled="copyingRepository || forkingRepository" @click="copyRepository">
                <LoaderCircle v-if="copyingRepository" class="spin" :size="17" />
                <HardDrive v-else :size="17" />
                {{ copyingRepository ? 'Copying repository…' : 'Create an independent copy' }}
              </button>
              <button class="fork-repo-button" type="button" :disabled="copyingRepository || forkingRepository" @click="forkRepository">
                <LoaderCircle v-if="forkingRepository" class="spin" :size="16" />
                <GitFork v-else :size="16" />
                {{ forkingRepository ? 'Forking…' : 'Create a fork' }}
              </button>
              <button v-if="user && user.login.toLowerCase() === repository.owner.login.toLowerCase()" class="delete-repo-button" type="button" :disabled="deletingRepository" @click="deleteRepository">
                <LoaderCircle v-if="deletingRepository" class="spin" :size="15" />
                <X v-else :size="15" />
                {{ deletingRepository ? 'Deleting repository…' : 'Delete repository' }}
              </button>
              <a class="secondary-action" :href="repository.html_url" target="_blank" rel="noreferrer">View on GitHub <ExternalLink :size="14" /></a>
            </div>
            <section class="automation-panel" aria-labelledby="dependency-heading">
              <div class="automation-heading">
                <div><span class="eyebrow">DEPENDENCIES</span><h2 id="dependency-heading">Scheduled updates</h2></div>
                <span class="automation-count">{{ dependencyEcosystems.length }} weekly update rules</span>
              </div>
              <p v-if="dependencyEcosystems.length">Detected: {{ dependencyEcosystems.map(rule => `${rule.ecosystem} ${rule.directory}`).join(' · ') }}. Merge the config pull request to enable weekly update checks for these manifests.</p>
              <p v-else>No supported dependency manifests found. Supported managers include npm, pip, Cargo, Go, Composer, and more.</p>
              <div class="automation-actions">
                <button class="automation-button primary" type="button" :disabled="configuringDependencies || !dependencyEcosystems.length || hasDependabotConfig" @click="enableDependencyUpdates">
                  <LoaderCircle v-if="configuringDependencies" class="spin" :size="14" /><span v-else>{{ hasDependabotConfig ? 'Dependabot configured' : 'Configure weekly updates' }}</span>
                </button>
                <button class="automation-button" type="button" :disabled="loadingDependencyPullRequests || dependencyPullRequestAction !== null" @click="loadDependencyPullRequests('dependabot')">
                  <LoaderCircle v-if="loadingDependencyPullRequests" class="spin" :size="14" /><span v-else>Load Dependabot PRs</span>
                </button>
                <button class="automation-button" type="button" :disabled="loadingDependencyPullRequests || dependencyPullRequestAction !== null" @click="loadDependencyPullRequests('all')">
                  <LoaderCircle v-if="loadingDependencyPullRequests" class="spin" :size="14" /><span v-else>Load all PRs</span>
                </button>
              </div>
              <a v-if="createdPullRequest" class="automation-pr" :href="createdPullRequest.url" target="_blank" rel="noreferrer"><Check :size="14" /> {{ createdPullRequest.title }} <ExternalLink :size="12" /></a>
              <div v-if="dependencyPullRequestsLoaded && !dependencyPullRequests.length" class="automation-empty">No open {{ dependencyPullRequestMode === 'all' ? '' : 'Dependabot ' }}pull requests.</div>
              <template v-if="dependencyPullRequests.length">
                <div class="dependency-selection-toolbar">
                  <UCheckbox class="dependency-select-all" size="sm" label="Select all" :model-value="allDependencyPullRequestsSelected" @update:model-value="toggleAllDependencyPullRequests" />
                  <span>{{ selectedDependencyPullNumbers.length }} selected</span>
                  <button class="automation-button danger" type="button" :disabled="!selectedDependencyPullNumbers.length || dependencyPullRequestAction !== null" @click="updateSelectedDependencyPullRequests('close')">Close selected</button>
                  <button class="automation-button primary" type="button" :disabled="!selectedDependencyPullNumbers.length || dependencyPullRequestAction !== null" @click="updateSelectedDependencyPullRequests('merge')">Merge selected</button>
                </div>
                <div v-if="dependencyPullRequestProgress" class="copy-progress"><LoaderCircle class="spin" :size="14" />{{ dependencyPullRequestProgress }}</div>
                <div v-for="pull in dependencyPullRequests" :key="pull.number" class="dependency-pr-row">
                  <UCheckbox class="dependency-pr-checkbox" size="sm" :model-value="selectedDependencyPullNumbers.includes(pull.number)" :aria-label="`Select pull request ${pull.number}`" @update:model-value="toggleDependencyPullRequest(pull.number)" />
                  <a class="automation-pr" :href="pull.html_url" target="_blank" rel="noreferrer"><span>#{{ pull.number }}</span>{{ pull.title }}<ExternalLink :size="12" /></a>
                </div>
              </template>
            </section>
            <div v-if="copyProgress" class="copy-progress"><LoaderCircle class="spin" :size="14" />{{ copyProgress }}</div>
            <a v-if="copyUrl" class="fork-success" :href="copyUrl" target="_blank" rel="noreferrer"><Check :size="16" /> {{ copyLinkLabel }} <ExternalLink :size="13" /></a>
            <div v-if="forkProgress" class="copy-progress"><LoaderCircle class="spin" :size="14" />{{ forkProgress }}</div>
            <a v-if="forkUrl" class="fork-success" :href="forkUrl" target="_blank" rel="noreferrer"><GitFork :size="15" /> Open your GitHub fork <ExternalLink :size="13" /></a>
            <div class="overview-divider" />
            <div class="folder-prompt"><FolderOpen :size="16" /><span>Choose a folder or file from the tree to explore its contents.</span></div>
          </div>

          <div v-else class="file-preview">
            <div v-if="fileKind === 'code' || (fileKind === 'html' && htmlPreviewMode === 'source')" class="source-file-card">
              <div class="source-file-header">
                <div class="source-file-identity">
                  <span v-if="languageIconSvg" class="language-icon" :style="{ color: languageBrandColors[languageInfo.slug] || '#53657f' }" aria-hidden="true" v-html="languageIconSvg" />
                  <span v-else class="language-mark">{{ languageInfo.mark }}</span>
                  <strong :title="activeFile.path">{{ activeFile.name }}</strong>
                  <span class="source-language-label">{{ languageInfo.label }}</span>
                </div>
                <div class="preview-toolbar-actions">
                  <button class="icon-button" type="button" title="Copy file path" aria-label="Copy file path" @click="copyPath(activeFile.path)"><Copy :size="15" /></button>
                  <a class="icon-button" :href="`https://github.com/${repository.full_name}/blob/${encodeURIComponent(repository.default_branch)}/${activeFile.path.split('/').map(encodeURIComponent).join('/')}`" target="_blank" rel="noreferrer" title="Open on GitHub"><ExternalLink :size="15" /></a>
                  <a class="download-action" :href="`https://raw.githubusercontent.com/${repository.full_name}/${encodeURIComponent(repository.default_branch)}/${activeFile.path.split('/').map(encodeURIComponent).join('/')}`" target="_blank" rel="noreferrer">Download</a>
                </div>
              </div>
              <div class="source-file-meta">
                <span>{{ formatBytes(activeFile.size) }}</span><span class="meta-separator">/</span><span>{{ repository.default_branch }}</span>
              </div>
              <div v-if="fileKind === 'html'" class="html-view-controls" role="group" aria-label="HTML preview mode">
                <button type="button" :class="{ active: htmlPreviewMode === 'website' }" @click="htmlPreviewMode = 'website'"><Eye :size="14" /> Website</button>
                <button type="button" :class="{ active: htmlPreviewMode === 'source' }" @click="htmlPreviewMode = 'source'"><Code2 :size="14" /> Source</button>
              </div>
              <div v-if="previewLoading" class="file-loading"><LoaderCircle class="spin" :size="23" /><span>Loading file…</span></div>
              <div v-else-if="previewError" class="preview-message"><CircleAlert :size="19" /><span>{{ previewError }}</span></div>
              <pre v-else-if="previewText" class="code-preview"><code v-if="highlightedCode" class="hljs" v-html="highlightedCode" /><code v-else>{{ previewText }}</code></pre>
              <div v-else class="preview-message"><FileText :size="19" /><span>No preview is available for this file.</span></div>
            </div>

            <div v-else>
              <div class="preview-toolbar">
                <div class="preview-file-title"><component :is="fileIcon(activeFile)" :size="17" /><span>{{ activeFile.path }}</span></div>
                <div class="preview-toolbar-actions">
                  <button class="icon-button" type="button" title="Copy file path" aria-label="Copy file path" @click="copyPath(activeFile.path)"><Copy :size="15" /></button>
                  <a class="icon-button" :href="`https://github.com/${repository.full_name}/blob/${encodeURIComponent(repository.default_branch)}/${activeFile.path.split('/').map(encodeURIComponent).join('/')}`" target="_blank" rel="noreferrer" title="Open on GitHub"><ExternalLink :size="15" /></a>
                  <a class="download-action" :href="`https://raw.githubusercontent.com/${repository.full_name}/${encodeURIComponent(repository.default_branch)}/${activeFile.path.split('/').map(encodeURIComponent).join('/')}`" target="_blank" rel="noreferrer">Download</a>
                </div>
              </div>
              <div class="preview-submeta"><span>{{ formatBytes(activeFile.size) }}</span><span class="meta-separator">/</span><span>{{ fileKind }}</span><span class="meta-separator">/</span><span>{{ repository.default_branch }}</span></div>
              <div v-if="fileKind === 'html'" class="html-view-controls" role="group" aria-label="HTML preview mode">
                <button type="button" :class="{ active: htmlPreviewMode === 'website' }" @click="htmlPreviewMode = 'website'"><Eye :size="14" /> Website</button>
                <button type="button" :class="{ active: htmlPreviewMode === 'source' }" @click="htmlPreviewMode = 'source'"><Code2 :size="14" /> Source</button>
              </div>
              <div v-if="fileKind === 'markdown'" class="language-banner">
                <span v-if="languageIconSvg" class="language-icon" :style="{ color: languageBrandColors[languageInfo.slug] || '#53657f' }" aria-hidden="true" v-html="languageIconSvg" />
                <span v-else class="language-mark">{{ languageInfo.mark }}</span>
                <strong>{{ languageInfo.label }}</strong>
              </div>
              <div v-if="previewLoading" class="file-loading"><LoaderCircle class="spin" :size="23" /><span>Loading file…</span></div>
              <div v-else-if="previewError" class="preview-message"><CircleAlert :size="19" /><span>{{ previewError }}</span></div>
              <img v-else-if="previewImage" class="image-preview" :src="previewImage" :alt="activeFile.name">
              <article v-else-if="fileKind === 'markdown' && previewHtml" class="markdown-preview" v-html="previewHtml" />
              <iframe v-else-if="fileKind === 'html' && websiteDocument" class="website-preview" :srcdoc="websiteDocument" :title="`Website preview for ${activeFile.name}`" sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-modals" referrerpolicy="no-referrer" />
              <div v-else class="preview-message"><FileText :size="19" /><span>No preview is available for this file.</span></div>
            </div>
          </div>
        </template>
      </section>
    </main>

    <div v-if="confirmation" class="confirmation-backdrop" @click.self="resolveConfirmation(false)" @keydown.esc.prevent.stop="resolveConfirmation(false)">
      <section class="confirmation-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-message">
        <div class="confirmation-dialog-heading">
          <span class="confirmation-icon" :class="confirmation.tone"><CircleAlert :size="19" /></span>
          <button class="icon-button" type="button" aria-label="Cancel" @click="resolveConfirmation(false)"><X :size="17" /></button>
        </div>
        <span class="eyebrow">CONFIRM ACTION</span>
        <h2 id="confirmation-title">{{ confirmation.title }}</h2>
        <p id="confirmation-message">{{ confirmation.message }}</p>
        <label v-if="confirmation.requiredText" class="confirmation-input-label" for="confirmation-text">
          <span>Type <strong>{{ confirmation.requiredText }}</strong> to confirm</span>
          <button class="confirmation-copy-button" type="button" :title="`Copy ${confirmation.requiredText}`" :aria-label="`Copy ${confirmation.requiredText}`" @click="copyConfirmationText"><Copy :size="13" /></button>
        </label>
        <input v-if="confirmation.requiredText" id="confirmation-text" v-model="confirmationText" class="confirmation-text-input" :placeholder="confirmation.requiredText" autocomplete="off" spellcheck="false">
        <div class="confirmation-actions">
          <button class="confirmation-cancel" type="button" autofocus @click="resolveConfirmation(false)">Cancel</button>
          <button class="confirmation-submit" :class="confirmation.tone" type="button" :disabled="!!confirmation.requiredText && confirmationText !== confirmation.requiredText" @click="resolveConfirmation(true)">{{ confirmation.confirmLabel }}</button>
        </div>
      </section>
    </div>

    <div v-if="showAuth" class="modal-backdrop" @click.self="showAuth = false">
      <section class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-heading">
        <div class="dialog-heading"><div class="dialog-mark"><GitHubMark :size="20" /></div><button class="icon-button" type="button" aria-label="Close" @click="showAuth = false"><X :size="18" /></button></div>
        <h2 id="auth-heading">Connect your GitHub</h2>
        <p class="dialog-copy">Use a personal access token to create repositories, browse private repositories, and manage files. The token is encrypted in this browser and restored until you sign out.</p>
        <form class="auth-form" @submit.prevent="signIn">
          <label for="github-token">Personal access token</label>
          <input id="github-token" v-model="tokenInput" type="password" autocomplete="off" placeholder="gh_....">
          <span class="input-hint">Grant repository read/write access and repository creation permission. <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">Create one <ExternalLink :size="12" /></a></span>
          <button class="copy-repo-button auth-submit" type="submit"><ShieldCheck :size="16" /> Connect securely</button>
        </form>
        <div class="security-note"><ShieldCheck :size="15" /><span>The encrypted token is stored in local storage and its non-exportable key in IndexedDB. Sign out removes both. This protects against casual storage inspection, not malicious scripts running in this browser.</span></div>
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

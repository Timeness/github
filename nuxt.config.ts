export default defineNuxtConfig({
  compatibilityDate: '2026-10-13',
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.scss'],
  typescript: {
    strict: true,
    typeCheck: true
  },
  app: {
    head: {
      title: 'GitView | GitHub Explorer',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#f6f8fb' },
        { name: 'description', content: 'Explore GitHub repositories and create a complete fork in one click.' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap' }
      ]
    }
  }
})

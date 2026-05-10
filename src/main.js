import './style.css'

let app = null

const boot = async () => {
  const { initApp } = await import('./app/initApp.js')
  app = initApp()
}

void boot()

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app?.destroy()
  })
}

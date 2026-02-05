import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                about: resolve(__dirname, 'about.html'),
                skills: resolve(__dirname, 'skills.html'),
                projects: resolve(__dirname, 'projects.html'),
                contact: resolve(__dirname, 'contact.html'),
            },
        },
    },
})

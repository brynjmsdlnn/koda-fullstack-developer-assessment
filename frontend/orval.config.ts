import { defineConfig } from 'orval'

export default defineConfig({
  projectTracker: {
    input: 'http://localhost:8000/docs/api.json',
    output: {
      mode: 'split',
      clean: true,
      target: './src/api/generated/endpoints.ts',
      schemas: './src/api/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
})

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

export default [
  { ignores: ['docs/.vitepress/dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['docs/.vitepress/**/*'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        Event: 'readonly',
        HTMLElement: 'readonly',
        Audio: 'readonly'
      }
    }
  },
  {
    files: ['docs/.vitepress/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: { vue: pluginVue },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['docs/.vitepress/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  }
]

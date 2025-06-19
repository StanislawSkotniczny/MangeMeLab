<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Zaloguj się do ManageMe
        </h2>
      </div>
      <form @submit.prevent="login" class="mt-8 space-y-6">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <input v-model="loginValue" type="text" required
              class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Login" />
          </div>
          <div>
            <input v-model="password" type="password" required
              class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Hasło" />
          </div>
        </div>

        <div>
          <button type="submit" :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            {{ isLoading ? 'Logowanie...' : 'Zaloguj' }}
          </button>
        </div>

        <div v-if="error" class="text-center">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>
      </form>

      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Konta testowe:<br>
          <strong>admin/admin</strong> lub <strong>dev/dev</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { User } from '../models/User'

const emit = defineEmits < {
  'login-success': [user: User]
} > ()

const loginValue = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

async function login() {
  error.value = ''
  isLoading.value = true

  try {
    // Logowanie przez API
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginValue.value, password: password.value })
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Błędny login lub hasło')
    }

    const { token, refreshToken } = await res.json()

    // Zapisz tokeny
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)

    // Pobierz dane użytkownika
    const meRes = await fetch('http://localhost:3000/api/me', {
      headers: { Authorization: 'Bearer ' + token }
    })

    if (!meRes.ok) throw new Error('Błąd pobierania danych użytkownika')

    const userData = await meRes.json()

    // Emit sukces do App.vue
    emit('login-success', userData)

  } catch (e: any) {
    error.value = e.message || 'Wystąpił błąd podczas logowania'
  } finally {
    isLoading.value = false
  }
}
</script>
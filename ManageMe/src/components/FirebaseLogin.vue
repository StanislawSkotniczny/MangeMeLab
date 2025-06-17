<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">ManageMe</h1>
        <h2 class="text-xl font-medium text-gray-600 dark:text-gray-300">
          {{ isRegister ? 'Utwórz nowe konto' : 'Zaloguj się do swojego konta' }}
        </h2>
      </div>

      <!-- Form -->
      <div class="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
        <form @submit.prevent="isRegister ? register() : login()" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input id="email" v-model="email" type="email" required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              placeholder="Wprowadź swój email" />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hasło
            </label>
            <input id="password" v-model="password" type="password" required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              placeholder="Wprowadź swoje hasło" />
          </div>

          <!-- Error Message -->
          <div v-if="error"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="loading"
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ isRegister ? 'Rejestrowanie...' : 'Logowanie...' }}
            </span>
            <span v-else>
              {{ isRegister ? 'Zarejestruj się' : 'Zaloguj się' }}
            </span>
          </button>
        </form>

        <!-- Toggle Register/Login -->
        <div class="mt-6 text-center">
          <button @click="toggleMode"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors duration-200">
            {{ isRegister ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się' }}
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Zarządzaj swoimi projektami efektywnie
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const isRegister = ref(false)

const toggleMode = () => {
  isRegister.value = !isRegister.value
  error.value = ''
}

const login = async () => {
  loading.value = true
  error.value = ''

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
  } catch (err: any) {
    console.error('Błąd logowania:', err)
    error.value = getErrorMessage(err.code)
  } finally {
    loading.value = false
  }
}

const register = async () => {
  loading.value = true
  error.value = ''

  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value)
  } catch (err: any) {
    console.error('Błąd rejestracji:', err)
    error.value = getErrorMessage(err.code)
  } finally {
    loading.value = false
  }
}

const getErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Nie znaleziono użytkownika z tym adresem email'
    case 'auth/wrong-password':
      return 'Nieprawidłowe hasło'
    case 'auth/email-already-in-use':
      return 'Ten adres email jest już używany'
    case 'auth/weak-password':
      return 'Hasło jest zbyt słabe'
    case 'auth/invalid-email':
      return 'Nieprawidłowy format adresu email'
    default:
      return 'Wystąpił błąd. Spróbuj ponownie'
  }
}
</script>
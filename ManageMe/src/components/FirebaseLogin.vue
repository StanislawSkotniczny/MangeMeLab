<template>
  <form @submit.prevent="login">
    <input v-model="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Hasło" required />
    <button type="submit">Zaloguj</button>
    <div v-if="error" style="color:red;">{{ error }}</div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const email = ref('')
const password = ref('')
const error = ref('')

async function login() {
  error.value = ''
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
 
  } catch (e: any) {
    error.value = e.message
  }
}
</script> 
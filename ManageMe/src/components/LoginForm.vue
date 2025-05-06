<template>
  <form @submit.prevent="login">
    <input v-model="loginValue" placeholder="Login" required />
    <input v-model="password" type="password" placeholder="Hasło" required />
    <button type="submit">Zaloguj</button>
    <div v-if="error" style="color:red;">{{ error }}</div>
    <div v-if="user">
      <p>Zalogowany jako: {{ user.firstName }} {{ user.lastName }} ({{ user.role }})</p>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
const loginValue = ref('')
const password = ref('')
const error = ref('')
const user = ref(null)

async function login() {
  error.value = ''
  user.value = null
  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginValue.value, password: password.value })
    })
    if (!res.ok) throw new Error('Błędny login lub hasło')
    const { token } = await res.json()
    // Pobierz dane użytkownika
    const meRes = await fetch('http://localhost:3000/api/me', {
      headers: { Authorization: 'Bearer ' + token }
    })
    user.value = await meRes.json()
  } catch (e) {
    error.value = e.message
  }
}
</script> 
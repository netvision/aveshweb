/* eslint-disable no-alert */
import axios from 'axios'
import { defineStore } from 'pinia'

const API = 'https://avesh.netserve.in'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: Boolean(localStorage.getItem('aveshToken')),
    name: '',
    email: localStorage.getItem('aveshEmail') || '',
    uid: '',
    photoURL: '',
  }),
  getters: {
    member: async (state) => {
      if (!state.email)
        return null
      const user = await axios.get(`${API}/members?filter[email][eq]=${encodeURIComponent(state.email)}`)
      return user.data[0] || null
    },
  },
  actions: {
    async signIn(email, password) {
      try {
        const { data } = await axios.post(`${API}/auth/login`, { email, password })
        localStorage.setItem('aveshToken', data.access_token)
        localStorage.setItem('aveshEmail', data.user.email)
        this.isLoggedIn = true
        this.email = data.user.email
        this.uid = String(data.user.id)
        this.name = data.user.email
        this.$router.push('/')
      }
      catch (error) {
        this.isLoggedIn = false
        alert(error.response?.data?.detail || 'Unable to sign in')
      }
    },
    signInGoogle() {
      alert('Google sign-in has been replaced with the Avesh API login.')
    },
    signout() {
      localStorage.removeItem('aveshToken')
      localStorage.removeItem('aveshEmail')
      this.isLoggedIn = false
      this.email = ''
      this.uid = ''
      this.$router.push('/login')
    },
    async changePassword(currentPassword, newPassword) {
      try {
        await axios.put(`${API}/auth/change-password`, { current_password: currentPassword, new_password: newPassword })
        alert('Password changed. Please log in again.')
        this.signout()
      }
      catch (error) {
        alert(error.response?.data?.detail || 'Unable to change password')
      }
    },
  },
})

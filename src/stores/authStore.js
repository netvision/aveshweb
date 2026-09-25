/* eslint-disable no-alert */
import axios from 'axios'
import { defineStore } from 'pinia'

const API = 'https://avesh.netserve.in'
let memberRequest = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: Boolean(localStorage.getItem('aveshToken')),
    name: '',
    email: localStorage.getItem('aveshEmail') || '',
    uid: '',
    photoURL: '',
    currentMember: null,
  }),
  getters: {
    member: state => state.currentMember,
  },
  actions: {
    async signIn(identifier, password) {
      try {
        const { data } = await axios.post(`${API}/auth/login`, { identifier, password })
        localStorage.setItem('aveshToken', data.access_token)
        localStorage.setItem('aveshEmail', data.user.email || identifier)
        this.isLoggedIn = true
        this.email = data.user.email || identifier
        this.uid = String(data.user.id)
        this.name = data.user.email
        this.currentMember = null
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
      memberRequest = null
      localStorage.removeItem('aveshToken')
      localStorage.removeItem('aveshEmail')
      this.isLoggedIn = false
      this.email = ''
      this.uid = ''
      this.currentMember = null
      this.$router.push('/login')
    },
    async loadMember() {
      if (this.currentMember)
        return this.currentMember
      if (!this.email)
        return null
      if (!memberRequest) {
        memberRequest = axios.get(`${API}/members?filter[email][eq]=${encodeURIComponent(this.email)}`)
          .then(({ data }) => {
            this.currentMember = data[0] || null
            return this.currentMember
          })
          .finally(() => { memberRequest = null })
      }
      return memberRequest
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

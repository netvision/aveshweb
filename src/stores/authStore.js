/* eslint-disable no-alert */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineStore } from 'pinia'
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updatePassword } from 'firebase/auth'
import axios from 'axios'
export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: true,
    name: '',
    email: '',
    uid: '',
    photoURL: '',
  }),
  getters: {
    member: async (state) => {
      const user = await axios.get(`https://avesh.netserve.in/members?filter[email][eq]=${state.email}`).then(res => res.data)
      return user[0]
    },
  },
  actions: {
    signIn(email, password) {
      const auth = getAuth()
      signInWithEmailAndPassword(auth, email, password).then((result) => {
        const user = result.user
        this.$router.push('/')
      }).catch((error) => {
        const errorCode = error.code
        this.errorMessage = error.message
        alert(this.errorMessage)
      })
    },
    signInGoogle() {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = result.user
          this.$router.push('/')
        })
        .catch((error) => {
          const errorCode = error.code
          this.errorMessage = error.message
          alert(this.errorMessage)
        })
    },

    signout() {
      const auth = getAuth()
      signOut(auth)
        .then(() => {
          alert('logged out')
          this.$router.push('/login')
        })
        .catch((error) => {
          const errorCode = error.code
          this.errorMessage = error.message
          alert(this.errorMessage)
        })
    },

    changePassword(password) {
      const auth = getAuth()
      const user = auth.currentUser
      updatePassword(user, password).then(() => {
        signOut(auth)
          .then(() => {
            alert('Password Changed! Please login again...')
            this.$router.push('/login')
          })
          .catch((error) => {
            const errorCode = error.code
            this.errorMessage = error.message
            alert(this.errorMessage)
          })
      }).catch((error) => {
        const errorCode = error.code
        this.errorMessage = error.message
        alert(this.errorMessage)
      })
    },
  },
})

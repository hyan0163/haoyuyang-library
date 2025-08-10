import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/main.css'
import './assets/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { initializeApp } from 'firebase/app'


const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })

app.component('DataTable', DataTable)
app.component('Column', Column)
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6rcWHsAL5-pN3dE7uXuNSLaWg7f4_4Sw",
  authDomain: "week7-haoyu-f8cb5.firebaseapp.com",
  projectId: "week7-haoyu-f8cb5",
  storageBucket: "week7-haoyu-f8cb5.firebasestorage.app",
  messagingSenderId: "963963724391",
  appId: "1:963963724391:web:b36fcf70ada2c8c9e92ac2"
};

// Initialize Firebase
initializeApp(firebaseConfig);

app.use(router)

app.mount('#app')

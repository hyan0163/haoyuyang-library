<template>
  <div class="auth-container">
    <h1>Logout</h1>
    <div v-if="currentUser">
      <p>Current User: {{ currentUser.email }}</p>
      <p>
        <button @click="logout" class="logout-btn">Logout</button>
      </p>
    </div>
    <div v-else>
      <p>No user is currently logged in.</p>
      <p class="login-link">
        <router-link to="/FireLogin">Go to Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router";

const currentUser = ref(null);
const router = useRouter();
const auth = getAuth();

onMounted(() => {
  // Get current user on component mount
  currentUser.value = auth.currentUser;
  
  // Set up auth state change listener
  auth.onAuthStateChanged((user) => {
    currentUser.value = user;
    console.log("Current user:", user);
  });
});

const logout = () => {
  signOut(auth)
    .then(() => {
      console.log("User signed out successfully");
      router.push("/FireLogin");
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

.login-link {
  text-align: center;
  margin-top: 15px;
}

.login-link a {
  color: #2196F3;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
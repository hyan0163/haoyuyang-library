<template>
  <div class="auth-container">
    <h1>Sign in</h1>
    <p><input type="text" placeholder="Email" v-model="email" /></p>
    <p><input type="password" placeholder="Password" v-model="password" /></p>
    <p>
      <button @click="signin" class="signin-btn">Sign in via Firebase</button>
    </p>
    <p class="register-link">
      Don't have an account? <router-link to="/FireRegister">Register here</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const router = useRouter();
const auth = getAuth();

const signin = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((data) => {
      console.log("Firebase Login Successful!");
      console.log("User data:", data.user);
      console.log("User email:", data.user.email);
      console.log("User ID:", data.user.uid);
      console.log("User metadata:", data.user.metadata);
      console.log("Full current user object:", auth.currentUser);
      router.push("/");
    })
    .catch((error) => {
      console.log("Login error:", error.code, error.message);
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

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.signin-btn {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.signin-btn:hover {
  background-color: #45a049;
}

.register-link {
  text-align: center;
  margin-top: 15px;
}

.register-link a {
  color: #2196F3;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
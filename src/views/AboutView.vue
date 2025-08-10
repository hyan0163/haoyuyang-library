<template>
  <div class="about">
    <h1>About Our Library</h1>
    <div class="content">
      <p>Welcome to our digital library! We're dedicated to providing a vast collection of books and resources to our community.</p>
    </div>
  </div>
</template>

<script setup>
// No script needed for now
</script>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  align-items: center; /* Horizontally centered */
  padding-top: 20px; /* Top spacing */
}

.content {
  max-width: 600px; /* Limit content width */
  text-align: left; /* Left-aligned paragraphs */
  padding: 0 20px; /* Left and right padding */
  box-sizing: border-box;
}

.about h1 {
  margin-bottom: 20px;
  text-align: center; /* Keep title centered */
}

.about p {
  line-height: 1.6;
}
</style>
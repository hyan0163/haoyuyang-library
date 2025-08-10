<template>
  <div class="container">
    <div class="header">
      <h1>WEATHER APP</h1>
      <div class="search-bar">
        <input 
          type="text" 
          v-model="city"
          placeholder="Enter city name"
          class="search-input"
          @keyup.enter="searchByCity"
        />
        <div class="button-group">
          <button @click="searchByCity" class="search-button">
            Search City
          </button>
          <button @click="fetchCurrentLocationWeather" class="location-button">
            <span class="location-icon">📍</span> Current Location
          </button>
        </div>
      </div>
    </div>
    <!-- The <main> tag in HTML is used to specify the main content of a document 
      More info about main, check https://www.w3schools.com/tags/tag_main.asp
    -->
    <main>
      <!-- Display error message if there is one -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <!-- Display loading indicator -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading weather data...</p>
      </div>
      
      <!-- If there are no data returned, then skip rendering the information -->
      <div v-if="weatherData && !isLoading">
        <!-- Display the weather data attribute returned from API
        Example of API data: https://openweathermap.org/current
        -->
        <h2>
          {{ weatherData.name }}, {{ weatherData.sys.country }}
        </h2>
        <div>
          <!-- The image source of the weather icon will be coming from a function called iconUrl
              which will be shared in script later -->
          <img :src="iconUrl" alt="Weather Icon" />
          <p>{{ temperature }} °C</p>
        </div>
        <!-- weather[0] means the current weather, the way we need to obtain data depends on how
        the API JSON data looks -->
        <span>{{ weatherData.weather[0].description }}</span>
      </div>
    </main>
  </div>
</template>

<script>
  // The info section in 10.1.1 provided detailed information about this package 
  import axios from "axios";

  const apikey = "81b7652051ef7bd2a3054ed41014ce30";
  
  export default {
    name: "App",
    data() {
      return {
        city: "",
        weatherData: null,
        hourlyForecast: [],
        dailyForecast: [],
        errorMessage: "",
        isLoading: false,
      };
    },
    //computed is a property that is used to define a property that 
    //is dependent on other data properties. 
    //If we using a more easy to understand words to understand the concept: 
    //the derived value such as temperature automatically update when the relevant value change.
    computed: {
      //There are multiple way to obtain the data in Celsius format.
      //Calculation by yourself like below after data is retireved or via API parameters
      
      //Example of adding additional units requirement, if you choose this, remember to change section 3.1
      //https://api.openweathermap.org/data/2.5/weather?lat=XXX&lon=-XXX.15&appid={API key}&units=metric
      temperature() {
        return this.weatherData
          ? Math.floor(this.weatherData.main.temp - 273)
          : null;
      },
      //Get the current weather icon using the API link
      iconUrl() {
        return this.weatherData
          ? `https://api.openweathermap.org/img/w/${this.weatherData.weather[0].icon}.png`
          : null;
      },
    },
    //There are two steps involved in this, 
    //step 1: identify current location 
    //step 2: after identify, get the weather data straight based on the current location.
    mounted() {
      this.fetchCurrentLocationWeather();
    },
    methods: {
      //Async in a easy to understand way means the method will run in backend thread, 
      //And it won't occupy the main thread, so the user experience is still smooth
      async fetchCurrentLocationWeather() {
        // Clear any previous error message and set loading state
        this.errorMessage = "";
        this.isLoading = true;
        
        //The navigator.geolocation object is part of the Web API provided by modern web browsers
        //Please note this function is not belongs to Vue or openweather.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            //API link to obtain the current weather based on the current location browser identified 
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`;
            //await means wait for the fetchWeatherData method to complete before proceeding
            await this.fetchWeatherData(url);
          }, (error) => {
            // Handle geolocation error
            console.error("Geolocation error:", error);
            this.isLoading = false;
            switch(error.code) {
              case error.PERMISSION_DENIED:
                this.errorMessage = "Location access denied. Please enable location services in your browser.";
                break;
              case error.POSITION_UNAVAILABLE:
                this.errorMessage = "Location information is unavailable.";
                break;
              case error.TIMEOUT:
                this.errorMessage = "Location request timed out.";
                break;
              default:
                this.errorMessage = "An unknown error occurred while getting location.";
            }
          });
        } else {
          this.isLoading = false;
          this.errorMessage = "Geolocation is not supported by this browser.";
        }
      },
      
      async fetchWeatherData(url) {
        this.isLoading = true;
        try {
          // Clear any previous error message
          this.errorMessage = "";
          const response = await axios.get(url);
          //Returned data from API is stored as JSON file in weatherData
          this.weatherData = response.data;
        } catch (error) {
          console.error("Error fetching weather data:", error);
          this.weatherData = null;
          this.errorMessage = "Failed to fetch weather data. Please try again.";
        } finally {
          this.isLoading = false;
        }
      },
      
      // Method to search weather by city name
      async searchByCity() {
        if (this.city.trim() === "") {
          this.errorMessage = "Please enter a city name";
          return;
        }
        
        try {
          // API link to obtain the current weather based on the city name
          const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${apikey}`;
          await this.fetchWeatherData(url);
          // Clear the input field after successful search
          this.city = "";
        } catch (error) {
          console.error("Error searching weather by city:", error);
          this.errorMessage = "City not found. Please check the city name and try again.";
        }
      }
    }
  }
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
}

.search-input {
  padding: 10px;
  width: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  margin-bottom: 10px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-button, .location-button {
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover, .location-button:hover {
  background-color: #2980b9;
}

.location-button {
  background-color: #2ecc71;
}

.location-button:hover {
  background-color: #27ae60;
}

.location-icon {
  margin-right: 5px;
  font-size: 16px;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-message {
  color: #e74c3c;
  background-color: #fadbd8;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  width: 100%;
  text-align: center;
  font-weight: bold;
}

h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

img {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
}

p {
  font-size: 24px;
  font-weight: bold;
  margin: 5px 0;
}

span {
  font-size: 18px;
  color: #7f8c8d;
  text-transform: capitalize;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}

.loading p {
  color: #3498db;
  font-size: 18px;
  margin-top: 10px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(52, 152, 219, 0.2);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
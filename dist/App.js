// Select the user input element
const userInput = document.querySelector("#user-input");
// Function to validate user input
function validateInput(userInput) {
  // Trim input and check if it's empty
  if (!userInput.trim()) {
    alert("Please enter a city name.");
    return false;
  }
  // Check for valid characters (alphabets, spaces, and hyphens)
  const validCharacters = /^[a-zA-Z\s-]+$/;
  if (!validCharacters.test(userInput)) {
    alert("Invalid city name. Only alphabets, spaces, and hyphens are allowed.");
    return false;
  }
  return true;
}

// Select the dropdown menu element
const dropdownMenu = document.querySelector("#dropdownMenu");
// Select the search button element
const searchBtn = document.querySelector(".search-btn");
// Select the current location button element
const currentLocationBtn = document.querySelector(".current-location");

// Arrays for days and months names
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

// Constants for API URL and API Key
const API_URL = "https://api.openweathermap.org/data/2.5/forecast";
const API_KEY = "08e586bf5d93c0ad13d9e791d980ae78";

// Function to select an element and handle error if the element is not found
function getElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    console.error(`${selector} element not found`);
    return null;
  }
  return element;
}

// Async function to fetch weather report for a city
async function getWeatherReport(city) {
  try {
    // Fetch the weather data from the API
    let res = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
    let data = await res.json();

    // Handle API response error
    if (data.cod !== "200") {
      console.error("Error fetching weather data:", data.message);
      alert(`Error fetching weather data ${data.message}`)
      return;
    }

    // Log the weather data
    console.log(data);

    // Update the UI with the fetched weather data
    updateWeatherData(data);

    // Update recent searches
    updateRecentSearches(city);
  } catch (error) {
    // Log any error that occurs during fetch
    console.error("Error fetching weather data:", error);
  }
}

// Function to update recent searches
function updateRecentSearches(city) {
  let recentSearches = JSON.parse(localStorage.getItem("Cities")) || [];
  recentSearches.unshift(city);
  // Keep only unique values
  recentSearches = [...new Set(recentSearches)];
  // Keep only the last 5 searches
  recentSearches = recentSearches.slice(0, 5);
  localStorage.setItem("Cities", JSON.stringify(recentSearches));
  renderRecentSearches(recentSearches);
}

// Function to update the UI with the fetched weather data
function updateWeatherData(data) {
  const timezoneOffset = data.city.timezone; // Get timezone offset
  const todayWeather = data.list[0]; // Get today's weather data

  // Update city name
  setElementContent(".city-name", data.city.name);
  // Update current time
  setElementContent(".time-hours-min", formatRegularTime(new Date((todayWeather.dt + timezoneOffset) * 1000)));
  // Update current date
  setElementContent(".day-date-month", formatRegularDate(new Date((todayWeather.dt + timezoneOffset) * 1000)));
  // Update sunrise time
  setElementContent(".sunrise", formatSunsetSunriseTime(new Date(data.city.sunrise * 1000)));
  // Update sunset time
  setElementContent(".sunset", formatSunsetSunriseTime(new Date(data.city.sunset * 1000)));
  // Update current temperature
  setElementContent(".temperature", Math.floor(todayWeather.main.temp));
  // Update feels like temperature
  setElementContent(".feels_like", Math.floor(todayWeather.main.feels_like));
  // Update weather type
  setElementContent(".weather-type", todayWeather.weather[0].main);
  // Update minimum temperature
  setElementContent(".temp-min", Math.floor(todayWeather.main.temp_min));
  // Update maximum temperature
  setElementContent(".temp-max", Math.floor(todayWeather.main.temp_max));
  // Update humidity
  setElementContent(".humidity", todayWeather.main.humidity);
  // Update wind speed
  setElementContent(".wind-speed", todayWeather.wind.speed);

  // Update weather icon based on description
  updateWeatherIcon(todayWeather.weather[0].description);

  // Update hourly weather forecast
  updateHourlyWeather(data.list, timezoneOffset);
  // Update daily weather forecast
  updateDailyWeather(data.list, timezoneOffset);
}

// Function to set the inner HTML of an element
function setElementContent(selector, content) {
  const element = getElement(selector);
  if (element) {
    element.innerHTML = content;
  }
}

// Function to update the weather icon based on description
function updateWeatherIcon(description) {
  const weatherIconElement = getElement('.Weather-icon');
  if (!weatherIconElement) return;

  // Map of descriptions to icon file names
  const iconMap = {
    "clear sky": "clear_1.png",
    "overcast clouds": "CloudSun.png",
    "broken clouds": "PartlysunnyHaze.png",
    "scattered clouds": "CloudThunderstrom.png",
    "few clouds": "cloud.png",
    "light rain": "Rain.png"
  };

  // Get the icon file name based on description, default to "weather.png"
  const iconSrc = iconMap[description] || "weather.png";
  // Set the inner HTML to display the icon
  weatherIconElement.innerHTML = `<img src="assets/${iconSrc}"/>`;
}

// Function to update hourly weather forecast
function updateHourlyWeather(list, timezoneOffset) {
  for (let i = 0; i < 5; i++) {
    const hourWeather = list[i];
    const hourIndex = i + 1;

    // Update time for each hourly forecast
    setElementContent(`.hours${hourIndex}-time`, formatRegularTime5day(new Date(hourWeather.dt_txt)));
    // Update icon for each hourly forecast
    setElementContent(`.hours${hourIndex}-icon`, formatWeatherIcons(hourWeather.weather[0].description));
    // Update temperature for each hourly forecast
    setElementContent(`.hours${hourIndex}-temp`, Math.floor(hourWeather.main.temp));
    // Update wind speed for each hourly forecast
    setElementContent(`.hours${hourIndex}-windSpeed`, hourWeather.wind.speed);
    // Update wind navigation img rotation
    updateWindDirection(`.hours${hourIndex}windimg`, hourWeather.wind.deg);
  }
}

// Function to update wind navigation image rotation
function updateWindDirection(selector, windDeg) {
  const windImg = getElement(selector);
  if (windImg) {
    // Calculate rotation angle based on wind direction
    const rotationAngle = windDeg + 180; // Adjusted by 180 degrees to align with the image
    windImg.style.transform = `rotate(${rotationAngle}deg)`;
  }
}

// Function to update daily weather forecast
function updateDailyWeather(list, timezoneOffset) {
  for (let i = 6; i <= 38; i += 8) {
    const dayIndex = (i - 6) / 8 + 1;
    const dayWeather = list[i];

    // Update date for each daily forecast
    setElementContent(`.day${dayIndex}-date`, formatRegularYear(new Date((dayWeather.dt + timezoneOffset) * 1000)));
    // Update temperature for each daily forecast
    setElementContent(`.day${dayIndex}-temp`, `Temp: ${Math.floor(dayWeather.main.temp)}&deg;C`);
    // Update icon for each daily forecast
    setElementContent(`.weather${dayIndex}Icon`, formatWeatherIcons(dayWeather.weather[0].description));
    // Update wind speed for each daily forecast
    setElementContent(`.day${dayIndex}-wind`, `Wind: ${dayWeather.wind.speed} M/s`);
    // Update humidity for each daily forecast
    setElementContent(`.day${dayIndex}-humidity`, `Humidity: ${dayWeather.main.humidity} &percnt;`);
  }
}

// Function to format a date to a regular readable format
function formatRegularDate(printDate) {
  const day = days[printDate.getDay()]; // Get day name
  const date = printDate.getDate(); // Get date
  const month = months[printDate.getMonth()]; // Get month name
  return `${day}, ${date} ${month}`; // Return formatted date string
}

// Function to format a time to a regular readable format
function formatRegularTime(time) {
  let hours = time.getHours(); // Get hours
  let minutes = time.getMinutes(); // Get minutes
  hours = hours < 10 ? `0${hours}` : hours; // Add leading zero to hours if needed
  minutes = minutes < 10 ? `0${minutes}` : minutes; // Add leading zero to minutes if needed
  return `${hours}<span class="collon">:</span>${minutes}`; // Return formatted time string
}

// Function to format a time to a regular readable format for 5 day
function formatRegularTime5day(time) {
  let hours = time.getHours(); // Get hours
  let minutes = time.getMinutes(); // Get minutes
  hours = hours < 10 ? `0${hours}` : hours; // Add leading zero to hours if needed
  minutes = minutes < 10 ? `0${minutes}` : minutes; // Add leading zero to minutes if needed
  return `${hours}:${minutes}`; // Return formatted time string
}

// Function to format sunrise and sunset time to a regular readable format
function formatSunsetSunriseTime(time) {
  let hours = time.getHours(); // Get hours
  const amPm = hours >= 12 ? "PM" : "AM"; // Determine AM or PM
  hours = hours % 12 || 12; // Convert hours to 12-hour format
  let minutes = time.getMinutes(); // Get minutes
  minutes = minutes < 10 ? `0${minutes}` : minutes; // Add leading zero to minutes if needed
  return `${hours}:${minutes} ${amPm}`; // Return formatted time string
}

// Function to format a date to include the year
function formatRegularYear(printDate) {
  const date = printDate.getDate(); // Get date
  const month = months[printDate.getMonth()]; // Get month name
  const year = printDate.getFullYear(); // Get year
  return `${date} ${month} ${year}`; // Return formatted date string
}

// Function to return the appropriate weather icon based on description
function formatWeatherIcons(description) {
  const iconMap = {
    "overcast clouds": '<i class="fa-solid fa-cloud-sun"></i>',
    "broken clouds": '<i class="fa-solid fa-cloud-bolt"></i>',
    "scattered clouds": '<i class="fa-solid fa-cloud-sun-rain"></i>',
    "few clouds": '<i class="fa-solid fa-cloud-rain"></i>',
    "clear sky": '<i class="fa-solid fa-sun"></i>',
    "light rain": '<i class="fa-solid fa-cloud-showers-heavy"></i>',
    "default": '<i class="fa-solid fa-rain"></i>'
  };
  return iconMap[description] || iconMap["default"]; // Return appropriate icon HTML
}

function timeUpdate() {
  // Update time every minute
  setInterval(() => {
    const currentTime = new Date();
    const formattedTime = formatRegularTime(currentTime);
    let hoursMinTime = document.querySelector(".time-hours-min");
    if (hoursMinTime) {
      hoursMinTime.innerHTML = formattedTime;
    } else {
      console.error("Time hours-min element not found");
    }
  }, 60000);
}

// Function to render recent searches in dropdown menu
const renderRecentSearches = (recentSearches) => {
  dropdownMenu.innerHTML = "";
  recentSearches.forEach((city) => {
    const option = document.createElement("div");
    option.innerHTML = city;
    option.classList.add("dropdown-item");
    option.addEventListener("click", () => {
      userInput.value = city;
      dropdownMenu.classList.remove("show");
      getWeatherReport(city);
    });
    dropdownMenu.appendChild(option);
  });
};

// Function to get weather report based on user's input (city name)
// Function to get weather report based on user's input (city name)
searchBtn.addEventListener("click", async () => {
  const city = userInput.value.trim(); // Get trimmed city name from user input
  if (validateInput(city)) {
    await getWeatherReport(city);
    userInput.value = "";
  }
  timeUpdate();
});

// Function to get weather report based on geolocation (latitude and longitude)
async function getWeatherByGeolocation(lat, lon) {
  try {
    // Fetch weather data using latitude and longitude
    let res = await fetch(`${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    let data = await res.json();

    // Handle API response error
    if (data.cod !== "200") {
      console.error("Error fetching weather data:", data.message);
      return;
    }

    // Log the weather data
    console.log(data);

    // Update the UI with the fetched weather data
    updateWeatherData(data);

    // Update recent searches with the city name from the geolocation data
    updateRecentSearches(data.city.name);
  } catch (error) {
    // Log any error that occurs during fetch
    console.error("Error fetching weather data:", error);
  }
}

// Function to get weather report based on geolocation (latitude and longitude)
currentLocationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          await getWeatherByGeolocation(lat, lon);
        } catch (error) {
          console.error("Error fetching weather data:", error);
          alert("Error fetching weather data. Please try again.");
        }
      },
      (error) => {
        console.error("Error getting current location:", error);
        alert("Error getting current location. Please enable location services and try again.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
  timeUpdate();
});


// After refresh page local storage get empty
window.addEventListener("load", () => {
  localStorage.removeItem("Cities");
});

// Initial rendering of recent searches
renderRecentSearches(JSON.parse(localStorage.getItem("Cities")) || []);

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const searchBox = document.getElementById("searchBox");
//gets the info inputed into the search box
const inputValue = searchBox.value;

//an event listener that lsitens for a submit action
searchBox.addEventListener("input", () => {
  let inputValue = searchBox.value;
  //an api call with the user request
  let api = "https://api.locationiq.com/v1/autocomplete.php?";
  axios
    .get(api, {
      params: {
        key: "3180628f7bc8ea",
        q: inputValue,
        limit: 5,
        crossDomain: true,
        format: "json"
      }
    })

    //recieves the data returned from the api call
    .then(res => {
      let inputValue = searchBox.value;
      let places = res.data;
      let suggest;
      let autoComplete = document.querySelector("#autoComplete");

      if (inputValue.length !== 0) {
        //suggests an auto complete based on user input and displays it to the UI
        suggest = places
          .map(
            place =>
              //displays autocomplete suggestions
              `<div class="suggest"> ${place.address.name},${place.address.country}</div>`
          )
          .join("");
      } else {
        suggest = [];
      }

      autoComplete.innerHTML = suggest;
      //when any of the suggestions is clicked the value of the input is replaced with the suggestion clicked
      document.querySelectorAll(".suggest").forEach(item => {
        item.addEventListener("click", e => {
          searchBox.value = e.target.innerHTML;
          autoComplete.innerHTML = "";
        });
      });
      document.querySelector("body").addEventListener("click", () => {
        autoComplete.innerHTML = "";
      });
    });
});

// selects the address form and add a submit event which triggers an api call
const addressForm = document.getElementById("addressForm");
addressForm.addEventListener("submit", e => {
  e.preventDefault();
  let location = searchBox.value;
  axios
    .get("https://us1.locationiq.com/v1/search.php?", {
      params: {
        key: "3180628f7bc8ea",
        q: location,
        format: "json"
      }
    })
    .then(response => {
      let { lat, lon } = response.data[0];

      displayMap(lat, lon);
      weatherInfo(lat, lon);
      setIcon(lat, lon);
      postCode(lat, lon);
    });
});

//function that grabs weather info from an api
function weatherInfo(lat, lon) {
  let proxy = "https://cors-anywhere.herokuapp.com/";
  let api = `${proxy}https://api.darksky.net/forecast/e3968dcc1c744f252da0bd34d9ae19e9/${lat},${lon}`;
  axios
    .get(api, {
      params: { crossDomain: true }
    })

    .then(res => {
      //returned weather properties from the call to the api
      let {
        temperature,
        summary,
        icon,
        humidity,
        windSpeed
      } = res.data.currently;
      let timezone = res.data.timezone;
      setIcon(icon, document.querySelector("#icon"));
      let celcius = ((temperature - 32) * 5) / 9;
      let currentTemp = document.querySelector(".degrees");
      currentTemp.innerHTML = `${temperature}F <p id="tempConvert">click to convert</p>`;
      //displays the required properties to the appropriate HTML DOM
      document.querySelector("#timezone").textContent = `Timezone: ${timezone}`;
      document.querySelector(
        "#visibility"
      ).innerHTML = `<h4 class="props"><strong>Humidity:</strong> ${humidity}</h4>`;
      document.querySelector(
        "#windspeed"
      ).innerHTML = `<h4 class="props"><strong>Windspeed:</strong> ${windSpeed}</h4>`;
      document.querySelector(
        "#desc"
      ).innerHTML = `<h4 class="props"><i>The current weather is ${summary}</i></h4>`;

      //converts temperature between Celcius and Fahrenheit
      currentTemp.addEventListener("click", () => {
        if (currentTemp.innerHTML.indexOf("F") >= 0) {
          currentTemp.textContent = `${Math.floor(celcius)}C`;
        } else {
          currentTemp.textContent = `${temperature}F`;
        }
      });
    })
    .catch(error => {
      console.log(error.message);
    });
}

//functtion that sets the weather icon
function setIcon(icon, iconId) {
  //sets weather icon color
  const skycons = new Skycons({ color: "white" });
  const currentIcon = icon.replace(/-/g, "_").toUpperCase();
  skycons.play();
  return skycons.set(iconId, Skycons[currentIcon]);
}

//a function that display the map to the UI
function displayMap(lat, lon) {
  // Maps access token goes here
  var key = "pk.4482eea469b93346d01c60da10de2878";

  // Add layers that we need to the map
  var streets = L.tileLayer.Unwired({ key: key, scheme: "streets" });

  // Initialize the map
  var map = L.map("map", {
    center: { lat: lat, lng: lon }, // Map loads with this location as center
    zoom: 10,
    scrollWheelZoom: true,
    layers: [streets] // Show 'streets' by default
  });

  //Add maker
  var marker = L.marker([lat, lon]).addTo(map);

  // Add the 'scale' control
  L.control.scale().addTo(map);
}

//it grabs the postcode code based on user search
function postCode(lat, lon) {
  axios
    .get(
      `https://us1.locationiq.com/v1/reverse.php?key=3180628f7bc8ea&lat=${lat}&lon=${lon}&format=json`
    )
    .then(res => {
      let postCode = res.data.address.postcode;
      document.querySelector(
        "#postcode"
      ).innerHTML = `<h4 class="props"><strong>Postcode:</strong> ${postCode}</h4>`;
    });
}

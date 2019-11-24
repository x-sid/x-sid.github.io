/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const searchBox = document.getElementById("searchBox");
//gets the info inputed into the search box
const inputValue = searchBox.value;

//an event listener that lsitens for a submit action
searchBox.addEventListener("input", () => {
  const inputValue = searchBox.value;

  //an api call with the user request to an autocomplete endpoint
  const api = "https://api.locationiq.com/v1/autocomplete.php?";
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
      const inputValue = searchBox.value;
      const places = res.data;
      let suggest;
      const autoComplete = document.querySelector("#autoComplete");

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
          makeApiCalls();
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
  //makes an api call to several api and returns a response which is displayed in the UI
  makeApiCalls();
});

function makeApiCalls() {
  const location = searchBox.value;

  //an api call to get the latitude and longitude of input string
  axios
    .get("https://us1.locationiq.com/v1/search.php?", {
      params: {
        key: "3180628f7bc8ea",
        q: location,
        format: "json"
      }
    })
    .then(response => {
      //latitude and longitude returned
      const { lat, lon } = response.data[0];

      //adds marker to map location
      L.marker([lat, lon]).addTo(map);
      //centers the map based on search
      map.setView({ lat: lat, lon: lon }, 10);
      weatherInfo(lat, lon);
      setIcon(lat, lon);
      postCode(lat, lon);
    });
}

// Maps access token goes here
const key = "pk.4482eea469b93346d01c60da10de2878";
// Add layers that we need to the map
const streets = L.tileLayer.Unwired({ key: key, scheme: "streets" });
// Initialize the map
const map = L.map("map", {
  center: { lat: 9.081999, lon: 8.675277000000051 }, // Map loads with this location as center
  zoom: 5,
  scrollWheelZoom: true,
  layers: [streets] // Show 'streets' by default
});
// Add the 'scale' control
L.control.scale().addTo(map);

//function that grabs weather info from an api
function weatherInfo(lat, lon) {
  const proxy = "https://cors-anywhere.herokuapp.com/";
  // an api call to a weather api
  const api = `${proxy}https://api.darksky.net/forecast/e3968dcc1c744f252da0bd34d9ae19e9/${lat},${lon}`;
  axios
    .get(api, {
      params: { crossDomain: true }
    })

    .then(res => {
      //returned weather properties from the call to the api
      const {
        temperature,
        summary,
        icon,
        humidity,
        windSpeed
      } = res.data.currently;
      const timezone = res.data.timezone;
      setIcon(icon, document.querySelector("#icon"));
      const celcius = ((temperature - 32) * 5) / 9;
      const currentTemp = document.querySelector(".degrees");
      currentTemp.innerHTML = `${temperature}F <p id="tempConvert">click to convert</p>`;
      //displays the required properties to the appropriate HTML DOM
      document.querySelector("#timezone").textContent = `Timezone ${timezone}`;
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
      document.querySelector(
        "#desc"
      ).innerHTML = `<h4 class="props" style="color:red,margin-top:0px;"><i>search limit for this moment has been reached please try again after a while.</i></h4>`;
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

//it grabs the postcode code based on user search
function postCode(lat, lon) {
  axios
    .get(
      `https://us1.locationiq.com/v1/reverse.php?key=3180628f7bc8ea&lat=${lat}&lon=${lon}&format=json`
    )
    .then(res => {
      const postCode = res.data.address.postcode;
      document.querySelector(
        "#postcode"
      ).innerHTML = `<h4 class="props"><strong>Postcode:</strong> ${
        postCode ? postCode : "Unknown"
      }</h4>`;
    });
}

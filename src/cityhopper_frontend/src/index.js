import { cityhopper_backend } from "../../declarations/cityhopper_backend";

var today = new Date();
var year = today.getFullYear();
var month = String(today.getMonth() + 1).padStart(2, "0");
var day = String(today.getDate()).padStart(2, "0");

document.getElementById("departureDate").setAttribute("min", year + "-" + month + "-" + day);

const slider = document.getElementById('slider');
const sliderValue = document.getElementById('slider-value');

slider.addEventListener('input', function () {
  const value = slider.value;
  sliderValue.textContent = value;
});

const slider2 = document.getElementById('slider2');
const sliderValue2 = document.getElementById('slider-value2');

slider2.addEventListener('input', function () {
  sliderValue2.textContent = slider2.value;
});

const form = document.querySelector('form');

form.addEventListener('submit', function (event) {
  event.preventDefault();
  const loadingAnimation = document.getElementById('loadingAnimation');
  loadingAnimation.style.display = 'block';
});

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = e.target.querySelector("button");
  const cityOrigin = document.getElementById("cityOrigin").value.toString();
  const cityVisit1 = document.getElementById("cityVisit1").value.toString();
  const cityVisit2 = document.getElementById("cityVisit2").value.toString();
  const days = document.getElementById("slider").value;
  const adults = document.getElementById("slider2").value;
  const departureDate = document.getElementById("departureDate").value.toString();
  button.setAttribute("disabled", true);
  displayData(cityOrigin, cityVisit1, cityVisit2, days, departureDate, adults);
  button.removeAttribute("disabled");
  return false;
});

async function displayData(cityOrigin, cityVisit1, cityVisit2, days, adults, year, month, day) {
  try {
    const loadingAnimation = document.getElementById('loadingAnimation');
    loadingAnimation.style.display = 'block';
    let bestFlight = [];
    let bestFlight2 = [];
    bestFlight = await buscarVuelo(cityOrigin, cityVisit1, cityVisit2, days, adults, year, month, day);
    bestFlight2 = await buscarVuelo(cityOrigin, cityVisit2, cityVisit1, days, adults, year, month, day);

    if (bestFlight[0] > bestFlight2[0]) {
      bestFlight = bestFlight2;
    }

    const link = document.getElementById("link");
    const precio = document.getElementById("precio");
    //const agents = document.getElementById("agents");
    precio.innerHTML = bestFlight[0] / 1000;
    //agents.innerHTML = bestFlight[1];
    link.setAttribute("href", bestFlight[2]);
    loadingAnimation.style.display = 'none';
    const results = document.getElementById('results');
    results.style.display = 'block';
  } catch (error) {
    console.error(error);
  }
}

async function buscarVuelo(cityOrigin, cityVisit1, cityVisit2, days, departureDate, adults) {
  let flightData = [];
  const url = "https://corsproxy.armsves.workers.dev/corsproxy/";

  console.log(departureDate)
  const departure = departureDate.split("-");
  let date = new Date(departure[0],departure[1], departure[2]);
  console.log(date)

  days = parseInt(days)
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  date.setDate(day + days)
  const day2 = date.getDate();
  const month2 = date.getMonth() + 1;
  const year2 = date.getFullYear();
  date.setDate(day2 + days)
  const day3 = date.getDate();
  const month3 = date.getMonth() + 1;
  const year3 = date.getFullYear();

  const headers = {};
  const data = {
    "query": {
      "market": "US",
      "locale": "en-US",
      "currency": "EUR",
      "query_legs": [
        {
          "origin_place_id": { "iata": cityOrigin },
          "destination_place_id": { "iata": cityVisit1 },
          "date": { "year": year, "month": month, "day": day }
        },
        {
          "origin_place_id": { "iata": cityVisit1 },
          "destination_place_id": { "iata": cityVisit2 },
          "date": { "year": year2, "month": month2, "day": day2 }
        },
        {
          "origin_place_id": { "iata": cityVisit2 },
          "destination_place_id": { "iata": cityOrigin },
          "date": { "year": year3, "month": month3, "day": day3 }
        }
      ],
      "adults": 1,
      "cabin_class": "CABIN_CLASS_ECONOMY",
      "nearbyAirports": false
    }
  };
  console.log(data)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const vuelosFinal = await response.json();
      const jsonObject = vuelosFinal['content']['results']['itineraries'];
      const jsonArray = Object.values(jsonObject);

      jsonArray.sort((a, b) => {
        console.log(a["pricingOptions"][0]["price"]["amount"] + " /n")
        const amountA = parseInt(a["pricingOptions"][0]["price"]["amount"]);
        const amountB = parseInt(b["pricingOptions"][0]["price"]["amount"]);
        if (amountA < amountB) { return -1; } else if (amountA > amountB) { return 1; } else { return 0; }
      });
      flightData = [jsonArray[0]["pricingOptions"][0]["price"]["amount"], jsonArray[0]["pricingOptions"][0]["agentIds"][0], jsonArray[0]["pricingOptions"][0]["items"][0]["deepLink"]];
      return flightData;
    } else {
      console.log('Request failed with status code:', response.status);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}
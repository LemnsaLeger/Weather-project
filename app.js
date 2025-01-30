const loaderP = document.querySelector("p");

const fetchedData = [];

async function fetchWeatherInfoForCountry(name) {
  const startTime = performance.now();
  loaderP.textContent = "fetching...";
  let finishedTime;
  let timeTaken;

  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${name}?key=SAT5X7EWPDTZY2UCT6G2S7HTP`,
      { mode: "cors" }
    );

    if (response.ok) {
      const jsonResponse = await response.json();

      finishedTime = performance.now();
      loaderP.textContent = "";
      timeTaken = ((finishedTime - startTime) / 1000).toFixed(2);

      const myData = {
        dataFromServer: jsonResponse,
        timeTakenToFetch: timeTaken,
      };

      dataObj(myData);
    } else if (!response.ok) {
      throw new Error("Network response was not ok: " + response.statusText);
    }
  } catch (error) {
    alert("error, try a valid country name");
    loaderP.textContent = "";
    console.log("Error: ", error);
  }
}

const dataObj = (obj) => {
  fetchedData.push(obj);
  const index = fetchedData.indexOf(obj);

  updateDOM(
    index,
    obj,
    obj.timeTakenToFetch,
    fetchGIF(obj.dataFromServer.icon)
  );
};

const fetchGIF = async (gifName) => {
  let gifUrl;
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/translate?api_key=exNYV0T3ms2qgIprrpcFknteLaWuKHrj&s=${gifName}`,
      { mode: "cors" }
    );
    if (response.ok) {
      const jsonResponse = await response.json();
      gifUrl = jsonResponse.data.images.original.url;
    } else {
      throw new Error("Network response status ", response.statusText);
    }
  } catch (error) {
    console.log("Error ", error);
  }
  return gifUrl;
};

// table's body
const tbody = document.querySelector("tbody");
// input field
const input = document.getElementById("input");
const btn = document.querySelector("button#search");
const changeUnits = document.querySelector("section.change-units");

function updateDOM(index, dataFromServer, timeTaken, gifUrl) {
  const tr = document.createElement("tr");

  const th = document.createElement("th");
  th.setAttribute("scope", "row");
  th.textContent = index + 1;
  tr.appendChild(th);

  const td1 = document.createElement("td");
  td1.textContent = dataFromServer.dataFromServer.resolvedAddress;
  tr.appendChild(td1);

  const td2 = document.createElement("td");
  td2.textContent = dataFromServer.dataFromServer.address;
  tr.appendChild(td2);

  const td3 = document.createElement("td");
  td3.className = "temp";
  td3.textContent = `${dataFromServer.dataFromServer.days[0].temp}f(${dataFromServer.dataFromServer.days[0].tempmin}:${dataFromServer.dataFromServer.days[0].tempmax})`;
  tr.appendChild(td3);

  const td7 = document.createElement("td");
  td7.textContent = dataFromServer.dataFromServer.currentConditions.datetime;
  tr.appendChild(td7);

  const td4 = document.createElement("td");
  td4.textContent = dataFromServer.dataFromServer.days[0].description;
  tr.appendChild(td4);

  const td5 = document.createElement("td");
  td5.textContent = `${timeTaken}s`;
  tr.appendChild(td5);

  const td6 = document.createElement("td");
  const img = document.createElement("img");
  img.alt = "icon";
  img.src = gifUrl;
  td6.appendChild(img);
  tr.appendChild(td6);

  tbody.appendChild(tr);
}

// search for weather condition of a given country
btn.addEventListener("click", function () {
  let countryName = input.value.trim();
  if (countryName) {
    fetchWeatherInfoForCountry(countryName);
    input.value = "";
  } else {
    alert("Enter a country");
    return;
  }
});

// function to change temperature units
changeUnits.addEventListener("click", function (event) {
  let targetBtn = event.target;
  let tempUnits, insideParentheses, secondValue, thirdValue, td;

  let tempTds = document.querySelectorAll(".temp");

  if (targetBtn.id === "celsius") {
    tempTds.forEach((t) => {
      if (t.textContent.includes("c")) {
        return;
      } else {
        td = t;
        tempUnits = t.textContent.split("f")[0];
        insideParentheses = t.textContent.match(/\(([^)]+)\)/)[1]; // "36.8:44.6"
        // Split the extracted part by ':'
        [secondValue, thirdValue] = insideParentheses.split(":");

        td.textContent = "";
        td.textContent = `${fahrenheitToCelsius(
          tempUnits
        )} c (${fahrenheitToCelsius(secondValue)} : ${fahrenheitToCelsius(
          thirdValue
        )})`;
      }
    });

  } else if (targetBtn.id === "farenheit") {
    tempTds.forEach((t) => {
      if (t.textContent.includes("f")) {
        return;
      } else {
        td = t;
        tempUnits = t.textContent.split("c")[0];
        insideParentheses = t.textContent.match(/\(([^)]+)\)/)[1]; // "36.8:44.6"
        // Split the extracted part by ':'
        [secondValue, thirdValue] = insideParentheses.split(":");

        td.textContent = "";
        td.textContent = `${celsiusToFahrenheit(
          tempUnits
        )} f (${celsiusToFahrenheit(secondValue)} : ${celsiusToFahrenheit(
          thirdValue
        )})`;
      }
    });
  }
});

// function to convert temperatures in fareinheit to celsius
function fahrenheitToCelsius(fahrenheit) {
  return (((fahrenheit - 32) * 5) / 9).toFixed(2);
}

// celsius to farenheit
function celsiusToFahrenheit(celsius) {
  return ((celsius * 9) / 5 + 32).toFixed(2);
}

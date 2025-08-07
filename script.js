import { formatDateTime, getDayName } from "./utils.js"
let value = "lahore"
const search = document.getElementById("search");
const searchbtn = document.getElementById("searchimg");
const country = document.getElementById("country")
const date = document.getElementById("date")
const humidity = document.getElementById("humidity")
const wind = document.getElementById("wind")
const feelslike = document.getElementById("feelslike")
const image = document.getElementById("image")
const temperature = document.getElementById("temperature")
const text = document.getElementById("text")

const state = {
    loading: false,
    success: false
}

let abortController = new AbortController()

let cache = new Map();
async function fetchWithcache(url) {
    if (cache.has(url)) {
        console.log("returning from cache...")
        return cache.get(url);
    }
    console.log("fetching from API...")
    let response = await fetch(url)
    let data = await response.json();
    cache.set(url, data);
    return data;
}

function showLoading() {
    document.getElementById('loading').style.display = 'block'
    document.getElementById('current').style.display = 'none'
    document.getElementById('future').style.display = 'none'
    state.loading = true
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none'
    document.getElementById('current').style.display = 'flex'
    document.getElementById('future').style.display = 'flex'
    state.loading = false
}


let fetchSugesstions = async (query) => {
    try {
        abortController = new AbortController()
        await fetch(`https://api.weatherapi.com/v1/search.json?key=bf220ca73980496a9c475734250608&q=${query}`, { signal: abortController.signal })
        // showLoading();
        state.success = true
    }
    catch (error) {
        if (error.name === "AbortError") {
            console.log("previous serach aborted");
        }
        else {
            console.log("error fetching city suggestion", error);
        }

        state.success = false
    }
    // hideLoading()
}

search.addEventListener("input", () => {
    let data = search.value;

    // showLoading()
    abortController.abort();
    fetchSugesstions(data)
})

let getCurrentData = async () => {
    try {
        showLoading();
        let url = `https://api.weatherapi.com/v1/current.json?key=bf220ca73980496a9c475734250608&q=${value}`
        let data = await fetchWithcache(url);
        let getday = new Date(data.location.localtime.slice(0, 10))
        hideLoading();
        country.innerHTML = `<img src="images/location.png"> <p>${data.location.name}, ${data.location.country}</p>`;
        date.innerHTML = `<img src="images/calendar.png"> <p>` + formatDateTime(data.location.localtime) + ` ` + getDayName(getday) + `</p>`
        humidity.innerHTML = `<img src="images/humidity.png"><p>${data.current.humidity} %</p>`
        wind.innerHTML = `<img src="images/windy.png"><p>${data.current.wind_kph} km/h</p>`
        feelslike.innerHTML = `<img src="images/feelslike.png"><p>${data.current.feelslike_c} °C</p>`
        temperature.innerHTML = `<p>${data.current.temp_c}°C</p>`
        text.innerHTML = `${data.current.condition.text}`
        image.src = `${data.current.condition.icon}`
        await getFutureData(value);
    }
    catch (error) {
        alert('Error finding City with that name');
        hideLoading();
    }
}

getCurrentData();

searchbtn.addEventListener('click', async () => {
    value = search.value;
    showLoading();
    getCurrentData();
})

let getFutureData = async (value) => {
    let days = 8;
    let url = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=bf220ca73980496a9c475734250608&q=${value}&days=${days}&hour=12`)
    let data = await url.json()
    let container = document.getElementById("future");
    container.innerHTML = " ";
    for (let i = 1; i < days; i++) {
        let getday = new Date(data.forecast.forecastday[i].date)
        container.innerHTML = container.innerHTML + `<div class="card back">
        <div class="futureimg"><img src="${data.forecast.forecastday[i].day.condition.icon}" alt ="img"></div>
        <div class="futureday">`+ getDayName(getday) + `</div>
        <div class="futuretext">${data.forecast.forecastday[i].day.condition.text}</div>
        <div class="futuretemp">${data.forecast.forecastday[i].hour[0].temp_c} °C</div>
        </div>`
    }
}




'use strict';

const countriesContainer = document.querySelector('.countries');
const input = document.querySelector('input');
const butonX = document.querySelector('.delete');
const buttonCloseError = document.querySelector('.fa-times');
const errorMsg = document.querySelector('.error_msg');
const errorCon = document.querySelector('.error');
const msgCon = document.querySelector('.msg');
const msgMsg = document.querySelector('.msg_msg');
let country, neighbour;
let buttonState = false;
const countryArr = [];
const neigbhoursArr = [];
////class for a country we are getting from input and putting inside html
class Country {
  date = new Date();
  id = (Date.now() + '').split(-10).join('');
  neigbhourNum;
  constructor(
    flag,
    name,
    region,
    population,
    language,
    currency,
    neigbhourNum
  ) {
    this.flag = flag;
    this.name = name;
    this.region = region;
    this.population =
      +population >= 1000000
        ? (+population / 1000000).toFixed(1) + ' ' + `milion`
        : +population <= 0
        ? `Unknown`
        : +population;
    this.language = language;
    this.currency = currency;
    this.neighbours = [];
    this.neigbhourNum = neigbhourNum;
  }

  // calcNeighbours() {
  //   this.neigbhourNum = this.neighbours.length;
  // }
}
//Neigbhour class
class Neighbour extends Country {
  constructor(
    flag,
    name,
    region,
    population,
    language,
    currency,
    neigbhourNum
  ) {
    super(flag, name, region, population, language, currency, neigbhourNum);
  }
}
//INSERT HTML FUNCTION
function renderCountry(countr, className = '') {
  const html = `<article class="country ${className}">
  ${
    className === 'neighbour' ? '' : '<button class="delete">&#x2717;</button>'
  } 
  <img class="country__img" src="${countr.flag}" />
  <div class="country__data">
    <h3 class="country__name">${countr.name}</h3>
    <h4 class="country__region">${countr.region}</h4>
    <p class="country__row"><span>👫</span>${countr.population} people</p>
    <p class="country__row"><span>🗣️</span>${countr.language}</p>
    <p class="country__row"><span>💰</span>${countr.currency}</p>
    <p class="country__row"><span>🛤️</span>${
      countr.neigbhourNum
    } neighbouring countries</p>
  </div>
  ${
    className === 'neighbour'
      ? ''
      : ' <button class="neighbour__button button_show">Show neigbours</button>\n<button class="neighbour__button button_hide hidden">Hide neigbours</button>'
  }
  
</article>`;

  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;
}

//Function for FETCHING COUNTRY
function getCountryData(countr) {
  //Helper function for fetch
  function fetchCallback(response) {
    //if country does not exists
    if (!response.ok) throw new Error(`Country not found! ${response.status}`);

    return response.json();
  }
  //fetching a promise
  const request = fetch(`https://restcountries.com/v3.1/name/${countr}`)
    .then(fetchCallback)
    .then(([data]) => {
      //seting data from API to a country class
      country = new Country(
        data.flags.png,
        data.name.common,
        data.region,
        data.population,
        Object.values(data.languages)[0],
        Object.values(data.currencies)[0].name,
        data.borders ? data.borders.length : 0
      );
      //pushing country class to an a array
      countryArr.push(country);

      ///////////////Neigbhours/////////////////
      //Makikng neighbours
      const countryNeigbours = data.borders;

      //Guarding claw // Country neigbhourNum=0 is set for countries that have 0 neighbours
      if (!countryNeigbours) {
        renderCountry(country);
        return;
      }

      //Doing a fetch for each  country
      countryNeigbours.forEach((state, i) => {
        const neigbourCountry = fetch(
          `https://restcountries.com/v3.1/alpha/${state}`
        );
        //U prethodnoj varijabli sam fetchovao promise, zatim u ovom then Metodu vracam taj promise, i na njega dirketno pozivan then za json, i then na json, putem koga ubacujem u html
        return neigbourCountry.then(fetchCallback).then(([data]) => {
          neighbour = new Neighbour(
            data.flags.png,
            data.name.common,
            data.region,
            data.population,
            Object.values(data.languages)[0],
            Object.values(data.currencies)[0].name,
            data.borders ? data.borders.length : 0
          );

          if (!neighbour) return;
          country.neighbours.push(neighbour);

          //Connetcing IDs
          if (country.neighbours[i] === neighbour) neighbour.id = country.name;
          ////////
        });
      });

      renderCountry(country);
      //Ovakav nacin fetchovanja se ne praktikuje, jer kreira callback hell. Medjutim, imam vise vrijednost koje je potrebno fetchovati, a ovo je bio najbrzi nacin
    })
    .catch(errorDisplay)
    .finally(() => {
      countriesContainer.opacity = 1;
    });
}

//CALLBACK function for INPUT field
function inputCountry(e) {
  if (e.key !== 'Enter') return;
  if (!input.value) return;
  getCountryData(input.value);

  //Clear fields
  input.value = '';
  input.blur();
}

//Function for SHOW neighbours button click
function buttonClick(e) {
  //Boolean value for button click
  const buttonExists = e.target.classList.contains('neighbour__button');
  //Button hide and button show
  const buttonHide = e.target.closest('.country').querySelector('.button_hide');
  const buttonShow = e.target.closest('.country').querySelector('.button_show');
  //Country name - for matching countries from an Array and from HTML
  const countryName = e.target
    .closest('.country')
    .querySelector('.country__name').textContent;

  //DELETE BUTTON - delete main country, and it's neighbours
  if (e.target.classList.contains('delete')) {
    const index = countryArr.findIndex(ele => ele.name === countryName);
    countryArr.splice(index, 1);
    e.target.closest('.country').remove();
    document.querySelectorAll('.neighbour').forEach(ele => ele.remove());
    buttonState = false;
  }
  //Guard clause
  if (!buttonExists) return;
  //Checking if target is a button

  //Button SHOW
  if (!buttonShow.classList.contains('hidden')) {
    //guard clause
    if (buttonState) return;
    //button show  won't work while button state is true
    buttonState = true;
    //Hide and show buttons

    buttonShow.classList.add('hidden');
    setTimeout(() => buttonHide.classList.remove('hidden'), 1);

    //Looping over country
    countryArr.forEach(ele => {
      //If countries name from countryArr matches name of country from html
      if (ele.name === countryName) {
        ele.neighbours.forEach(state => {
          //Then we render neighbours from neighbours array of that country object on page
          if (countryName === state.id) renderCountry(state, 'neighbour');
        });
      }
    });
  }
  //button HIDE
  if (!buttonHide.classList.contains('hidden')) {
    //while button state is true only hide button works, when it is closed, button show can work again
    buttonState = false;
    //Remove elements from html
    document.querySelectorAll('.neighbour').forEach(ele => ele.remove());
    //remove neighbour from arr of neighbour

    //button hide and show
    buttonShow.classList.remove('hidden');
    buttonHide.classList.add('hidden');
  }
}
//INPUT COUNTRY
input.addEventListener('keydown', inputCountry);
//BUTTON SHOW/HIDE Neighbours
countriesContainer.addEventListener('click', buttonClick);
//Button close error
buttonCloseError.addEventListener('click', function () {
  errorCon.classList.remove('show');
  errorCon.classList.add('hide');
});
//Error display
function errorDisplay(error) {
  console.error(error);
  errorCon.classList.remove('hidden');
  errorCon.classList.remove('hide');
  errorCon.classList.add('show');
  errorMsg.textContent = `Something went wrong. ${error.message}`;
  setTimeout(() => {
    errorCon.classList.add('hide');
    errorCon.classList.remove('show');
  }, 3000);
}
//Msg display
function msgDisplay(data) {
  msgCon.classList.remove('hidden');
  msgCon.classList.remove('hide');
  msgCon.classList.add('show');
  msgMsg.textContent = `You are in ${data.city}, ${data.country}`;
  setTimeout(() => {
    msgCon.classList.add('hide');
    msgCon.classList.remove('show');
  }, 3000);
}
////////////////////////////////////
//CODING CHALLENGE #1//
///////////////////////////////////
function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      err => reject(err)
    );
  }).then(response => {
    const { latitude: lat, longitude: lng } = response.coords;

    return fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`);
  });
}

function whereAmI() {
  getPosition()
    .then(response => {
      if (response.status === 403)
        throw new Error(`To many attempts (${response.status} code)`);
      if (!response.ok)
        throw new Error(`Geolocation wrong (${response.status} code)`);
      return response.json();
    })
    .then(data => {
      setTimeout(() => msgDisplay(data), 1000);
      return fetch(`https://restcountries.com/v3.1/name/${data.country}`);
    })
    .then(response => {
      if (!response.ok) throw new Error(`Country not found ${response.status}`);
      return response.json();
    })
    .then(([data]) => {
      getCountryData(data.name.common);
    })
    .catch(error =>
      console.error(`Something went wrong.${error.message}. Try again!`)
    )
    .finally(() => (countriesContainer.opacity = 1));
}

document.querySelector('.btn-country').addEventListener('click', whereAmI);

//////
// console.log('Test start');
// setTimeout(() => console.log('Timer 0'), 0);
// Promise.resolve('Resolved 2').then(response => {
//   for (let i = 0; i < 1000000000; i++) {}
//   console.log(response);
// });
// Promise.resolve('Resolved 1').then(response => console.log(response));
// console.log('Test end');
// //Buidling a promise

// const lotteryPromise = new Promise(function (reslove, reject) {
//   console.log(`Lotter draw has started...`);
//   tic();
//   setTimeout(() => {
//     if (Math.random() >= 0.5) {
//       reslove(`You WIN!`);
//     } else reject(new Error(`You LOST your money!`));
//   }, 6000);
// });

// function tic() {
//   let sec = 5;

//   const timer = () => {
//     if (sec <= 0) return;
//     console.log(sec);
//     sec--;
//   };
//   setInterval(timer, 1000);
// }
// lotteryPromise
//   .then(response => console.log(response))
//   .catch(error => console.error(error.message));

//PROMISIFYING setTIMOUt
const wait = seconds =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, seconds * 1000);
    setTimeout(reject, seconds * 2000);
  });

wait(3)
  .then(response => {
    console.log(`I waited for 3 seconds!`);
    return wait(2);
  })
  .then(response => {
    console.log('I waited for 2 seconds!');
    return wait(2);
  })
  .then(response => console.log('I waited for 1 second!'))
  .catch(error => console.log(error));

var currentCity;
var currentCountry;
var currentTemp;
var requestUrl;
var geocoder;

document.addEventListener('DOMContentLoaded', function () {
    initialize();
    getCurrentCityAndCountry();
});

function getCurrentCityAndCountry() {
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        var crd = pos.coords;

        console.log('Your current position is:');
        console.log('Latitude : ' + crd.latitude);
        console.log('Longitude: ' + crd.longitude);
        console.log('More or less ' + crd.accuracy + ' meters.');
        latitude = crd.latitude;
        longitude = crd.longitude;
        var latlng = new google.maps.LatLng(latitude, longitude);

        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {

                    for (var j=0; j<results.length; j++)  {
                        if (results[j].types[0] == 'locality') {
                            indice=j;
                            break;
                        }
                    }
                    for (var i=0; i<results[j].address_components.length; i++) {
                        if (results[j].address_components[i].types[0] == "locality") {
                            //this is the object you are looking for
                            city = results[j].address_components[i];
                        }
                        if (results[j].address_components[i].types[0] == "administrative_area_level_1") {
                            //this is the object your are looking for
                            region = results[j].address_components[i];
                        }
                        if (results[j].address_components[i].types[0] == "country") {
                            //this is the object you are looking for
                            country = results[j].address_components[i];
                        }
                    }

                    currentCity = city.long_name;
                    currentCountry = country.short_name;

                    requestData(currentCity, currentCountry);

                } else {
                    alert("No results found");
                }
            } else {
                alert("Geocoder failed due to: " + status);
            }
        });
    };

    function error(err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);

}

// TODO: Separation of concerns below
function requestData(city, country) {
    var request = new XMLHttpRequest();
    requestUrl = '//api.openweathermap.org/data/2.5/weather?q=' + city + ',' + country + '&units=metric&APPID=de25e34668f7af16171fa16705c66088';
    console.log(requestUrl);

    request.onload = function() {
        if (request.readyState === 4) {
            if (request.status == 200) {
                // Success!
                var data = JSON.parse(request.responseText);
                var city = data.name;
                var country = data.sys.country;
                var tempCelsius = Math.round(data.main.temp);
                currentTemp = tempCelsius;
                var weather = data.weather[0].main;
                var iconCode = data.weather[0].icon;
                var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";
                console.log(city);
                console.log(country);

                var loc = document.querySelector("p.location");
                var temp = document.querySelector("p.temperature");
                var currentWeather = document.querySelector("img.weather");
                
                loc.textContent = city + ', ' + country;
                temp.innerHTML = "" + tempCelsius + ' °' + "<a href=\'#\'>C</a>";
                var tempLink = document.querySelector('p.temperature a');
                tempLink.addEventListener("click", switchDegrees);
                
                currentWeather.setAttribute('src', iconUrl);
            }
        }
    };

    request.open('GET', requestUrl, true);
    request.send();
}

// TODO: SOC
function switchDegrees() {
    var temp = document.querySelector("p.temperature");
    if (this.textContent === "C") {
        var fahrenheit = Math.round(currentTemp * 9 / 5 + 32);
        temp.innerHTML = "" + fahrenheit + ' °' + "<a href=\'#\'>F</a>";
        currentTemp = fahrenheit;
    } else {
        var celsius = Math.round((currentTemp - 32) * 5 / 9);
        temp.innerHTML = "" + celsius + ' °' + "<a href=\'#\'>C</a>";
        currentTemp = celsius;
    }

    var tempLink = document.querySelector('p.temperature a');
    tempLink.addEventListener("click", switchDegrees);
}

function initialize() {
    geocoder = new google.maps.Geocoder();
}
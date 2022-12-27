var storelat
var storelong

async function PayloadRun() {
    await GetLatLong();
    doit();
  }

function GetLatLong(postalCode) {
      var postalCode = document.getElementById("postalCode").value;
      var apiKey = "AIzaSyC7_-rbL5TEj7Yjww2MmL9BSSDqN8uYvqo"
      const address = `${postalCode}, Canada`;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      return fetch(url)
          .then(response => response.json())
          .then(data => {
          if (data.status === 'OK') {
              const result = data.results[0];
              const location = result.geometry.location;
              storelong = location.lng
              storelat= location.lat
              return {
              latitude: location.lat,
              longitude: location.lng
              };
          } else {
              throw new Error(data.error_message);
          }

      
      });
      
          
}

function pointInPolygon(polygon, point) {
      let odd = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
          if (((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1]))
              && (point[0] < ((polygon[j][0] - polygon[i][0]) *
                  (point[1] - polygon[i][1]) /
                  (polygon[j][1] -
                  polygon[i][1]) + polygon[i][0]))) {
          odd = !odd;
      }        j = i;
      }
      return odd;
}

function pip(polygon, lon, lat) {
point = [lon, lat]
var startTime = performance.now()
retval = pointInPolygon(polygon, point)
var endTime = performance.now()
return { ok: retval, stats: `(<i>Point-in-Polygon Algo took ${endTime - startTime} millseconds</i>)`}
}

function lookup(db, lon, lat) {
  var startTime = performance.now()
  name = null
  for (var i = 0 in db["features"]) {
  res = pip(db["features"][i]["geometry"]["coordinates"][0],
          lon, lat)
  if(res.ok == true) {
      name = db["features"][i]["properties"]["ENNAME"]
      break
  }
  }
  var endTime = performance.now()
  console.log("Start time lookup: ", startTime)
  console.log("End time lookup: ", endTime)

  stats = "We searched <strong>" + i + " Electoral Districts</strong> and returned results in " + `<strong> ${endTime -
  startTime} milliseconds</strong> ` + res.stats
  
  return { state: res.ok, result: name , stats: stats }
}


function doit() {
  dbfile = "https://apollopublicaffairs.github.io/payload-embed/2015REPORDSIMPLIFIED.geojson"
  fetch(dbfile).then(function (response) {
  return response.json();
  }).then(function (db) {

  var lon = storelong
  var lat = storelat
  console.log("latitude is: ", lat)
  console.log("Longtitude is:", lon)

  result = lookup(db, lon, lat)
  document.getElementById("resultreport").innerHTML = result.result
  document.getElementById("stats").innerHTML = result.stats
  
  }).catch(function (error) {
  console.error("Something went wrong")
  })
}
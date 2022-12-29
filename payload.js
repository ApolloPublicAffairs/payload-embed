// Initialize global vars
var storelat
var storelong

// Initialize the form
document.addEventListener("DOMContentLoaded",createForm());
function createForm() {
    const formContainer = document.getElementById('form-container');
  
    formContainer.insertAdjacentHTML("beforeend", `
    <form id="pform" onsubmit="PayloadRun()" autocomplete="on">
    <div class="form-group">
        <label for="firstName">First Name</label>
        <input type="text" class="form-control" id="firstName" autofill="given-name" autocomplete="given-name" required>
      </div>
      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input type="text" class="form-control" id="lastName" autofill="family-name" autocomplete="family-name" required>
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" class="form-control" id="email" autocomplete="email"  required>
      </div>
         <div class="form-group">
            <label for="phoneNumber">Phone Number</label>
            <input type="tel" class="form-control" id="phoneNumber" autocomplete="tel"  required>
        </div>
        <div class="form-group">
          <label for="postalCode">Postal Code</label>
          <input type="text" class="form-control" id="postalCode" autocomplete="postal-code"  required>
        </div>
    
        <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    `);
  }
const pform = document.getElementById('pform');
  pform.addEventListener('submit', async function(e) {
              e.preventDefault();
              const payload = new FormData(pform);
              console.log(payload);
              await PayloadRun();
              UpdateForm();
              getMessage();
          }
          
          )

// Run The Geolocation Process


async function PayloadRun() {
    await GetLatLong();
    await doit();
  }

async function getMessage() {
    const MessageData = await fetch("https://icanhazdadjoke.com/", {
      headers: {
        Accept: "application/json"
      }
    });
    const MessageObj = await MessageData.json();
    console.log(MessageObj);
    const Messagecontent = document.getElementById("MessageDiv");
    MessageDiv.value = MessageObj.joke;
}

function UpdateForm() {
    
    const formContainer = document.getElementById('form-container');
    formContainer.innerHTML = `
    <p>We've found your elected officials in<strong> ${result.result} </strong></p>
    <p>While Nathan is setting up the database, why not send him a dad joke?</p>
    <form method="POST" action="mailto:" id="repform" autocomplete="off">  
        <div class="form-group">
            <label for="toField">To:</label>
            <input type="email" class="form-control" id="toField" name="to" placeholder="nathan.carr@apollopublicaffairs.com">
        </div>
        <div class="form-group">
            <label for="ccField">CC:</label>
            <input type="email" class="form-control" id="ccField" name="cc" placeholder="operations@apollopublicaffairs.com">
        </div>
        <div class="form-group">
            <label for="bccField">BCC:</label>
            <input type="email" class="form-control" id="bccField" name="bcc" placeholder="Enter BCC email">
        </div>
        <div class="form-group">
            <label for="messageField">Message:</label>
            <textarea class="form-control" id="MessageDiv" name="body" rows="3"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Send Email</button>
        </form>`
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
  
  
  }).catch(function (error) {
  console.error("Something went wrong")
  })
}
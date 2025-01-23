// GET All


var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};

fetch("http://localhost:3000/api/users", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));


// Create . POST
{
    "name":"mustafa2"
}

var raw = "{\r\n    \"name\":\"mustafa2\"\r\n}";

var requestOptions = {
  method: 'POST',
  body: raw,
  redirect: 'follow'
};

fetch("http://localhost:3000/api/users", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

// PATCH UPDATE 

var raw = "{\r\n    \"name\":\"ahmed\"\r\n}";

var requestOptions = {
  method: 'PATCH',
  body: raw,
  redirect: 'follow'
};

fetch("http://localhost:3000/api/users/1", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));



//  DELETE USER

var requestOptions = {
  method: 'DELETE',
  redirect: 'follow'
};

fetch("http://localhost:3000/api/users/1", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

/// POST Init Client


var requestOptions = {
  method: 'POST',
  redirect: 'follow'
};

fetch("http://localhost:3000/whatsapp/86867016/init", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));


/// GET QR

var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};

fetch("http://localhost:3000/whatsapp/86867016/qr", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));


// CLIENT STATUS 

var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};

fetch("http://localhost:3000/whatsapp/86867016/status", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

// POST SEND MSG 

var raw = "{\r\n  \"to\": \"201276071829@c.us\",\r\n  \"message\": \"Hello from NestJS!\"\r\n}\r\n";

var requestOptions = {
  method: 'POST',
  body: raw,
  redirect: 'follow'
};

fetch("http://localhost:3000/whatsapp/86867016/send", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

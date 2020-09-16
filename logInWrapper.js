function login(){
    const addy = document.getElementById('email').value;
    document.getElementById('message').innerHTML = addy + " is logged in";
    document.getElementById('loginArea').style.display = "none";
    document.getElementById('signedInArea').style.display = "block";
    document.getElementById('logoutButton').addEventListener('click', logout);
}

function logout(){
  document.getElementById('loginArea').style.display = "block";
  document.getElementById('signedInArea').style.display = "none";
  document.getElementById('message').innerHTML = "Logged out";
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('message').innerHTML = "Test Complete";
  document.getElementById('sendLink').addEventListener('click', login);
});

login;
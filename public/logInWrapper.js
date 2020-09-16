var actionCodeSettings = {
  url: window.location.href,
  handleCodeInApp: true,
};

function login(){
    const addy = document.getElementById('email').value;
    firebase.auth().sendSignInLinkToEmail(addy, actionCodeSettings)
    .then(function() {
      window.localStorage.setItem('emailForSignIn', addy);
    })
    .catch(function(error) {
    document.getElementById('message').innerHTML = "something went wrong...";
    console.log(error);
    });
    document.getElementById('message').innerHTML = "link sent to email";
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
  if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
    var email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }
    firebase.auth().signInWithEmailLink(email, window.location.href)
    .then(function(result) { window.localStorage.removeItem('emailForSignIn'); })
    .catch(function(error) { console.log(error); });
    document.getElementById('loginArea').style.display = "none";
    document.getElementById('signedInArea').style.display = "none";
    document.getElementById('message').style.display = "none";
    init();
  }
  else {
    document.getElementById('message').innerHTML = "Test Complete";
    document.getElementById('sendLink').addEventListener('click', login); 
  }
});
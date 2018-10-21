
function askPermission() {
  return new Promise(function (resolve, reject) {
    const permissionResult = Notification.requestPermission(function (result) {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  })
    .then(function (permissionResult) {
      if (permissionResult !== 'granted') {
        throw new Error('We weren\'t granted permission.');
      }
    });
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  return navigator.serviceWorker.getRegistration()
    .then((registration) => {
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      })
    })
    .then(function (subscription) {
      console.log('User is subscribed.');
      console.log(subscription);
      fetch('https://localhost:44348/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      }).then(function (response) {
        if (response.ok) {
          console.log('Successfully subscribed for Push Notifications');
        } else {
          console.log('Failed to store the Push Notifications subscription on server');
        }
      })
    })
    .catch(function (err) {
      console.log('Failed to subscribe the user: ', err);
    });
}

async function isUserSubscribed() {
  var isSubscribed = false;
  return await navigator.serviceWorker.getRegistration()
    .then((registration) => {
      if (!registration) {
        return null;
      }
      return registration.pushManager.getSubscription()
    })
    .then(function (subscription) {
      isSubscribed = !(subscription === null);
      return isSubscribed;
    });
}

const applicationServerPublicKey = 'BP3KYW8aPpClaCjP2MUceUNTwqBSaK88kTnl6SWg0k134zAy_dNNub8LfGHo83bbkm-LUGAd_aLKM0z_4cpUlY8';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export { askPermission, subscribeUser, isUserSubscribed };
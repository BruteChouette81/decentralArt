
/* to way:
-1st: Wyre checkout
    -get the credit on centralized exchange and use an api Wyre
    //secret TEST-SK-9GZ74QRR-BPN327QT-WB8RLWGW-Y3T7PZY3
    api key: TEST-AK-VYJPFG3V-ARVEBC29-9F483GC4-T6U7MP62
    client code: AC_JGDWVJ3PDEL

    new secret: TEST-SK-QRRQQ6BH-ZE6LPQUP-2WLBXCYW-M8QTZN4J
    new api lkey: TEST-AK-3M3RRY2E-6N9W79HB-RZVLW6NQ-LUYD7PA3
    new client code: AC_LHA7N9QRLP6

    each new F2C interpretation: 
    get the exact amount transfert on wyre. Then use the market contract to access those credits 
-2nd: use same calls, but with moonpay

const sdk = require('api')('@wyre-hub/v4#a7v9oa26lbyb5rxw');

sdk.auth('TEST-SK-9GZ74QRR-BPN327QT-WB8RLWGW-Y3T7PZY3');
sdk.createWalletOrderReservation({
  referrerAccountId: 'AC_JGDWVJ3PDEL', //always the same
  amount: '100',
  sourceCurrency: 'USD',
  destCurrency: 'ETH', //$CREDIT
  dest: 'ethereum:0xfa99F46DD28933b56bFdB829d2a2d59EFacEB2d5',
  firstName: 'Thomas',
  lastName: 'Berthiaume',
  phone: '4189066360',
  country: 'CA',
  postalCode: 'G0S2C0',
  state: 'Quebec',
  city: 'Saint-Antoine-de-Tilly',
  street1: '4172 Rte Marie-Victorin'
})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  with imperial account, get already the payment method  using owner parameter
{
  "url": "https://pay.testwyre.com/purchase?accountId=AC_JGDWVJ3PDEL&reservation=93P8UHQ82XGVG2PZRCMU&autoRedirect=false&utm_campaign=AC_JGDWVJ3PDEL&utm_medium=widget&utm_source=checkout",
  "reservation": "93P8UHQ82XGVG2PZRCMU"
}

create order with card number with api backend!!!
*/

function placeOrder(amount, address, hasPay, payment, city, state, code, country, street, phone, email, fname, lname) {
    const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: 'Bearer TEST-SK-QRRQQ6BH-ZE6LPQUP-2WLBXCYW-M8QTZN4J'
        },
        body: JSON.stringify({
        lockFields: ['amount', 'sourceCurrency', 'destCurrency', "dest"],
        referrerAccountId: 'AC_LHA7N9QRLP6', //always the same
        amount: amount,
        sourceCurrency: 'USD',
        destCurrency: 'ETH', //$CREDIT
        dest: `ethereum:${address}`, //not toLowerCase
        autoRedirect: true, 
        redirectUrl: `https://imperialdao.net/F2C/${address}`,
        failureRedirectUrl: 'https://imperialdao.net/market'}) //add owner
      };
      
      return new Promise(function (resolve, reject) {
        fetch('https://api.testwyre.com/v3/orders/reserve', options)
        .then(response => response.json())
        .then(response => {
          if (hasPay) {
            const options = {
              method: 'POST',
              headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: 'Bearer TEST-SK-QRRQQ6BH-ZE6LPQUP-2WLBXCYW-M8QTZN4J'
              },
              body: JSON.stringify({
                debitCard: {number: payment[0], year: payment[2], month: payment[1], cvv: payment[3]},
                address: {
                  city: city,
                  state: state,
                  postalCode: code,
                  country: country,
                  street1: street
                },
                amount: amount,
                sourceCurrency: 'USD',
                destCurrency: 'ETH',
                dest: `ethereum:${address}`,
                referrerAccountId: 'AC_JGDWVJ3PDEL',
                givenName: fname,
                familyName: lname,
                phone: phone,
                email: email,
                reservationId: response.reservation
              })
            };
            
            fetch('https://api.testwyre.com/v3/debitcard/process/partner', options)
              .then(response => response.json())
              .then(response =>  getAuth(response.authenticationUrl).then(res => {
                if (res.code) {
                  getStatus(res.transfertId).then(res => {
                      resolve(res) // true if completed 
                  })
                } else {
                  reject("Can't authentificate")
                }
                
              }))
              .catch(err => console.error(err));
            
          } else {
            window.open(response.url, '_blank', 'width=500,height=500')
            resolve("no pay")
          }
         
        }).catch(err => console.error(err));
      })
       
}

async function getAuth(authUrl, transferId) {
  window.open(authUrl, '_blank', 'width=500,height=500') //open auth link
  var authenticationComplete = new Promise(function (resolve, reject) {
      window.addEventListener("message", function (event) {
          try {
              if (event.origin) {
                  if (event.origin.includes("sendwyre") || event.origin.includes("testwyre")) {
                      let data = event.data
                      resolve(data);
                  }
              }
          }catch (e){
              reject(e);
          }
      }, false);
   });
  
  let authResult = await authenticationComplete;
  
  if (authResult.type === "authentication" && authResult.status === "completed") {
      // close the webview
      //alert("auth complete")
      return {code: true, transfertId: transferId} //return true if auth is true
  } else {
    
    return {code: false, transfertId: transferId}
  }
}

function getStatus(transferId) {
let i = 0;
return new Promise(function (resolve, reject) {
  const interval = setInterval(() => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: 'Bearer TEST-SK-QRRQQ6BH-ZE6LPQUP-2WLBXCYW-M8QTZN4J'
      }
    };
    
    fetch(`https://api.testwyre.com/v2/transfer/${transferId}/track`, options)
      .then(response => response.json())
      .then(response => {
        if (response.status === "COMPLETE") {
          clearInterval(interval);
          resolve(true)
        }
        if (i <= 10) {
          i++
        }
        if (i > 10) {
          reject("Transaction failed")
        }
      })
      .catch(err => console.error(err));
  }, 5000);

})
  
  
}


export default placeOrder;
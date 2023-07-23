//api to pay gaz fees on transactions


async function getGasPriceUsd(amount, address, payment, city, state, code, country, street, phone, email, fname, lname) {
    const options1 = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Bearer TEST-SK-QRRQQ6BH-ZE6LPQUP-2WLBXCYW-M8QTZN4J'
      },
      body: JSON.stringify({
        referrerAccountId: 'AC_LHA7N9QRLP6' //always the same
      })
    };
   
   
    return new Promise(function (resolve, reject) {
      fetch('https://api.testwyre.com/v3/orders/reserve', options1)
      .then(response => response.json())
      .then(response => {
        const options2 = {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: 'Bearer TEST-SK-QRRQQ6BH-ZE6LPQUP-2WLBXCYW-M8QTZN4J'
          },
          body: JSON.stringify({
            debitCard: {number: payment[0], year: payment[2], month: payment[1], cvv: payment[2]},
            address: {
              city: city,
              state: state,
              postalCode: code,
              country: country,
              street1: street,
              street2: ""
            },
            amount: amount,
            sourceCurrency: 'USD',
            destCurrency: 'ETH', //$credit
            dest: `ethereum:${address}`,
            referrerAccountId: 'AC_LHA7N9QRLP6',
            givenName: fname,
            familyName: lname,
            phone: phone,
            email: email,
            reservationId: response.reservation
          })
        }
        fetch('https://api.testwyre.com/v3/debitcard/process/partner', options2)
        .then(response2 => response2.json())
        .then(response2 => getAuth(response2.authenticationUrl).then(res => {
          if (res.code) {
            getStatus(res.transfertId).then(res => {
                resolve(res) // true if completed 
            })
          } else {
            reject("Can't authentificate")
          }
          
        })) //return "ok" when transaction is complete
        .catch(err =>  reject(err));
        }).catch(err => reject(err))
    })
    
}

async function getAuth(authUrl, transferId) {
    window.open(authUrl) //open auth link
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

export default getGasPriceUsd;
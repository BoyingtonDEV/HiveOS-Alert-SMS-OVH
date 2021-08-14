const config = require("./config.json");
const axios = require('axios');

const ovh = require('ovh')({
    endpoint: 'ovh-eu',
    appKey: config.OVHappKey,
    appSecret: config.OVHappSecret,
    consumerKey: config.OVHconsumerKey
  });

smsSended = 0
function tempIsGood(GPU)
{
    console.log("Checking temp...")

    for (var i = 0; i < GPU.length; ++i) {
        
        temp = GPU[i]
        console.log(temp)
        if(temp > config.TempLimit)
        {
            console.log("Temp too high! Sending SMS.")
            if(smsSended == 1)
            {
                console.log("SMS already sent!")
            }
            smsSended = 1
            sendSMS(GPU)
            return 2;
        }
    }
    console.log("Temp is good.")
    smsSended = 0
    return 1;

}

function checkTemp() {
axios.get('https://api2.hiveos.farm/api/v2/farms/'+config.HiveFarm+'/workers/'+config.HiveWorker+'/metrics', {
    headers: {
        "Authorization": "Bearer "+ config.HiveToken
    },
    params: {
        "period": "1d"
    }
      })
      .then(function (response) {
        const lastItem = response.data.data[response.data.data.length-1]
        const GPU = lastItem.temp
        const result = tempIsGood(GPU)
        console.log(result)
      })
      .catch(function (error) {
        console.log(error);
      });
    }

    setInterval(checkTemp,300000)
// SMS Send function
function sendSMS(GPU){
var mss = 0
message = "Alert temp is high : "
console.log(smsSended)
    for (var i = 0; i < GPU.length; ++i) {
        
        message = message +"GPU"+mss+" : "+ GPU[i]+" ";
        ++mss
        
    }
    console.log(message)
    const serviceName = config.OVHserviceName

    ovh.request('POST', '/sms/' + serviceName + '/jobs', {
        message: message,
        senderForResponse: true,
        receivers: [''] // <== PHONE NUMBER
    },function (errsend, result) {
        console.log(errsend, result);
    });
}

"use strict";

let fs = require('fs');
let conf = JSON.parse(fs.readFileSync('configuration.conf', 'utf8'));
console.log(conf);

let exec = require('child_process').exec;
let request = require('request');

let headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}


const getAndSendRequest = () => {
    let obj = {};
    exec("~/dynamic-1.5.0/bin/dynamic-cli getmininginfo", function (error, stdout, stderr) {
        console.log(JSON.parse(stdout).hashespersec);
        obj.hashrate = JSON.parse(stdout).hashespersec;
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
    
    exec("~/dynamic-1.5.0/bin/dynamic-cli getbalance", function (error, stdout, stderr) {
        console.log(JSON.parse(stdout));
        obj.balance = JSON.parse(stdout);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });

    setTimeout(function() {
        console.log('sendRequest ' + obj);
        // Configure the request
        var options = {
            url: `http://${conf.monitor_ip}:${conf.monitor_port}/miners/${conf.miner_name}/${obj.hashrate}/${obj.balance}`,
            method: 'POST',
            headers: headers,
        }

        // Start the request
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                console.log(body)
            }
        });
    }, 1000 * 2);
}

const sendBalance = () => {
    exec(`~/dynamic-1.5.0/bin/dynamic-cli sendtoaddress "${conf.send_address}" 0.9999616`, function (error, stdout, stderr) {
        console.log(JSON.parse(stdout).hashespersec);
        obj.hashrate = JSON.parse(stdout).hashespersec;
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}

setTimeout(getAndSendRequest, 0);
setInterval(getAndSendRequest, 1000 * 60);  // 60 seconds interval.
setInterval(sendBalance, 1000 * 60);    // 60 seconds interval.


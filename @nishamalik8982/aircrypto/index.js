'use strict'

var Promise = require("bluebird")
var crypto = require("crypto");
var randomNumber = require("random-number-csprng");
var base64 = require('base-64');
var request = require('request-promise');
var dateFormat = require('dateformat');
var cryptoJS = require ('crypto-js');
var header = require ('./headergen.js');
const rn = require ('./randomno.js');
var querystring = require('querystring');

exports.getQuote = function (amount, primaryCurrency, secondaryCurrency){
  var nonce = rn.randomnumber(5);
  var now = new Date();
  var timestamp = dateFormat(now, "yyyymmdd hh:MM:ss");
  var httpmethod="GET";
  var MID = "CFF7D059-5EFC-49B2-BD18-B937261943B5";
  var APIkey ="b25c9ae6f91d4c9f948b67ec00113456";
  var URI = "https://previewapi.paidbycoins.com/v1/cli/rates";
  var payload='';
  var fiatCurrency = ["USD", "AUD"];
  var cryptoCurrency = ["ETH", "BTC", "LTC", "BCH"];

  var signature = header.headergen(MID, httpmethod,URI, timestamp, nonce, payload, APIkey);
  return request({
      "uri": URI,
      "method": httpmethod,
      "apikey": APIkey,
      "JSON" : true,
      "headers":{
        "pbcx": signature,
        "User-Agent" : "Request-Promise"
      }},
    function(error, response, body) {
      if (error) {
        //handle error
        console.log(error);
      }
    })
    .then(function(response) {
      let quotes = JSON.parse(response);
      let desiredQuote = quotes.Data.filter(function(element){
        // If we want to convert crypto to fiat
        if (cryptoCurrency.includes(primaryCurrency)) {
          return element.PrimaryCurrency === primaryCurrency && element.SecondaryCurrency === secondaryCurrency;
        } else { // If we want to convert fiat to crypto
          return element.PrimaryCurrency === secondaryCurrency && element.SecondaryCurrency === primaryCurrency;
        }
      });
      // If we want to convert crypto to fiat
      if (cryptoCurrency.includes(primaryCurrency)) {
        return amount*desiredQuote[0].Price;
      } else {// If we want to convert fiat to crypto
        return amount/desiredQuote[0].Price;
      }
    });
}

exports.createPayment = function (userEmail, cryptoType, Amount){
  var nonce = rn.randomnumber(5);
  var now = new Date();
  var timestamp = dateFormat(now, "yyyymmdd hh:MM:ss");
  var MID = "CFF7D059-5EFC-49B2-BD18-B937261943B5";
  var APIkey ="b25c9ae6f91d4c9f948b67ec00113456";
  var httpmethod="POST";
  var Currency = "AUD";
  var MerchantRefNumber= "345345345";
  var URI = "https://previewapi.paidbycoins.com/v1/cli/createpayment";

  var payload = JSON.stringify({
    CryptoCurrency: cryptoType,
    Currency: Currency,
    Amount: Amount,
    Detail:{
      MerchantRefNo: MerchantRefNumber,
      Email: userEmail
    }
  });

  var signature = header.headergen (MID, httpmethod,URI, timestamp, nonce, payload, APIkey);
  return request.post({
      "encoding": 'utf8',
      "uri": URI,
      "method": httpmethod,
      "apikey": APIkey,
      "JSON" : true,
      "body": payload,
      "headers":{
        "content-type":"application/json",
        "pbcx": signature,
        "User-Agent" : "Request"
      }},
    function(error, response, body) {
      if(error) {
        return console.error('couldnt connect', error);
      }
    })
    .then(function(response) {
      return response;
    });
}

exports.paymentStatus = function (paymentID) {
  var nonce = rn.randomnumber(5);
  var now = new Date();
  var timestamp = dateFormat(now, "yyyymmdd hh:MM:ss");
  var MID = "CFF7D059-5EFC-49B2-BD18-B937261943B5";
  var APIkey ="b25c9ae6f91d4c9f948b67ec00113456";
  var httpmethod="GET";
  var URI = "https://previewapi.paidbycoins.com/v1/cli/status/" + paymentID;

  var payload = "";

  var signature = header.headergen(MID, httpmethod,URI, timestamp, nonce, payload, APIkey);
  return request({
      "encoding": 'utf8',
      "uri": URI,
      "method": httpmethod,
      "apikey": APIkey,
      "JSON" : true,
      "body": payload,
      "headers":{
        "content-type":"application/json",
        "pbcx": signature,
        "User-Agent" : "Request"
      }},
    function(error, response, body) {
      if(error) {
        return console.error('couldnt connect', error);
      }
    })
    .then(function(response) {
      return response;
    });
}

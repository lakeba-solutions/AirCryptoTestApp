
'use strict'


var aircrypto = require ('./index.js');

var paymentID = "";
// Quantities to get from user
var amount = 234;
var primaryCurrency = "AUD"; // or USD ?
var secondaryCurrency = "XRP";
var userEmail = "user@gmail.com";
var MerchantRefNumber = "345345345"; // ??

aircrypto.getQuote(amount, primaryCurrency, secondaryCurrency).then(function (res) {
  let quote = JSON.parse(res);
  console.log('QUOTE: %f %s == %d %s',amount.toFixed(2),primaryCurrency,quote.toFixed(2),secondaryCurrency);
});



aircrypto.createPayment(userEmail, secondaryCurrency, amount).then(function (res) {
  let payment = JSON.parse(res);
  paymentID = payment.Data.PaymentID;

  console.log('PAYMENT: status: %s, payment id: %s', payment.Status, paymentID);

  aircrypto.paymentStatus(paymentID).then(function (res) {
    let paymentStatus = JSON.parse(res);
    console.log('PAYMENT STATUS: %s,  %s', payment.Status, paymentStatus.Data.Status);
  });
});

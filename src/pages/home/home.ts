import { Component } from '@angular/core';
import {Alert, NavController, NavParams} from 'ionic-angular';
import { AirCrypto } from '@lakeba-solutions/aircryptolib';
import { HttpClient,HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  public airCrypto:any = new AirCrypto("CFF7D059-5EFC-49B2-BD18-B937261943B5","b25c9ae6f91d4c9f948b67ec00113456");
  // List of cryptocurrencies
  public  cryptoCurrency:Array<string> = ["ETH", "BTC", "LTC", "BCH"];

  // Currency type
  public type:string = ""; // FIAT or CRYPTO

  // To display/hide input field (default: hidden)
  public showCrypto:boolean = false; // show currency in crypto
  public showFiat:boolean = false;  //  show currency in fiat

  // Currencies
  public primaryCurrency:string = "";
  public secondaryCurrency:string = "";

  // if true --> primaryCurrency is crypto and secondaryCurrency is fiat, else the other way around
  public secondaryCurrencyIsFiat:boolean = false;

  // amount (either in crypto or fiat)
  public amount:number = null;

  // To display/hide the response of function getQuote
  public quoteResponse:boolean = false;

  // To display/hide status button
  public status: boolean = false;

  // email
  public email:string = "";

  // quoted amount from getQuote
  public quotedAmount:number = null;

  // To display/hide amount input field
  public inputAmount: boolean = false;

  // To Display/hide confrm button
  public confirmQuote: boolean = false;

  // Currency to pass to the createPayment() function. Can be either primaryCurrency or secondaryCurrency (the one in AUD)
  public currency:string = "";

  // Amount to pass to the createPayment() function. It can be this.amount or this.quotedAmount (the one in AUD)
  public amountAUD:number = null;

  // To store info from payment
  private Payment:any = {
    ID: null,
    address: "",
    cryptoAmount: null
  };

  constructor(public navCtrl: NavController,
              public http: HttpClient)
              {

              }


  showCurrency() {
    if ( this.type === "CRYPTO" ) {
      this.showCrypto = true;
      this.showFiat = false;
      this.secondaryCurrency = "AUD";
      this.secondaryCurrencyIsFiat = true;
    } else {
      this.secondaryCurrencyIsFiat = false;
      this.showCrypto = false;
      this.showFiat = true;
      this.primaryCurrency = "AUD";
    }

    this.status = false;
    this.confirmQuote = false;
    this.quoteResponse = true;
  }

  public showAmount() {
    this.inputAmount = true;
  }

  public showButtons() {
    this.status = true;
    this.confirmQuote = true;
  }

  public amountIsInRange() {
    if (this.secondaryCurrencyIsFiat ) {
      if (this.quotedAmount < 30){
        alert("Minimum amount is:  " + (this.amount*30/this.quotedAmount).toFixed(4).toString() + this.primaryCurrency );
        return false;
      } else if(this.quotedAmount > 1000) {
        alert("Maximum amount is:  " + (this.amount*1000/this.quotedAmount).toFixed(4).toString() + this.primaryCurrency );
        return false;
      } else {
        return true;
      }
    } else {
      if (this.amount < 30){
        alert("Minimum amount is:  30 AUD" );
        return false;
      } else if(this.amount > 1000) {
        alert("Maximum amount is:  1000 AUD" );
        return false;
      } else {
        return true;
      }
    }
  }

  public getRate() {
    let that = this;
    console.log(this.amount, this.primaryCurrency, this.secondaryCurrency);
    document.getElementById('quoteResponse').textContent = 'Getting quote...';
    this.showButtons();
    this.airCrypto.getQuote(this.amount, this.primaryCurrency, this.secondaryCurrency).then(function (res) {
      var result = JSON.parse(res);
      document.getElementById('quoteResponse').textContent = 'Your quote: ' + that.amount + ' ' + that.primaryCurrency.toString() + ' = ' + result.QUOTE.toFixed(2) + ' ' + that.secondaryCurrency;
      that.quotedAmount = result.QUOTE;
    }).catch(function (e) {
      alert(e.message);
    });
  }

  public makePayment() {
    // If    30 < AUD < 1000
    if (this.amountIsInRange()) {
      let that = this;
      if (this.secondaryCurrencyIsFiat) {
        this.currency = this.primaryCurrency;
        this.amountAUD = this.quotedAmount;
      } else {
        this.currency = this.secondaryCurrency;
        this.amountAUD = this.amount;
      }
      this.airCrypto.createPayment(this.email, this.currency, this.amountAUD).then(function (res) {
        let response = JSON.parse(res);
        that.Payment = {
          ID: response.Data.PaymentID,
          address: response.Data.CryptoAddress,
          cryptoAmount: response.Data.CryptoAmount
        };
        alert(
          "\npaymentID:   " + that.Payment.ID +
          "\ncryptoAddress:   " + that.Payment.address +
          "\ncryptoAmount:   " + that.Payment.cryptoAmount + "  " + that.primaryCurrency);
      }).catch(function (e) {
        alert(e.message);
      });
    } else return;
  }

  public getStatus() {
    if (this.amountIsInRange()) {
      let that = this;
      this.airCrypto.paymentStatus(that.Payment.ID).then(function (res) {
        let response = JSON.parse(res);
        let TransactionStatus = response.Data.Status;
        alert("\nPayment Status:   " + TransactionStatus);
      }).catch(function (e) {
        alert(e.message);
      });
    } else return;
  }


}

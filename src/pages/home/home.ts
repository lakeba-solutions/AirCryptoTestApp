import { Component } from '@angular/core';
import {Alert, NavController, NavParams} from 'ionic-angular';
import { getQuote, createPayment, paymentStatus } from '@nishamalik8982/aircrypto';
import { HttpClient,HttpErrorResponse } from '@angular/common/http';
import { Select } from 'ionic-angular';
import { ViewChild } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import {FormBuilder, FormGroup, Validators, AbstractControl} from "@angular/forms";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  // List of cryptocurrencies
  public  cryptoCurrency:Array<string> = ["ETH", "BTC", "LTC", "BCH"];

  // To
  public type:string = ""; // FIAT or CRYPTO

  // To display/hide input field
  public showCrypto:boolean = false;
  public showFiat:boolean = false;






  @ViewChild('selectCrypto') selectCrypto: Select;

  // Currencies
  public primaryCurrency:string = "";
  public secondaryCurrency:string = "";
  public secondaryCurrencyIsFiat:boolean = false;
  public amount:number = null;
  public quoteResponse:boolean = false;
  public status: boolean = false;
  public email:string = "";
  public quotedAmount:number = null;
  public inputAmount: boolean = false;
  public confirmQuote: boolean = false;

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
    getQuote(this.amount, this.primaryCurrency, this.secondaryCurrency).then(function (res) {
      document.getElementById('quoteResponse').textContent = 'Your quote: ' + that.amount + ' ' + that.primaryCurrency.toString() + ' = ' + res + ' ' + that.secondaryCurrency;
      that.quotedAmount = res;
    }).catch(function (e) {
      alert(e.message);
    });
  }


  public createPayment() {
    // If    30 < AUD < 1000
    if (this.amountIsInRange()) {
      let that = this;
      if (this.secondaryCurrencyIsFiat) {
        createPayment(this.email, this.primaryCurrency, this.quotedAmount).then(function (res) {
          console.log(that.email, that.primaryCurrency, that.quotedAmount);
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
      } else {
        createPayment(this.email, this.secondaryCurrency, this.amount).then(function (res) {
          let response = JSON.parse(res);
          that.Payment = {
            ID: response.Data.PaymentID,
            address: response.Data.CryptoAddress,
            cryptoAmount: response.Data.CryptoAmount
          };
          alert(
            "\npaymentID:   " + that.Payment.ID +
            "\ncryptoAddress:   " + that.Payment.address +
            "\ncryptoAmount:   " + that.Payment.cryptoAmount + "  " + that.secondaryCurrency);
        }).catch(function (e) {
          alert(e.message);
        });
      }
    } else return;
  }


  public paymentStatus() {
    if (this.amountIsInRange()) {
      let that = this;
      paymentStatus(that.Payment.ID).then(function (res) {
        let response = JSON.parse(res);
        let TransactionStatus = response.Data.Status;
        alert("\nPayment Status:   " + TransactionStatus);
      }).catch(function (e) {
        alert(e.message);
      });
    } else return;
  }


}

import {React,useState,useEffect} from 'react';
import axios from 'axios';
import logo from '../images/icons/favicon.ico'
import { useHistory } from "react-router-dom";

var url = require('url');
const Booking2 = () => {
    const [bookData, setBookData] = useState([]);
    const history = useHistory()
     var mongoUrl = "http://localhost:8080/"
    var currentUrl = window.location.href;
    var parsedUrl = url.parse(currentUrl, true);
    var queryData = parsedUrl.query
    var mongoRequest = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryData)
    }
    /*
    useEffect(() => {
        const getFlights = () => {fetch(mongoUrl,mongoRequest).then(response => response.json()).then(data => {setBookData(data);console.log(bookData)});}
        getFlights()
        alert(JSON.stringify(bookData))

      }, []); */
    //alert(window.sessionStorage.getItem("bookingDetails"))
    
    function loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }

    async function displayRazorpay(flightAmount) {
        
        const price = queryData.price*100;
        console.log(price)
        const res = await loadScript(
            "https://checkout.razorpay.com/v1/checkout.js"
        );
  
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }
  
        const result = await axios.post("http://localhost:8081/payment/orders",{"amount":price,"currency":"INR"});
  
        if (!result) {
            alert("Server error. Are you online?");
            return;
        }
  
        const { amount, id: order_id, currency } = result.data.sub;
  
        const options = {
            key: "rzp_test_viDGDEqdmCJlAn", // Enter the Key ID generated from the Dashboard
            amount: amount.toString(),
            currency: currency,
            name: "Flight Corp.",
            description: "Test Transaction",
            image: { logo },
            order_id: order_id,
            handler: async function (response) {
                const data = {
                    "orderCreationId": order_id,
                    "razorpayPaymentId": response.razorpay_payment_id,
                    "razorpayOrderId": response.razorpay_order_id,
                    "razorpaySignature": response.razorpay_signature,
                };
                const result = await axios.post("http://localhost:8081/payment/verify", data);
                alert(result.data.status);
                if(result.data.status === "success"){
                    alert("Your Ticket has been booked. Reciept will be sent to your mail soon.")
                    history.push("/")
                }
                if(result.data.status === "fail"){
                    alert("Payment Failed, try again in some time");
                    history.push("/")
                }
            },
            theme: {
                color: "#61dafb",
            },
        };
  
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    }
    return(

                <div>
                    <button onclick={displayRazorpay()}></button>
                    <a href="/">Return to Home Page</a>
                </div>
    )
        
}

export default Booking2
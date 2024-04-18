import { Button, Card, CardContent, TextField, Typography } from '@mui/material';
import React, { useState } from 'react'
import { auth } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const App = () => {

  const [phone, setPhone] = useState('+91');
  const [hasFilled, setHasFilled] = useState(false);
  const [otp, setOtp] = useState('');

  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // ...
      }
    }, auth);
  }

  const handleSubmitOtp = () => {
    // Assuming `verifyOtp` can be called directly with the OTP
    // If it's necessary to pass an event, you may need to adjust the function definition
    verifyOtp(otp);
  }

  const handleSend = (event) => {
    event.preventDefault();
    setHasFilled(true);
    generateRecaptcha();
    let appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, phone, appVerifier)
      .then((confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        window.confirmationResult = confirmationResult;
      }).catch((error) => {
        // Error; SMS not sent
        console.log(error);
      });
  }
  
  const verifyOtp = (event) => {
    let otpInput = event.target.value;
    setOtp(otpInput);
  
    if (otpInput.length === 6) {
      // verify otp
      let confirmationResult = window.confirmationResult;
      // After OTP is confirmed and you get the user object
      confirmationResult.confirm(otpInput).then((result) => {
        // User signed in successfully.
        const user = result.user;
        
        // Here we assume you have access to user.phoneNumber after verification.
        // Now, send both phoneNumber and token to your backend
        fetch('http://localhost:5000/verify_and_store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phoneNumber: user.phoneNumber, // the verified phone number
            token: user.za // the token from the user object, property name might differ
          })
        })
        .then(response => response.json())
        .then(data => {
          // Handle response from your backend
          console.log(data);
          alert('Phone number and token sent successfully.');
        })
        .catch((error) => {
          // Handle any errors
          console.error('Error:', error);
        });
      });
    }
  }

  if(!hasFilled){
    return (
      <div className='app__container'>
        <Card sx={{ width: '300px'}}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
            <Typography sx={{ padding: '20px'}} variant='h5' component='div'>Enter your phone number</Typography>
            <form onSubmit={handleSend}>
              <TextField sx={{ width: '240px'}} variant='outlined' autoComplete='off' label='Phone Number' value={phone} onChange={(event) => setPhone(event.target.value)} />
              <Button type='submit' variant='contained' sx={{ width: '240px', marginTop: '20px'}}>Send Code</Button>
            </form>
          </CardContent>
        </Card>
        <div id="recaptcha"></div>
      </div>
    ) 
  } else {
    return (
      <div className='app__container'>
        <Card sx={{ width: '300px'}}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
            <Typography sx={{ padding: '20px'}} variant='h5' component='div'>Enter the OTP</Typography>
            <TextField 
              sx={{ width: '240px', marginBottom: '20px'}} 
              variant='outlined' 
              label='OTP' 
              value={otp} 
              onChange={(event) => setOtp(event.target.value)} 
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  handleSubmitOtp();
                }
              }} // This allows the user to also press Enter to submit the OTP
              inputProps={{ maxLength: 6 }} // Assuming OTP is 6 digits
            />
            <Button 
              onClick={handleSubmitOtp} 
              variant='contained' 
              sx={{ width: '240px'}}
            >
              Verify OTP
            </Button>
          </CardContent>
        </Card>
        <div id="recaptcha"></div>
      </div>
    )
  }
}

export default App;
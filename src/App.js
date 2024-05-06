import { Button, Card, CardContent, TextField, Typography, Box } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const App = () => {
  const [phone, setPhone] = useState('');
  const [hasFilled, setHasFilled] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(180); // 180 seconds for 3 minutes

  useEffect(() => {
    let interval = null;
    if (hasFilled && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [hasFilled, timer]);

  useEffect(() => {
    generateRecaptcha();  // 初始化 reCAPTCHA
  
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();  // 组件卸载时清除 reCAPTCHA 实例
      }
    };
  }, []);  // 空依赖数组确保仅在组件挂载和卸载时执行

  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    }, auth);
  }

  const handleSend = (event) => {
    event.preventDefault();

    if (!window.recaptchaVerifier) {
      console.error("reCAPTCHA has not been initialized.");
      return;  // 如果 reCAPTCHA 验证器未初始化，则不执行登录操作
    }
    //generateRecaptcha();

    setHasFilled(true);
    setTimer(180); // reset timer
    
    const fullPhoneNumber = `+886${phone.startsWith('0') ? phone.slice(1) : phone}`;
    let appVerifier = window.recaptchaVerifier;

    // window.recaptchaVerifier.verify().then(() => {
    //   // 此处进行电话号码发送逻辑
    // }).catch((error) => {
    //   console.error("reCAPTCHA verification failed:", error);
    // });

    signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
      }).catch((error) => {
        console.log(error);
      });
  }

  const verifyOtp = (event) => {
    let otpInput = event.target.value;
    setOtp(otpInput);

    if (otpInput.length === 6) {
      let confirmationResult = window.confirmationResult;
      confirmationResult.confirm(otpInput).then((result) => {
        const user = result.user;
        console.log(user.phoneNumber);

        const verificationToken = result.user.accessToken;

        const fullPhoneNumber = `+886${phone.startsWith('0') ? phone.slice(1) : phone}`;
        fetch('http://127.0.0.1:5000/verify_and_get_phone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phoneNumber: fullPhoneNumber,
            token: verificationToken
          })
        })
        .then(response => response.json())
        .then(data => {
          console.log('Token verified by backend:', data);
          alert('User signed in successfully');
        })
        .catch((error) => {
          console.error('Error verifying token:', error);
          alert('Error during token verification');
        });

      }).catch((error) => {
        console.error('User couldn\'t sign in (bad verification code?):', error);
        alert('User couldn\'t sign in (bad verification code?)');
      });
    }
  }

  return (
    <div className='app__container'>
      <Card sx={{ width: '300px'}}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
          <Typography sx={{ padding: '20px'}} variant='h5' component='div'>{!hasFilled ? '請輸入手機號碼' : '請輸入驗證碼'}</Typography>
          {!hasFilled ? (
            <form onSubmit={handleSend}>
              <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <TextField
                  sx={{ width: '80px' }}
                  variant='outlined'
                  value='+886'
                />
                <TextField
                  sx={{ width: '160px' }}
                  variant='outlined'
                  autoComplete='off'
                  label='Phone Number'
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)} // Automatically remove the first zero
                />
              </Box>
              <Button type='submit' variant='contained' sx={{ width: '240px', marginTop: '20px'}}>發送驗證碼</Button>
            </form>
          ) : (
            <TextField sx={{ width: '240px'}} variant='outlined' label='OTP ' value={otp} onChange={verifyOtp} />
          )}
          {hasFilled && <Typography sx={{ marginTop: '20px' }}>
            {timer > 0 ? `${Math.floor(timer / 60)}:${timer % 60 < 10 ? '0' : ''}${timer % 60} 後重新傳送` : <Button onClick={handleSend} variant="contained">重新發送驗證碼</Button>}
          </Typography>}
        </CardContent>
      </Card>
      <div id="recaptcha"></div>
    </div>
  );
}

export default App;

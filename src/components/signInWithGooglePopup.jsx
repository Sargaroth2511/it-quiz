import React from 'react'
import signInWithGoogle from '../Services/firebase/signInWithGoogle'

// TODO: Prevent user to enter no name
const SignInWithGooglePopup = ({showPopup}) => {
  return (
    <div className="authPopup">
        <div className="auth-form">
            <button onClick={()=> showPopup(false)} className="closeButton">
            X
            </button>
            <h2>Sign In With Your Google Account</h2>
            <button 
                onClick={
                    ()=>{
                        signInWithGoogle();
                        showPopup(false);
                        }
                    }>
                            Sign in
            </button>
        </div>
    </div>
  )
}

export default SignInWithGooglePopup
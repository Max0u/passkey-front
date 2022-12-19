// import { signIn, useSession } from 'next-auth/react';
import { ChangeEvent, KeyboardEventHandler, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/typescript-types';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

import styles from '../../styles/Home.module.css'

export default function SignInComponent() {
    const [email, setEmail] = useState('');
    const [isValid, setIsValid] = useState(false);

    const router = useRouter();
    // const { status } = useSession();

    // useEffect(() => {
    //     if (status === 'authenticated') {
    //         router.push('/');
    //     }
    // })

    // async function signInWithEmail() {
    //     return signIn('email', { email })
    // }

    async function signInWithWebauthn() {

        fetch('http://localhost:3333/users/getRegistration/6d0a8942-5550-4ac3-81a5-41d2b94957d9')
        .then((res) => res.json())
        .then(async (data) => {
            let attResp;
            try {
              // Pass the options to the authenticator and wait for a response
              attResp = await startRegistration(data);
            } catch (error) {
              // Some basic error handling

              throw error;
            }
        
            // POST the response to the endpoint that calls
            // @simplewebauthn/server -> verifyRegistrationResponse()
            const verificationResp = await fetch('http://localhost:3333/users/registrationVerification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(attResp),
            });
        
            // Wait for the results of verification
            const verificationJSON = await verificationResp.json();
        })
        // const optionsResponse = await fetch(url.toString());

        // if (optionsResponse.status !== 200) {
        //     throw new Error('Could not get authentication options from server');
        // }
        // const opt: PublicKeyCredentialRequestOptionsJSON = await optionsResponse.json();

        // if (!opt.allowCredentials || opt.allowCredentials.length === 0) {
        //     throw new Error('There is no registered credential.')
        // }

        // const credential = await startAuthentication(opt);

        // await signIn('credentials', {
        //     id: credential.id,
        //     rawId: credential.rawId,
        //     type: credential.type,
        //     clientDataJSON: credential.response.clientDataJSON,
        //     authenticatorData: credential.response.authenticatorData,
        //     signature: credential.response.signature,
        //     userHandle: credential.response.userHandle,
        // })

    }

    async function handleSignIn() {
        try {
            await signInWithWebauthn();
        } catch (error) {
            console.log(error);
            // await signInWithEmail();
        }
    }

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'Enter') {
            return handleSignIn();
        }
    }

    function updateEmail(e: ChangeEvent<HTMLInputElement>) {
        setIsValid(e.target.validity.valid)
        setEmail(e.target.value);
    }


    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <form onSubmit={e => e.preventDefault()}>
                    <input
                        name="email"
                        type="email"
                        id="email"
                        autoComplete="home email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={updateEmail}
                        onKeyDown={handleKeyDown}
                    />
                    <button type="button" onClick={handleSignIn} disabled={!isValid}>
                        Sign in
                    </button>
                </form>
            </main>
        </div>
    )
}
import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import Providers from "next-auth/providers";
import jwt from "jsonwebtoken";
import ApiClient from "../axios/client"
import { AxiosResponse } from "axios";

function getNextAuthToken(response: AxiosResponse, token?: JWT): JWT {
    const data = response.data

    const jwtDecode = jwt.decode(data.accessToken)

    if (token) {
        // @ts-ignore
        return { ...token, accessToken: data.accessToken, refreshToken: data.refreshToken, accessTokenExpiresAt: jwtDecode.exp }
    }

    // @ts-ignore
    return { accessToken: data.accessToken, refreshToken: data.refreshToken, id: jwtDecode?.sub, name: jwtDecode.name, email: jwtDecode.email, accessTokenExpiresAt: jwtDecode.exp }
}

async function refreshAccessToken(token: JWT) {
    try {
        const response = await ApiClient.post('/auth/refresh', {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.refreshToken}`
            }
        })

        return getNextAuthToken(response, token)

    } catch (error) {
        console.error(error);
        return null;
    }
}



export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Email credentials",
            id: "email-credentials",
            credentials: {},
            // @ts-ignore
            async authorize(credentials, _) {
                const { payload, endpoint } = credentials as {
                    payload: any;
                    endpoint: string;
                };
                const data = JSON.parse(payload)

                if (!data.email || !data.password) {
                    throw new Error("Missing username or password");
                }

                try {
                    const response = await ApiClient.post(endpoint, data)

                    return getNextAuthToken(response)
                } catch (error) {
                    console.error(error);
                    return null;
                }

            },
        }),
        CredentialsProvider({
            name: 'webauthn',
            id: "webauthn-credentials",
            credentials: {},
            // @ts-ignore
            async authorize(credentials, _) {
                const { authenticatorParams, accessToken, endpoint } = credentials as {
                    authenticatorParams: any;
                    accessToken: string;
                    endpoint: string;
                };

                try {
                    const response = await ApiClient.post(endpoint, authenticatorParams, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })

                    return getNextAuthToken(response)
                } catch (error) {
                    console.error(error);
                    return null;
                }
            }
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        // @ts-ignore
        jwt: async ({ token, user, account }) => {

            if (account && user) {
                return {
                    ...token,
                    // @ts-ignore
                    accessToken: user.accessToken,
                    // @ts-ignore
                    refreshToken: user.refreshToken,
                    // @ts-ignore
                    accessTokenExpiresAt: user.accessTokenExpiresAt,
                };
            }

            if (Date.now() / 1000 < new Date(token.accessTokenExpiresAt).getTime()) {
                return token
            }

            return await refreshAccessToken(token);
        },
        // @ts-ignore
        session: async (session, token) => {

            if (token) {
                session.token.accessToken = token.token.accessToken;
                session.token.refreshToken = token.token.refreshToken;
                session.token.accessTokenExpiresAt = token.token.accessTokenExpiresAt;
            }
            return { name: session.token.name, email: session.token.email, sub: session.token.sub, accessToken: session.token.accessToken }
        },
    },
    debug: true,
}

export default NextAuth(authOptions);

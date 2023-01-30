"use client"
import Image from "next/image";
import { FormEvent, useState } from "react";
import LoadingDots from "@/components/loading-dots";
import toast from "react-hot-toast";
import Link from "next/link";
import { startAuthentication } from "@simplewebauthn/browser";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function loginWithWebauthn(e: FormEvent<HTMLFormElement>) {

    let payload = {
      email: e.currentTarget.email.value,
    }


    fetch("http://localhost:3333/auth/getAuthenticator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(async (res) => {

      const data = await res.json();

      const asseResp = await startAuthentication(data.options);

      signIn("webauthn-credentials", {
        redirect: false,
        ...{ authenticatorParams: JSON.stringify(asseResp), accessToken: data.accessToken, endpoint: '/auth/authVerification' }
      }
        // @ts-ignore
      ).then(({ ok, error }) => {
        setLoading(false);
        if (ok) {
          router.push("/test");
        } else {
          toast.error(error);
          setLoading(false);
        }
      });
    });

  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <a href="https://dub.sh">
            <Image
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 rounded-full"
              width={20}
              height={20}
            />
          </a>
          <h3 className="text-xl font-semibold">Sign In</h3>
          <p className="text-sm text-gray-500">
            Use your email and password to sign in
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            loginWithWebauthn(e)
            toast.success(e.currentTarget.email.value)
          }}
          className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 sm:px-16"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-xs text-gray-600 uppercase"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="panic@thedis.co"
              autoComplete="webauthn username"
              required
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
            />
          </div>
          <button
            disabled={loading}
            className={`${loading
              ? "cursor-not-allowed border-gray-200 bg-gray-100"
              : "border-black bg-black text-white hover:bg-white hover:text-black"
              } flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none`}
          >
            {loading ? (
              <LoadingDots color="#808080" />
            ) : (
              <p>Sign In</p>
            )}
          </button>
          <Link href="/signin" className="font-semibold text-gray-800">
            <button className="border-black bg-black text-white hover:bg-white hover:text-black flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none">
              Sign in with classic credentials
            </button>
          </Link>
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register/webauthn" className="font-semibold text-gray-800">
              Sign up
            </Link>{" "}
            for free.
          </p>
        </form>
      </div>
    </div>
  );
}

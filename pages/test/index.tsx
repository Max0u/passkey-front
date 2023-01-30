import { unstable_getServerSession } from "next-auth"
import { signIn, signOut, useSession } from "next-auth/react"
import { authOptions } from "pages/api/auth/[...nextauth]"
import { useEffect, useState } from "react"

export default  function Component() {
  const { data: session } = useSession()
  console.log(session)
  if (session) {
    return (
      <>
        Signed in as {session.name} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
}



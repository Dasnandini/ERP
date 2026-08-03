'use client'
import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <div className=" flex gap-10  " >
      <Link href='/register' className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
      <button >Register</button></Link>
      <Link href='/login' className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300">
      <button>Login</button>
      </Link>
    </div>
   
  )
}
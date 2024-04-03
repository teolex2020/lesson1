"use client"
import {useState} from "react"
import ChatBot from "./components/ChatBot";
import { WandSparkles } from 'lucide-react'
export default function Home() {
const [popap, setPopap] = useState(true)


const togglePopap = () => {
  setPopap(!popap)
}


  return (
		<main className='flex min-h-screen flex-col items-center justify-center p-24 text-7xl font-bold relative'>
			<h1>Create Chat-Bot</h1>
			<button
				className={`absolute bottom-10 right-10 text-base flex gap-3 border-2 px-3 py-2 border-zinc-600 rounded-full bg-slate-200 hover:bg-slate-300 ${
					popap ? 'scale-100' : 'scale-0'
				}   origin-bottom-right ease-in-out  duration-500`}
				onClick={togglePopap}
			>
				<WandSparkles size={22} />
				<p>Chat-Bot</p>
			</button>
			<ChatBot togglePopap={togglePopap} popap={popap} setPopap={setPopap} />
		</main>
	)
}

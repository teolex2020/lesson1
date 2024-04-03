'use client'
import { useRef, useEffect } from 'react'
import { experimental_useAssistant as useAssistant } from 'ai/react'
import { X, Bot, SendHorizontal, User } from 'lucide-react'
import TextareaAutosize from 'react-textarea-autosize'
const ChatBot = ({ togglePopap, popap }) => {

 const { status, messages, input, submitMessage, handleInputChange, error } =
		useAssistant({
			api: '/api/assistant',
		})

	const messagesEndRef = useRef(null)

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

 

	return (
		<div
			className={` ${
				!popap ? 'scale-100' : 'scale-0'
			}   origin-bottom-right ease-in-out  duration-500 absolute bottom-10 right-10 border-2 border-zinc-700/50 rounded-lg h-96 w-72 text-base flex flex-col text-zinc-800 `}
		>
			<div className='w-full bg-slate-300 justify-center flex space-x-5  relative p-2'>
				<Bot size={24} />
				<p> Chat-Bot</p>
				<button className='absolute right-1' onClick={togglePopap}>
					<X size={24} />
				</button>
			</div>
			<div className='flex flex-col h-full p-2 bg'>
				<div className='flex-1 overflow-y-scroll max-h-[285px] '>
					{messages.length !== 0
						? messages.map((m) => (
								<div key={m.id} className='flex space-x-3'>
									{m.role === 'user' ? <User size={24} /> : <Bot size={24} />}
									<p
										className={`${
											m.role === 'user' ? 'text-green-500 ' : 'AI: '
										} w-full`}
									>
										{' '}
										{m.content}
									</p>
								</div>
						  ))
						: !error &&
						  messages.length === 0 && (
								<p className='text-center '>
									Hello friend, how can I help you?
								</p>
						  )}
					{status === 'in_progress' && (
						<div className='w-full  flex justify-center items-center text-blue-500 '>
							Send ....
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				<form
					onSubmit={submitMessage}
					className='border-2 border-zinc-400 rounded-lg flex min-h-10 justify-between'
				>
					<TextareaAutosize
						value={input}
						onChange={handleInputChange}
						className='h-full border-none outline-none text-sm w-full p-1'
						maxRows={3}
						style={{ overflow: 'auto', scrollbarWidth: 'none' }}
					/>

					<button type='submit' className='w-10 '>
						{' '}
						<SendHorizontal />
					</button>
				</form>
			</div>
		</div>
	)
}

export default ChatBot

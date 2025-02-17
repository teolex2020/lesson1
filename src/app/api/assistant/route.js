import { experimental_AssistantResponse } from 'ai'
import OpenAI from 'openai'

const keyAPI = process.env.NEXT_PUBLIC_OPENAI_API
const openId = process.env.NEXT_PUBLIC_OPENAI_ID

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
	apiKey: keyAPI || '',
})

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

const homeTemperatures = {
	bedroom: 20,
	'home office': 21,
	'living room': 21,
	kitchen: 22,
	bathroom: 23,
}

export async function POST(req) {
	// Parse the request body
	const input = await req.json()

	// Create a thread if needed
	const threadId = input.threadId ?? (await openai.beta.threads.create({})).id

	// Add a message to the thread
	const createdMessage = await openai.beta.threads.messages.create(threadId, {
		role: 'user',
		content: input.message,
	})

	return experimental_AssistantResponse(
		{ threadId, messageId: createdMessage.id },
		async ({ forwardStream, sendDataMessage }) => {
			// Run the assistant on the thread
			const runStream = openai.beta.threads.runs.createAndStream(threadId, {
				assistant_id:
					openId ??
					(() => {
						throw new Error('ASSISTANT_ID is not set')
					})(),
			})

			// forward run status would stream message deltas
			let runResult = await forwardStream(runStream)

			// status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
			while (
				runResult?.status === 'requires_action' &&
				runResult.required_action?.type === 'submit_tool_outputs'
			) {
				const tool_outputs =
					runResult.required_action.submit_tool_outputs.tool_calls.map(
						(toolCall) => {
							const parameters = JSON.parse(toolCall.function.arguments)

							switch (toolCall.function.name) {
								case 'getRoomTemperature': {
									const temperature = homeTemperatures[parameters.room]

									return {
										tool_call_id: toolCall.id,
										output: temperature.toString(),
									}
								}

								case 'setRoomTemperature': {
									const oldTemperature = homeTemperatures[parameters.room]

									homeTemperatures[parameters.room] = parameters.temperature

									sendDataMessage({
										role: 'data',
										data: {
											oldTemperature,
											newTemperature: parameters.temperature,
											description: `Temperature in ${parameters.room} changed from ${oldTemperature} to ${parameters.temperature}`,
										},
									})

									return {
										tool_call_id: toolCall.id,
										output: `temperature set successfully`,
									}
								}

								default:
									throw new Error(
										`Unknown tool call function: ${toolCall.function.name}`
									)
							}
						}
					)
			
				runResult = await forwardStream(
					openai.beta.threads.runs.submitToolOutputsStream(
						threadId,
						runResult.id,
						{ tool_outputs }
					)
				)
			}
		}
	)
}

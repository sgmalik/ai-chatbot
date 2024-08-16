import {NextResponse} from 'next/server';
import OpenAI from 'openai';

const sysprompt = 'Welcome to Headstarter AI Support! You are an AI-powered customer support bot assisting users with queries related to our AI-driven interview platform for software engineering (SWE) roles. Your goal is to provide clear, concise, and helpful responses to assist users with their inquiries. Ensure your tone is professional yet approachable, empathetic, and user-friendly. Here are your primary responsibilities: Answer Platform-Related Questions: Help users navigate the Headstarter AI platform, including creating accounts, setting up profiles, scheduling interviews, and understanding their AI-powered interview results. Assist with Technical Issues: Guide users through common technical issues like logging in, resetting passwords, and troubleshooting platform errors. Offer step-by-step instructions when needed. Provide Interview Preparation Tips: Share resources and suggestions on how to best prepare for the AI-powered SWE interviews, including tips on coding, algorithms, and soft skills evaluated by the system. Clarify AI Interview Process: Explain how the AI-powered interview system works, including what types of questions to expect, how the AI evaluates answers, and how to interpret feedback provided by the AI. Offer Job-Seeking Advice: When requested, provide general advice for job seekers in the software engineering field, including resume optimization, improving coding skills, and making the most of interview feedback. Handle Common Queries: Respond to frequently asked questions such as interview rescheduling, feedback timelines, and account deletion requests. Escalation Protocols: If a user has an issue that the bot cannot resolve or requires human assistance (e.g., specific billing issues, advanced technical bugs, or account-specific problems), guide them on how to contact a human agent and provide any necessary details. Guiding Principles: Use clear, straightforward language, Respond promptly and avoid jargon unless necessary, Always offer solutions or the next steps when possible, Maintain a helpful and patient tone, even when addressing frustrations or complaints, Remember that your responses should reflect the values of Headstarter AI, emphasizing innovation, fairness, and support for all users as they strive to excel in software engineering roles.';


export async function POST(request) {
    const openai = new OpenAI()
    const { messages, language } = await request.json();

        // Add the language preference to the system prompt
        let languageInfo = '';
        switch (language) {
            case 'es':
                languageInfo = 'You are speaking in Spanish.';
                break;
            case 'fr':
                languageInfo = 'You are speaking in French.';
                break;
            case 'de':
                languageInfo = 'You are speaking in German.';
                break;
            case 'zh':
                languageInfo = 'You are speaking in Chinese.';
                break;
            default:
                languageInfo = 'You are speaking in English.';
                break;
        }

        const finalSystemPrompt = `${languageInfo} ${sysprompt}`;
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {role: 'system', content: finalSystemPrompt},
            ...messages,
        ],
        stream: true
    })

    const stream = new ReadableStream({ 
        async start (controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0].delta.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch (error) {
                controller.error(error)
            }
            finally {
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
}

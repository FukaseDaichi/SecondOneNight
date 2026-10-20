export const TTS_MODEL = 'gemini-3.8-flash-tts';
export const TTS_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

/** Interactions API body for single-speaker speech. Style goes in speech_metadata, never in the text. */
export function buildTtsRequest({ text, voice, style }) {
    return {
        model: TTS_MODEL,
        input: [
            {
                type: 'user_input',
                content: [
                    {
                        type: 'text',
                        text,
                        annotations: [{ type: 'speech_metadata', style }],
                    },
                ],
            },
        ],
        generation_config: { speech_config: [{ voice }] },
        response_format: { type: 'audio' },
    };
}

/** Base64 audio from the last model_output audio part; throws with a body excerpt otherwise. */
export function extractAudioBase64(response) {
    const steps = Array.isArray(response?.steps) ? response.steps : [];
    let found = null;
    for (const step of steps) {
        if (step?.type !== 'model_output' || !Array.isArray(step.content)) continue;
        for (const part of step.content) {
            if (part?.type === 'audio' && typeof part.data === 'string' && part.data) found = part.data;
        }
    }
    if (found) return found;
    const excerpt = JSON.stringify(response).slice(0, 200);
    throw new Error(`no audio in response: ${excerpt}`);
}

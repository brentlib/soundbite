import axios from 'axios';

import { encoding_for_model } from 'tiktoken';

let encoder: ReturnType<typeof encoding_for_model> | null = null;

function getEncoder() {
  if (!encoder) {
    encoder = encoding_for_model('gpt-5');
  }
  return encoder;
}

export async function countTokens(text: string): Promise<number> {
  try {
    const enc = getEncoder();
    const tokens = enc.encode(text);
    return tokens.length;
  } catch (error) {
    console.error('Error counting tokens:', error);
    // Fallback: rough estimate (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4);
  }
}

// Extracts the concatenated output_text from an OpenAI Responses API payload
export function extractOutputText(response: any): string {
  return (response.output ?? [])
    .flatMap((item: any) => item.content ?? [])
    .filter((part: any) => part.type === 'output_text')
    .map((part: any) => part.text)
    .join('');
}

// Tool definition (matches OpenAI Responses API format, easy to map from MCP)
export interface Tool {
    type: 'function';
    name: string;
    description?: string;
    parameters: object; // JSON Schema (maps from MCP inputSchema)
  }
  
  // Tool call returned by the model
  export interface ToolCall {
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string; // JSON string of the tool input
    };
  }
  
  // --- Input item types (supports multi-turn tool use) ---
  
  // Standard conversational message
  export interface InputMessage {
    role: 'user' | 'assistant' | 'system' | 'developer';
    content: string;
  }
  
  // Assistant's prior function call (echoed back by client for multi-turn context)
  export interface InputFunctionCall {
    type: 'function_call';
    call_id: string;
    name: string;
    arguments: string; // JSON string
  }
  
  // Client's tool execution result
  export interface InputFunctionCallOutput {
    type: 'function_call_output';
    call_id: string;
    output: string;
  }
  
  // Union of all valid input item types
  export type InputItem = InputMessage | InputFunctionCall | InputFunctionCallOutput;
  
  // Type guards
  export function isInputMessage(item: InputItem): item is InputMessage {
    return 'role' in item && 'content' in item;
  }
  
  export function isInputFunctionCall(item: InputItem): item is InputFunctionCall {
    return 'type' in item && (item as InputFunctionCall).type === 'function_call';
  }
  
  export function isInputFunctionCallOutput(item: InputItem): item is InputFunctionCallOutput {
    return 'type' in item && (item as InputFunctionCallOutput).type === 'function_call_output';
  }

interface OpenAiResponsesRequest {
  input: InputItem[];
  model: string;
  max_output_tokens?: number;
  response_format?: 'text' | 'json_object' | 'json_schema';
  response_schema?: { name: string; strict?: boolean; schema: object };
  reasoning_effort?: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
  tools?: Tool[];
  tool_choice?: string;
}

class LLMService {

  async openAiResponses(request: OpenAiResponsesRequest) {
    try {
        // Check for API key
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }

        // Build text.format — for json_schema, include name/strict/schema in the format object
        const textFormat: any = { type: request.response_format ?? 'text' };
        if (request.response_format === 'json_schema' && request.response_schema) {
            textFormat.name = request.response_schema.name;
            textFormat.schema = request.response_schema.schema;
            if (request.response_schema.strict !== undefined) {
            textFormat.strict = request.response_schema.strict;
            }
        }

        const requestBody: any = {
            input: request.input,
            model: request.model,
            max_output_tokens: request.max_output_tokens ?? 1000,
            text: { format: textFormat }
        };

        const reasoningConfig = {
            effort: request.reasoning_effort ?? 'none',
            summary: 'detailed' // auto | detailed | concise
        };
        requestBody['reasoning'] = reasoningConfig;

        // Add tools if provided (OpenAI Responses API native format)
        if (request.tools && request.tools.length > 0) {
            requestBody['tools'] = request.tools;

            if (request.tool_choice) {
            const choice = request.tool_choice;
            if (['auto', 'none', 'required'].includes(choice)) {
                requestBody['tool_choice'] = choice;
            } else {
                // Specific tool name
                requestBody['tool_choice'] = { type: 'function', name: choice };
            }
            }
        }

        const endpoint = `https://api.openai.com/v1/responses`;

        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        };

        // console.log(`--- OPENAI REQUEST ---\n${JSON.stringify(requestBody, null, 2)}`);

        const response = await axios.post(endpoint, requestBody, { headers });
        // console.log(`--- OPENAI RESPONSE ---\n${JSON.stringify(response.data, null, 2)}`);
        return response.data;
    } catch (error) {
        console.error('Error in openAiResponses service:', error);
        throw error;
    }
  }
}

export default LLMService;
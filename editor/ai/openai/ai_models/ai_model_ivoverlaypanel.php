<?php
//quiz model using gpt-3.5 turbo
require_once(dirname(__FILE__) . "/../../../../config.php");
_load_language_file("/editor/ai_models/openai_model_ivoverlaypanel_ai.inc");

//generates questions
//$chat_url = "https://api.openai.com/v1/chat/completions";

$chat_url = "https://api.openai.com/v1/threads/runs";
$model = "gpt-3.5-turbo";
$assistantId = "asst_IyiBKzr8nvwddAzVKuh6OnlC";
$q = LEARNING_PROMPT_IVOVERLAYPANEL;
$object = LEARNING_RESULT_IVOVERLAYPANEL;

//$openAI_preset_models->type_list["quiz"] = ["payload" => ["model" => $model, "max_tokens" => 3096, "n" => 1, "temperature" => 0.2, "messages" => [["role" => "user", "content" => $q], ["role" => "assistant", "content" => $object], ["role" => "user", "content" => ""]]], "url" => $chat_url];
// Construct the payload for the request
$payload = [
    "assistant_id" => $assistantId, // Required: The ID of the assistant to use for the run

    // Optional: If you want to use a specific model other than the default, uncomment the following line and set the model ID
    // "model" => $model,

    "thread" => [
        "messages" => [
            ["role" => "user", "content" => LEARNING_PROMPT_IVOVERLAYPANEL],
            ["role" => "assistant", "content" => LEARNING_RESULT_IVOVERLAYPANEL],
            ["role" => "user", "content" => ""]
        ],
    ],

    // Optional: Uncomment and set instructions to override the assistant's default instructions
     "instructions" => "Follow the instructions in the last message from the user. Use the appropriate uploaded transcript as your source",

    // Optional: Uncomment and set additional instructions to append to the existing instructions without overriding them
     "additional_instructions" => "When following XML examples, make sure you follow it exactly. This includes formatting, special characters, node structure and everything else. Do not deviate from the example AND how it is presented other than the content and the amount of each type of node and the contents therein. Notably, do NOT use markdown syntax when formatting your answer! Only return plain text.",

    // Optional: Uncomment and add additional messages to the thread before creating the run
    // "additional_messages" => [
    //     ["role" => "user", "content" => "Additional message content"]
    // ],

    // Optional: Uncomment and attach metadata to this run, using key-value pairs
    // "metadata" => [
    //     "key1" => "value1",
    //     "key2" => "value2"
    // ],

    // Optional: Uncomment and override the tools available for this run
     "tools" => [
    //     ["type" => "code_interpreter"],
         ["type" => "file_search"]
     ],

    // Optional: Uncomment and set temperature to control the randomness of the output (between 0 and 2)
    // "temperature" => 0.7,

    // Optional: Uncomment and set top_p for nucleus sampling (considers top_p probability mass)
    // "top_p" => 0.9,

    // Optional: Uncomment to enable streaming of events during the run
    // "stream" => true,

    // Optional: Uncomment and set to limit the maximum number of prompt tokens
    // "max_prompt_tokens" => 500,

    // Optional: Uncomment and set to limit the maximum number of completion tokens
    // "max_completion_tokens" => 500,

    // Optional: Uncomment and set truncation strategy to control initial context window of the run
    // "truncation_strategy" => [
    //     "type" => "last_messages",
    //     "last_messages" => 5
    // ],

    // Optional: Uncomment and set tool_choice to control which tool (if any) is called by the model
     "tool_choice" => "required",

    // Optional: Uncomment and set response_format to specify the format that the model must output
    // "response_format" => ["type" => "json_object"],

    // Optional: Uncomment to enable parallel function calling during tool use
    // "parallel_tool_calls" => true,
];

$openAI_preset_models->type_list["ivOverlayPanel"] = ["payload" => ["model" => $model, "max_tokens" => 4096, "n" => 1, "temperature" => 0.2, "messages" => [["role" => "user", "content" => $q], ["role" => "assistant", "content" => $object], ["role" => "user", "content" => ""]]], "url" => $chat_url];

$openAI_preset_models->type_list["ivOverlayPanel"]["payload"] = $payload;

$openAI_preset_models->prompt_list["ivOverlayPanel"] = explode(",", DEFAULT_PROMPT_IVOVERLAYPANEL);

$openAI_preset_models->multi_run[] = "ivOverlayPanel";
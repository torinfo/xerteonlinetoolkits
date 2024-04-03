<?php
//quiz model using gpt-3.5 turbo
require_once(dirname(__FILE__) . "/../../../../config.php");
_load_language_file("/editor/ai_models/openai_model_quiz_ai.inc");

//generates questions
//$chat_url = "https://api.openai.com/v1/chat/completions";

$chat_url = "https://api.openai.com/v1/threads/runs";
$model = "gpt-3.5-turbo";
$assistantId = "asst_IyiBKzr8nvwddAzVKuh6OnlC";
$q = LEARNING_PROMPT_QUIZ;
$object = LEARNING_RESULT_QUIZ;

//$openAI_preset_models->type_list["quiz"] = ["payload" => ["model" => $model, "max_tokens" => 3096, "n" => 1, "temperature" => 0.2, "messages" => [["role" => "user", "content" => $q], ["role" => "assistant", "content" => $object], ["role" => "user", "content" => ""]]], "url" => $chat_url];
// Construct the payload for the request
$payload = [
    "assistant_id" => $assistantId,
    // Optional: remove if you wish to use the assistant's default model as defined on assistant creation
    // "model" => $model,
    "thread" => [
        "messages" => [
            ["role" => "user", "content" => LEARNING_PROMPT_QUIZ],
            ["role" => "user", "content" => LEARNING_RESULT_QUIZ], //The assistant endpoint doesn't support anyone other than 'user' as the author of the message. As a workaround, ensure that 'Assistant:' is appended to the learning result itself.
            ["role" => "user", "content" => ""]
        ],
    ],
    // Optional: include if overriding the default instructions
    "instructions" => "Use the information in the provided file, if there is one. Otherwise, supplement with your own. Follow the example xml structure as exactly as possible. Do not respond with any additional text other than the xml.",
    // Optional: include if modifying the tools available for this run
    /*"tools" => [
        // Define tools and their configurations here
    ],*/
    // Optional: include if you need to attach metadata to this run, use key-value pairs
    /*"metadata" => [
        // Add up to 16 key-value pairs
    ]*/
];

$openAI_preset_models->type_list["quiz"] = ["payload" => ["model" => $model, "max_tokens" => 3096, "n" => 1, "temperature" => 0.2, "messages" => [["role" => "user", "content" => $q], ["role" => "assistant", "content" => $object], ["role" => "user", "content" => ""]]], "url" => $chat_url];

$openAI_preset_models->type_list["quiz"]["payload"] = $payload;

$openAI_preset_models->prompt_list["quiz"] = explode(",", DEFAULT_PROMPT_QUIZ);

$openAI_preset_models->multi_run[] = "quiz";
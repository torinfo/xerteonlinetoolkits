<?php
//quiz model using gpt-3.5 turbo
require_once(dirname(__FILE__) . "/../../../../config.php");
_load_language_file("/editor/ai_models/openai_model_flashcards_ai.inc");

//generates questions
$chat_url = "https://api.openai.com/v1/chat/completions";
$model = "gpt-4";
$q = LEARNING_PROMPT_FLASHCARDS;
$object = LEARNING_RESULT_FLASHCARDS;

$openAI_preset_models->type_list["flashCards"] = ["payload" => ["model" => $model, "max_tokens" => 3096, "n" => 1, "temperature" => 0.2, "messages" => [["role" => "user", "content" => $q], ["role" => "assistant", "content" => $object], ["role" => "user", "content" => ""]]], "url" => $chat_url];

$openAI_preset_models->prompt_list["flashCards"] = explode(",", DEFAULT_PROMPT_FLASHCARDS);

$openAI_preset_models->multi_run[] = "flashCards";
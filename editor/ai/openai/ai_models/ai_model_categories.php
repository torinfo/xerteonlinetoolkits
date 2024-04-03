<?php
//quiz model using gpt-3.5 turbo
require_once(dirname(__FILE__) . "/../../../../config.php");
_load_language_file("/editor/ai_models/openai_model_categories_ai.inc");

//generates questions
$chat_url = "https://api.openai.com/v1/chat/completions";
$model = "gpt-3.5-turbo";
$q = LEARNING_PROMPT_CATEGORIES;
$object = LEARNING_RESULT_CATEGORIES;

$openAI_preset_models->type_list["categories"] = ["payload" => ["model" => $model, "max_tokens" => 3096, "n" => 1, "temperature" => 0.2, "messages" => [["role" => "user", "content" => $q], ["role" => "assistant", "content" => $object], ["role" => "user", "content" => ""]]], "url" => $chat_url];

$openAI_preset_models->prompt_list["categories"] = explode(",", DEFAULT_PROMPT_CATEGORIES);

$openAI_preset_models->multi_run[] = "categories";
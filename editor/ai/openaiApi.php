<?php
//openai api master class
//file name must be $api . Api.php for example openaiApi.php when adding new api
//class name AiApi mandatory when adding new api
class openaiApi
{
    //constructor must be like this when adding new api
    function __construct(string $api) {
        $dir = __DIR__;
        $dir = str_replace('\\', '/', $dir);
        require_once ($dir. "/" . $api ."/load_preset_models.php");
        $this->preset_models = $openAI_preset_models;
        require_once ($dir . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
    }
    //check if answer conforms to model
    private function clean_gpt_result($answer)
    {
        //TODO idea: if not correct drop until last closed xml and close rest manually?

        //TODO ensure answer contains no html and xml has no data fields aka remove spaces
        //IMPORTANT GPT really wants to add \n into answers
        $tmp = str_replace('\n', "", $answer);
        $tmp = preg_replace('/\s+/', ' ', $tmp);
        $tmp = str_replace('> <', "><", $tmp);
        return $tmp;
    }

    //general class for interactions with the openai API
    //this should only be called if the user passed all checks

   private function POST_OpenAi($prompt, $settings)
    {

        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;

        //add user supplied prompt to payload
        $settings["payload"]["messages"][max(sizeof($settings["payload"]["messages"]) - 1, 0)]["content"] = $prompt;
        $payload = json_encode($settings["payload"]);

        //start api interaction
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $settings["url"]);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json"]);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);

        $result = curl_exec($curl);

        curl_close($curl);


        $resultConform = $this->clean_gpt_result($result);
        $resultConform = json_decode($resultConform);

        if ($resultConform->error) {
            return (object)["status" => "error", "message" => "error on api call with type:" . $result->error->type];
        }
        //if (!$this->conform_to_model($resultConform)){
        //    return (object) ["status" => "error", "message" => "answer does not match model"];
        //}
        return $resultConform;
    }

    private function POST_OpenAi_Assistant($prompt, $settings)
    {
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;

        //add user supplied prompt to payload
        $settings["payload"]["thread"]["messages"][max(sizeof($settings["payload"]["thread"]["messages"])-1, 0)]["content"] = $prompt;
        $payload = json_encode($settings["payload"]);

        //start api interaction
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $settings["url"]);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", "OpenAI-Beta: assistants=v1"]);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);

        $result = curl_exec($curl);
        curl_close($curl);

        $resultArray = json_decode($result, true); // Decode to array for easier handling
        if (isset($resultArray['id']) && isset($resultArray['thread_id'])) {
            $runId = $resultArray['id'];
            $threadId = $resultArray['thread_id'];
            $startTime = time();
            do {
                sleep(5); // Wait for 5 seconds before checking status
                $status = $this->GET_OpenAi_Run_Status($runId, $threadId);
                if (in_array($status, ['completed', 'failed', 'cancelled'])) {
                    break; // Exit loop if terminal status is reached
                }
            } while (time() - $startTime < 60); // Continue if less than 30 seconds have passed
            // Optionally handle timeout scenario here
        }

        if (in_array($status, ['completed'])) {
            // If run is completed, retrieve the last message
            $lastMessageContent = $this->GET_last_message_from_thread($threadId);
        }

        $resultConform = $this->clean_gpt_result($lastMessageContent);
        $resultConform = json_decode($resultConform);

        $thread = $this->deleteThread($threadId);

        if ($resultConform->error) {
            return (object) ["status" => "error", "message" => "error on api call with type:" . $result->error->type];
        }
        //if (!$this->conform_to_model($resultConform)){
        //    return (object) ["status" => "error", "message" => "answer does not match model"];
        //}
        return $resultConform;
    }

    private function GET_OpenAi_Run_Status($runId, $threadId){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $url = "https://api.openai.com/v1/threads/$threadId/runs/$runId";
        //start api interaction

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", "OpenAI-Beta: assistants=v1"]);

        $result = curl_exec($curl);
        curl_close($curl);

        $resultConform = $this->clean_gpt_result($result);
        $resultConform = json_decode($resultConform);

        $status = $resultConform->status;

        return $status;
    }

    private function GET_last_message_from_thread($threadId) {
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $url = "https://api.openai.com/v1/threads/$threadId/messages";

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [$authorization, "Content-Type: application/json", "OpenAI-Beta: assistants=v1"]);

        $result = curl_exec($curl);
        curl_close($curl);

        if (!$result) {
            return (object) ["status" => "error", "message" => "Failed to fetch messages"];
        }

        $messages = json_decode($result, true);
        if (isset($messages['data']) && count($messages['data']) > 0) {
            $lastMessage = $messages['data'][0]['content'][0]['text']['value'];
            $formattedResult = [
                "id" => "filler", // or a relevant ID
                "object" => "chat.completion",
                "created" => time(),
                "model" => "filler-model",
                "choices" => [
                    [
                        "index" => 0,
                        "message" => [
                            "role" => "assistant",
                            "content" => $lastMessage // Use the last message directly here
                        ],
                        "logprobs" => null,
                        "finish_reason" => "filler-reason"
                    ]
                ],
                "usage" => [
                    "prompt_tokens" => 1,
                    "completion_tokens" => 1,
                    "total_tokens" => 1
                ],
                "system_fingerprint" => null
            ];
        }else {
            return "error: no message found"; // Return error message if no data is found
        }
        $formattedResult = json_encode($formattedResult);
        return $formattedResult;
    }

    //generates prompt for openai from preset prompts and user input
    //todo rework to use wildcards
    private function generatePrompt($p, $type): string
    {
        $prompt = '';
        foreach ($this->preset_models->prompt_list[$type] as $prompt_part){
            if ($p[$prompt_part] == null){
                $prompt = $prompt . $prompt_part;
            } else {
                $prompt = $prompt . $p[$prompt_part];
            }
        }
        return $prompt;
    }

    private function fileUpload($filePath){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        //$filePath = 'C:\xampp\htdocs\xot\USER-FILES\15-guest2-Nottingham\media\test.txt';
        $basePath = __DIR__ . '/../../'; // Moves up from ai -> editor -> xot

        // Normalize the directory separators to the current operating system's preference
        $normalizedBasePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $basePath);

        // Append the $filePath to the normalized base path
        $finalPath = $normalizedBasePath . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $filePath);
        $finalPath = realpath($finalPath);

        $fileName = basename($finalPath);

        if (!file_exists($finalPath)) {
            echo "File does not exist: $filePath";
            return;
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/files');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            $authorization,
            'Content-Type: multipart/form-data',
            "OpenAI-Beta: assistants=v1"
        ]);

        // Define the POST fields, including the file in 'file' parameter
        // Use CURLFile for the file content, which effectively sends the file as a file object
        $curlFile = new CURLFile($finalPath, 'text/plain', $fileName);
        $postFields = ['file' => $curlFile, 'purpose' => 'assistants'];
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response !== false) {
            // Decode the JSON response into a PHP array
            $decodedResponse = json_decode($response, true);
            return $decodedResponse['id'];
        } else {
            // If cURL encountered an error
            echo "cURL Error: " . curl_error($ch);
        }

    }

    private function attachFile ($fileId, $assistantId){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $url ="https://api.openai.com/v1/assistants/$assistantId/files";

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            $authorization,
            "Content-Type: application/json",
            "OpenAI-Beta: assistants=v1"
        ]);
        curl_setopt($curl, CURLOPT_POST, true);
        $postData = json_encode(['file_id' => $fileId]);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);
        $result = curl_exec($curl);
        if (curl_errno($curl)) {
            echo 'Error:' . curl_error($curl);
        }
        curl_close($curl);
        return $result;

    }
    // Delete a file from the specified assistant.
    private function detatchFile ($fileId, $assistantId){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $url ="https://api.openai.com/v1/assistants/$assistantId/files/$fileId";

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            $authorization,
            "Content-Type: application/json",
            "OpenAI-Beta: assistants=v1"
        ]);

        // Specify that this is a DELETE request
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");

        $result = curl_exec($curl);
        if (curl_errno($curl)) {
            echo 'Error:' . curl_error($curl);
        }
        curl_close($curl);
        return $result;

    }
    //Delete a file from the openAI storage in general. Note that this method doesn't remove the file from the assistant by default.
    private function deleteFile ($fileId){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $url = "https://api.openai.com/v1/files/$fileId";
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            $authorization,
            "Content-Type: application/json",
        ]);

        // Specify that this is a DELETE request
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");

        $result = curl_exec($curl);
        if (curl_errno($curl)) {
            echo 'Error:' . curl_error($curl);
        }
        curl_close($curl);
        return $result;

    }

    private function deleteThread($threadId){
        $authorization = "Authorization: Bearer " . $this->xerte_toolkits_site->openAI_key;
        $url = "https://api.openai.com/v1/threads/$threadId";
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            $authorization,
            "Content-Type: application/json",
            "OpenAI-Beta: assistants=v1"
        ]);

        // Specify that this is a DELETE request
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");

        $result = curl_exec($curl);
        if (curl_errno($curl)) {
            echo 'Error:' . curl_error($curl);
        }
        curl_close($curl);
        return $result;
    }

    //public function must be ai_request($p, $type) when adding new api
    //todo maybe change this to top level object and extend with api functions?
    public function ai_request($p, $type, $uploadUrl)
    {
        if (is_null($this->preset_models->type_list[$type]) or $type == "") {
            return (object) ["status" => "error", "message" => "there is no match in type_list for " . $type];
        }
        //todo check for corresponding key to api
        if ($this->xerte_toolkits_site->openAI_key == "") {
            return (object) ["status" => "error", "message" => "there is no corresponding API key"];
        }

        $prompt = $this->generatePrompt($p, $type);

        $results = array();

        $block_size = 6;
        /*if (in_array($type, $this->preset_models->multi_run) and isset($p['nrq']) and $p['nrq'] > $block_size){

            $nrq_remaining = $p['nrq'];

            while ($nrq_remaining > $block_size) {
                $prompt = preg_replace('/'.$p['nrq'].'/', strval($block_size), $prompt, 1);

                $results[] = $this->POST_OpenAi($prompt, $this->preset_models->type_list[$type]);
                $tempxml = simplexml_load_string(end($results)->choices[0]->message->content);
                foreach ($tempxml->children() as $child){
                    $prompt = $prompt . $child->attributes()->prompt . " ; ";
                }

                $nrq_remaining = $nrq_remaining - $block_size;
            }
            $prompt = preg_replace('/'.strval($block_size).'/', strval($nrq_remaining), $prompt, 1);
        }*/
        if (isset($this->preset_models->type_list[$type]['payload']['assistant_id'])) {
            // assistant_id exists, meaning we're dealing with an assistant request which can but doesn't have to include a file upload
            if($uploadUrl!=null){
                $fileId = "";
                $fileId = $this->fileUpload($uploadUrl);
                if ($fileId!=""){
                    $this->attachFile($fileId, $this->preset_models->type_list[$type]['payload']['assistant_id']);
                }
            }
            $results[] = $this->POST_OpenAi_Assistant($prompt, $this->preset_models->type_list[$type]);
            if ($fileId!=""){
                $detactch = $this->detatchFile($fileId, $this->preset_models->type_list[$type]['payload']['assistant_id']);
                $delete = $this->deleteFile($fileId);
            }
        }
        else {
            $results[] = $this->POST_OpenAi($prompt, $this->preset_models->type_list[$type]);
        }

        $answer = "";
        $total_tokens_used = 0;
        //if status is set something went wrong
        foreach ($results as $result) {
            if ($result->status) {
                return $result;
            }
            $total_tokens_used += $result->usage->total_tokens;
            $answer = $answer . $result->choices[0]->message->content;
        }
        #move to frontend or change it here -> this is for things that generate children, need options for 1) not generating and 2) for both top level + generating
        $answer = str_replace(["<". $type .">", "</". $type .">"], "", $answer);

        //todo change if lop level is changed
        return "<". $type ." >" . $answer. "</". $type .">";
        return $answer;
    }

}

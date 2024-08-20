<?php
//openai api master class
//file name must be $api . Api.php for example openaiApi.php when adding new api
//class name AiApi mandatory when adding new api
class dalle3Api
{
    function __construct() {
        require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");
        $this->xerte_toolkits_site = $xerte_toolkits_site;
    }

    // Function to rewrite the prompt for DALL·E
    private function rewritePrompt($query)
    {
        // The system message to instruct the AI how to rewrite the prompt
        // The system message to instruct the AI how to rewrite the prompt
        $systemMessage = "You are an AI assistant helping to craft detailed prompts for generating photorealistic images with DALL·E. If the user's input is detailed, enhance the details and clarify where necessary. If the input is vague, add appropriate details to ensure the final prompt includes specifics like lighting, camera angle, composition, and any assumed elements. The output should resemble the following example in style and comprehensiveness:

    \"Craft a photorealistic image showcasing a cocktail with a delicate blend of light pink and a subtle hint of brown hues. The cocktail, effervescent with carbonation, is served in an elegant, tall Collins-style glass. Within the glass, a single, large, and tall cylinder-shaped ice cube stands prominently, its clarity and shape adding to the drink’s allure. On top of this ice cube rests a single square piece of dried kelp, positioned horizontally, serving as the sole garnish in a display of minimalistic elegance. There are no straws or additional garnishes.

    The scene is captured from a slightly elevated angle, zoomed out to include the full reflection of the cocktail on a flat, immaculate black glossy surface that mirrors the scene above with perfect clarity. This setup is against a softly blurred white wall background. The surface hosts a small arrangement reminiscent of a Japanese garden, featuring dark beach pebbles and a scattering of fine sand.

    Lighting is arranged from the left side and slightly behind, casting gentle highlights and shadows that reveal the cocktail’s textured surface, the intricate condensation on the glass, and the delicate bubbles within the liquid. The image quality and composition are intended to emulate the depth and clarity of a portrait mode photograph taken with a Canon EOS 1.\"

    Now, given the following input, craft a similarly detailed prompt, making sure that this text (I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS:) is at the very top of the prompt!:";


        // The full prompt to be sent to the API
        $apiInput = [
            "model" => "gpt-4o-mini",
            "messages" => [
                ["role" => "system", "content" => $systemMessage],
                ["role" => "user", "content" => $query]
            ],
            "max_tokens" => 500,
            "temperature" => 0.9
        ];

        // Convert the input to JSON
        $data = json_encode($apiInput);

        // Initialize cURL
        $curl = curl_init();

        // Set cURL options
        curl_setopt($curl, CURLOPT_URL, "https://api.openai.com/v1/chat/completions");
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$this->xerte_toolkits_site->openAI_key}",
            "Content-Type: application/json"
        ]);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);

        // Execute cURL request and capture response
        $result = curl_exec($curl);

        // Check for cURL errors
        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            curl_close($curl);
            return (object)["status" => "error", "message" => "cURL error: " . $error_msg];
        }

        // Close the cURL session
        curl_close($curl);

        // Decode the JSON response
        $resultDecoded = json_decode($result);

        // Check if there's an error in the API response
        if (isset($resultDecoded->error)) {
            return (object)["status" => "error", "message" => "Error on API call: " . $resultDecoded->error->message];
        }

        // Extract the rewritten prompt from the API response
        $rewrittenPrompt = $resultDecoded->choices[0]->message->content;

        return trim($rewrittenPrompt);
    }

    // Function to make a request to the DALL·E image generation API
    private function generateImage($prompt, $size = "1024x1024", $model = "dall-e-3"){

        strip_tags($prompt);

        $apiInput = [
            "prompt" => $prompt,
            "model" => $model,  // Model to use
            "size" => $size  // Specify the image size
        ];

        // Convert the input to JSON
        $data = json_encode($apiInput);

        // Initialize cURL
        $curl = curl_init();

        // Set cURL options
        curl_setopt($curl, CURLOPT_URL, "https://api.openai.com/v1/images/generations");
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$this->xerte_toolkits_site->openAI_key}",
            "Content-Type: application/json"
        ]);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);

        // Execute cURL request and capture response
        $result = curl_exec($curl);

        // Check for cURL errors
        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            curl_close($curl);
            return (object)["status" => "error", "message" => "cURL error: " . $error_msg];
        }

        // Close the cURL session
        curl_close($curl);

        // Decode the JSON response
        $resultDecoded = json_decode($result);

        // Check for API errors
        if (isset($resultDecoded->error)) {
            return (object)["status" => "error", "message" => "Error on API call: " . $resultDecoded->error];
        }

        // Initialize an array to hold the image URLs
        $imageUrls = [];

        // Loop through the generated images and add their URLs to the array
        foreach ($resultDecoded->data as $imageData) {
            $imageUrls[] = $imageData->url;
        }

        // Return the array of image URLs
        return (object)["status" => "success", "urls" => $imageUrls];
    }

    // Function to download the generated image
    private function downloadImage($imageUrl, $saveTo)
    {
        // Initialize cURL
        $curl = curl_init($imageUrl);

        // Set cURL options
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true); // Follow redirects, if any
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // Skip SSL verification (if needed)
        curl_setopt($curl, CURLOPT_TIMEOUT, 120); // Set a timeout for the request

        // Execute the cURL request and get the image data
        $imageData = curl_exec($curl);

        // Check for cURL errors
        if (curl_errno($curl)) {
            $error_msg = curl_error($curl);
            curl_close($curl);
            return (object)["status" => "error", "message" => "cURL error: " . $error_msg];
        }

        // Get the HTTP status code
        $http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        // Check if the request was successful
        if ($http_status != 200) {
            return (object)["status" => "error", "message" => "Failed to download image. HTTP status code: " . $http_status];
        }

        // Save the image to the specified path
        $savePath = $saveTo . '/' . basename(parse_url($imageUrl, PHP_URL_PATH));

        // Write the image data to a file
        if (file_put_contents($savePath, $imageData) === false) {
            return (object)["status" => "error", "message" => "Failed to save image."];
        }

        return (object)["status" => "success", "message" => "Image downloaded successfully.", "path" => $savePath];
    }

    // Public function to handle the entire process
    public function sh_request($query, $target, $interpretPrompt, $overrideSettings, $settings, $size = "1024x1024")
    {
        // Initialize the results array to store downloaded file paths
        $downloadedPaths = [];


        if (($interpretPrompt === "true")||($interpretPrompt === true)){
            $aiQuery = $this->rewritePrompt($query);
        } else {
            $aiQuery = $query;
        }

        // Generate the images using DALL·E API
        $imageResponse = $this->generateImage($aiQuery, $size);

        // If there's an error, return it with an empty array for the paths
        if ($imageResponse->status === "error") {
            return (object)[
                "status" => "error",
                "message" => $imageResponse->message,
                "paths" => $downloadedPaths
            ];
        }

        // Get the current date and time for folder naming
        $dateTime = date('d-m-Y_Hi');

        // Specify the directory to save images, including date and time
        $path = $target . "/media/dalle3/" . $dateTime;

        // Ensure the directory exists and is writable
        if (!is_dir($path)) {
            mkdir($path, 0777, true); // Create the directory if it doesn't exist
        }

        // Loop through the generated image URLs and download each one
        foreach ($imageResponse->urls as $url) {
            $downloadResult = $this->downloadImage($url, $path);

            // If the download was successful, add the image path to the results array
            if ($downloadResult->status === "success") {
                $downloadedPaths[] = $downloadResult->path;
            } else {
                // If a download fails, return the error status with downloaded paths so far
                return (object)[
                    "status" => "error",
                    "message" => $downloadResult->message,
                    "paths" => $downloadedPaths
                ];
            }
        }

        // Return a success status with the array of downloaded paths
        return (object)[
            "status" => "success",
            "message" => "Images downloaded successfully.",
            "paths" => $downloadedPaths
        ];
    }
}

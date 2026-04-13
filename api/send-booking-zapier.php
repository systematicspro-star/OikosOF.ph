<?php
// Set error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Handle CORS headers immediately
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Expected POST, got ' . $_SERVER['REQUEST_METHOD']
    ]);
    exit();
}

// Get JSON data from request
$input = file_get_contents('php://input');

if (empty($input)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'No data received'
    ]);
    exit();
}

$data = json_decode($input, true);

// Validate JSON parsing
if ($data === null) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON format'
    ]);
    exit();
}

// Zapier webhook URL
$webhookURL = 'https://hooks.zapier.com/hooks/catch/26009613/ue0bg0z/';

// Prepare the payload for Zapier
$payload = json_encode($data);

if ($payload === false) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to encode data for sending'
    ]);
    exit();
}

// Check if cURL is available
if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'cURL is not available on this server'
    ]);
    exit();
}

// Initialize cURL
$ch = curl_init($webhookURL);

if ($ch === false) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to initialize cURL'
    ]);
    exit();
}

// Set cURL options
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($payload)
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
$errno = curl_errno($ch);

curl_close($ch);

// Check for cURL errors
if ($error) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send booking: ' . $error,
        'error_code' => $errno
    ]);
    exit();
}

// Check HTTP response code from Zapier
if ($httpCode >= 200 && $httpCode < 300) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Booking submitted successfully!',
        'code' => $httpCode
    ]);
} else {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => 'Zapier returned error code: ' . $httpCode,
        'response' => substr($response, 0, 500)
    ]);
}
exit();
?>

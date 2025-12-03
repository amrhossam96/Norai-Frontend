export const intentionSnippets = {
  cURL: `curl --location "https://api.example.com/v1/intention/"
--header "Authorization: Token xxxxx"
--header "Content-Type: application/json"
--data-raw '{
  "amount": 2000,
  "currency": "EGP",
  "payment_methods": [
    158
  ],
  "items": [
    {
      "name": "Item name",
      "amount": 2000,
      "description": "Item description",
      "quantity": 1
    }
  ],
  "billing_data": {
    "apartment": "dummy",
  }
}'`,
  Ruby: `require 'uri'
require 'net/http'
require 'json'

uri = URI('https://api.example.com/v1/intention/')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request['Authorization'] = 'Token xxxxx'
request['Content-Type'] = 'application/json'
request.body = {
  amount: 2000,
  currency: 'EGP',
  payment_methods: [158],
  items: [
    {
      name: 'Item name',
      amount: 2000,
      description: 'Item description',
      quantity: 1
    }
  ],
  billing_data: {
    apartment: 'dummy'
  }
}.to_json

response = http.request(request)
puts response.body`,
  Python: `import requests
import json

url = "https://api.example.com/v1/intention/"
headers = {
    "Authorization": "Token xxxxx",
    "Content-Type": "application/json"
}
payload = {
    "amount": 2000,
    "currency": "EGP",
    "payment_methods": [158],
    "items": [
        {
            "name": "Item name",
            "amount": 2000,
            "description": "Item description",
            "quantity": 1
        }
    ],
    "billing_data": {
        "apartment": "dummy"
    }
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`,
  PHP: `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.example.com/v1/intention/",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_HTTPHEADER => [
    "Authorization: Token xxxxx",
    "Content-Type: application/json"
  ],
  CURLOPT_POSTFIELDS => json_encode([
    "amount" => 2000,
    "currency" => "EGP",
    "payment_methods" => [158],
    "items" => [
      [
        "name" => "Item name",
        "amount" => 2000,
        "description" => "Item description",
        "quantity" => 1
      ]
    ],
    "billing_data" => [
      "apartment" => "dummy"
    ]
  ])
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`,
  Java: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class Main {
    public static void main(String[] args) {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.example.com/v1/intention/"))
            .header("Authorization", "Token xxxxx")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(
                "{" +
                "  \\"amount\\": 2000," +
                "  \\"currency\\": \\"EGP\\"," +
                "  \\"payment_methods\\": [158]," +
                "  \\"items\\": [" +
                "    {" +
                "      \\"name\\": \\"Item name\\"," +
                "      \\"amount\\": 2000," +
                "      \\"description\\": \\"Item description\\"," +
                "      \\"quantity\\": 1" +
                "    }" +
                "  ]," +
                "  \\"billing_data\\": {" +
                "    \\"apartment\\": \\"dummy\\"" +
                "  }" +
                "}"
            ))
            .build();
        
        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
            .thenApply(HttpResponse::body)
            .thenAccept(System.out::println)
            .join();
    }
}`,
  "Node.js": `const fetch = require('node-fetch');

const url = 'https://api.example.com/v1/intention/';
const options = {
  method: 'POST',
  headers: {
    'Authorization': 'Token xxxxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 2000,
    currency: 'EGP',
    payment_methods: [158],
    items: [
      {
        name: 'Item name',
        amount: 2000,
        description: 'Item description',
        quantity: 1
      }
    ],
    billing_data: {
      apartment: 'dummy'
    }
  })
};

fetch(url, options)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
  Go: `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	url := "https://api.example.com/v1/intention/"
	
	// Create the request body
	requestBody, _ := json.Marshal(map[string]interface{}{
		"amount":         2000,
		"currency":       "EGP",
		"payment_methods": []int{158},
		"items": []map[string]interface{}{
			{
				"name":        "Item name",
				"amount":      2000,
				"description": "Item description",
				"quantity":    1,
			},
		},
		"billing_data": map[string]string{
			"apartment": "dummy",
		},
	})
	
	// Create the request
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(requestBody))
	req.Header.Set("Authorization", "Token xxxxx")
	req.Header.Set("Content-Type", "application/json")
	
	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	
	// Read the response
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	fmt.Println(result)
}`,
}

// Add more snippet collections for other endpoints as needed


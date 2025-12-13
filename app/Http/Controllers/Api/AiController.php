<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Question;

class AiController extends Controller
{
    /**
     * Generate an AI explanation for a question.
     */
    public function explain(Request $request)
    {
        $request->validate([
            'question_id' => 'required|exists:questions,id',
        ]);

        $question = Question::findOrFail($request->question_id);
        
        $user = $request->user();
        
        $apiKey = $user->gemini_api_key;
        
        if ($apiKey) {
            // User provided key - Unlimited usage (or subject to Google's quotas on their key)
        } else {
             // Free tier check
             if ($user->ai_usage_count >= 5) {
                 return response()->json([
                     'error' => 'Limit Reached',
                     'message' => 'You have reached the limit of 5 free AI explanations. Please add your own Gemini API Key in your Profile to continue.'
                 ], 403);
             }

             // Use system key
             $apiKey = env('GEMINI_API_KEY');
             if (!$apiKey) {
                return response()->json([
                    'error' => 'AI service not configured.',
                    'message' => 'System AI Key missing and no user key provided.'
                ], 503);
             }

             // Increment usage
             $user->increment('ai_usage_count');
        }

        // Prepare prompt
        $optionsArray = $question->options ?? [];
        $optionsText = "";
        
        foreach ($optionsArray as $opt) {
            $isCorrect = ($opt === $question->correct_option) ? " (Correct)" : "";
            $optionsText .= "- {$opt}{$isCorrect}\n";
        }

        $prompt = "You are an expert tutor. Explain this multiple-choice question clearly and concisely. \n\n" .
                  "Question: {$question->question_text}\n" .
                  "Options:\n{$optionsText}\n\n" .
                  "Explain why the correct answer is right and why others might be wrong. Keep it under 150 words.";

        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={$apiKey}", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $explanation = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Could not generate explanation.';
                
                return response()->json(['explanation' => $explanation]);
            } else {
                \Illuminate\Support\Facades\Log::error('AI Service Error: ' . $response->body());
                return response()->json(['error' => 'AI service error', 'details' => $response->body()], 500);
            }

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('AI Explanation Exception: ' . $e->getMessage());
             return response()->json(['error' => 'Failed to connect to AI service: ' . $e->getMessage()], 500);
        }
    }
}

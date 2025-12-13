<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class StudentController extends Controller
{
    /**
     * Get user profile.
     */
    public function getProfile(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update user profile including Gemini API Key.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'gemini_api_key' => 'nullable|string|max:255', // Add validation for API key
        ]);

        if ($request->has('name')) {
            $user->name = $validated['name'];
        }

        if ($request->has('gemini_api_key')) {
            $user->gemini_api_key = $validated['gemini_api_key'];
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Get user subscriptions (Placeholder/Stub based on routes)
     */
    public function getSubscriptions(Request $request) {
         return response()->json([]);
    }
}

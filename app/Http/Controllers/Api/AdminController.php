<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

use App\Models\Subject; // Added import

class AdminController extends Controller
{
    /**
     * Get all subjects with quiz counts
     */
    public function getSubjects()
    {
        $subjects = Subject::withCount('quizzes')
            ->orderBy('name')
            ->get();

        return response()->json($subjects);
    }

    /**
     * Get all quizzes for admin management
     */
    public function getQuizzes()
    {
        $quizzes = Quiz::with(['questions', 'subject']) // Added subject relation
            ->withCount('questions')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($quizzes);
    }

    /**
     * Create a new quiz
     */
    public function createQuiz(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'subject_id' => 'required|exists:subjects,id', // Changed from category
            'difficulty_level' => 'nullable|in:easy,medium,hard',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $quiz = Quiz::create([
            ...$request->all(),
            'created_by' => $request->user()->id,
        ]);

        return response()->json($quiz, 201);
    }

    /**
     * Update an existing quiz
     */
    public function updateQuiz(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'subject_id' => 'sometimes|required|exists:subjects,id', // Changed from category
            'difficulty_level' => 'nullable|in:easy,medium,hard',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $quiz->update($request->all());

        return response()->json($quiz);
    }

    /**
     * Delete a quiz
     */
    public function deleteQuiz($id)
    {
        $quiz = Quiz::findOrFail($id);
        $quiz->delete();

        return response()->json(['message' => 'Quiz deleted successfully']);
    }

    /**
     * Bulk import quizzes from JSON
     */
    public function bulkImport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quizzes' => 'required|array',
            'quizzes.*.title' => 'required|string',
            'quizzes.*.subject' => 'nullable|string', // Match schema concept
            'quizzes.*.category' => 'nullable|string', // Backward compat
            'quizzes.*.questions' => 'required|array|min:1',
            'quizzes.*.questions.*.question_text' => 'required|string',
            'quizzes.*.questions.*.options' => 'required|array|min:2',
            // Options validation is complex due to dual support, doing basic array check here
            'quizzes.*.questions.*.correct_option' => 'nullable|string', // Required if options are strings
            'quizzes.*.questions.*.difficulty_level' => 'nullable|in:easy,medium,hard',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            $importedCount = 0;

            foreach ($request->quizzes as $quizData) {
                // Determine subject name (support subject or category key)
                $subjectName = $quizData['subject'] ?? $quizData['category'] ?? 'General';
                $slug = \Illuminate\Support\Str::slug($subjectName);
                
                $subject = Subject::firstOrCreate(
                    ['slug' => $slug],
                    ['name' => $subjectName]
                );

                // Calculate duration if not provided (default 30s per question)
                $questionCount = count($quizData['questions']);
                $calculatedDuration = ceil($questionCount * 0.5);
                $duration = $quizData['duration_minutes'] ?? ($calculatedDuration > 0 ? $calculatedDuration : 30);

                // Create quiz
                $quiz = Quiz::create([
                    'title' => $quizData['title'],
                    'description' => $quizData['description'] ?? null,
                    'duration_minutes' => $duration,
                    'passing_score' => $quizData['passing_score'] ?? 60,
                    'subject_id' => $subject->id,
                    'difficulty_level' => $quizData['difficulty_level'] ?? 'medium',
                    'is_active' => $quizData['is_active'] ?? true,
                    'created_by' => $request->user()->id,
                ]);

                // Create questions
                foreach ($quizData['questions'] as $index => $questionData) {
                    
                    $optionsInput = $questionData['options'];
                    $optionsList = [];
                    $correctOption = $questionData['correct_option'] ?? null;

                    // Determine format: Object array or String array
                    $firstOpt = $optionsInput[0];

                    if (is_array($firstOpt) || is_object($firstOpt)) {
                        // Handle [{option_text: "...", is_correct: true}] format
                        foreach ($optionsInput as $opt) {
                            $opt = (array)$opt; // Ensure array
                            $text = $opt['option_text'] ?? $opt['text']; // Support both keys
                            $optionsList[] = $text;
                            if (isset($opt['is_correct']) && $opt['is_correct']) {
                                $correctOption = $text;
                            }
                        }
                    } else {
                        // Handle ["A", "B"] format (Native Schema)
                        $optionsList = $optionsInput;
                    }

                    // Fallback validation
                    if (!$correctOption && count($optionsList) > 0) {
                        // If no correct option found/provided, default to first (safeguard)
                        $correctOption = $optionsList[0];
                    }

                    Question::create([
                        'quiz_id' => $quiz->id,
                        'question_text' => $questionData['question_text'],
                        'options' => $optionsList, // Automatically cast to JSON
                        'correct_option' => $correctOption,
                        'difficulty_level' => $questionData['difficulty_level'] ?? $quiz->difficulty_level ?? 'medium', 
                        'points' => $questionData['points'] ?? 1,
                        'order' => $index + 1,
                        'explanation' => $questionData['explanation'] ?? null,
                    ]);
                }

                $importedCount++;
            }

            DB::commit();

            return response()->json([
                'message' => 'Bulk import successful',
                'imported_count' => $importedCount,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Bulk import failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get dashboard statistics
     */
    public function getStats()
    {
        $stats = [
            'total_quizzes' => Quiz::count(),
            'active_quizzes' => Quiz::where('is_active', true)->count(),
            'total_questions' => Question::count(),
            'total_subjects' => Subject::count(), // Updated
            'recent_quizzes' => Quiz::with('subject')->latest()->take(5)->get(['id', 'title', 'subject_id', 'created_at']), // Updated
        ];

        return response()->json($stats);
    }
}

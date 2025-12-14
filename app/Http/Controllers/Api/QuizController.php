<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\UserAttempt;
use App\Models\UserAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

use App\Services\GamificationService;

class QuizController extends Controller
{
    /**
     * Display a listing of active quizzes.
     * Public endpoint - no authentication required.
     */
    public function index(Request $request)
    {
        $query = Quiz::active()
            ->with(['subject']) // Load subject
            ->withCount('questions')
            ->select('id', 'title', 'description', 'duration_minutes', 'subject_id', 'difficulty_level');

        // Filter by subject
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $quizzes = $query->paginate(10);

        return response()->json($quizzes);
    }

    /**
     * Display the specified quiz with questions and options.
     */
    public function show($id)
    {
        $quiz = Quiz::with(['subject', 'questions' => function ($query) {
            $query->select('id', 'quiz_id', 'question_text', 'options', 'points', 'order', 'explanation'); 
        }])
        ->findOrFail($id);

        return response()->json($quiz);
    }

    // ... startAttempt, submitAnswer ...

    // ... completeAttempt ...



    /**
     * Start a new quiz attempt for the authenticated user.
     */
    public function startAttempt(Request $request, $quizId)
    {
        $user = $request->user();

        // Check for existing in-progress attempt
        $existingAttempt = UserAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quizId)
            ->where('status', 'in_progress')
            ->first();

        if ($existingAttempt) {
            return response()->json([
                'attempt_id' => $existingAttempt->id,
                'started_at' => $existingAttempt->started_at,
                'max_score' => $existingAttempt->max_score,
                'resumed' => true // Flag for frontend if needed
            ], 200);
        }

        $quiz = Quiz::with('questions')->findOrFail($quizId);
        $maxScore = $quiz->questions->sum('points');

        $attempt = UserAttempt::create([
            'user_id' => $user->id,
            'quiz_id' => $quizId,
            'max_score' => $maxScore,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        return response()->json([
            'attempt_id' => $attempt->id,
            'started_at' => $attempt->started_at,
            'max_score' => $maxScore,
        ], 201);
    }

    /**
     * Submit an answer for a question.
     * Server-side validation and scoring.
     */
    public function submitAnswer(Request $request, $attemptId)
    {
        $validator = Validator::make($request->all(), [
            'question_id' => 'required|exists:questions,id',
            'selected_option' => 'required', // Allow array or string
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $attempt = UserAttempt::findOrFail($attemptId);

        // Verify ownership
        if ($attempt->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Verify attempt is in progress
        if ($attempt->status !== 'in_progress') {
            return response()->json(['error' => 'Attempt is not in progress'], 400);
        }

        $question = Question::findOrFail($request->question_id);
        
        // Handle array or string input
        $inputOption = $request->selected_option;
        $selectedOption = is_array($inputOption) ? ($inputOption[0] ?? null) : $inputOption;

        if (!$selectedOption) {
             return response()->json(['error' => 'No option selected'], 422);
        }

        // Check if answer is correct
        // Simple string comparison
        $isCorrect = $selectedOption === $question->correct_option;
        $pointsEarned = $isCorrect ? $question->points : 0;

        // Save the answer
        UserAnswer::updateOrCreate(
            ['attempt_id' => $attemptId, 'question_id' => $request->question_id],
            [
                'selected_option' => $selectedOption,
                'is_correct' => $isCorrect,
                'points_earned' => $pointsEarned,
                'answered_at' => now(),
            ]
        );

        return response()->json([
            'is_correct' => $isCorrect,
            'points_earned' => $pointsEarned,
            'explanation' => $question->explanation,
            'correct_option' => $question->correct_option, // Return correct answer for immediate feedback
        ]);
    }

    /**
     * Complete the quiz attempt and calculate final score.
     */
    protected $gamificationService;

    public function __construct(GamificationService $gamificationService)
    {
        $this->gamificationService = $gamificationService;
    }

    // ... existing methods ...

    /**
     * Complete the quiz attempt and calculate final score.
     */
    public function completeAttempt(Request $request, $attemptId)
    {
        $attempt = UserAttempt::with(['answers', 'quiz.questions'])->findOrFail($attemptId);
        $user = $request->user();

        // Verify ownership
        if ($attempt->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Calculate final score
        $totalScore = $attempt->answers->sum('points_earned');
        $percentage = ($totalScore / $attempt->max_score) * 100;

        // Calculate time taken
        $timeTaken = now()->diffInSeconds($attempt->started_at);

        // Update attempt
        $attempt->update([
            'score' => $totalScore,
            'percentage' => $percentage,
            'completed_at' => now(),
            'time_taken_seconds' => $timeTaken,
            'status' => 'completed',
        ]);

        // --- Gamification & Learning Logic ---
        
        // 1. Update Streak
        $this->gamificationService->updateStreak($user);

        // 2. Award XP (Score * 10 + Bonus for passing)
        $xpEarned = $totalScore * 10;
        if ($percentage >= $attempt->quiz->passing_score) {
            $xpEarned += 50; // Bonus for passing
        }
        $this->gamificationService->awardXp($user, $xpEarned);

        // 3. Check for specific badges
        $this->gamificationService->checkBadges($user, 'quiz_count', \App\Models\UserAttempt::where('user_id', $user->id)->where('status', 'completed')->count());
        if ($percentage == 100) {
            $this->gamificationService->checkBadges($user, 'perfect_score', 1);
        }

        // 4. Update Weak Topics
        $this->updateWeakTopics($user, $attempt);

        // -------------------------------------

        // Return detailed results with correct answers
        $results = $attempt->answers->map(function ($answer) {
            $question = $answer->question;
            
            return [
                'question_id' => $answer->question_id,
                'question_text' => $question->question_text,
                'selected_options' => [$answer->selected_option], // Wrap in array
                'correct_options' => [$question->correct_option], // Wrap in array
                'is_correct' => $answer->is_correct,
                'points_earned' => $answer->points_earned,
                'explanation' => $question->explanation,
            ];
        });

        return response()->json([
            'attempt_id' => $attempt->id,
            'score' => $totalScore,
            'max_score' => $attempt->max_score,
            'percentage' => round($percentage, 2),
            'time_taken_seconds' => $timeTaken,
            'passed' => $percentage >= $attempt->quiz->passing_score,
            'xp_earned' => $xpEarned, // Return XP earned for UI
            'results' => $results,
        ]);
    }

    /**
     * Helper to update weak topics based on attempt results.
     */
    private function updateWeakTopics($user, $attempt)
    {
        // Group answers by quiz category (using quiz topic as proxy for now)
        $category = $attempt->quiz->category; 

        if (!$category) return;

        $weakTopic = \App\Models\WeakTopic::firstOrCreate(
            ['user_id' => $user->id, 'topic' => $category],
            ['confidence_score' => 50, 'correct_attempts' => 0, 'total_attempts' => 0]
        );

        // Update stats
        $correctCount = $attempt->answers->where('is_correct', true)->count();
        $totalCount = $attempt->answers->count();

        $weakTopic->total_attempts += $totalCount;
        $weakTopic->correct_attempts += $correctCount;
        
        // Recalculate confidence (simple percentage)
        if ($weakTopic->total_attempts > 0) {
            $weakTopic->confidence_score = round(($weakTopic->correct_attempts / $weakTopic->total_attempts) * 100);
        }

        $weakTopic->save();
    }

    /**
     * Get all attempts for the authenticated user.
     */
    public function myAttempts(Request $request)
    {
        $attempts = UserAttempt::with('quiz:id,title,passing_score')
            ->where('user_id', $request->user()->id)
            ->where('status', 'completed') // Only show completed attempts
            ->orderBy('completed_at', 'desc') // Sort by completion time
            ->paginate(10);

        return response()->json($attempts);
    }

    /**
     * Get detailed results for a specific attempt.
     */
    public function attemptDetails(Request $request, $attemptId)
    {
        $attempt = UserAttempt::with([
            'quiz',
            'answers.question' // removed .options
        ])->findOrFail($attemptId);

        // Verify ownership
        if ($attempt->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Format the response
        $answers = $attempt->answers->map(function ($answer) {
            $question = $answer->question;
            
            return [
                'question_text' => $question->question_text,
                'selected_options' => [$answer->selected_option], // Wrap in array
                'correct_options' => [$question->correct_option], // Wrap in array
                'is_correct' => $answer->is_correct,
                'points_earned' => $answer->points_earned,
                'explanation' => $question->explanation,
                'options' => $question->options, // Array of strings
            ];
        });

        return response()->json([
            'quiz' => [
                'title' => $attempt->quiz->title,
                'passing_score' => $attempt->quiz->passing_score,
            ],
            'score' => $attempt->score,
            'max_score' => $attempt->max_score,
            'percentage' => $attempt->percentage,
            'time_taken_seconds' => $attempt->time_taken_seconds,
            'passed' => $attempt->percentage >= $attempt->quiz->passing_score,
            'answers' => $answers,
        ]);
    }

    /**
     * Delete a specific attempt.
     */
    public function deleteAttempt(Request $request, $attemptId)
    {
        $attempt = UserAttempt::findOrFail($attemptId);

        // Verify ownership
        if ($attempt->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $attempt->delete();

        return response()->json(['message' => 'Attempt deleted successfully']);
    }

    /**
     * Get the leaderboard (Top 10 users by XP).
     */
    public function leaderboard()
    {
        $topUsers = \App\Models\User::select('id', 'name', 'xp', 'level', 'streak_count')
            ->where('role', '!=', 'admin') // Exclude admin users
            ->orderBy('xp', 'desc')
            ->take(10)
            ->get();

        return response()->json($topUsers);
    }

    /**
     * Toggle saved status of a question.
     */
    public function toggleSaveQuestion(Request $request, $questionId)
    {
        $user = $request->user();
        $saved = \App\Models\SavedQuestion::where('user_id', $user->id)
            ->where('question_id', $questionId)
            ->first();

        if ($saved) {
            $saved->delete();
            return response()->json(['saved' => false]);
        } else {
            \App\Models\SavedQuestion::create([
                'user_id' => $user->id,
                'question_id' => $questionId,
                'notes' => $request->input('notes'),
            ]);
            return response()->json(['saved' => true]);
        }
    }

    /**
     * Get user's saved questions.
     */
    public function savedQuestions(Request $request)
    {
        // relation 'options' no longer exists, it is a column 'options'
        $saved = \App\Models\SavedQuestion::with('question') 
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($saved);
    }

    /**
     * Get user's weak topics.
     */
    public function weakTopics(Request $request)
    {
        $topics = \App\Models\WeakTopic::where('user_id', $request->user()->id)
            ->orderBy('confidence_score', 'asc') // Lowest confidence first
            ->get();

        return response()->json($topics);
    }
}

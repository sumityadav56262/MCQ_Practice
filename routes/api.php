<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClubController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\AdminController as ApiAdminController;

Route::get('/user', function (Request $request) {
    return $request->user()->load(['badges', 'weakTopics']);
})->middleware('auth:sanctum');

// Auth Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/signup/student', [AuthController::class, 'signupStudent']);
Route::post('/auth/signup/teacher', [AuthController::class, 'signupTeacher']);
Route::post('/auth/signup/club', [AuthController::class, 'signupClub']);

// MCQ Public Routes - no authentication required
Route::get('/quizzes', [QuizController::class, 'index']);
Route::get('/subjects', [ApiAdminController::class, 'getSubjects']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Club Routes
    Route::get('/clubs', [ClubController::class, 'index']);
    Route::get('/clubs/{id}', [ClubController::class, 'show']);
    Route::post('/clubs/subscribe/{club_id}', [ClubController::class, 'subscribe']);

    // Event Routes
    Route::get('/events/upcoming', [EventController::class, 'upcoming']);
    Route::get('/events/{id}', [EventController::class, 'show']);
    Route::post('/events/create', [EventController::class, 'store']);
    Route::get('/events/club/{club_id}', [EventController::class, 'getClubEvents']);

    // Student Routes
    Route::get('/student/profile', [StudentController::class, 'getProfile']);
    Route::put('/student/profile', [StudentController::class, 'updateProfile']);
    Route::get('/student/subscriptions', [StudentController::class, 'getSubscriptions']);

    // Attendance Routes
    Route::get('/attendance/qr/{event_id}', [AttendanceController::class, 'generateQr']);
    Route::post('/attendance/mark', [AttendanceController::class, 'markAttendance']);
    Route::get('/attendance/live/{event_id}', [AttendanceController::class, 'liveAttendance']);
    Route::get('/attendance/event/{event_id}', [AttendanceController::class, 'getEventAttendance']);

    // Profile Picture Routes
    Route::post('/profile/picture', [ProfileController::class, 'uploadProfilePicture']);
    Route::get('/profile/picture/{userId}', [ProfileController::class, 'getProfilePicture']);
    Route::delete('/profile/picture', [ProfileController::class, 'deleteProfilePicture']);

    // Notification Routes
    Route::get('/notifications', [NotificationController::class, 'getUserNotifications']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'deleteNotification']);

    // MCQ Protected Routes - require authentication
    Route::get('/quizzes/{id}', [QuizController::class, 'show']);
    Route::post('/quizzes/{id}/start', [QuizController::class, 'startAttempt']);
    Route::post('/attempts/{id}/answer', [QuizController::class, 'submitAnswer']);
    Route::post('/attempts/{id}/complete', [QuizController::class, 'completeAttempt']);
    Route::get('/my-attempts', [QuizController::class, 'myAttempts']);
    Route::delete('/attempts/{id}', [QuizController::class, 'deleteAttempt']);
    Route::get('/attempts/{id}', [QuizController::class, 'attemptDetails']);
    Route::get('/leaderboard', [QuizController::class, 'leaderboard']);
    Route::post('/questions/{id}/save', [QuizController::class, 'toggleSaveQuestion']);
    Route::get('/library/saved-questions', [QuizController::class, 'savedQuestions']);
    Route::get('/library/weak-topics', [QuizController::class, 'weakTopics']);
    
    // AI Routes
    Route::post('/ai/explain', [AiController::class, 'explain']);

    // Admin Routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Existing Admin Routes
        Route::get('/stats', [ApiAdminController::class, 'getStats']);
        Route::get('/clubs/pending', [AdminController::class, 'getPendingClubs']);
        Route::get('/clubs', [AdminController::class, 'getAllClubs']);
        Route::post('/clubs/{id}/approve', [AdminController::class, 'approveClub']);
        Route::post('/clubs/{id}/reject', [AdminController::class, 'rejectClub']);
        Route::delete('/clubs/{id}', [AdminController::class, 'deleteClub']);
        Route::get('/events', [AdminController::class, 'getAllEvents']);
        Route::delete('/events/{id}', [AdminController::class, 'deleteEvent']);

        // MCQ Admin Routes
        Route::get('/quiz-stats', [ApiAdminController::class, 'getStats']);
        Route::get('/quizzes', [ApiAdminController::class, 'getQuizzes']);
        Route::post('/quizzes', [ApiAdminController::class, 'createQuiz']);
        Route::put('/quizzes/{id}', [ApiAdminController::class, 'updateQuiz']);
        Route::delete('/quizzes/{id}', [ApiAdminController::class, 'deleteQuiz']);
        Route::post('/bulk-import', [ApiAdminController::class, 'bulkImport']);
    });
});

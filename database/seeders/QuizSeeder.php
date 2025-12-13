<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Option;
use App\Models\User;

class QuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test user if doesn't exist
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
            ]
        );

        // Quiz 1: Laravel Basics
        $quiz1 = Quiz::create([
            'title' => 'Laravel Basics',
            'description' => 'Test your knowledge of Laravel fundamentals',
            'duration_minutes' => 15,
            'passing_score' => 60,
            'is_active' => true,
            'category' => 'Web Development',
            'difficulty_level' => 'easy',
            'created_by' => $user->id,
        ]);

        $q1 = Question::create([
            'quiz_id' => $quiz1->id,
            'question_text' => 'What is Laravel?',
            'question_type' => 'single_choice',
            'points' => 1,
            'order' => 1,
            'explanation' => 'Laravel is a PHP web application framework with expressive, elegant syntax.',
        ]);

        Option::create(['question_id' => $q1->id, 'option_text' => 'A PHP framework', 'is_correct' => true, 'order' => 1]);
        Option::create(['question_id' => $q1->id, 'option_text' => 'A database', 'is_correct' => false, 'order' => 2]);
        Option::create(['question_id' => $q1->id, 'option_text' => 'A JavaScript library', 'is_correct' => false, 'order' => 3]);
        Option::create(['question_id' => $q1->id, 'option_text' => 'An operating system', 'is_correct' => false, 'order' => 4]);

        $q2 = Question::create([
            'quiz_id' => $quiz1->id,
            'question_text' => 'Which command is used to create a new Laravel project?',
            'question_type' => 'single_choice',
            'points' => 1,
            'order' => 2,
            'explanation' => 'The composer create-project command is used to create a new Laravel project.',
        ]);

        Option::create(['question_id' => $q2->id, 'option_text' => 'laravel new project', 'is_correct' => false, 'order' => 1]);
        Option::create(['question_id' => $q2->id, 'option_text' => 'composer create-project laravel/laravel', 'is_correct' => true, 'order' => 2]);
        Option::create(['question_id' => $q2->id, 'option_text' => 'npm install laravel', 'is_correct' => false, 'order' => 3]);
        Option::create(['question_id' => $q2->id, 'option_text' => 'php artisan new', 'is_correct' => false, 'order' => 4]);

        $q3 = Question::create([
            'quiz_id' => $quiz1->id,
            'question_text' => 'What is Eloquent in Laravel?',
            'question_type' => 'single_choice',
            'points' => 1,
            'order' => 3,
            'explanation' => 'Eloquent is Laravel\'s ORM (Object-Relational Mapping) for database interactions.',
        ]);

        Option::create(['question_id' => $q3->id, 'option_text' => 'A routing system', 'is_correct' => false, 'order' => 1]);
        Option::create(['question_id' => $q3->id, 'option_text' => 'An ORM', 'is_correct' => true, 'order' => 2]);
        Option::create(['question_id' => $q3->id, 'option_text' => 'A template engine', 'is_correct' => false, 'order' => 3]);
        Option::create(['question_id' => $q3->id, 'option_text' => 'A testing framework', 'is_correct' => false, 'order' => 4]);

        // Quiz 2: React Fundamentals
        $quiz2 = Quiz::create([
            'title' => 'React Fundamentals',
            'description' => 'Master the basics of React.js',
            'duration_minutes' => 20,
            'passing_score' => 70,
            'is_active' => true,
            'category' => 'Frontend Development',
            'difficulty_level' => 'medium',
            'created_by' => $user->id,
        ]);

        $q4 = Question::create([
            'quiz_id' => $quiz2->id,
            'question_text' => 'What is JSX?',
            'question_type' => 'single_choice',
            'points' => 1,
            'order' => 1,
            'explanation' => 'JSX is a syntax extension for JavaScript that allows writing HTML-like code in React.',
        ]);

        Option::create(['question_id' => $q4->id, 'option_text' => 'A JavaScript library', 'is_correct' => false, 'order' => 1]);
        Option::create(['question_id' => $q4->id, 'option_text' => 'A syntax extension for JavaScript', 'is_correct' => true, 'order' => 2]);
        Option::create(['question_id' => $q4->id, 'option_text' => 'A CSS framework', 'is_correct' => false, 'order' => 3]);
        Option::create(['question_id' => $q4->id, 'option_text' => 'A database query language', 'is_correct' => false, 'order' => 4]);

        $q5 = Question::create([
            'quiz_id' => $quiz2->id,
            'question_text' => 'Which hook is used for side effects in React?',
            'question_type' => 'single_choice',
            'points' => 1,
            'order' => 2,
            'explanation' => 'useEffect is the React hook used for handling side effects like data fetching, subscriptions, etc.',
        ]);

        Option::create(['question_id' => $q5->id, 'option_text' => 'useState', 'is_correct' => false, 'order' => 1]);
        Option::create(['question_id' => $q5->id, 'option_text' => 'useEffect', 'is_correct' => true, 'order' => 2]);
        Option::create(['question_id' => $q5->id, 'option_text' => 'useContext', 'is_correct' => false, 'order' => 3]);
        Option::create(['question_id' => $q5->id, 'option_text' => 'useReducer', 'is_correct' => false, 'order' => 4]);

        // Quiz 3: Database Design
        $quiz3 = Quiz::create([
            'title' => 'Database Design Principles',
            'description' => 'Advanced concepts in database normalization and design',
            'duration_minutes' => 30,
            'passing_score' => 75,
            'is_active' => true,
            'category' => 'Database',
            'difficulty_level' => 'hard',
            'created_by' => $user->id,
        ]);

        $q6 = Question::create([
            'quiz_id' => $quiz3->id,
            'question_text' => 'What is the purpose of database normalization?',
            'question_type' => 'single_choice',
            'points' => 2,
            'order' => 1,
            'explanation' => 'Normalization reduces data redundancy and improves data integrity.',
        ]);

        Option::create(['question_id' => $q6->id, 'option_text' => 'To increase data redundancy', 'is_correct' => false, 'order' => 1]);
        Option::create(['question_id' => $q6->id, 'option_text' => 'To reduce data redundancy', 'is_correct' => true, 'order' => 2]);
        Option::create(['question_id' => $q6->id, 'option_text' => 'To slow down queries', 'is_correct' => false, 'order' => 3]);
        Option::create(['question_id' => $q6->id, 'option_text' => 'To remove all foreign keys', 'is_correct' => false, 'order' => 4]);

        $this->command->info('Sample quizzes created successfully!');
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            ['name' => 'Mathematics', 'slug' => 'mathematics', 'description' => 'Algebra, Calculus, and Geometry', 'icon' => 'calculator'],
            ['name' => 'Science', 'slug' => 'science', 'description' => 'Physics, Chemistry, and Biology', 'icon' => 'flask'],
            ['name' => 'History', 'slug' => 'history', 'description' => 'World History and Civilizations', 'icon' => 'history'],
            ['name' => 'General Knowledge', 'slug' => 'general-knowledge', 'description' => 'Current Affairs and Trivia', 'icon' => 'globe'],
            ['name' => 'Programming', 'slug' => 'programming', 'description' => 'Coding and Software Development', 'icon' => 'code'],
        ];

        foreach ($subjects as $subject) {
            \App\Models\Subject::create($subject);
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Badge;

class BadgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $badges = [
            [
                'name' => 'First Steps',
                'description' => 'Complete your first quiz',
                'icon' => 'award',
                'condition_type' => 'quiz_count',
                'condition_value' => 1,
            ],
            [
                'name' => 'High Five',
                'description' => 'Complete 5 quizzes',
                'icon' => 'star',
                'condition_type' => 'quiz_count',
                'condition_value' => 5,
            ],
            [
                'name' => 'Quiz Master',
                'description' => 'Complete 50 quizzes',
                'icon' => 'crown',
                'condition_type' => 'quiz_count',
                'condition_value' => 50,
            ],
            [
                'name' => 'On Fire',
                'description' => 'Maintain a 3-day streak',
                'icon' => 'flame',
                'condition_type' => 'streak',
                'condition_value' => 3,
            ],
            [
                'name' => 'Unstoppable',
                'description' => 'Maintain a 7-day streak',
                'icon' => 'zap',
                'condition_type' => 'streak',
                'condition_value' => 7,
            ],
            [
                'name' => 'Perfectionist',
                'description' => 'Score 100% on a quiz',
                'icon' => 'target',
                'condition_type' => 'perfect_score',
                'condition_value' => 1,
            ],
            [
                'name' => 'Knowledge Seeker',
                'description' => 'Reach Level 5',
                'icon' => 'book-open',
                'condition_type' => 'level',
                'condition_value' => 5,
            ],
            [
                'name' => 'Scholar',
                'description' => 'Reach Level 10',
                'icon' => 'graduation-cap',
                'condition_type' => 'level',
                'condition_value' => 10,
            ],
        ];

        foreach ($badges as $badge) {
            Badge::firstOrCreate(['name' => $badge['name']], $badge);
        }
    }
}

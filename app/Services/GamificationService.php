<?php

namespace App\Services;

use App\Models\User;
use App\Models\Badge;
use App\Models\UserBadge;
use Carbon\Carbon;

class GamificationService
{
    /**
     * Award XP to a user and check for level up.
     */
    public function awardXp(User $user, int $amount)
    {
        $user->xp += $amount;
        $user->save();

        $this->checkLevelUp($user);
        $this->checkBadges($user, 'xp', $user->xp);
    }

    /**
     * Check if user needs to level up based on XP.
     * Simple formula: Level N requires N * 100 XP.
     */
    private function checkLevelUp(User $user)
    {
        // Level calculation: XP needed for level L = 100 * (L * (L-1) / 2) -> Quadratic?
        // Let's keep it simple: Level = floor(xp / 100) + 1
        
        $newLevel = floor($user->xp / 100) + 1;

        if ($newLevel > $user->level) {
            $user->level = intval($newLevel);
            $user->save();
            
            // Allow checking for 'level' badges
            $this->checkBadges($user, 'level', $user->level);
        }
    }

    /**
     * Update user streak.
     * Should be called when a user completes a quiz (activity).
     */
    public function updateStreak(User $user)
    {
        $today = Carbon::today();
        $lastActivity = $user->last_activity_date ? Carbon::parse($user->last_activity_date) : null;

        if (!$lastActivity) {
            // First ever activity
            $user->streak_count = 1;
        } elseif ($lastActivity->isYesterday()) {
            // Streak continues
            $user->streak_count++;
        } elseif ($lastActivity->isToday()) {
            // Already active today, do nothing to streak
        } else {
            // Broken streak
            $user->streak_count = 1;
        }

        $user->last_activity_date = $today;
        $user->save();

        $this->checkBadges($user, 'streak', $user->streak_count);
    }

    /**
     * Check and award badges based on trigger condition.
     */
    public function checkBadges(User $user, string $type, int $value)
    {
        // Find badges of this type that user doesn't have yet, 
        // and where the condition value is met (less than or equal to user's value)
        $potentialBadges = Badge::where('condition_type', $type)
            ->where('condition_value', '<=', $value)
            ->whereDoesntHave('users', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->get();

        foreach ($potentialBadges as $badge) {
            UserBadge::create([
                'user_id' => $user->id,
                'badge_id' => $badge->id,
            ]);
            
            // You might want to fire an event or notification here
        }
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeakTopic extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'topic',
        'confidence_score',
        'correct_attempts',
        'total_attempts',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

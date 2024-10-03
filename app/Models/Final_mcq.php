<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Final_mcq extends Model
{
    use HasFactory;

    protected $fillable = ['question', 'options', 'correct_answer','from'];

    protected $casts = [
        'options' => 'array',  // Cast the options to array automatically
    ];
}

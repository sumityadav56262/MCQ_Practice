<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->integer('passing_score')->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null'); // Added subject relation
            // $table->string('category')->nullable(); // Removed category in favor of subject_id
            $table->enum('difficulty_level', ['easy', 'medium', 'hard'])->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};

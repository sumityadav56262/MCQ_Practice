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
        Schema::create('final_mcqs', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->json('options'); // Store options as JSON
            $table->integer('correct_answer');
            $table->string('from');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('final_mcqs');
    }
};

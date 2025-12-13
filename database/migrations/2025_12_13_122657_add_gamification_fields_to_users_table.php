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
        Schema::table('users', function (Blueprint $table) {
            $table->integer('xp')->default(0)->after('role');
            $table->integer('level')->default(1)->after('xp');
            $table->integer('streak_count')->default(0)->after('level');
            $table->date('last_activity_date')->nullable()->after('streak_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['xp', 'level', 'streak_count', 'last_activity_date']);
        });
    }
};

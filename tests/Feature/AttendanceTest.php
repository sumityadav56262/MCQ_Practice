<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Club;
use App\Models\Student;
use App\Models\Event;
use App\Models\Subscription;
use App\Models\AttendanceToken;
use App\Models\Attendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Carbon\Carbon;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected $clubUser;
    protected $studentUser;
    protected $club;
    protected $student;
    protected $event;

    protected function setUp(): void
    {
        parent::setUp();

        // Create Club User and Club
        $this->clubUser = User::factory()->create(['role' => 'club']);
        $this->club = Club::create([
            'user_id' => $this->clubUser->id,
            'club_name' => 'Test Club',
            'club_code' => 'TC001',
            'club_email' => 'testclub@example.com',
            'faculty_incharge' => 'Dr. Smith',
        ]);

        // Create Student User and Student
        $this->studentUser = User::factory()->create(['role' => 'student']);
        $this->student = Student::create([
            'user_id' => $this->studentUser->id,
            'name' => 'Test Student',
            'QID' => 'Q123456',
            'course' => 'BTech',
            'section' => 'A',
            'programme' => 'CSE',
            'phone' => '1234567890',
        ]);

        // Create Event
        $this->event = Event::create([
            'club_id' => $this->club->id,
            'title' => 'Test Event',
            'description' => 'Event Description',
            'start_time' => Carbon::now()->subHour(),
            'end_time' => Carbon::now()->addHour(),
            'venue' => 'Hall A',
        ]);
    }

    public function test_club_can_generate_qr_token()
    {
        $response = $this->actingAs($this->clubUser)
            ->getJson("/api/attendance/qr/{$this->event->id}");

        $response->assertStatus(200)
            ->assertJsonStructure(['event_id', 'token', 'expires_at']);

        $this->assertDatabaseHas('attendance_tokens', [
            'event_id' => $this->event->id,
        ]);
    }

    public function test_student_can_mark_attendance_with_valid_token()
    {
        // Subscribe student to club
        Subscription::create([
            'student_id' => $this->student->id,
            'club_id' => $this->club->id,
        ]);

        // Generate Token
        $token = AttendanceToken::create([
            'event_id' => $this->event->id,
            'token' => 'valid_token',
            'expires_at' => Carbon::now()->addSeconds(20),
        ]);

        $response = $this->actingAs($this->studentUser)
            ->postJson('/api/attendance/mark', [
                'event_id' => $this->event->id,
                'token' => 'valid_token',
            ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('attendances', [
            'student_id' => $this->student->id,
            'event_id' => $this->event->id,
            'status' => 'present',
        ]);
    }

    public function test_student_cannot_mark_attendance_with_expired_token()
    {
        // Subscribe student
        Subscription::create([
            'student_id' => $this->student->id,
            'club_id' => $this->club->id,
        ]);

        // Generate Expired Token
        $token = AttendanceToken::create([
            'event_id' => $this->event->id,
            'token' => 'expired_token',
            'expires_at' => Carbon::now()->subSeconds(5),
        ]);

        $response = $this->actingAs($this->studentUser)
            ->postJson('/api/attendance/mark', [
                'event_id' => $this->event->id,
                'token' => 'expired_token',
            ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'Token expired']);
    }

    public function test_unsubscribed_student_cannot_mark_attendance()
    {
        // Generate Token
        $token = AttendanceToken::create([
            'event_id' => $this->event->id,
            'token' => 'valid_token',
            'expires_at' => Carbon::now()->addSeconds(20),
        ]);

        $response = $this->actingAs($this->studentUser)
            ->postJson('/api/attendance/mark', [
                'event_id' => $this->event->id,
                'token' => 'valid_token',
            ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'You must be subscribed to the club to mark attendance']);
    }

    public function test_duplicate_attendance_is_handled()
    {
        // Subscribe student
        Subscription::create([
            'student_id' => $this->student->id,
            'club_id' => $this->club->id,
        ]);

        // Mark first time
        Attendance::create([
            'student_id' => $this->student->id,
            'event_id' => $this->event->id,
            'scanned_token' => 'token1',
            'status' => 'present',
        ]);

        // Generate new token
        $token = AttendanceToken::create([
            'event_id' => $this->event->id,
            'token' => 'token2',
            'expires_at' => Carbon::now()->addSeconds(20),
        ]);

        $response = $this->actingAs($this->studentUser)
            ->postJson('/api/attendance/mark', [
                'event_id' => $this->event->id,
                'token' => 'token2',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Attendance already marked']);
    }

    public function test_live_attendance_list()
    {
        // Create attendance
        Attendance::create([
            'student_id' => $this->student->id,
            'event_id' => $this->event->id,
            'scanned_token' => 'token1',
            'status' => 'present',
        ]);

        $response = $this->actingAs($this->clubUser)
            ->getJson("/api/attendance/live/{$this->event->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Test Student']);
    }
}

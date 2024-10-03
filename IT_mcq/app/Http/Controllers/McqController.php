<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Final_mcq as Mcq;
use SebastianBergmann\Diff\Chunk;

class McqController extends Controller
{
    // Admin panel to show form for adding MCQs
    public function showAdmin()
    {
        return view('admin');
    }

    // Store the MCQ in the database
    public function storeMcq(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'from' => 'required|string',
            'options' => 'required|array',
            'correct_answer' => 'required|integer',
        ]);
        $existing = Mcq::where('question',$validated['question']);
        if($existing)
        {
            return redirect()->route('admin.mcq')->with('success', 'The Question is already added!');
        }
        Mcq::create([
            'question' => $validated['question'],
            'options' => json_encode($validated['options']),
            'correct_answer' => $validated['correct_answer'],
            'from' => $validated['from'],
        ]);

        return redirect()->route('admin.mcq')->with('success', 'Question added successfully!');
    }

    public function getQuestions()
    {
        $mcqs = Mcq::inRandomOrder()->take(30)->get(); // Adjust to get the right number of questions
        return response()->json($mcqs);
    }

    // User panel to show the MCQs one by one
    public function showUser()
    {
        $mcqs = Mcq::inRandomOrder()->get(); // Get all MCQs in random order
        $chunkedMcqs = $mcqs->chunk(30); // Chunk into sets of 30

        // Prepare an array of questions with options and correct answers
        $questions = [];
        foreach ($chunkedMcqs as $chunk) {
            foreach ($chunk as $mcq) {
                $questions[] = [
                    'question' => $mcq->question,
                    'options' => json_decode($mcq->options), // Ensure this is an array
                    'correctAnswer' => $mcq->correct_answer // Assuming this is your correct answer
                ];
            }
            break;
        }

        return view('user', compact('questions')); // Pass to view
    }

    // Validate the user's answer
    public function validateAnswer(Request $request)
    {
        $mcq = Mcq::find($request->mcq_id);

        $isCorrect = $mcq->correct_answer == $request->selected_answer;

        return response()->json([
            'isCorrect' => $isCorrect,
            'correctAnswer' => $mcq->correct_answer
        ]);
    }
     // Show the form to input raw JSON data
    public function showJsonInputForm()
    {
        return view('admin-json-input');
    }

    public function storeJsonMcq(Request $request)
    {
        // Validate the JSON input
        $validated = $request->validate([
            'json_data' => 'required|json',
        ]);

        // Decode the JSON data
        $jsonData = json_decode($request->json_data, true);

        // Check if it's a single MCQ (associative array) or multiple (indexed array)
        if (isset($jsonData['question'])) {
            $jsonData = [$jsonData]; // Wrap it in an array to handle both single and multiple cases
        }

        // Process each MCQ
        foreach ($jsonData as $mcq) {
            // Ensure the required fields are present
            if (isset($mcq['question'], $mcq['options'], $mcq['correctAnswer'])) {
                // Check if the question already exists in the database
                $existingMcq = Mcq::where('question', $mcq['question'])->first();

                if (!$existingMcq) {
                    // Insert the MCQ if it's not a duplicate
                    Mcq::create([
                        'question' => $mcq['question'],
                        'options' => json_encode($mcq['options']),
                        'correct_answer' => intval($mcq['correctAnswer']) - 1,// Convert 1-based index to 0-based
                        'from'=>$mcq['from'] ,
                    ]);
                }
            } else {
                return redirect()->back()->withErrors(['json_data' => 'Invalid JSON structure in one or more MCQs!'])->withInput();
            }
        }

        return redirect()->route('admin.jsonInput')->with('success', 'MCQ(s) added successfully!');
    }
}

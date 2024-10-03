<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Add MCQ</title>
    <link rel="stylesheet" href={{ asset('style/admin.css') }}>
</head>
<body>
    <div class="container">
        <h1>Add MCQ Question</h1>

        @if(session('success'))
            <p>{{ session('success') }}</p>
        @endif

        <form class="form-group" action="{{ route('admin.mcq.store') }}" method="POST">
            @csrf
            <label for="question">Question:</label>
            <input type="text" name="question" required><br><br>

            <label for="options">Options (comma separated):</label>
            <input type="text" name="options[]" required><br>
            <input type="text" name="options[]" required><br>
            <input type="text" name="options[]" required><br>
            <input type="text" name="options[]" required><br><br>

            <label for="correct_answer">Correct Answer (1-based index):</label>
            <input type="number" name="correct_answer" min="1" max="4" required><br><br>

            <label for="from">Enter Category:</label>
            <input type="text" name="from" placeholder="Ex:- computer_fundamental, Operating_system" required><br><br>

            <div class="buttons">
                <button class="button" type="submit">Add Question</button>
                <a class="button" href={{ route('admin.jsonInput') }}>Add JSON</a>
            </div>
        </form>
    </div>
</body>
</html>

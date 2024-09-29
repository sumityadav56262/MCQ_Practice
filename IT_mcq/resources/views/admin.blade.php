<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Add MCQ</title>
</head>
<body>
    <h1>Add MCQ Question</h1>

    @if(session('success'))
        <p>{{ session('success') }}</p>
    @endif

    <form action="{{ route('admin.mcq.store') }}" method="POST">
        @csrf
        <label for="question">Question:</label><br>
        <input type="text" name="question" required><br><br>

        <label for="options">Options (comma separated):</label><br>
        <input type="text" name="options[]" required><br>
        <input type="text" name="options[]" required><br>
        <input type="text" name="options[]" required><br>
        <input type="text" name="options[]" required><br><br>

        <label for="correct_answer">Correct Answer (1-based index):</label><br>
        <input type="number" name="correct_answer" min="1" max="4" required><br><br>

        <button type="submit">Add Question</button>
    </form>
</body>
</html>

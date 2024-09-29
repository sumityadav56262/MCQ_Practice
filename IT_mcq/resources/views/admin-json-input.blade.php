<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Add MCQs via JSON</title>
    <style>
        textarea {
            width: 100%;
            height: 300px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <h1>Add MCQ Questions via JSON</h1>

    @if(session('success'))
        <p>{{ session('success') }}</p>
    @endif

    <form action="{{ route('admin.jsonInput.store') }}" method="POST">
        @csrf
        <label for="json_data">Paste JSON Data Here:</label><br>
        <textarea name="json_data" required></textarea><br>
        
        @error('json_data')
            <p style="color:red;">{{ $message }}</p>
        @enderror

        <button type="submit">Add Questions</button>
    </form>
</body>
</html>

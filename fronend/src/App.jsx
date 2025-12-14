import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { QuizList } from './pages/QuizList';
import { QuizTaking } from './pages/QuizTaking';
import { QuizResults } from './pages/QuizResults';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { QuizHistory } from './pages/QuizHistory';
import { Courses } from './pages/Courses';
import { AdminDashboard } from './pages/AdminDashboard';
import { BulkImport } from './pages/BulkImport';
import { ManageQuizzes } from './pages/ManageQuizzes';
import { QuizEditor } from './pages/QuizEditor';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quizzes" element={<QuizList />} />
            <Route path="/quizzes/:subject" element={<QuizList />} />
            <Route path="/quiz/:quizId" element={<QuizTaking />} />
            <Route path="/results/:attemptId" element={<QuizResults />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />

            {/* New Routes */}
            <Route path="/history" element={<QuizHistory />} />
            <Route path="/courses" element={<Courses />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/quizzes" element={<ManageQuizzes />} />
            <Route path="/admin/quizzes/:id" element={<QuizEditor />} />
            <Route path="/admin/bulk-import" element={<BulkImport />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;

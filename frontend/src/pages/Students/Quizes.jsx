import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../utils/AuthContext';
import api from '../../services/api';
import {
    BookOpen, Clock, Calendar, ChevronRight, ChevronLeft,
    CheckCircle, XCircle, AlertCircle, Timer, Trophy,
    ArrowLeft, Send, BarChart3, Loader2
} from 'lucide-react';

const Quizes = () => {
    const { user, loading } = useAuth();

    // ── View state ──────────────────────────────────────────────
    const [view, setView] = useState('list'); // 'list' | 'attempt' | 'results'

    // ── Quiz list ───────────────────────────────────────────────
    const [quizzes, setQuizzes] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');

    // ── Quiz attempt ────────────────────────────────────────────
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTimeTaken, setTotalTimeTaken] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [quizStartTime, setQuizStartTime] = useState(null);
    const timerRef = useRef(null);

    // ── Results ─────────────────────────────────────────────────
    const [results, setResults] = useState(null);

    // ── Fetch quizzes ───────────────────────────────────────────
    const fetchQuizzes = useCallback(async () => {
        try {
            setDataLoading(true);
            const res = await api.get('/classroom/quizzes/');
            setQuizzes(res.data);
            setError('');
        } catch (err) {
            console.error('Error fetching quizzes:', err);
            setError('Failed to load quizzes. Please try again.');
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user && user.role === 'STUDENT') {
            fetchQuizzes();
        }
    }, [user, fetchQuizzes]);

    // ── Quiz status helper ──────────────────────────────────────
    const getQuizStatus = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (now < start) return { text: 'Upcoming', color: 'blue', canAttempt: false };
        if (now > end) return { text: 'Ended', color: 'red', canAttempt: false };
        return { text: 'Active', color: 'green', canAttempt: true };
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    // ── Start Quiz ──────────────────────────────────────────────
    const startQuiz = async (quiz) => {
        try {
            setDataLoading(true);
            const res = await api.get(`/classroom/quizzes/${quiz.id}/`);
            const quizDetail = res.data;

            if (!quizDetail.questions || quizDetail.questions.length === 0) {
                setError('This quiz has no questions.');
                setDataLoading(false);
                return;
            }

            setCurrentQuiz(quizDetail);
            setQuestions(quizDetail.questions);
            setCurrentIndex(0);
            setAnswers({});
            setTimeLeft(quizDetail.time_per_question || 60);
            setQuizStartTime(Date.now());
            setView('attempt');
            setError('');
        } catch (err) {
            console.error('Error loading quiz:', err);
            if (err.response?.status === 400 && err.response?.data?.detail?.includes('already submitted')) {
                setError('You have already submitted this quiz.');
            } else {
                setError('Failed to load quiz. Please try again.');
            }
        } finally {
            setDataLoading(false);
        }
    };

    // ── Timer logic ─────────────────────────────────────────────
    useEffect(() => {
        if (view !== 'attempt') return;

        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Auto-advance to next question
                    handleNextQuestion(true);
                    return currentQuiz?.time_per_question || 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [view, currentIndex]);

    // ── Answer selection ────────────────────────────────────────
    const selectAnswer = (optionIndex) => {
        setAnswers((prev) => ({
            ...prev,
            [currentIndex]: String(optionIndex),
        }));
    };

    // ── Navigation ──────────────────────────────────────────────
    const handleNextQuestion = (autoAdvance = false) => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setTimeLeft(currentQuiz?.time_per_question || 60);
        } else if (autoAdvance) {
            // Last question timer ran out → auto submit
            handleSubmitQuiz();
        }
    };

    const handlePrevQuestion = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setTimeLeft(currentQuiz?.time_per_question || 60);
        }
    };

    // ── Submit quiz ─────────────────────────────────────────────
    const handleSubmitQuiz = async () => {
        if (submitting) return;

        const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);
        setTotalTimeTaken(timeTaken);

        try {
            setSubmitting(true);
            if (timerRef.current) clearInterval(timerRef.current);

            const res = await api.post(`/classroom/quizzes/${currentQuiz.id}/submit/`, {
                answers: answers,
                time_taken: timeTaken,
            });

            setResults({
                score: res.data.score,
                total_questions: res.data.total_questions,
                time_taken: timeTaken,
            });
            setView('results');
            setError('');
        } catch (err) {
            console.error('Error submitting quiz:', err);
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Failed to submit quiz. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ── Back to list ────────────────────────────────────────────
    const backToList = () => {
        setView('list');
        setCurrentQuiz(null);
        setQuestions([]);
        setAnswers({});
        setResults(null);
        setCurrentIndex(0);
        if (timerRef.current) clearInterval(timerRef.current);
        fetchQuizzes();
    };

    // ── Loading state ───────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
        );
    }

    if (!user || user.role !== 'STUDENT') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-400 text-xl">Unauthorized Access</div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════
    //  RESULTS VIEW
    // ═══════════════════════════════════════════════════════════
    if (view === 'results' && results) {
        const percentage = results.total_questions > 0
            ? Math.round((results.score / results.total_questions) * 100) : 0;
        const minutes = Math.floor(results.time_taken / 60);
        const seconds = results.time_taken % 60;

        let gradeColor = 'text-red-400';
        let gradeBg = 'from-red-600/20 to-red-900/20';
        let gradeIcon = <XCircle className="w-16 h-16" />;
        if (percentage >= 80) {
            gradeColor = 'text-green-400';
            gradeBg = 'from-green-600/20 to-emerald-900/20';
            gradeIcon = <Trophy className="w-16 h-16" />;
        } else if (percentage >= 50) {
            gradeColor = 'text-yellow-400';
            gradeBg = 'from-yellow-600/20 to-amber-900/20';
            gradeIcon = <CheckCircle className="w-16 h-16" />;
        }

        return (
            <div className="min-h-screen bg-gray-800 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className={`bg-gradient-to-br ${gradeBg} border border-gray-700 rounded-2xl p-8 text-center`}>
                        <div className={`${gradeColor} flex justify-center mb-4`}>
                            {gradeIcon}
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h1>
                        <p className="text-gray-300 mb-6">{currentQuiz?.title}</p>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-gray-800/60 rounded-xl p-4">
                                <div className={`text-3xl font-bold ${gradeColor}`}>{results.score}</div>
                                <div className="text-gray-400 text-sm mt-1">Correct</div>
                            </div>
                            <div className="bg-gray-800/60 rounded-xl p-4">
                                <div className="text-3xl font-bold text-white">{results.total_questions}</div>
                                <div className="text-gray-400 text-sm mt-1">Total</div>
                            </div>
                            <div className="bg-gray-800/60 rounded-xl p-4">
                                <div className={`text-3xl font-bold ${gradeColor}`}>{percentage}%</div>
                                <div className="text-gray-400 text-sm mt-1">Score</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-gray-400 mb-8">
                            <Timer className="w-4 h-4" />
                            <span>Time taken: {minutes}m {seconds}s</span>
                        </div>

                        {/* Score progress bar */}
                        <div className="w-full bg-gray-700 rounded-full h-3 mb-8">
                            <div
                                className={`h-3 rounded-full transition-all duration-1000 ${percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        <button
                            onClick={backToList}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Back to Quizzes
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════
    //  QUIZ ATTEMPT VIEW
    // ═══════════════════════════════════════════════════════════
    if (view === 'attempt' && currentQuiz && questions.length > 0) {
        const question = questions[currentIndex];
        const isLastQuestion = currentIndex === questions.length - 1;
        const answeredCount = Object.keys(answers).length;
        const progressPercent = ((currentIndex + 1) / questions.length) * 100;

        // Timer styling
        const timerPercent = (timeLeft / (currentQuiz.time_per_question || 60)) * 100;
        let timerColor = 'text-green-400';
        if (timerPercent < 30) timerColor = 'text-red-400';
        else if (timerPercent < 60) timerColor = 'text-yellow-400';

        const options = [
            { key: '1', label: question.option1 || question.option_1 || '' },
            { key: '2', label: question.option2 || question.option_2 || '' },
            { key: '3', label: question.option3 || question.option_3 || '' },
            { key: '4', label: question.option4 || question.option_4 || '' },
        ];

        return (
            <div className="min-h-screen bg-gray-800 p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header bar */}
                    <div className="bg-gray-900 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to leave? Your progress will be lost.')) {
                                        backToList();
                                    }
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-white font-semibold text-sm md:text-base truncate max-w-[200px]">
                                    {currentQuiz.title}
                                </h2>
                                <p className="text-gray-400 text-xs">
                                    {answeredCount}/{questions.length} answered
                                </p>
                            </div>
                        </div>

                        {/* Timer */}
                        <div className={`flex items-center gap-2 ${timerColor} font-mono text-lg font-bold`}>
                            <Timer className="w-5 h-5" />
                            <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                        <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    {/* Question Card */}
                    <div className="bg-gray-900 rounded-2xl p-6 md:p-8 mb-6">
                        <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-4">
                            <BarChart3 className="w-4 h-4" />
                            Question {currentIndex + 1} of {questions.length}
                        </div>

                        <h3 className="text-xl md:text-2xl font-semibold text-white mb-8 leading-relaxed">
                            {question.question}
                        </h3>

                        {/* Options */}
                        <div className="space-y-3">
                            {options.map((opt) => {
                                const isSelected = answers[currentIndex] === opt.key;
                                return (
                                    <button
                                        key={opt.key}
                                        onClick={() => selectAnswer(opt.key)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ${isSelected
                                            ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                                            : 'border-gray-700 bg-gray-800 hover:border-gray-500 hover:bg-gray-750'
                                            }`}
                                    >
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${isSelected
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                                            }`}>
                                            {String.fromCharCode(64 + parseInt(opt.key))}
                                        </span>
                                        <span className={`text-sm md:text-base ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                            {opt.label}
                                        </span>
                                        {isSelected && (
                                            <CheckCircle className="w-5 h-5 text-indigo-400 ml-auto flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handlePrevQuestion}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>

                        {/* Question dots */}
                        <div className="hidden md:flex items-center gap-1.5 flex-wrap justify-center max-w-[300px]">
                            {questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setCurrentIndex(idx);
                                        setTimeLeft(currentQuiz.time_per_question || 60);
                                    }}
                                    className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex
                                        ? 'bg-indigo-500 scale-125'
                                        : answers[idx] !== undefined
                                            ? 'bg-green-500'
                                            : 'bg-gray-600 hover:bg-gray-500'
                                        }`}
                                    title={`Question ${idx + 1}`}
                                />
                            ))}
                        </div>

                        {isLastQuestion ? (
                            <button
                                onClick={() => {
                                    const unanswered = questions.length - answeredCount;
                                    if (unanswered > 0) {
                                        if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
                                            return;
                                        }
                                    }
                                    handleSubmitQuiz();
                                }}
                                disabled={submitting}
                                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Submit Quiz
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleNextQuestion(false)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Error in attempt view */}
                    {error && (
                        <div className="mt-4 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════
    //  QUIZ LIST VIEW (default)
    // ═══════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-gray-800 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25"></div>
                        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <BookOpen className="w-8 h-8" />
                                <h1 className="text-3xl font-bold">My Quizzes</h1>
                            </div>
                            <p className="text-indigo-100">View and attempt quizzes assigned to your classrooms</p>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto text-red-300 hover:text-white">×</button>
                    </div>
                )}

                {/* Quiz Grid */}
                {dataLoading ? (
                    <div className="text-center py-16">
                        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-300">Loading quizzes...</p>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-700">
                        <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-300 text-lg font-medium">No quizzes available</p>
                        <p className="text-gray-500 mt-2">Quizzes assigned to your enrolled classrooms will appear here</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {quizzes.map((quiz) => {
                            const status = getQuizStatus(quiz.start_time, quiz.end_time);
                            return (
                                <div
                                    key={quiz.id}
                                    className="bg-gray-900 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 overflow-hidden group"
                                >
                                    {/* Status ribbon */}
                                    <div className={`h-1 ${status.color === 'green' ? 'bg-green-500' :
                                        status.color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
                                        }`} />

                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors truncate pr-2">
                                                {quiz.title}
                                            </h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${status.color === 'green'
                                                ? 'bg-green-500/20 text-green-400'
                                                : status.color === 'blue'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {status.text}
                                            </span>
                                        </div>

                                        {quiz.description && (
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                                        )}

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <BookOpen className="w-4 h-4 text-indigo-400" />
                                                <span>{quiz.classroom_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <Timer className="w-4 h-4 text-indigo-400" />
                                                <span>{quiz.time_per_question}s per question</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <Calendar className="w-4 h-4 text-indigo-400" />
                                                <span>{formatDate(quiz.start_time)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <Clock className="w-4 h-4 text-indigo-400" />
                                                <span>Ends: {formatDate(quiz.end_time)}</span>
                                            </div>
                                        </div>

                                        {status.canAttempt ? (
                                            <button
                                                onClick={() => startQuiz(quiz)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                                Start Quiz
                                            </button>
                                        ) : status.text === 'Upcoming' ? (
                                            <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 text-blue-300 rounded-lg text-sm cursor-not-allowed">
                                                <Clock className="w-4 h-4" />
                                                Not started yet
                                            </div>
                                        ) : (
                                            <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 text-red-300 rounded-lg text-sm cursor-not-allowed">
                                                <XCircle className="w-4 h-4" />
                                                Quiz ended
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quizes;
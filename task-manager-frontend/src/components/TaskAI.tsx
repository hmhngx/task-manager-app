import React, { useState } from 'react';
import { Task } from '../types/Task';
import aiService, { AiAssistResponse } from '../services/aiService';
import Button from './ui/Button';

interface TaskAIProps {
  task: Task;
}

const TaskAI: React.FC<TaskAIProps> = ({ task }) => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AiAssistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const aiResponse = await aiService.getTaskAssistance({
        taskTitle: task.title,
        taskDescription: task.description || '',
        question: question.trim(),
      });
      setResponse(aiResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to get AI assistance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuestion('');
    setResponse(null);
    setError(null);
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-900">AI Assistant</h3>
          <p className="text-sm text-gray-600">Get productivity tips and suggestions for this task</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ai-question" className="block text-sm font-medium text-gray-700 mb-2">
            Ask about this task
          </label>
          <textarea
            id="ai-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., How can I complete this faster? What tools should I use? How can I break this down into smaller steps?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div className="flex space-x-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!question.trim() || isLoading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Getting AI Advice...</span>
              </div>
            ) : (
              'Get AI Advice'
            )}
          </Button>
          
          {response && (
            <Button
              type="button"
              onClick={handleClear}
              variant="secondary"
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 font-medium">Error</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-6 space-y-4">
          {/* AI Response */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-3">AI Response</h4>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{response.response}</p>
            </div>
          </div>

          {/* Suggestions */}
          {response.suggestions && response.suggestions.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-3">Actionable Suggestions</h4>
              <ul className="space-y-2">
                {response.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 text-center">
            Generated on {new Date(response.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAI; 
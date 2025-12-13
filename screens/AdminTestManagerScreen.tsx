
import React, { useState } from 'react';
import { Question, Test, Topic } from '../lib/types';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { NATIONAL_EXAMS } from '../lib/constants';
import { Plus, Save, Database, FileText, Check, Trash2, Filter, Tag, Calendar, BarChart, Target } from 'lucide-react';

interface Props {
  questionBank: Question[];
  tests: Test[];
  onAddQuestion: (q: Question) => void;
  onCreateTest: (t: Test) => void;
  onDeleteQuestion: (id: string) => void;
  onDeleteTest: (id: string) => void;
  syllabus: Topic[];
}

export const AdminTestManagerScreen: React.FC<Props> = ({ 
  questionBank, tests, onAddQuestion, onCreateTest, onDeleteQuestion, onDeleteTest, syllabus 
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'tests'>('questions');

  return (
    <div className="space-y-6 animate-in fade-in">
        
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-blue-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                  <div className="flex items-center space-x-3 mb-2">
                      <Target className="w-8 h-8 text-white" />
                      <h1 className="text-3xl font-bold">Test & Question Bank</h1>
                  </div>
                  <p className="text-indigo-100 text-lg opacity-90 max-w-2xl">
                      Create new questions, assemble mock tests, and manage the examination database.
                  </p>
              </div>
              
              <div className="flex bg-white/20 p-1 rounded-xl backdrop-blur-sm border border-white/20">
                  <button onClick={() => setActiveTab('questions')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'questions' ? 'bg-white text-indigo-700 shadow-md' : 'text-indigo-100 hover:bg-white/10'}`}>
                      <Database className="w-4 h-4" /> Question Bank
                  </button>
                  <button onClick={() => setActiveTab('tests')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'tests' ? 'bg-white text-indigo-700 shadow-md' : 'text-indigo-100 hover:bg-white/10'}`}>
                      <FileText className="w-4 h-4" /> Test Builder
                  </button>
              </div>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-white opacity-10"></div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[600px] p-6">
         {activeTab === 'questions' ? (
            <QuestionBankManager 
                questions={questionBank} 
                onAdd={onAddQuestion} 
                onDelete={onDeleteQuestion}
                syllabus={syllabus}
            />
         ) : (
            <TestBuilder 
                questions={questionBank} 
                tests={tests} 
                onCreate={onCreateTest} 
                onDelete={onDeleteTest} 
            />
         )}
      </div>
    </div>
  );
};

// --- Sub-Components ---

const QuestionBankManager = ({ questions, onAdd, onDelete, syllabus }: { questions: Question[], onAdd: (q: Question) => void, onDelete: (id: string) => void, syllabus: Topic[] }) => {
    const [subject, setSubject] = useState('Physics');
    const [topicId, setTopicId] = useState('');
    const [text, setText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctIdx, setCorrectIdx] = useState(0);
    const [source, setSource] = useState(NATIONAL_EXAMS[0]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
    
    const [filterSub, setFilterSub] = useState('ALL');

    const topics = syllabus.filter(t => t.subject === subject);
    const filteredQuestions = questions.filter(q => filterSub === 'ALL' || q.subjectId === (filterSub === 'Physics' ? 'phys' : filterSub === 'Chemistry' ? 'chem' : 'math'));

    const handleAdd = () => {
        if (!topicId || !text || options.some(o => !o.trim())) return;
        
        const newQ: Question = {
            id: `q_${Date.now()}`,
            subjectId: subject === 'Physics' ? 'phys' : subject === 'Chemistry' ? 'chem' : 'math',
            topicId,
            text,
            options,
            correctOptionIndex: correctIdx,
            source,
            year,
            difficulty
        };
        onAdd(newQ);
        setText('');
        setOptions(['', '', '', '']);
        setCorrectIdx(0);
        // Keep topic selected for speed entry
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1 space-y-4 border-r border-slate-100 pr-0 lg:pr-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus size={18} /> Add New Question</h3>
                
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                            <select 
                                className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                                value={subject}
                                onChange={e => { setSubject(e.target.value); setTopicId(''); }}
                            >
                                <option>Physics</option>
                                <option>Chemistry</option>
                                <option>Maths</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Topic</label>
                            <select 
                                className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                                value={topicId}
                                onChange={e => setTopicId(e.target.value)}
                            >
                                <option value="">Select Topic</option>
                                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Difficulty</label>
                            <select 
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                                value={difficulty}
                                onChange={e => setDifficulty(e.target.value as any)}
                            >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tag</label>
                            <select 
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                                value={source}
                                onChange={e => setSource(e.target.value)}
                            >
                                {NATIONAL_EXAMS.map(exam => (
                                    <option key={exam} value={exam}>{exam}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label>
                            <input 
                                type="number"
                                className="w-full p-2 border rounded-lg text-sm"
                                placeholder="2023"
                                value={year}
                                onChange={e => setYear(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Question Text</label>
                        <textarea 
                            className="w-full p-2 border rounded-lg text-sm h-24 focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="Type question here..."
                            value={text}
                            onChange={e => setText(e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Options (Select Correct)</label>
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input 
                                    type="radio" 
                                    name="correct" 
                                    checked={correctIdx === idx}
                                    onChange={() => setCorrectIdx(idx)}
                                    className="cursor-pointer accent-green-600"
                                />
                                <input 
                                    className={`flex-1 p-2 border rounded-lg text-sm ${correctIdx === idx ? 'border-green-300 bg-green-50' : ''}`}
                                    placeholder={`Option ${idx + 1}`}
                                    value={opt}
                                    onChange={e => {
                                        const newOpts = [...options];
                                        newOpts[idx] = e.target.value;
                                        setOptions(newOpts);
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <Button onClick={handleAdd} disabled={!text || !topicId} className="w-full">
                        <Plus size={16} /> Add to Question Bank
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Existing Questions ({questions.length})</h3>
                    <div className="flex gap-1">
                        {['ALL', 'Physics', 'Chemistry', 'Maths'].map(sub => (
                            <button 
                                key={sub}
                                onClick={() => setFilterSub(sub)}
                                className={`text-xs px-2 py-1 rounded border ${filterSub === sub ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="space-y-3 h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredQuestions.length === 0 && <p className="text-slate-400 text-sm italic">No questions found.</p>}
                    {filteredQuestions.map(q => (
                        <div key={q.id} className="p-3 border rounded-lg hover:bg-slate-50 group relative bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2 items-center flex-wrap">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border inline-block ${
                                        q.subjectId === 'phys' ? 'text-purple-700 bg-purple-50 border-purple-200' : 
                                        q.subjectId === 'chem' ? 'text-amber-700 bg-amber-50 border-amber-200' : 
                                        'text-blue-700 bg-blue-50 border-blue-200'
                                    }`}>
                                        {q.subjectId}
                                    </span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block ${
                                        q.difficulty === 'HARD' ? 'text-red-700 bg-red-50 border-red-200' :
                                        q.difficulty === 'MEDIUM' ? 'text-orange-700 bg-orange-50 border-orange-200' :
                                        'text-green-700 bg-green-50 border-green-200'
                                    }`}>
                                        {q.difficulty || 'MEDIUM'}
                                    </span>
                                    {(q.source || q.year) && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center">
                                            <Tag size={10} className="mr-1"/> {q.source} {q.year}
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => onDelete(q.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                            </div>
                            <p className="text-sm text-slate-800 font-medium mb-2">{q.text}</p>
                            <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt, i) => (
                                    <div key={i} className={`text-xs p-1.5 rounded border ${i === q.correctOptionIndex ? 'bg-green-100 border-green-300 text-green-800 font-bold' : 'bg-white border-slate-100 text-slate-500'}`}>
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TestBuilder = ({ questions, tests, onCreate, onDelete }: { questions: Question[], tests: Test[], onCreate: (t: Test) => void, onDelete: (id: string) => void }) => {
    // ... Test Builder implementation (kept simple for brevity, logic same as before)
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(180);
    const [selectedQIds, setSelectedQIds] = useState<string[]>([]);
    const [activeSubject, setActiveSubject] = useState('ALL');

    const handleCreate = () => {
        if (!title || selectedQIds.length === 0) return;
        const selectedQs = questions.filter(q => selectedQIds.includes(q.id));
        const newTest: Test = {
            id: `test_${Date.now()}`,
            title,
            durationMinutes: duration,
            questions: selectedQs,
            category: 'ADMIN',
            difficulty: 'CUSTOM'
        };
        onCreate(newTest);
        setTitle('');
        setSelectedQIds([]);
        alert('Test Published!');
    };

    const toggleSelection = (id: string) => {
        setSelectedQIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredQuestions = questions.filter(q => activeSubject === 'ALL' || q.subjectId === (activeSubject === 'Physics' ? 'phys' : activeSubject === 'Chemistry' ? 'chem' : 'math'));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ... Test Config Form ... */}
            <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Test Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Test Title</label>
                            <input className="w-full p-2 border rounded-lg" placeholder="e.g. Weekly Mock Test 05" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Mins)</label>
                                <input type="number" className="w-full p-2 border rounded-lg" value={duration} onChange={e => setDuration(parseInt(e.target.value))} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Questions</label>
                                <div className="w-full p-2 border rounded-lg bg-slate-200 text-slate-600 font-bold">{selectedQIds.length} Selected</div>
                            </div>
                        </div>
                        <Button onClick={handleCreate} disabled={!title || selectedQIds.length === 0} className="w-full"><Save size={16} /> Publish Test</Button>
                    </div>
                </div>
                {/* ... Published List ... */}
                <div>
                    <h3 className="font-bold text-slate-800 mb-4">Published Tests</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {tests.filter(t => t.category === 'ADMIN').map(t => (
                            <div key={t.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50">
                                <div><p className="font-bold text-sm text-slate-800">{t.title}</p><p className="text-xs text-slate-500">{t.questions.length} Qs • {t.durationMinutes} min</p></div>
                                <button onClick={() => onDelete(t.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ... Question Picker ... */}
            <div className="flex flex-col h-[600px] border rounded-xl overflow-hidden">
                <div className="bg-slate-100 p-3 border-b flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 text-sm">Select Questions</h3>
                    <div className="flex gap-1">
                        {['ALL', 'Physics', 'Chemistry', 'Maths'].map(sub => (
                            <button key={sub} onClick={() => setActiveSubject(sub)} className={`text-[10px] px-2 py-1 rounded font-bold ${activeSubject === sub ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>{sub}</button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
                    {filteredQuestions.map(q => (
                        <div key={q.id} onClick={() => toggleSelection(q.id)} className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${selectedQIds.includes(q.id) ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${selectedQIds.includes(q.id) ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-slate-300'}`}>
                                {selectedQIds.includes(q.id) && <Check size={12} />}
                            </div>
                            <div className="flex-1">
                                <span className={`text-[9px] font-bold px-1 rounded uppercase border mr-2 ${q.difficulty === 'HARD' ? 'text-red-700 bg-red-50' : 'text-green-700 bg-green-50'}`}>{q.difficulty || 'MED'}</span>
                                <span className="text-sm text-slate-800">{q.text}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

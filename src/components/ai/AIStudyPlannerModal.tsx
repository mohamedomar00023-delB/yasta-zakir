import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Bot, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Flame, 
  Zap, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Send,
  MessageSquare,
  Lightbulb,
  Brain,
  Volume2,
  VolumeX,
  FileText,
  Activity,
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
  Award,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudyPlanItem, TaskPriority } from '../../types';

interface SubjectConfig {
  name: string;
  difficulty: 'hard' | 'medium' | 'easy';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface Flashcard {
  question: string;
  answer: string;
  hint: string;
}

export const AIStudyPlannerModal: React.FC = () => {
  const { isAIPlannerModalOpen, setIsAIPlannerModalOpen, lessons, tasks, addStudyPlans, profile, settings, showToast, t } = useApp();

  const isAr = settings.language !== 'en';

  // Navigation tab within AI modal: 'planner' | 'chat' | 'flashcards' | 'health' | 'techniques'
  const [activeSubTab, setActiveSubTab] = useState<'planner' | 'chat' | 'flashcards' | 'health' | 'techniques'>('planner');

  // 1. Planner States
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [dailyHours, setDailyHours] = useState(3);
  const [planDays, setPlanDays] = useState<3 | 7 | 14 | 30>(3);
  const [studyTimeSlot, setStudyTimeSlot] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('afternoon');
  const [goal, setGoal] = useState<'regular' | 'exam_prep' | 'catch_up'>('regular');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<Omit<StudyPlanItem, 'id'>[] | null>(null);

  // 2. Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: isAr 
        ? 'أهلاً بك يا بطل! أنا مستشارك الذكي للمذاكرة 🤖📚.. اسألني عن أي مادة، طريقة لم المنهج، تنظيم الوقت مع الصلوات، حل مشكلة التراكمات أو خطة مراجعة الامتحانات وسأجيبك فوراً!'
        : 'Welcome! I am your AI Study Co-Pilot 🤖📚. Ask me anything about study schedules, exam prep, time management, or tackling tough subjects!',
      time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 3. Flashcards & Summaries States
  const [flashcardTopic, setFlashcardTopic] = useState('');
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([]);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [topicSummary, setTopicSummary] = useState<string[]>([]);

  // Initialize subjects from lessons
  useEffect(() => {
    if (isAIPlannerModalOpen) {
      const lessonSubjects = Array.from(new Set(lessons.map(l => l.subject).filter(Boolean)));
      if (lessonSubjects.length > 0) {
        setSubjects(lessonSubjects.map((s, idx) => ({
          name: s,
          difficulty: idx === 0 ? 'hard' : idx === 1 ? 'medium' : 'easy'
        })));
        setFlashcardTopic(lessonSubjects[0]);
      } else {
        setSubjects([
          { name: isAr ? 'الرياضيات والفيزياء' : 'Math & Physics', difficulty: 'hard' },
          { name: isAr ? 'اللغة الإنجليزية' : 'English', difficulty: 'easy' },
          { name: isAr ? 'الكيمياء' : 'Chemistry', difficulty: 'medium' },
        ]);
        setFlashcardTopic(isAr ? 'الفيزياء' : 'Physics');
      }
      setGeneratedPlan(null);
    }
  }, [isAIPlannerModalOpen, lessons, isAr]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  if (!isAIPlannerModalOpen) return null;

  // Speech synthesis toggle
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast(isAr ? 'المتصفح لا يدعم القراءة الصوتية' : 'Speech synthesis not supported', 'warning');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isAr ? 'ar-EG' : 'en-US';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectInput.trim()) return;
    setSubjects([...subjects, { name: newSubjectInput.trim(), difficulty: 'medium' }]);
    setNewSubjectInput('');
  };

  const handleRemoveSubject = (idx: number) => {
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const handleDifficultyChange = (idx: number, difficulty: 'hard' | 'medium' | 'easy') => {
    const updated = [...subjects];
    updated[idx].difficulty = difficulty;
    setSubjects(updated);
  };

  // Smart AI Plan Generator
  const handleGeneratePlan = () => {
    if (subjects.length === 0) return;
    setIsGenerating(true);
    setGeneratedPlan(null);

    setTimeout(() => {
      const plan: Omit<StudyPlanItem, 'id'>[] = [];
      const today = new Date();

      let baseHour = 16; // afternoon
      if (studyTimeSlot === 'morning') baseHour = 9;
      if (studyTimeSlot === 'evening') baseHour = 19;
      if (studyTimeSlot === 'night') baseHour = 21;

      const sessionDuration = 50; // 50 mins focus
      const breakDuration = 10;   // 10 mins break

      const sessionsPerDay = Math.min(6, Math.max(2, Math.round((dailyHours * 60) / (sessionDuration + breakDuration))));

      const sortedSubjects = [...subjects].sort((a, b) => {
        const order = { hard: 0, medium: 1, easy: 2 };
        return order[a.difficulty] - order[b.difficulty];
      });

      const arGoalTopics: Record<string, string[]> = {
        exam_prep: [
          'حل بنك الأسئلة ونماذج الامتحانات الشاملة 📝',
          'مراجعة وتلخيص أهم القوانين والمفاهيم الصعبة 💡',
          'حل مسائل وتدريبات مكثفة على النقاط الحرجة 🎯',
          'اختبار تجريبي سريع وتقييم نقاط الضعف ⏱️'
        ],
        catch_up: [
          'إنهاء المحاضرات المتراكمة وتلخيص الأساسيات ⚡',
          'حل الواجبات السابقة والتأكد من فهم القوانين 📚',
          'مراجعة الدروس الفائتة وحل تدريبات مباشرة 🚀'
        ],
        regular: [
          'مذاكرة المحاضرة الجديدة وتدوين الملاحظات 📖',
          'حل تدريبات وتمارين الكتاب المقررة ✏️',
          'تثبيت المفاهيم وتطبيق عملي أو أسئلة فهم 🧠',
          'مراجعة سريعة واسترجاع نشط 🌟'
        ]
      };

      const enGoalTopics: Record<string, string[]> = {
        exam_prep: [
          'Past papers & comprehensive test sets 📝',
          'Formulas memorization & core summary 💡',
          'Intense problem solving on tricky topics 🎯',
          'Timed mock test & self-evaluation ⏱️'
        ],
        catch_up: [
          'Catching up on missed lectures & summaries ⚡',
          'Completing overdue assignments & formulas 📚',
          'Fast-track review of previous chapters 🚀'
        ],
        regular: [
          'Lecture review & key concept note-taking 📖',
          'Textbook problems & exercises solving ✏️',
          'Reinforcement & active recall session 🧠',
          'Daily wrap-up review 🌟'
        ]
      };

      const topics = isAr ? arGoalTopics[goal] : enGoalTopics[goal];

      for (let dayOffset = 0; dayOffset < planDays; dayOffset++) {
        const planDate = new Date();
        planDate.setDate(today.getDate() + dayOffset);
        const dateStr = planDate.toISOString().split('T')[0];

        let currentH = baseHour;
        let currentM = 0;

        for (let sIdx = 0; sIdx < sessionsPerDay; sIdx++) {
          const subjectObj = sortedSubjects[(dayOffset * sessionsPerDay + sIdx) % sortedSubjects.length];
          const startTimeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;

          const endMinsTotal = currentH * 60 + currentM + sessionDuration;
          const endH = Math.floor(endMinsTotal / 60) % 24;
          const endM = endMinsTotal % 60;
          const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

          const topic = topics[sIdx % topics.length];
          const priority: TaskPriority = subjectObj.difficulty === 'hard' ? 'high' : subjectObj.difficulty === 'medium' ? 'medium' : 'low';

          plan.push({
            subject: subjectObj.name,
            title: `${subjectObj.name}: ${topic}`,
            date: dateStr,
            startTime: startTimeStr,
            endTime: endTimeStr,
            durationMinutes: sessionDuration,
            priority,
            completed: false,
          });

          const nextStartMins = endMinsTotal + breakDuration;
          currentH = Math.floor(nextStartMins / 60) % 24;
          currentM = nextStartMins % 60;
        }
      }

      setGeneratedPlan(plan);
      setIsGenerating(false);
      showToast(isAr ? 'تم توليد خطة المذاكرة الذكية بنجاح! 🚀' : 'AI Study Plan Generated! 🚀', 'success');
    }, 800);
  };

  const handleApplyPlan = () => {
    if (!generatedPlan || generatedPlan.length === 0) return;
    addStudyPlans(generatedPlan);
    setIsAIPlannerModalOpen(false);
  };

  // AI Flashcard & Summary Generator
  const handleGenerateFlashcards = () => {
    if (!flashcardTopic.trim()) return;
    setIsGeneratingFlashcards(true);
    setGeneratedFlashcards([]);
    setRevealedAnswers({});

    setTimeout(() => {
      const topic = flashcardTopic.trim();
      const summaryItems = isAr ? [
        `📌 **جوهر المادة (${topic}):** التركيز على القوانين والمفاهيم التأسيسية التي تتكرر بنسبة 80% في الامتحانات.`,
        `💡 **استراتيجية التثبيت:** قم بحل مسألتين تطبيقتين مباشرة بعد قراءة أي قانون نظري.`,
        `🎯 **أهم مواضع الأسئلة:** العلاقات البيانية، التعريفات الدقيقة، والتطبيقات الواقعية.`,
      ] : [
        `📌 **Core Concept (${topic}):** Focus on fundamental rules and high-yield exam principles.`,
        `💡 **Retention Tip:** Solve 2 practice questions immediately after reviewing each theorem.`,
        `🎯 **High-Yield Areas:** Key formulas, definitions, and real-world applications.`,
      ];

      const cards: Flashcard[] = isAr ? [
        {
          question: `ما هو أهم مبدأ أو قانون يجب تطبيقه أولاً في مسائل (${topic})؟`,
          answer: `تحديد المعطيات والمطلوب بوضوح، وكتابة القانون العام قبل التعويض بالأرقام لتجنب أخطاء الإشارات والوحدات.`,
          hint: `فكر في الخطوة الأولى التي تمنع خسارة درجات خطوات الحل.`
        },
        {
          question: `كيف تميز بين الحالات الخاصة والاستثناءات في درس (${topic})؟`,
          answer: `عن طريق رسم مخطط ذهني (Mind Map) يربط القاعدة العامة بفروع الاستثناءات مع مثال عملي لكل حالة.`,
          hint: `استخدم الخرائط الذهنية والألوان للتمييز.`
        },
        {
          question: `ما هي أفضل طريقة لتلخيص هذا الفصل قبل ليلة الامتحان؟`,
          answer: `كتابة ورقة واحدة فقط (Cheat Sheet) تحوي القوانين والملاحظات الحرجة بخط يدك مع مراجعتها صباح الامتحان.`,
          hint: `ملخص الورقة الواحدة المركزة.`
        }
      ] : [
        {
          question: `What is the core rule to apply first in (${topic}) problems?`,
          answer: `Identify given variables and target outputs, then state the fundamental theorem before numeric substitution.`,
          hint: `Think of step-by-step scoring rubric.`
        },
        {
          question: `How to remember edge cases in (${topic})?`,
          answer: `Create a visual comparison table highlighting exceptions with one concrete example per case.`,
          hint: `Use mind maps and diagrams.`
        },
        {
          question: `Best last-minute revision protocol for (${topic})?`,
          answer: `Construct a 1-page condensed cheat sheet of essential formulas and review it right before sleep.`,
          hint: `Single-page synthesis.`
        }
      ];

      setTopicSummary(summaryItems);
      setGeneratedFlashcards(cards);
      setIsGeneratingFlashcards(false);
      showToast(isAr ? 'تم توليد الملخص والبطاقات الذكية! 🗂️' : 'AI Flashcards Generated! 🗂️', 'success');
    }, 700);
  };

  // AI Chat Handler with deep academic reasoning & conversational intelligence
  const handleSendChatMessage = (messageText?: string) => {
    const textToSend = messageText || chatInput;
    if (!textToSend.trim()) return;

    const trimmed = textToSend.trim();
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      let aiReply = '';
      const q = trimmed.toLowerCase();

      // 1. Short letters, greetings, or tests (e.g. "ر", "هلا", "ازيك", "hi", "test", etc.)
      if (trimmed.length <= 3 || q.includes('ازيك') || q.includes('مرحبا') || q.includes('سلام') || q.includes('هلا') || q.includes('hello') || q.includes('hi') || q.includes('hey')) {
        aiReply = isAr
          ? `أهلاً وسهلاً بيك يا بطل! 🎓 أنا مستشارك ورفيقك الدراسي الذكي في **«يسطا ذاكر»**.\n\nأقدر أساعدك في:\n• 📅 **توليد جدول مذاكرة ذكي** يوزع وقتك على موادك.\n• ⚡ **خطة عملية للتغلب على التراكمات** وإنقاذ المواد.\n• 📐 **شرح واستراتيجيات لأي مادة** (رياضيات، فيزياء، كيمياء، لغات، إلخ).\n• 🧠 **طرق حفظ القوانين والمعادلات** بدون نسيان.\n• 🕌 **تنظيم أوقات المذاكرة مع الصلوات الخمس** والراحة.\n\nقولي بتذاكر إيه دلوقتي أو إيه المشكلة اللي بتواجهك وهديك الحل فوراً! 🚀`
          : `Hello champ! 🎓 I am your AI Study Advisor at **Yasta Zakir**.\n\nI can help you with:\n• 📅 **Generating custom study timetables** balanced with prayer times.\n• ⚡ **Step-by-step backlog clearance protocols**.\n• 📐 **Subject mastery strategies** (Math, Physics, Chemistry, Languages, etc.).\n• 🧠 **Active Recall & long-term formula memorization**.\n• 🎯 **Overcoming exam stress and procrastination**.\n\nTell me what subject or challenge you're working on, and let's conquer it! 🚀`;
      }
      // 2. Math & Calculations
      else if (q.includes('رياض') || q.includes('جبر') || q.includes('هندس') || q.includes('تفاضل') || q.includes('تكامل') || q.includes('math') || q.includes('calculus') || q.includes('algebra')) {
        aiReply = isAr
          ? `📐 **روشتة التفوق وتقفيل مادة الرياضيات:**\n\n1. **افهم أصل القانون قبل الحفظ:** اعرف القانون جه منين وإيه الشروط اللي بيتطبق فيها عشان متتلخبطش في المسائل غير المباشرة.\n2. **حل بإيدك مش بعينك:** أكبر فخ في الرياضة هو قراءة الحل بالنظر! امسك ورقة وقلم وابدأ حل المسألة لحد الناتج النهائي بنفسك.\n3. **كشكول الأفكار الثقيلة:** كل مسألة وقفت قدامك، انقل فكرتها في كشكول مخصص وراجعها أسبوعياً.\n4. **الخطوات بتجيب درجات:** حتى لو الناتج النهائي فيه غلطة، خطواتك المنظمة وترتيب المعطيات بيضمنلك 80% من درجة السؤال!`
          : `📐 **Mastering Mathematics & Calculus:**\n\n1. **Understand derivations:** Know why a theorem works before memorizing formulas.\n2. **Active Problem Solving:** Never read math passively. Always work out solutions with pen and paper.\n3. **Mistake Log:** Keep a notebook dedicated to challenging problem archetypes.\n4. **Structured Working:** Show clear intermediate steps for maximum exam credit!`;
      }
      // 3. Physics
      else if (q.includes('فيزيا') || q.includes('physics')) {
        aiReply = isAr
          ? `⚡ **أسرار التفوق في مادة الفيزياء:**\n\n1. **تخيل الظاهرة الفيزيائية:** الفيزياء علم بيوصف الكون، اتخيل حركة الإلكترونات أو مسار القوى كأنك بتشوفها في الحقيقة.\n2. **وحدات القياس والتحويلات:** 30% من درجات المسائل بتضيع بسبب التحويلات (من cm لـ m أو من دقيقة لثانية). اتأكد من وحدات النظام الدولي (SI).\n3. **الرسومات البيانية والميل (Slope):** في كل قانون، اعرف العلاقة الطردية والعكسية ودلالة الميل الفيزيائي والرياضي.\n4. **استخدم ورقة القوانين (Formula Sheet):** لخص قوانين كل فصل في صفحة واحدة وراجعها قبل النوم!`
          : `⚡ **Physics Mastery Protocol:**\n\n1. **Visualize the physical phenomenon:** Understand the real-world intuition before diving into equations.\n2. **SI Units & Conversions:** Watch out for unit consistency across all equations.\n3. **Graph Analysis:** Master determining the physical meaning of slopes and intercepts.\n4. **Formula Synthesis:** Condense each chapter into a single formula overview sheet!`;
      }
      // 4. Chemistry & Biology
      else if (q.includes('كيميا') || q.includes('أحياء') || q.includes('احياء') || q.includes('chem') || q.includes('bio')) {
        aiReply = isAr
          ? `🧪 **دليل تقفيل الكيمياء والأحياء:**\n\n1. **شروط التفاعلات والمعادلات:** اكتب المعادلة الكيميائية موزونة 3 مرات مع كتابة شروط التفاعل (حرارة، ضغط، عوامل حفازة).\n2. **جداول مقارنة الألوان والرواسب:** اجمع كل الرواسب والغازات والهرمونات في جدول مقارنة بصري لتسهيل التمييز.\n3. **الرسومات التخطيطية (في الأحياء):** اعرف كل بيان على الرسم ودوره ووظيفته في الكائن الحي.\n4. **حل أسئلة الفهم (MCQ):** ركز على أسئلة ماذا يحدث لو؟ وما الهرمون/المركب المسؤول؟`
          : `🧪 **Chemistry & Biology High-Yield Strategies:**\n\n1. **Balanced Equations & Catalysts:** Practice writing balanced reaction mechanisms with temperature/pressure conditions.\n2. **Visual Comparison Tables:** Create color/precipitate charts for quick memorization.\n3. **Diagram Mastery:** In biology, label structures and memorize each organelle/hormone mechanism.\n4. **Conceptual MCQs:** Focus on cause-and-effect reasoning questions!`;
      }
      // 5. Backlog & Catch up
      else if (q.includes('تراكم') || q.includes('ألم') || q.includes('المتراكم') || q.includes('متأخر') || q.includes('catch up') || q.includes('backlog')) {
        aiReply = isAr
          ? `📋 **خطة إنقاذ التراكمات في 5 خطوات عملية ومجربة:**\n\n1. **قاعدة الـ 80/20:** 80% من درجات الامتحان تأتي من 20% من أهم دروس المنهج (ركز على الأساسيات أولاً).\n2. **جلسات 50/10:** ذاكر 50 دقيقة تركيز تام بدون موبايل + 10 دقائق استراحة.\n3. **حل أسئلة قبل أن تحفظ:** ابدأ بحل أسئلة الامتحانات السابقة لتكتشف مواضع الأسئلة فوراً.\n4. **تجنب المثالية المفرطة:** إنهاء 70% من المنهج بفهم حقيقي أفضل 100 مرة من تأجيل كل شيء!\n5. **ابدأ الآن بأول درس لمدة 25 دقيقة فقط وسترى انطلاقة مذهلة!** 💪`
          : `📋 **5-Step Backlog Clearance Protocol:**\n\n1. **80/20 Rule:** Focus on high-yield chapters first.\n2. **50/10 Pomodoro:** 50 minutes deep focus + 10 minutes break.\n3. **Active Practice:** Test yourself with past exam questions.\n4. **Avoid perfectionism:** 70% completed with clarity beats zero!\n5. **Start right now with 25 minutes!** 💪`;
      }
      // 6. Schedule & Time Management
      else if (q.includes('جدول') || q.includes('خطة') || q.includes('تنظيم') || q.includes('وقت') || q.includes('plan') || q.includes('schedule') || q.includes('time')) {
        aiReply = isAr
          ? `📅 **كيف تبني جدول مذاكرة يشتغل بجد وماتملش منه؟**\n\n1. **نظام البلوكات (Time Blocking):** قسّم يومك لـ 3 فترات رئيسية (الصباح بعد الفجر، بعد العصر، والمساء).\n2. **ابدأ بالمادة الأثقل أولاً:** لما تكون طاقتك الذهنية في أعلى مستوياتها في بداية اليوم.\n3. **استخدم مولد الجداول الذكي في التطبيق:** ادخل على تبويب **"مولد الجداول 📅"** بالأعلى، وحدد موادك وهينشئ لك جدول متوازن تقدر تضيفه لمهامك بضغطة زر واحدة! 🚀`
          : `📅 **Designing a Realistic & Sustainable Study Schedule:**\n\n1. **Time-Blocking:** Divide your day into 3 distinct focus windows.\n2. **Eat the Frog First:** Tackle your hardest subject during peak morning energy.\n3. **Use the In-App AI Timetable Generator:** Switch to the **Timetable tab 📅** above to generate a sprint you can inject directly into your tasks! 🚀`;
      }
      // 7. Prayer & Focus Balance
      else if (q.includes('صلاة') || q.includes('صلاه') || q.includes('prayer') || q.includes('دين') || q.includes('بركة')) {
        aiReply = isAr
          ? `🕌 **كيف تنظم وقتك مع الصلوات الخمس بذكاء وبركة؟**\n\n1. **اجعل الصلوات محطات راحة وتجديد طاقة:** قسّم جلساتك حول الصلوات (بين الفجر والظهر، بين الظهر والعصر، وبعد العشاء).\n2. **بركة الفجر الذهبية:** جلسة المذاكرة بعد الفجر تعادل 3 أضعاف التركيز في أي وقت آخر.\n3. **الوضوء ينعش الدماغ:** عند الشعور بالخمول، توضأ وصلي ركعتين لتنشيط الدورة الدموية واستعادة التركيز الذهني! ✨`
          : `🕌 **Optimizing Study Blocks Around Prayers:**\n\n1. **Use prayers as natural reset intervals:** Divide your day into 4 focused blocks.\n2. **Early Morning Clarity:** The post-Fajr session offers 3x retention.\n3. **Physical Reset:** A brief prayer break restores cognitive focus for your next session! ✨`;
      }
      // 8. Memorization & Formulas
      else if (q.includes('حفظ') || q.includes('نسيان') || q.includes('قوانين') || q.includes('تثبيت') || q.includes('memoriz') || q.includes('remember') || q.includes('forget')) {
        aiReply = isAr
          ? `🧠 **استراتيجية التثبيت السريع وعدم النسيان (Active Recall):**\n\n1. **طريقة الورقة البيضاء:** بعد قراءة الدرس، أغلق الكتاب واكتب على ورقة بيضاء كل ما تتذكره ثم راجع النواقص.\n2. **تقنية فاينمان:** اشرح المعلومة أو القانون لزميلك أو لنفسك بصوت مسموع وبأبسط أسلوب.\n3. **المراجعة المتباعدة:** راجع الدرس بعد يوم، ثم بعد 3 أيام، ثم بعد أسبوع لتثبيته في الذاكرة الدائمة! 💡`
          : `🧠 **Active Recall & Long-Term Memory Protocol:**\n\n1. **Blank Sheet Method:** Close the notes and write what you recall from memory.\n2. **Feynman Technique:** Teach the concept out loud in plain words.\n3. **Spaced Repetition:** Review at 1-day, 3-day, and 7-day intervals for permanent retention! 💡`;
      }
      // 9. Exams & Stress
      else if (q.includes('امتحان') || q.includes('خوف') || q.includes('توتر') || q.includes('قلق') || q.includes('exam') || q.includes('stress')) {
        aiReply = isAr
          ? `⚡ **روشتة ليلة الامتحان والتغلب على التوتر:**\n\n1. **النوم 7 ساعات:** النوم هو الذي ينقل المعلومات للذاكرة الدائمة؛ السهر يفقدك 40% من صفائك الذهني.\n2. **مراجعة الملخصات والقوانين فقط:** تجنب فتح دروس جديدة تماماً ليلة الامتحان.\n3. **حل امتحان شامل مع مؤقت زمني:** لتعويد عقلك على أجواء اللجنة وضغط الوقت.\n4. **التوكل والدعاء:** *"اللهم لا سهل إلا ما جعلته سهلاً وأنت تجعل الحزن إذا شئت سهلاً"* 🤲`
          : `⚡ **Exam Night Survival & Stress Protocol:**\n\n1. **7 Hours Sleep:** Sleep consolidates memories into long-term storage.\n2. **Review summaries only:** Avoid starting completely new topics the night before.\n3. **Timed Mock Test:** Accustoms your brain to exam conditions.\n4. **Stay confident & pray!** 🤲`;
      }
      // 10. Default General Intelligent Advice
      else {
        aiReply = isAr
          ? `🌟 **إليك خطة العمل الأفضل لـ (${trimmed}):**\n\n1. **الخطوة الأولى (الفهم والأساسيات):** ابدأ بقراءة المفاهيم الرئيسية واستيعاب الفكرة العامة قبل الغوص في التفاصيل.\n2. **الخطوة الثانية (التطبيق والتدريب):** قم بحل مسألتين أو تمرينين فوراً لتثبيت المعلومة في الذاكرة الحركية.\n3. **الخطوة الثالثة (التقييم الذاتي):** افتح تبويب **"بطاقات المراجعة 🗂️"** بالأعلى لتوليد بطاقات أسئلة ذكية تختبر نفسك بها.\n4. **نصيحة إضافية:** خذ استراحة 5 دقائق كل 25 دقيقة للحفاظ على أعلى مستويات التركيز! 🚀`
          : `🌟 **Action Plan for (${trimmed}):**\n\n1. **Core Fundamentals:** Review the high-level outline and key concepts before deep details.\n2. **Active Application:** Solve 2 practice exercises immediately to reinforce motor memory.\n3. **Self-Assessment:** Use the **Flashcards tab 🗂️** above to auto-generate quick revision cards.\n4. **Productivity Tip:** Take a 5-minute break every 25 minutes to maintain peak focus! 🚀`;
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 600);
  };

  // Academic Health & Readiness Calculation
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length || 1;
  const taskCompletionRate = Math.round((completedTasksCount / totalTasksCount) * 100);
  const streakScore = Math.min(100, (profile.streakDays || 1) * 15);
  const readinessScore = Math.min(100, Math.round((taskCompletionRate * 0.6) + (streakScore * 0.4)));

  const quickPrompts = isAr ? [
    '🚀 إزاي ألم المنهج في أسبوع؟',
    '⏰ إزاي أنظم وقتي مع الصلاة؟',
    '🧠 طريقة حفظ القوانين الصعبة',
    '⚡ نصائح ليلة الامتحان والتركيز',
    '🌙 تنظيم النوم والتغلب على الكسل',
  ] : [
    '🚀 How to catch up in 1 week?',
    '⏰ Balancing study with prayers?',
    '🧠 Memorizing formulas easily',
    '⚡ Exam night focus strategy',
    '🌙 Sleep schedule & energy tips',
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            if (isSpeaking && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
            }
            setIsAIPlannerModalOpen(false);
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-4xl transform rounded-3xl p-5 sm:p-7 shadow-2xl relative border my-auto max-h-[90vh] flex flex-col overflow-hidden text-start"
          style={{
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-color)',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => {
              if (isSpeaking && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }
              setIsAIPlannerModalOpen(false);
            }}
            className={`absolute top-5 ${isAr ? 'left-5' : 'right-5'} p-2 rounded-full hover:bg-slate-700/40 transition-colors z-20`}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 text-white shadow-xl shadow-indigo-500/25 flex items-center justify-center shrink-0">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                  <span>{isAr ? 'منظومة الذكاء الاصطناعي للدراسة والتفوق 🚀' : 'AI Study & Academic Intelligence Hub 🚀'}</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr ? 'توليد جداول ذكية، كروت مراجعة، استشارات فورية، ومؤشر الجاهزية' : 'Smart timetable, flashcards, AI advice, and academic health analysis'}
                </p>
              </div>
            </div>

            {/* Sub Tabs Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-900/70 border border-slate-800 self-start sm:self-center gap-1 overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActiveSubTab('planner')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'planner'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isAr ? 'مولّد الجداول' : 'Planner'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('chat')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isAr ? 'استشر المساعد 💬' : 'Ask AI 💬'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('flashcards')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'flashcards'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'بطاقات وملخصات 🗂️' : 'Flashcards 🗂️'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('health')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'health'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'مؤشر الجاهزية 📊' : 'Readiness 📊'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('techniques')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'techniques'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>{isAr ? 'طرق المذاكرة 💡' : 'Methods 💡'}</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Smart Timetable Generator */}
          {activeSubTab === 'planner' && (
            <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-5">
              {!generatedPlan ? (
                <div className="space-y-5">
                  
                  {/* Target Goal Presets */}
                  <div>
                    <label className="block text-xs font-bold mb-2 text-slate-300">
                      {isAr ? '🎯 الهدف الدراسي الحالي' : '🎯 Study Objective'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setGoal('regular')}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all text-start ${
                          goal === 'regular'
                            ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500 shadow-md'
                            : 'border-slate-700/60 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{isAr ? 'مذاكرة يومية منتظمة' : 'Regular Study'}</span>
                        </div>
                        <span className="text-[10px] font-normal text-slate-400 block">
                          {isAr ? 'تثبيت الدروس وحل الواجبات أولاً بأول' : 'Consistent daily pace & assignments'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGoal('exam_prep')}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all text-start ${
                          goal === 'exam_prep'
                            ? 'border-rose-500 bg-rose-600/20 text-rose-300 ring-1 ring-rose-500 shadow-md'
                            : 'border-slate-700/60 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Flame className="w-3.5 h-3.5 text-rose-400" />
                          <span>{isAr ? 'مراجعة امتحانات مكثفة' : 'Exam Sprint'}</span>
                        </div>
                        <span className="text-[10px] font-normal text-slate-400 block">
                          {isAr ? 'حل نماذج واختبارات وتلخيص قوانين' : 'Past papers & intense summaries'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGoal('catch_up')}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all text-start ${
                          goal === 'catch_up'
                            ? 'border-amber-500 bg-amber-600/20 text-amber-300 ring-1 ring-amber-500 shadow-md'
                            : 'border-slate-700/60 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isAr ? 'إنهاء التراكمات' : 'Catch Up'}</span>
                        </div>
                        <span className="text-[10px] font-normal text-slate-400 block">
                          {isAr ? 'سد الفجوات وإنهاء الفصول المتأخرة' : 'Clear backlogs & missed chapters'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Subjects and Difficulties */}
                  <div>
                    <label className="block text-xs font-bold mb-2 text-slate-300 flex items-center justify-between">
                      <span>{isAr ? '📚 المواد ومستوى صعوبتها' : '📚 Subjects & Difficulty Level'} ({subjects.length})</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {isAr ? 'المواد الصعبة تأخذ أولوية في أوقات قمة التركيز' : 'Harder subjects scheduled first'}
                      </span>
                    </label>

                    {/* Add subject bar */}
                    <form onSubmit={handleAddSubject} className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newSubjectInput}
                        onChange={e => setNewSubjectInput(e.target.value)}
                        placeholder={isAr ? 'أضف مادة إضافية...' : 'Add another subject...'}
                        className="flex-1 px-3.5 py-2.5 rounded-2xl border text-xs focus:outline-none"
                        style={{
                          background: 'var(--input-bg)',
                          borderColor: 'var(--card-border)',
                          color: 'var(--text-color)',
                        }}
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إضافة' : 'Add'}</span>
                      </button>
                    </form>

                    {/* Subjects list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {subjects.map((sub, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-between gap-2"
                        >
                          <span className="text-xs font-bold truncate max-w-[140px]">{sub.name}</span>
                          
                          <div className="flex items-center gap-1">
                            <select
                              value={sub.difficulty}
                              onChange={e => handleDifficultyChange(idx, e.target.value as any)}
                              className="px-2 py-1 rounded-xl text-[10px] font-bold border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none"
                            >
                              <option value="hard">{isAr ? '🔥 صعبة' : 'Hard'}</option>
                              <option value="medium">{isAr ? '⚡ متوسطة' : 'Medium'}</option>
                              <option value="easy">{isAr ? '☕ سهلة' : 'Easy'}</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(idx)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Daily Hours, Duration, Preferred Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Hours Slider */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800">
                      <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isAr ? `ساعات المذاكرة: ${dailyHours} س` : `Daily Hours: ${dailyHours}h`}</span>
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={8}
                        value={dailyHours}
                        onChange={e => setDailyHours(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer mt-2"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
                        <span>1h</span>
                        <span>4h</span>
                        <span>8h</span>
                      </div>
                    </div>

                    {/* Days Span */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800">
                      <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{isAr ? 'مدة الخطة' : 'Plan Duration'}</span>
                      </label>
                      <div className="grid grid-cols-4 gap-1 mt-1">
                        {[
                          { days: 3, labelAr: '3 أيام', labelEn: '3D' },
                          { days: 7, labelAr: 'أسبوع', labelEn: '7D' },
                          { days: 14, labelAr: '14 يوم', labelEn: '14D' },
                          { days: 30, labelAr: 'شهر', labelEn: '30D' },
                        ].map(item => (
                          <button
                            key={item.days}
                            type="button"
                            onClick={() => setPlanDays(item.days as any)}
                            className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                              planDays === item.days
                                ? 'border-indigo-500 bg-indigo-600/30 text-indigo-300'
                                : 'border-slate-700/60 bg-slate-800/40 text-slate-400'
                            }`}
                          >
                            {isAr ? item.labelAr : item.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Study Time Slot */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800">
                      <label className="block text-xs font-bold mb-1.5 text-slate-300">
                        {isAr ? 'الفترة الزمنية المفضلة' : 'Preferred Study Time'}
                      </label>
                      <select
                        value={studyTimeSlot}
                        onChange={e => setStudyTimeSlot(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border text-xs font-bold mt-1 focus:outline-none"
                        style={{
                          background: 'var(--input-bg)',
                          borderColor: 'var(--card-border)',
                          color: 'var(--text-color)',
                        }}
                      >
                        <option value="morning">{isAr ? '🌅 صباحاً (09:00 ص)' : 'Morning (09:00 AM)'}</option>
                        <option value="afternoon">{isAr ? '☀️ بعد الظهر (04:00 م)' : 'Afternoon (04:00 PM)'}</option>
                        <option value="evening">{isAr ? '🌙 مساءً (07:00 م)' : 'Evening (07:00 PM)'}</option>
                        <option value="night">{isAr ? '🌌 ليلي (09:00 م)' : 'Night Owl (09:00 PM)'}</option>
                      </select>
                    </div>

                  </div>

                  {/* Generate Plan Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isGenerating || subjects.length === 0}
                      onClick={handleGeneratePlan}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{isAr ? 'جاري حساب وتوزيع الجلسات مع فترات الراحة...' : 'Generating optimal study sessions...'}</span>
                        </div>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>{isAr ? 'توليد وتوزيع جدول المذاكرة الذكي ✨' : 'Generate Smart Study Timetable ✨'}</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              ) : (
                /* Generated Plan Result View */
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
                    <div>
                      <h3 className="text-base font-black flex items-center gap-2 text-indigo-300">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>{t('generatedPlanTitle')} ({generatedPlan.length} {isAr ? 'جلسات مذاكرة' : 'sessions'})</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAr 
                          ? 'تم جدولة المواد مع فترات راحة 10 دقائق بعد كل 50 دقيقة تركيز'
                          : 'Optimized 50m study + 10m pause intervals'}
                      </p>
                    </div>

                    <button
                      onClick={() => setGeneratedPlan(null)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 p-2 rounded-xl bg-slate-800/60 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تعديل المعايير' : 'Re-adjust'}</span>
                    </button>
                  </div>

                  {/* Sessions Timeline Cards */}
                  <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                    {generatedPlan.map((session, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between gap-3 text-xs hover:border-indigo-500/50 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-indigo-300 text-sm">{session.subject}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold">
                              {session.date}
                            </span>
                            {session.priority === 'high' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold">
                                {isAr ? 'أولوية عالية 🔥' : 'High Priority'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-1 font-medium">{session.title}</p>
                        </div>

                        <div className="text-end shrink-0">
                          <span className="text-amber-400 font-black flex items-center gap-1 dir-ltr">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{session.startTime} - {session.endTime}</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">({session.durationMinutes} {isAr ? 'دقيقة' : 'mins'})</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Apply Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isAr ? 'جاهز للتطبيق في جدولك بنقرة واحدة' : 'Ready to inject into your Task list'}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setGeneratedPlan(null)}
                        className="px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-slate-700/40"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        onClick={handleApplyPlan}
                        className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('applyPlanToTasks')}</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* Tab 2: AI Study Advisor Chat */}
          {activeSubTab === 'chat' && (
            <div className="flex flex-col flex-1 overflow-hidden py-3 space-y-3">
              
              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendChatMessage(prompt)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700 text-xs font-semibold whitespace-nowrap text-slate-300 hover:text-white transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 max-h-[360px]">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed relative group ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => speakText(msg.text)}
                          className="mt-2 text-[10px] text-indigo-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-950/50 border border-indigo-500/30"
                          title="استمع للشرح الصوتي"
                        >
                          {isSpeaking ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
                          <span>{isSpeaking ? (isAr ? 'إيقاف الصوت' : 'Stop') : (isAr ? '🔊 استمع للشرح' : 'Listen')}</span>
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 w-32 text-xs text-indigo-400">
                    <span className="animate-pulse">يكتب الرد الآن...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={isAr ? 'اكتب سؤالك هنا: إزاي أذاكر، أعمل جدول، أو أحل مشكلة معينة...' : 'Ask AI advisor for study advice...'}
                  className="flex-1 px-4 py-3 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-color)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Tab 3: Flashcards & Summaries */}
          {activeSubTab === 'flashcards' && (
            <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'اختر أو اكتب موضوع الدرس لتوليد كروت الاختبار والملخص الذكي:' : 'Enter topic for AI Flashcards:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={flashcardTopic}
                    onChange={e => setFlashcardTopic(e.target.value)}
                    placeholder={isAr ? 'مثال: قوانين نيوتن، التفاضل والتكامل، قواعد النحو...' : 'e.g. Newton Laws, Calculus...'}
                    className="flex-1 px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
                  />
                  <button
                    onClick={handleGenerateFlashcards}
                    disabled={isGeneratingFlashcards || !flashcardTopic.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-lg flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingFlashcards ? (isAr ? 'جاري التحليل...' : 'Generating...') : (isAr ? 'توليد الكروت 🗂️' : 'Generate Cards')}</span>
                  </button>
                </div>
              </div>

              {topicSummary.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                  <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" />
                    <span>{isAr ? 'الخلاصة الذهبية للموضوع' : 'Key Takeaways'}</span>
                  </h4>
                  <div className="space-y-1 text-xs text-slate-300">
                    {topicSummary.map((item, idx) => (
                      <p key={idx} className="leading-relaxed">{item}</p>
                    ))}
                  </div>
                </div>
              )}

              {generatedFlashcards.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'كروت المراجعة الذاتية (اضغط لإظهار الإجابة والتأكد)' : 'Interactive Flashcards'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {generatedFlashcards.map((card, idx) => {
                      const isRevealed = revealedAnswers[idx];
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 flex flex-col justify-between min-h-[160px] relative transition-all hover:border-indigo-500/50"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 mb-2 inline-block">
                              {isAr ? `سؤال ${idx + 1}` : `Q${idx + 1}`}
                            </span>
                            <p className="text-xs font-bold text-slate-200 mb-2">{card.question}</p>
                            
                            {isRevealed && (
                              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 mt-2 font-medium">
                                <span className="font-bold text-emerald-400 block mb-0.5">{isAr ? 'الإجابة النموذجية:' : 'Answer:'}</span>
                                {card.answer}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            className="mt-3 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-indigo-400" />}
                            <span>{isRevealed ? (isAr ? 'إخفاء الإجابة' : 'Hide Answer') : (isAr ? 'إظهار الإجابة' : 'Reveal Answer')}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: AI Academic Health & Readiness */}
          {activeSubTab === 'health' && (
            <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold mb-2">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تحليل الأداء بالذكاء الاصطناعي' : 'AI Performance Diagnostics'}</span>
                  </div>
                  <h3 className="text-xl font-black text-white">{isAr ? 'مؤشر الجاهزية الأكاديمية العام' : 'Academic Readiness Score'}</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-md">
                    {readinessScore >= 80 
                      ? (isAr ? 'أداؤك استثنائي وفي قمة التركيز! استمر بنفس العزيمة وستحقق الامتياز بإذن الله.' : 'Outstanding performance! Keep this pace for top honors.')
                      : (isAr ? 'مستواك جيد ويحتاج لإنهاء المهام المتبقية للحفاظ على استمرارية التتابع والتفوق.' : 'Good consistency. Finish remaining tasks to boost your score!')}
                  </p>
                </div>

                {/* Circular Score Badge */}
                <div className="w-24 h-24 rounded-full bg-slate-950 border-4 border-indigo-500/80 flex flex-col items-center justify-center shadow-xl shadow-indigo-500/20 shrink-0">
                  <span className="text-2xl font-black text-emerald-400">{readinessScore}%</span>
                  <span className="text-[10px] text-slate-400 font-bold">{isAr ? 'الجاهزية' : 'Readiness'}</span>
                </div>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <span className="text-xs text-slate-400">{isAr ? 'نسبة إنجاز الواجبات والمهام' : 'Task Completion'}</span>
                  <p className="text-xl font-black text-indigo-400 mt-1">{taskCompletionRate}%</p>
                  <span className="text-[10px] text-slate-500 font-medium">({completedTasksCount} / {totalTasksCount} {isAr ? 'مهام مكتملة' : 'tasks'})</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <span className="text-xs text-slate-400">{isAr ? 'أيام الاستمرارية والتتابع' : 'Study Streak'}</span>
                  <p className="text-xl font-black text-rose-400 mt-1">{profile.streakDays || 1} {isAr ? 'أيام 🔥' : 'Days'}</p>
                  <span className="text-[10px] text-slate-500 font-medium">{isAr ? 'معدل الالتزام اليومي ممتاز' : 'Great daily focus'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <span className="text-xs text-slate-400">{isAr ? 'نقاط الخبرة التراكمية' : 'Total XP Earned'}</span>
                  <p className="text-xl font-black text-purple-400 mt-1">{profile.xpPoints || 0} XP</p>
                  <span className="text-[10px] text-slate-500 font-medium">{isAr ? 'تزداد مع كل صلاة ومهمة' : 'Boosts with every task'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Study Techniques & Cheat Sheets */}
          {activeSubTab === 'techniques' && (
            <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* 1. Feynman Technique */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? '1. تقنية فاينمان (The Feynman Technique)' : '1. The Feynman Technique'}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr 
                      ? 'اقرأ المفهوم ثم اشرحه بصوتك بأسلوب مبسط جداً كأنك تشرحه لطفل عمره 10 سنوات. النقاط التي تعجز عن تبسيطها هي نقاط ضعفك الحقيقية.'
                      : 'Teach the concept in plain simple language as if explaining to a 10-year old. Gaps in your explanation highlight what you need to review.'}
                  </p>
                </div>

                {/* 2. Active Recall */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>{isAr ? '2. الاسترجاع النشط (Active Recall)' : '2. Active Recall Protocol'}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr 
                      ? 'أغلق الكتاب فوراً وحاول استخراج المعلومة من ذاكرتك بكتابتها على ورقة بيضاء. إجبار المخ على التذكر يقوي الوصلات العصبية بنسبة 300%.'
                      : 'Close the book and retrieve facts directly from memory. Active retrieval builds 300% stronger neural connections than passive re-reading.'}
                  </p>
                </div>

                {/* 3. Spaced Repetition */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? '3. التكرار المتباعد (Spaced Repetition)' : '3. Spaced Repetition'}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr 
                      ? 'منحنى النسيان ينخفض بنسبة 70% بعد 24 ساعة. راجع الدرس في: اليوم الأول (10 د)، اليوم الثالث (5 د)، اليوم السابع (3 د) ليبقى في الذاكرة الدائمة.'
                      : 'Combat the forgetting curve by reviewing at structured intervals: Day 1 (10m), Day 3 (5m), Day 7 (3m).'}
                  </p>
                </div>

                {/* 4. Pomodoro 50/10 */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>{isAr ? '4. نظام 50/10 للتركيز العميق' : '4. Academic 50/10 Flow'}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr 
                      ? '50 دقيقة تركيز خالص بدون إشعارات أو تشتيت، تليها 10 دقائق راحة ووضوء وصلاة. هذا النمط يحافظ على مستوى طاقتك طوال اليوم دون إرهاق.'
                      : '50 minutes uninterrupted focus followed by a 10-minute movement or prayer pause.'}
                  </p>
                </div>

              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

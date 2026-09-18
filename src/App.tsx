import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, 
  Code2, 
  Coins, 
  Library, 
  Network, 
  Send, 
  Terminal, 
  ChevronRight, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Search,
  Zap,
  Cpu,
  Database,
  ShieldCheck,
  History,
  Eye,
  Rocket,
  Clock,
  Upload,
  FileText,
  X,
  Link2,
  RefreshCw,
  User,
  Bot,
  Info,
  HelpCircle
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { askPilot, PilotModule, PilotResponse } from '@/src/lib/gemini';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const MODULES: { id: PilotModule; name: string; icon: any; description: string; color: string }[] = [
  { 
    id: 'code', 
    name: 'Code Architect', 
    icon: Code2, 
    description: 'Analyze files & queries to generate Snowflake logic.',
    color: 'text-indigo-500'
  },
  { 
    id: 'drift', 
    name: 'Drift Watchdog', 
    icon: Activity, 
    description: 'Analyze data files for ML health & drift.',
    color: 'text-blue-500'
  },
  { 
    id: 'finops', 
    name: 'FinOps Advisor', 
    icon: Coins, 
    description: 'Analyze scripts for cost & credit optimization.',
    color: 'text-emerald-500'
  },
  { 
    id: 'scheduler', 
    name: 'Intelligent Scheduler', 
    icon: Clock, 
    description: 'Analyze query history for training schedules.',
    color: 'text-cyan-500'
  },
  { 
    id: 'librarian', 
    name: 'Librarian', 
    icon: Library, 
    description: 'Analyze feature files for deduplication.',
    color: 'text-amber-500'
  },
  { 
    id: 'schema', 
    name: 'Schema Contractor', 
    icon: ShieldCheck, 
    description: 'Analyze schemas for quality gates & contracts.',
    color: 'text-rose-500'
  },
  { 
    id: 'experiment', 
    name: 'Experiment Tracker', 
    icon: History, 
    description: 'Analyze runs for hyperparameter comparison.',
    color: 'text-orange-500'
  },
  { 
    id: 'explain', 
    name: 'Explainability Layer', 
    icon: Eye, 
    description: 'Analyze model files for SHAP explainability.',
    color: 'text-sky-500'
  },
  { 
    id: 'promotion', 
    name: 'DevOps Engine', 
    icon: Rocket, 
    description: 'Analyze CI/CD files for model promotion.',
    color: 'text-violet-500'
  },
  { 
    id: 'integrator', 
    name: 'External Integrator', 
    icon: Network, 
    description: 'Analyze ETL files for zero-copy integration.',
    color: 'text-purple-500'
  },
];

const MOCK_DRIFT_DATA = [
  { name: 'Mon', drift: 0.02, accuracy: 0.95 },
  { name: 'Tue', drift: 0.03, accuracy: 0.94 },
  { name: 'Wed', drift: 0.08, accuracy: 0.91 },
  { name: 'Thu', drift: 0.15, accuracy: 0.85 },
  { name: 'Fri', drift: 0.12, accuracy: 0.87 },
  { name: 'Sat', drift: 0.18, accuracy: 0.82 },
  { name: 'Sun', drift: 0.25, accuracy: 0.78 },
];

export interface Message {
  role: 'user' | 'model';
  content: string;
  response?: PilotResponse;
  files?: { name: string; content: string }[];
}

const SidebarTooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative w-full" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -10 }}
            className="absolute left-[105%] top-1/2 -translate-y-1/2 z-[999] w-64 p-3 bg-card text-card-foreground rounded-xl shadow-2xl border border-primary/10 text-[11px] font-bold leading-relaxed pointer-events-none backdrop-blur-xl"
          >
            <div className="flex gap-2 items-start">
              <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>{content}</span>
            </div>
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-card border-l border-b rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HeaderTooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-full mt-2 right-0 z-[100] w-48 p-2.5 bg-card text-card-foreground rounded-xl shadow-2xl border border-primary/10 text-[10px] font-bold leading-tight pointer-events-none backdrop-blur-md"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardTooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-[100] w-48 p-2.5 bg-card text-card-foreground rounded-xl shadow-2xl border border-primary/10 text-[10px] font-bold leading-tight pointer-events-none backdrop-blur-md text-center"
          >
            {content}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-card border-r border-b rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [activeModule, setActiveModule] = useState<PilotModule>('code');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSnowflakeConnected, setIsSnowflakeConnected] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string }[]>([]);
  const [history, setHistory] = useState<Record<PilotModule, Message[]>>({
    drift: [
      {
        role: 'user',
        content: 'Check for covariate shift in the customer_churn table.'
      },
      {
        role: 'model',
        content: 'I have analyzed the customer_churn table. I detected a significant covariate shift in the TENURE feature (p-value: 0.0042). The distribution has shifted towards longer-tenure customers compared to the training baseline.',
        response: {
          content: 'I have analyzed the customer_churn table. I detected a significant covariate shift in the TENURE feature (p-value: 0.0042).',
          suggestions: ['Generate monitoring SQL', 'Update training baseline', 'View drift dashboard'],
          data: { driftScore: 0.18 }
        }
      }
    ],
    code: [
      {
        role: 'user',
        content: 'Translate this SQL to Snowpark: SELECT category, AVG(price) FROM products GROUP BY category'
      },
      {
        role: 'model',
        content: 'I have translated your SQL query into an optimized Snowpark Python operation. I have also wrapped it with MLOps guardrails for production readiness.',
        response: {
          content: 'I have translated your SQL query into an optimized Snowpark Python operation.',
          language: 'python',
          code: 'from snowflake.snowpark.functions import col, avg\n\ndef get_avg_prices(session):\n    return session.table("products") \\\n        .group_by("category") \\\n        .agg(avg(col("price")).alias("avg_price"))',
          opsGuardrails: {
            costEstimate: 'Estimated 0.05 credits per execution on X-Small warehouse.',
            schemaValidation: 'Verified: category (STRING), price (FLOAT) exist in upstream table.',
            experimentLogging: 'Boilerplate added to log this transformation as a feature-engineering run.'
          },
          suggestions: ['Optimize for memory', 'Add data quality gate', 'Deploy as UDF']
        }
      }
    ],
    finops: [],
    librarian: [],
    integrator: [],
    schema: [],
    experiment: [],
    explain: [],
    promotion: [],
    scheduler: []
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, activeModule, loading]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFiles(prev => [...prev, { name: file.name, content: reader.result as string }]);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSnowflakeConnect = () => {
    setLoading(true);
    // Simulate connection and file fetching from a Snowflake Stage
    setTimeout(() => {
      setIsSnowflakeConnected(true);
      setUploadedFiles(prev => [
        ...prev,
        { 
          name: 'snowflake_training_script.py', 
          content: 'import snowpark\n# Native Snowflake ML Training Logic\ndef train_model(session):\n    df = session.table("RAW_DATA")\n    # Missing MLOps guardrails here...' 
        },
        {
          name: 'warehouse_usage.sql',
          content: 'SELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY WHERE WAREHOUSE_NAME = "ML_WH";'
        }
      ]);
      setLoading(false);
    }, 1500);
  };

  const handleSend = async (overrideInput?: string) => {
    const finalInput = overrideInput || input;
    if (!finalInput.trim() && uploadedFiles.length === 0) return;
    
    const currentInput = finalInput;
    const currentFiles = [...uploadedFiles];
    setInput('');
    setUploadedFiles([]);
    setLoading(true);

    const fileContext = currentFiles.map(f => `FILE: ${f.name}\nCONTENT:\n${f.content}`).join('\n\n');
    const fullPrompt = fileContext 
      ? `I have uploaded the following files for analysis:\n\n${fileContext}\n\nMy query regarding these files is: ${currentInput}`
      : currentInput;

    const userMessage: Message = { role: 'user', content: currentInput, files: currentFiles };
    
    setHistory(prev => ({
      ...prev,
      [activeModule]: [...prev[activeModule], userMessage]
    }));

    // Prepare history for Gemini
    const chatHistory = history[activeModule].map(msg => ({
      role: msg.role,
      parts: [{ text: msg.role === 'model' ? JSON.stringify(msg.response) : msg.content }]
    }));

    try {
      const response = await askPilot(activeModule, fullPrompt, chatHistory);
      const modelMessage: Message = { role: 'model', content: response.content, response };
      
      setHistory(prev => ({
        ...prev,
        [activeModule]: [...prev[activeModule], modelMessage]
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const currentModule = MODULES.find(m => m.id === activeModule)!;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-card/50 backdrop-blur-sm flex flex-col shrink-0 h-full overflow-hidden">
        <div className="p-5 flex items-center gap-3 border-b shrink-0">
          <div className="bg-primary p-2 rounded-2xl shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-none mb-1 text-foreground">Snowflake ML</h1>
            <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">Co-Pilot Engine</p>
          </div>
        </div>
        
        <ScrollArea className="flex-1 w-full min-h-0 overflow-visible">
          <div className="px-4 py-4 space-y-1 overflow-visible">
            {MODULES.map((module) => (
              <SidebarTooltip key={module.id} content={module.description}>
                <button
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 group relative ${
                    activeModule === module.id 
                      ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/25 scale-[1.02]' 
                      : 'hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <module.icon className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeModule === module.id ? 'text-primary-foreground' : module.color}`} />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate tracking-tight">{module.name}</p>
                  </div>
                  {activeModule === module.id && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
                  )}
                </button>
              </SidebarTooltip>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-card/80 shrink-0">
          <HeaderTooltip content={isSnowflakeConnected ? "Securely connected to Snowflake Enterprise Warehouse." : "Disconnected from Snowflake. Click 'Run Demo' to simulate connection."}>
            <div className="bg-secondary/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isSnowflakeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{isSnowflakeConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-[8px] text-muted-foreground uppercase tracking-wider font-bold">
                <span>Warehouse</span>
                <span className="font-mono text-foreground">{isSnowflakeConnected ? 'ML_CO_PILOT_WH' : 'N/A'}</span>
              </div>
              
              <div className="pt-1 space-y-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-7 text-[9px] font-bold uppercase tracking-wider border-primary/20 hover:bg-primary/5 cursor-pointer"
                  onClick={() => {
                    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                    if (input) input.click();
                  }}
                >
                  <Upload className="w-3 h-3 mr-2" /> Upload
                </Button>
              </div>
            </div>
          </HeaderTooltip>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-8 bg-card/30 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <currentModule.icon className={`w-6 h-6 ${currentModule.color}`} />
            <div className="flex flex-col">
              <h2 className="text-lg font-bold tracking-tight leading-none mb-0.5">{currentModule.name}</h2>
              <p className="text-[10px] text-muted-foreground font-medium">{currentModule.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HeaderTooltip content="Execute an end-to-end MLOps analysis demo with pre-loaded logs.">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-[10px] font-bold uppercase tracking-wider border-primary/20 hover:bg-primary hover:text-primary-foreground cursor-pointer"
                onClick={() => {
                  handleSnowflakeConnect();
                  setTimeout(() => {
                    handleSend("Please analyze the uploaded training script and SQL usage logs. Provide an MLOps guardrail report covering cost optimization, schema validation, and experiment tracking for Snowflake.");
                  }, 2000);
                }}
              >
                <Zap className="w-3 h-3 mr-1" /> Run Demo
              </Button>
            </HeaderTooltip>
            
            <HeaderTooltip content="Enterprise-grade features enabled.">
              <Badge variant="outline" className="px-3 py-0.5 border-primary/20 bg-primary/5 text-primary text-[10px] font-bold">
                PRO EDITION
              </Badge>
            </HeaderTooltip>

            <HeaderTooltip content="Open system console for low-level Snowflake interaction.">
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <Terminal className="w-4 h-4" />
              </Button>
            </HeaderTooltip>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Chat/Response Section */}
          <div className="flex-1 flex flex-col border-r bg-background/50 overflow-hidden min-h-0">
            <ScrollArea className="flex-1 w-full" ref={scrollRef}>
              <div className="max-w-4xl mx-auto p-6 space-y-8">
                {history[activeModule].length === 0 ? (
                  <div className="py-16 text-center space-y-6">
                    <div className="inline-flex p-5 rounded-[2rem] bg-primary/5 border border-primary/10 shadow-2xl shadow-primary/5">
                      <currentModule.icon className={`w-12 h-12 ${currentModule.color}`} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black tracking-tighter text-foreground">Initialize {currentModule.name}</h3>
                      <p className="text-muted-foreground text-xs max-w-sm mx-auto leading-relaxed font-medium">
                        {currentModule.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                      {activeModule === 'code' && [
                        'Analyze uploaded file for Snowpark',
                        'Translate SQL to Snowpark',
                        'Debug Snowpark failure',
                        'Optimize DataFrame logic'
                      ].map(s => (
                        <Button key={s} variant="outline" className="justify-start h-auto py-3 px-4 rounded-xl text-[10px] font-bold hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shadow-sm" onClick={() => { handleSend(s); }}>
                          {s}
                        </Button>
                      ))}
                      {activeModule === 'drift' && [
                        'Analyze data file for drift',
                        'Detect covariate shift',
                        'Check for label shift',
                        'Remediate concept drift'
                      ].map(s => (
                        <Button key={s} variant="outline" className="justify-start h-auto py-3 px-4 rounded-xl text-[10px] font-bold hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shadow-sm" onClick={() => { handleSend(s); }}>
                          {s}
                        </Button>
                      ))}
                      {activeModule === 'schema' && [
                        'Analyze schema file for quality',
                        'Generate data quality gates',
                        'Validate upstream schema',
                        'Check for schema drift'
                      ].map(s => (
                        <Button key={s} variant="outline" className="justify-start h-auto py-3 px-4 rounded-xl text-[10px] font-bold hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shadow-sm" onClick={() => { handleSend(s); }}>
                          {s}
                        </Button>
                      ))}
                      {activeModule === 'integrator' && [
                        'Analyze ETL file for zero-copy',
                        'Generate zero-copy ETL',
                        'Document data lineage',
                        'Create Snowpipe logic'
                      ].map(s => (
                        <Button key={s} variant="outline" className="justify-start h-auto py-3 px-4 rounded-xl text-[10px] font-bold hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shadow-sm" onClick={() => { handleSend(s); }}>
                          {s}
                        </Button>
                      ))}
                      {activeModule === 'promotion' && [
                        'Analyze CI/CD file for promotion',
                        'Promote dev to staging',
                        'Generate rollback script',
                        'Setup Git integration'
                      ].map(s => (
                        <Button key={s} variant="outline" className="justify-start h-auto py-3 px-4 rounded-xl text-[10px] font-bold hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shadow-sm" onClick={() => { handleSend(s); }}>
                          {s}
                        </Button>
                      ))}
                      {activeModule === 'explain' && [
                        'Analyze model file for SHAP',
                        'Run SHAP analysis',
                        'Check feature importance',
                        'Explain model prediction'
                      ].map(s => (
                        <Button key={s} variant="outline" className="justify-start h-auto py-3 px-4 rounded-xl text-[10px] font-bold hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shadow-sm" onClick={() => { handleSend(s); }}>
                          {s}
                        </Button>
                      ))}
                      {activeModule === 'finops' && [
                        'Analyze script for cost optimization',
                        'Estimate training cost',
                        'Optimize warehouse size',
                        'Setup cost kill-switch'
                      ].map(s => (
                        <Button key={s} variant="outline" className="justify-start h-auto py-3 px-4 rounded-xl text-[10px] font-bold hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shadow-sm" onClick={() => { handleSend(s); }}>
                          {s}
                        </Button>
                      ))}
                      {activeModule === 'librarian' && [
                        'Analyze feature file for staleness',
                        'Find stale features',
                        'Search feature store',
                        'Prevent feature duplication'
                      ].map(s => (
                        <Button key={s} variant="outline" className="justify-start h-auto py-3 px-4 rounded-xl text-[10px] font-bold hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shadow-sm" onClick={() => { handleSend(s); }}>
                          {s}
                        </Button>
                      ))}
                      {activeModule === 'experiment' && [
                        'Analyze run file for comparison',
                        'Log hyperparameters',
                        'Compare model runs',
                        'Track training metrics'
                      ].map(s => (
                        <Button key={s} variant="outline" className="justify-start h-auto py-3 px-4 rounded-xl text-[10px] font-bold hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shadow-sm" onClick={() => { handleSend(s); }}>
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {history[activeModule].map((msg, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground shadow-primary/20' 
                            : 'bg-card border shadow-sm'
                        }`}>
                          {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-primary" />}
                        </div>
                        <div className={`flex flex-col gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                          <div className={`p-6 rounded-[2rem] shadow-sm leading-relaxed text-[14px] font-medium ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground rounded-tr-none' 
                              : 'bg-card border rounded-tl-none text-foreground/90'
                          }`}>
                            <Markdown 
                              components={{
                                code({ node, inline, className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return !inline ? (
                                    <div className="my-4 rounded-2xl overflow-hidden border bg-black/5 dark:bg-black/40">
                                      <div className="flex items-center justify-between px-4 py-2 bg-black/5 border-b">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{match ? match[1] : 'code'}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100">
                                          <Terminal className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <ScrollArea className="w-full">
                                        <div className="p-4 custom-scrollbar">
                                          <code className="text-[13px] font-mono leading-relaxed whitespace-pre" {...props}>
                                            {children}
                                          </code>
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                      </ScrollArea>
                                    </div>
                                  ) : (
                                    <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono text-[13px]" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="space-y-2 mb-4 list-disc pl-4">{children}</ul>,
                                li: ({ children }) => <li className="text-[14px]">{children}</li>,
                              }}
                            >
                              {msg.content}
                            </Markdown>

                            {msg.files && msg.files.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4">
                                {msg.files.map(f => (
                                  <Badge key={f.name} variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 border-primary/10 rounded-xl">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-bold">{f.name}</span>
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {msg.response?.opsGuardrails && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                {msg.response.opsGuardrails.costEstimate && (
                                  <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                                      <Coins className="w-3.5 h-3.5" /> FinOps Guardrail
                                    </div>
                                    <p className="text-[11px] font-bold leading-tight">{msg.response.opsGuardrails.costEstimate}</p>
                                  </div>
                                )}
                                {msg.response.opsGuardrails.schemaValidation && (
                                  <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase tracking-wider">
                                      <ShieldCheck className="w-3.5 h-3.5" /> Data Contract
                                    </div>
                                    <p className="text-[11px] font-bold leading-tight">{msg.response.opsGuardrails.schemaValidation}</p>
                                  </div>
                                )}
                                {msg.response.opsGuardrails.experimentLogging && (
                                  <div className="p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-wider">
                                      <History className="w-3.5 h-3.5" /> Tracking Guardrail
                                    </div>
                                    <p className="text-[11px] font-bold leading-tight">{msg.response.opsGuardrails.experimentLogging}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">
                            {msg.role === 'user' ? 'Authorized User' : 'Snowflake AI Engine'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {loading && (
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
                    <div className="space-y-3 flex-1">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-card/30 border-t backdrop-blur-sm shrink-0">
              <div className="max-w-3xl mx-auto space-y-3">
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {uploadedFiles.map((f, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1 px-2 py-0.5 rounded-lg">
                        <FileText className="w-3 h-3" />
                        <span className="text-[9px] font-bold">{f.name}</span>
                        <X className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))} />
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="relative group">
                  <div {...getRootProps()} className={`absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 rounded-xl transition-colors ${isDragActive ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-muted-foreground'}`}>
                    <input {...getInputProps()} />
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                  
                  <Textarea 
                    placeholder={`Ask the ${currentModule.name}...`}
                    className="min-h-[44px] max-h-[120px] pl-12 pr-12 py-2.5 rounded-xl border-primary/20 focus-visible:ring-primary/30 resize-none bg-background/80 shadow-inner text-sm"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-2 bottom-2 rounded-lg shadow-lg shadow-primary/20 h-7 w-7"
                    disabled={loading || (!input.trim() && uploadedFiles.length === 0)}
                    onClick={() => handleSend()}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-[8px] text-center text-muted-foreground mt-2 uppercase tracking-widest font-black">
                Snowflake ML Co-Pilot • Enterprise Intelligence Engine
              </p>
            </div>
          </div>

          {/* Context/Dashboard Section */}
          <aside className="w-96 bg-card/10 backdrop-blur-sm border-l flex flex-col shrink-0 overflow-hidden h-full">
            <div className="p-5 border-b bg-card/30 shrink-0">
          <div className="flex items-center gap-2">
            <DashboardTooltip content="Real-time insights derived from Snowflake telemetry and logs.">
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/70">Contextual Intelligence</h4>
            </DashboardTooltip>
            <p className="text-sm font-extrabold tracking-tight">Live Snowflake Telemetry</p>
          </div>
            </div>

            <ScrollArea className="flex-1 w-full min-h-0">
              <div className="p-5 space-y-6">
                {activeModule === 'code' && (
                  <div className="space-y-5">
                    <Card className="border-primary/10 bg-primary/5 overflow-hidden">
                      <CardHeader className="pb-2 bg-primary/5">
                        <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.15em] text-primary">
                          <DashboardTooltip content="Snowpark Python runtime environment status.">
                            <Cpu className="w-3.5 h-3.5" />
                          </DashboardTooltip>
                          Snowpark Engine
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-muted-foreground">Python 3.10 Runtime</span>
                            <span className="text-emerald-500 font-black">HEALTHY</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '92%' }}
                              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-muted-foreground">Memory Allocation</span>
                            <span className="text-amber-500 font-black">64%</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '64%' }}
                              className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-2.5">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Recent Conversions</p>
                      {[
                        { sql: 'SELECT * FROM sales_data WHERE region = "APAC" AND revenue > 1000000', python: 'session.table("sales_data").filter((col("region") == "APAC") & (col("revenue") > 1000000))' },
                        { sql: 'GROUP BY category, month HAVING count(*) > 50', python: '.group_by(["category", "month"]).count().filter(col("count") > 50)' },
                      ].map((c, i) => (
                        <div key={i} className="p-3 rounded-xl border bg-card/40 hover:bg-card/60 transition-colors space-y-2.5 group">
                          <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                            <DashboardTooltip content="Original SQL query from Snowflake logs.">
                              <Database className="w-3 h-3" />
                            </DashboardTooltip>
                            SQL Source
                          </div>
                          <ScrollArea className="w-full">
                            <div className="pb-1.5">
                              <code className="text-[10px] font-mono text-foreground/80 whitespace-nowrap bg-muted/30 px-1.5 py-0.5 rounded-md">{c.sql}</code>
                            </div>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                          <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-wider">
                            <DashboardTooltip content="Generated Snowpark Python equivalent.">
                              <Code2 className="w-3 h-3" />
                            </DashboardTooltip>
                            Snowpark Output
                          </div>
                          <ScrollArea className="w-full">
                            <div className="pb-1.5">
                              <code className="text-[10px] font-mono text-primary/90 whitespace-nowrap bg-primary/5 px-1.5 py-0.5 rounded-md">{c.python}</code>
                            </div>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

            {activeModule === 'drift' && (
              <div className="space-y-6">
                <Card className="border-amber-500/20 bg-amber-500/5 overflow-hidden">
                  <CardHeader className="pb-3 bg-amber-500/5">
                    <CardTitle className="text-[11px] font-black flex items-center gap-2 uppercase tracking-[0.15em] text-amber-600">
                      <DashboardTooltip content="Monitoring statistical deviations in data distributions.">
                        <AlertCircle className="w-4 h-4" />
                      </DashboardTooltip>
                      Drift Detection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Covariate Shift</p>
                      <p className="text-[11px] leading-relaxed font-medium">Feature <code className="bg-amber-500/10 px-1 rounded font-mono">TENURE</code> distribution shifted by 18%.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider">Concept Drift</p>
                      <p className="text-[11px] leading-relaxed font-medium">Model accuracy dropped below 0.85 threshold.</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Drift Velocity</p>
                  <div className="h-56 w-full border rounded-2xl p-4 bg-card/50 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_DRIFT_DATA}>
                        <defs>
                          <linearGradient id="colorDrift" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#888' }} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#888' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="drift" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDrift)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeModule === 'scheduler' && (
              <div className="space-y-6">
                <Card className="border-cyan-500/20 bg-cyan-500/5 overflow-hidden">
                  <CardHeader className="pb-3 bg-cyan-500/5">
                    <CardTitle className="text-[11px] font-black flex items-center gap-2 uppercase tracking-[0.15em] text-cyan-600">
                      <DashboardTooltip content="Optimizing warehouse usage based on historical patterns.">
                        <Clock className="w-4 h-4" />
                      </DashboardTooltip>
                      Compute Optimizer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Next Optimal Window</p>
                        <p className="text-lg font-black text-cyan-600 tracking-tight">02:00 AM - 05:00 AM</p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-500 border-none text-[10px] font-black px-3 py-1">92% EFFICIENCY</Badge>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Historical Load Profile</p>
                      <div className="flex gap-1.5 h-20 items-end px-1">
                        {[40, 60, 80, 100, 70, 30, 20, 10, 15, 25, 45, 65].map((h, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.05 }}
                            className="flex-1 bg-cyan-500/30 hover:bg-cyan-500/50 transition-colors rounded-t-md" 
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeModule === 'schema' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Active Data Contracts</p>
                  {[
                    { table: 'RAW_SALES', status: 'Verified', checks: 12, drift: '0.02%' },
                    { table: 'USER_PROFILES', status: 'Warning', checks: 8, drift: '4.15%' },
                    { table: 'LOG_EVENTS', status: 'Verified', checks: 24, drift: '0.01%' },
                  ].map(c => (
                    <div key={c.table} className="p-4 rounded-2xl border bg-card/40 hover:bg-card/60 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${c.status === 'Verified' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                          <DashboardTooltip content="Ensuring data quality and schema compliance.">
                            <ShieldCheck className={`w-4 h-4 ${c.status === 'Verified' ? 'text-emerald-500' : 'text-amber-500'}`} />
                          </DashboardTooltip>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[12px] font-extrabold block tracking-tight">{c.table}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{c.checks} Checks Active</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <DashboardTooltip content={c.status === 'Verified' ? 'Schema matches the defined data contract.' : 'Schema deviation detected.'}>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${c.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                            {c.status.toUpperCase()}
                          </span>
                        </DashboardTooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModule === 'experiment' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Experiment Lineage</p>
                  {[
                    { id: 'run_92a', metric: '0.924', time: '2h ago', status: 'Success' },
                    { id: 'run_88b', metric: '0.881', time: '4h ago', status: 'Failed' },
                    { id: 'run_91c', metric: '0.912', time: '1d ago', status: 'Success' },
                  ].map(r => (
                    <div key={r.id} className="p-4 rounded-2xl border bg-card/40 hover:bg-card/60 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-orange-500/10">
                          <DashboardTooltip content="Tracking model training history and performance.">
                            <History className="w-4 h-4 text-orange-500" />
                          </DashboardTooltip>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-mono font-bold block">{r.id}</span>
                          <span className="text-[10px] text-muted-foreground font-bold">{r.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <DashboardTooltip content="Primary performance metric for this experiment run.">
                            <span className="text-[13px] font-black text-foreground tracking-tight">{r.metric}</span>
                          </DashboardTooltip>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Accuracy</p>
                        </div>
                        <DashboardTooltip content={r.status === 'Success' ? 'Experiment completed successfully.' : 'Experiment failed or was aborted.'}>
                          <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'Success' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                        </DashboardTooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModule === 'promotion' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Deployment Pipeline</p>
                  {[
                    { stage: 'Staging', status: 'Active', version: 'v2.4.1', health: 100 },
                    { stage: 'Production', status: 'Pending', version: 'v2.4.0', health: 98 },
                  ].map(p => (
                    <div key={p.stage} className="p-4 rounded-2xl border bg-card/40 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-primary/10">
                            <DashboardTooltip content="Automated model promotion to higher environments.">
                              <Rocket className="w-4 h-4 text-primary" />
                            </DashboardTooltip>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[12px] font-extrabold block tracking-tight">{p.stage}</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{p.version}</span>
                          </div>
                        </div>
                        <DashboardTooltip content={p.status === 'Active' ? 'Deployment is live and serving traffic.' : 'Deployment is awaiting approval or in progress.'}>
                          <Badge className={`${p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'} border-none text-[9px] font-black`}>
                            {p.status.toUpperCase()}
                          </Badge>
                        </DashboardTooltip>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-muted-foreground">Node Health</span>
                          <span className="text-emerald-500">{p.health}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${p.health}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModule === 'explain' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Global Feature Importance</p>
                  <DashboardTooltip content="SHAP-based feature importance analysis for model transparency and bias detection.">
                    <div className="space-y-4 p-4 rounded-2xl border bg-card/40 w-full">
                      {[
                        { feature: 'TENURE', value: 0.45, color: 'bg-sky-500' },
                        { feature: 'MONTHLY_CHARGES', value: 0.28, color: 'bg-indigo-500' },
                        { feature: 'TOTAL_CHARGES', value: 0.15, color: 'bg-blue-500' },
                        { feature: 'CONTRACT_TYPE', value: 0.12, color: 'bg-cyan-500' },
                      ].map(f => (
                        <div key={f.feature} className="space-y-2">
                          <div className="flex justify-between text-[11px] font-extrabold">
                            <span className="text-foreground/80 tracking-tight">{f.feature}</span>
                            <span className="text-foreground">{(f.value * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${f.value * 100}%` }}
                              className={`h-full ${f.color} shadow-sm`} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </DashboardTooltip>
                </div>
              </div>
            )}

            {activeModule === 'integrator' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">External Data Stages</p>
                  {[
                    { name: 'S3_DATA_LAKE', type: 'AWS S3', status: 'Active', latency: '12ms' },
                    { name: 'AZURE_BLOB_STG', type: 'Azure Blob', status: 'Active', latency: '45ms' },
                    { name: 'GCS_RAW_DATA', type: 'GCS', status: 'Standby', latency: 'N/A' },
                  ].map(s => (
                    <div key={s.name} className="p-4 rounded-2xl border bg-card/40 hover:bg-card/60 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/10">
                          <DashboardTooltip content="External cloud storage integration via Snowflake Stages.">
                            <Network className="w-4 h-4 text-purple-500" />
                          </DashboardTooltip>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[12px] font-extrabold block tracking-tight">{s.name}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{s.type}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <DashboardTooltip content={s.status === 'Active' ? 'Stage is currently reachable and active.' : 'Stage is in standby mode.'}>
                          <div className={`w-2 h-2 rounded-full ml-auto mb-1 ${s.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        </DashboardTooltip>
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{s.latency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModule === 'finops' && (
              <div className="space-y-6">
                <Card className="border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
                  <CardHeader className="pb-3 bg-emerald-500/5">
                    <CardTitle className="text-[11px] font-black flex items-center gap-2 uppercase tracking-[0.15em] text-emerald-600">
                      <DashboardTooltip content="Monitoring Snowflake credit consumption and cost efficiency.">
                        <Coins className="w-4 h-4" />
                      </DashboardTooltip>
                      Credit Burn Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    <div className="text-3xl font-black tracking-tighter text-foreground">1,248.5 <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest ml-1">Credits</span></div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-extrabold">
                        <span className="text-muted-foreground">Budget Utilization (Monthly)</span>
                        <span className="text-emerald-600 font-black">42%</span>
                      </div>
                      <div className="w-full h-2.5 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '42%' }}
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <DashboardTooltip content="Estimated total credit consumption for the current billing cycle.">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 w-full">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Projected</p>
                          <p className="text-sm font-black text-foreground">2,840.0</p>
                        </div>
                      </DashboardTooltip>
                      <DashboardTooltip content="Potential savings identified through warehouse optimization.">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 w-full">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Savings</p>
                          <p className="text-sm font-black text-emerald-500">+$420.12</p>
                        </div>
                      </DashboardTooltip>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeModule === 'librarian' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Feature Store Health</p>
                  {[
                    { name: 'USER_LTV_PRED', age: '47d', status: 'Stale', usage: 'High' },
                    { name: 'CHURN_PROB_V2', age: '2h', status: 'Fresh', usage: 'Critical' },
                    { name: 'AVG_ORDER_VAL', age: '12h', status: 'Fresh', usage: 'Medium' },
                  ].map(f => (
                    <div key={f.name} className="p-4 rounded-2xl border bg-card/40 hover:bg-card/60 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10">
                          <DashboardTooltip content="Managing and deduplicating ML features in the Snowflake Feature Store.">
                            <Library className="w-4 h-4 text-amber-500" />
                          </DashboardTooltip>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[12px] font-extrabold block tracking-tight">{f.name}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Updated {f.age} ago</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <DashboardTooltip content={f.status === 'Stale' ? 'Feature data is outdated and may need re-calculation.' : 'Feature data is up-to-date.'}>
                          <Badge className={`text-[9px] font-black border-none px-2 py-0.5 mb-1 block ${f.status === 'Stale' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-600'}`}>
                            {f.status.toUpperCase()}
                          </Badge>
                        </DashboardTooltip>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{f.usage} USAGE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
        </div>
      </main>
    </div>
  );
}



import React, { useState, useEffect, useRef } from 'react';
import { BIBLE_BOOKS } from './constants';
import { BibleBook, Verse, BibleApiResponse, Explanation } from './types';
import { getVerseExplanation } from './services/geminiService';
import { 
  Book as BookIcon, 
  ChevronRight, 
  Search, 
  Sparkles, 
  Loader2, 
  ArrowLeft,
  X,
  Volume2
} from 'lucide-react';

const App: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [explainingVerse, setExplainingVerse] = useState<Verse | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Bible chapter
  const fetchChapter = async (book: BibleBook, chapter: number) => {
    setLoading(true);
    try {
      // Using bible-api.com for Portuguese translation (Almeida)
      const res = await fetch(`https://bible-api.com/${book.name}+${chapter}?translation=almeida`);
      const data: BibleApiResponse = await res.json();
      setVerses(data.verses);
      setSelectedBook(book);
      setSelectedChapter(chapter);
    } catch (error) {
      console.error("Erro ao buscar capítulo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async (verse: Verse) => {
    setExplainingVerse(verse);
    setIsExplaining(true);
    setExplanation(null);
    try {
      const result = await getVerseExplanation(verse.text, `${verse.book_name} ${verse.chapter}:${verse.verse}`);
      setExplanation(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExplaining(false);
    }
  };

  const resetSelection = () => {
    setSelectedBook(null);
    setSelectedChapter(null);
    setVerses([]);
    setExplanation(null);
    setExplainingVerse(null);
  };

  const filteredBooks = BIBLE_BOOKS.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-amber-100 sticky top-0 z-30 px-4 py-3 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={resetSelection}>
          <div className="bg-amber-600 p-2 rounded-lg">
            <BookIcon className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-amber-900 serif-font tracking-tight">
            Bíblia <span className="text-amber-600">Explicada</span>
          </h1>
        </div>

        <div className="relative hidden md:block w-64 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar livro..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        {!selectedBook ? (
          /* Book Selection Grid */
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-slate-800 serif-font">Escolha um Livro</h2>
              <p className="text-slate-500">Inicie seu estudo bíblico com explicações de IA</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-500 hover:shadow-md transition-all text-left"
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${book.testament === 'Velho' ? 'text-amber-700' : 'text-blue-700'}`}>
                    {book.testament}
                  </span>
                  <span className="text-slate-800 font-semibold group-hover:text-amber-600 transition-colors">
                    {book.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : !selectedChapter ? (
          /* Chapter Selection Grid */
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setSelectedBook(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors mb-4 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar aos livros
            </button>
            
            <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 serif-font">{selectedBook.name}</h2>
                <p className="text-slate-500 font-medium">{selectedBook.testament} Testamento • {selectedBook.chapters} Capítulos</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-full">
                <BookIcon className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                <button
                  key={chapter}
                  onClick={() => fetchChapter(selectedBook, chapter)}
                  className="w-full aspect-square flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all font-bold text-slate-700 shadow-sm"
                >
                  {chapter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Reader View */
          <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <button 
                onClick={() => setSelectedChapter(null)}
                className="flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Capítulos de {selectedBook.name}
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  disabled={selectedChapter <= 1}
                  onClick={() => fetchChapter(selectedBook, selectedChapter - 1)}
                  className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Anterior
                </button>
                <span className="font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-md border border-amber-100">
                  Capítulo {selectedChapter}
                </span>
                <button 
                  disabled={selectedChapter >= selectedBook.chapters}
                  onClick={() => fetchChapter(selectedBook, selectedChapter + 1)}
                  className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Próximo
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                <p className="text-slate-500 font-medium">Buscando as Escrituras...</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-amber-50 shadow-sm p-8 md:p-12 leading-relaxed">
                <div className="max-w-3xl mx-auto space-y-6">
                  {verses.map((v) => (
                    <p 
                      key={v.verse} 
                      className={`serif-font text-xl text-slate-800 transition-all cursor-pointer hover:bg-amber-50 rounded px-2 -mx-2 flex gap-4 ${explainingVerse?.verse === v.verse ? 'bg-amber-50 ring-1 ring-amber-200' : ''}`}
                      onClick={() => handleExplain(v)}
                    >
                      <sup className="text-amber-600 font-bold text-xs mt-2 select-none">{v.verse}</sup>
                      <span className="flex-1">{v.text}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Explanation Modal/Drawer */}
      {explainingVerse && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl h-[85vh] md:h-auto md:max-h-[90vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{explainingVerse.book_name} {explainingVerse.chapter}:{explainingVerse.verse}</h3>
                  <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Análise da IA Gemini</p>
                </div>
              </div>
              <button 
                onClick={() => setExplainingVerse(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-400 italic text-amber-900 serif-font text-lg">
                "{explainingVerse.text}"
              </div>

              {isExplaining ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                    <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-700 font-semibold">Gerando explicação teológica...</p>
                    <p className="text-slate-400 text-sm mt-1">Isso pode levar alguns segundos</p>
                  </div>
                </div>
              ) : explanation ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <Section title="Contexto Histórico" content={explanation.historicalContext} />
                  <Section title="Insights Linguísticos" content={explanation.linguisticInsights} />
                  <Section title="Significado Espiritual" content={explanation.spiritualMeaning} />
                  <Section title="Aplicação Prática" content={explanation.practicalApplication} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-red-500">Ocorreu um erro ao carregar a explicação.</p>
                  <button 
                    onClick={() => handleExplain(explainingVerse)}
                    className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-full font-medium hover:bg-amber-700"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex justify-end rounded-b-3xl">
               <button 
                onClick={() => setExplainingVerse(null)}
                className="px-6 py-2 text-slate-600 font-semibold hover:text-slate-800 transition-colors"
              >
                Fechar Estudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200 mt-auto text-center">
        <p className="text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Bíblia Explicada AI. Feito para inspirar e educar.
        </p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="#" className="text-slate-400 hover:text-amber-600 text-xs">Termos</a>
          <a href="#" className="text-slate-400 hover:text-amber-600 text-xs">Privacidade</a>
          <a href="#" className="text-slate-400 hover:text-amber-600 text-xs">Contato</a>
        </div>
      </footer>
    </div>
  );
};

const Section: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div className="space-y-3 group">
    <h4 className="flex items-center gap-2 text-amber-700 font-bold uppercase text-xs tracking-widest border-b border-amber-100 pb-1">
      {title}
    </h4>
    <p className="text-slate-700 leading-relaxed text-[15px]">{content}</p>
  </div>
);

export default App;

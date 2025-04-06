"use client"
import { FC, useState, useEffect } from "react"
import { Socket } from "socket.io-client"
import { ClientToServerEvents, ServerToClientEvents, translateMessage } from "../../lib/socket"

interface TranslationServiceProps {
  messageId: string
  socket: Socket<ServerToClientEvents, ClientToServerEvents>
  onLanguageSelect: (languageCode: string) => void
  onClose: () => void
}

interface Language {
  code: string
  name: string
}

const TranslationService: FC<TranslationServiceProps> = ({ 
  messageId, 
  socket, 
  onLanguageSelect,
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages');
        if (!response.ok) {
          throw new Error('Failed to fetch languages');
        }
        const data = await response.json();
        setLanguages(data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load languages');
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  // Filter languages based on search term
  const filteredLanguages = searchTerm.trim()
    ? languages.filter(language => 
        (language?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (language?.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : languages;

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageSelect(languageCode);
    onClose();
  };

  if (isLoading) {
    return (
      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-48 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400"></div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-48 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center gap-2">
          <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-center text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={onClose}
            className="mt-1 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-48 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100">
          Select Language
        </h3>
        <button
          onClick={onClose}
          className="p-0.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="relative mb-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full pl-7 pr-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-shadow"
        />
        <svg 
          className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {filteredLanguages.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-3">
            <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              No languages found
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className="w-full px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-between group"
              >
                <span>{language.name}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400">
                  {language.code.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationService;

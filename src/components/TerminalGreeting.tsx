import { useState, useEffect } from 'preact/hooks';
import { Terminal, HardDrive, Copy, Sun, Moon, Check } from 'lucide-preact';
import DOMPurify from 'dompurify';
import slugify from 'slugify';
import { route } from 'preact-router';

const TerminalGreeting = () => {
  const [name, setName] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

useEffect(() => {
  const getSafeCurrentUrl = () => {
    try {
      if (typeof window === 'undefined') return 'https://india.sanweb.info/terminal';
      
      const url = new URL(window.location.href);

      if (url.hostname === 'india.sanweb.info' && 
          (url.protocol === 'http:' || url.protocol === 'https:')) {
        return url.toString();
      }
      return 'https://india.sanweb.info/terminal';
    } catch (e) {
      return 'https://india.sanweb.info/terminal';
    }
  };

  const currentUrl = getSafeCurrentUrl();
  const baseUrl = 'https://india.sanweb.info';

  const metaTags = [
    { name: 'description', content: 'A special 🇮🇳 Happy Independence Day greeting for your friends and Family Members.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: currentUrl },
    { property: 'og:title', content: 'Create Happy Independence Day Greeting 🇮🇳' },
    { property: 'og:description', content: 'A special 🇮🇳 Happy Independence Day greeting for your friends and Family Members.' },
    { property: 'og:image', content: 'https://img.sanweb.info/india/india/?name=Your-Name' },
    { property: 'og:image:alt', content: 'Wishing you a very Happy Independence Day 🇮🇳' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Create Happy Independence Day Greeting 🇮🇳' },
    { name: 'twitter:description', content: 'A special 🇮🇳 Happy Independence Day greeting for your friends and Family Members.' },
    { name: 'twitter:image', content: 'https://img.sanweb.info/india/india/?name=Your-Name' }
  ];

  document.title = 'Create Happy Independence Day Greeting 🇮🇳';

  const existingCanonical = document.querySelector('link[rel="canonical"]');
  if (existingCanonical) {
    document.head.removeChild(existingCanonical);
  }

  const canonicalLink = document.createElement('link');
  canonicalLink.rel = 'canonical';
  canonicalLink.href = window.location.pathname === '/' ? baseUrl : currentUrl;
  document.head.appendChild(canonicalLink);

  metaTags.forEach(tag => {
    const attribute = tag.name ? 'name' : 'property';
    const key = tag.name || tag.property;
    
    let metaTag = document.querySelector(`meta[${attribute}="${key}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(attribute, key);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', tag.content);
  });

  return () => {
    if (canonicalLink.parentNode === document.head) {
      document.head.removeChild(canonicalLink);
    }
  };
}, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-gray-900');
      document.body.classList.remove('bg-gray-50');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-gray-900');
      document.body.classList.add('bg-gray-50');
    }
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  const sanitizeName = (input: string) => {
    let cleanName = DOMPurify.sanitize(input).trim();
    cleanName = slugify(cleanName, {
      replacement: ' ',
      remove: /[*+~.()'"!:@]/g,
      lower: false,
      strict: false,
    });
    cleanName = cleanName.replace(/\++/g, ' ');
    cleanName = cleanName.replace(/\s+/g, ' ');
    cleanName = cleanName.replace(/%20+/g, ' ');
    cleanName = cleanName.replace(/-+/g, ' ');
    return cleanName;
  };

  const validateName = (input: string) => {
    if (input.length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (input.length > 36) {
      setError('Name must be less than 36 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCopied(false);

    const cleanName = sanitizeName(name);
    if (!validateName(cleanName)) return;

    setIsProcessing(true);
    setProgress(0);

    const steps = [
      5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 
      55, 60, 65, 70, 75, 80, 85, 90, 95, 100
    ];
    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setIsProcessing(false);
        const finalSlug = slugify(cleanName, {
          replacement: '-',
          remove: /[*+~.()'"!:@]/g,
          lower: true,
          strict: true,
        });
        setSuccess(finalSlug);
        return;
      }
      setProgress(steps[stepIndex]);
      stepIndex++;
    }, 150 + Math.random() * 300);
  };

  const copyToClipboard = () => {
    if (!success) return;
    const fullUrl = `${window.location.origin}/${success}`;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => setError('Failed to copy URL'));
  };

  const navigateToGreeting = () => {
    if (success && typeof success === 'string') {
      route(`/${success}`);
    }
  };

  return (
    <div class={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
      <div class="w-full max-w-2xl mx-4">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <Terminal class={`${isDarkMode ? 'text-blue-400' : 'text-purple-500'}`} />
            <span class={`${isDarkMode ? 'text-blue-400' : 'text-purple-500'}`}>Greeting Generator</span>
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            class={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-yellow-300' : 'hover:bg-gray-200 text-indigo-600'}`}
            aria-label={`Toggle ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div class={`rounded-lg overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div class={`flex items-center px-4 py-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div class="flex space-x-2 mr-3">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div class={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              create --name="[YOUR_NAME]"
            </div>
          </div>

          <div class={`p-5 font-mono text-sm ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
            <div class="mb-4 flex items-start">
              <span class={`mt-1 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>$</span>
              <span>Enter your name to generate a personalized Independence Day greeting URL</span>
            </div>

            <form onSubmit={handleSubmit} class="mb-4">
              <div class="flex items-center">
                <span class={`mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>$</span>
                <input
                  type="text"
                  value={name}
                  onInput={(e) => setName((e.target as HTMLInputElement).value)}
                  placeholder="Your name"
                  class={`flex-1 px-3 py-2 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-500'} border focus:outline-none focus:ring-2 focus:border-transparent`}
                  disabled={isProcessing}
                />
              </div>

              {error && (
                <div class={`mt-2 flex items-start ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  <span class="mr-2">!</span>
                  <span>{error}</span>
                </div>
              )}

              <div class="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  class={`px-4 py-2 rounded flex items-center gap-2 ${isProcessing ? 'bg-blue-600 cursor-not-allowed' : isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
                >
                  {isProcessing ? (
                    <>
                      <span class="animate-pulse">Processing...</span>
                    </>
                  ) : (
                    <>
                      <HardDrive size={16} />
                      <span>Generate URL</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {isProcessing && (
              <div class="mb-4">
                <div class="flex items-start">
                  <span class={`mt-0.5 mr-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>*</span>
                  <div class="flex-1">
                    <span>Generating URL: {progress}%</span>
                    <div class={`mt-2 w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div class={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {progress < 50 ? 'Initializing...' : progress < 80 ? 'Processing...' : 'Finalizing...'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div class={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'} border`}>
                <div class="flex items-start">
                  <span class={`mt-0.5 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓</span>
                  <div class="flex-1">
                    <div class="flex justify-between items-start">
                      <span>URL generated successfully</span>
                      <button
                        onClick={copyToClipboard}
                        class={`ml-4 px-3 py-1 rounded flex items-center gap-1 text-sm ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} transition-colors`}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <div class={`mt-2 p-3 rounded text-sm break-all font-medium ${isDarkMode ? 'bg-gray-800 text-blue-300' : 'bg-white text-blue-600'}`}>
                      {window.location.origin}/{success}
                    </div>
                    <button
                      onClick={navigateToGreeting}
                      class={`mt-2 text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} hover:underline transition-colors`}
                    >
                      Click here to view your greeting →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div class={`mt-6 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>Create and share personalized Independence Day greetings with your name</p>
          <p class="mt-1">Name must be 2-36 characters. Special characters will be removed.</p>
        </div>
      </div>
    </div>
  );
};

export default TerminalGreeting;
import { JSX } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import DOMPurify from 'dompurify';
import slugify from 'slugify';
import IndianFlag from './IndianFlag';

interface GreetingPageProps {
  name?: string;
}

const sanitizeName = (name: string) => {
  let cleanName = DOMPurify.sanitize(name).trim();
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
  if (cleanName.length < 2 || cleanName.length > 36) {
    return 'Guest';
  }
  return cleanName;
};

const getFormattedTime = () => {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
};

const Snackbar = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => (
  <div class="fixed bottom-6 right-4 md:right-6 z-50 w-[calc(100%-2rem)] max-w-sm bg-cyan-600 text-white px-5 py-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-slide-in">
    <span class="text-sm font-bold flex-1">{message}</span>
    <button
      onClick={onClose}
      class="p-2 text-red-800 transition-colors"
      aria-label="Close notification"
    >
      &times;
    </button>
  </div>
);

const GreetingPage = ({ name }: GreetingPageProps & JSX.IntrinsicElements['div']) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sanitizedName = sanitizeName(name || '');
  const [imageUrl, setImageUrl] = useState('');
  const [language, setLanguage] = useState('en');
  const [toggleState, setToggleState] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const currentTime = getFormattedTime();
  const currentUrl = window.location.href;
  const basename = `independence-day-greeting-${sanitizedName.toLowerCase().replace(/\s+/g, '-')}.png`;

useEffect(() => {
  const pathname = window.location.pathname;
  const decoded = decodeURIComponent(pathname.replace(/^\/+/, ''));
  
  const correctSlug = slugify(DOMPurify.sanitize(decoded).trim(), {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
  });

  if (decoded && pathname !== `/${correctSlug}`) {
    window.location.replace(`/${correctSlug}`);
  }
}, []);

  const loadFont = async () => {
    try {
      const font = new FontFace(
        'Anek Tamil',
        'url(https://fonts.gstatic.com/s/anektamil/v4/XLYJIZH2bYJHGYtPGSbUB8JKTp-_9n55SsLHW0WZez6TjtkDu3uNnCB6qw.ttf)'
      );
      await font.load();
      document.fonts.add(font);
    } catch (error) {
      console.error('Font load failed:', error);
    }
  };

  const generateImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = 1080;
    canvas.height = 1080;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = './independence-day-2025.png';

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Image load failed'));
    });

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    await loadFont();

    context.font = '600 30pt Anek Tamil';
    context.fillStyle = '#1e824c';
    context.textAlign = 'center';
    context.fillText(sanitizedName, canvas.width / 2, 900);

    const dataURL = canvas.toDataURL('image/png');
    setImageUrl(dataURL);
  };

  useEffect(() => {
    generateImage().catch(err => {
      console.error('Image generation failed:', err);
      setSnackbarMessage('Error generating image. Please refresh.');
    });
  }, [sanitizedName]);

useEffect(() => {
  const title = `${sanitizedName} - Independence Day Greeting 🇮🇳`;
  const description = `Wishing you a very Happy Independence Day From ${sanitizedName}`;
  const ogImg = `https://img.sanweb.info/india/india/?name=${encodeURIComponent(sanitizedName)}`;
  const ogAlt = messages[language].greeting || 'Independence Day Greeting';

  document.title = title;

  const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
  metaDesc.setAttribute('name', 'description');
  metaDesc.setAttribute('content', description);
  if (!metaDesc.parentNode) document.head.appendChild(metaDesc);

  const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
  link.setAttribute('rel', 'canonical');
  link.setAttribute('href', currentUrl);
  if (!link.parentNode) document.head.appendChild(link);

  const ogTags = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: currentUrl },
    { property: 'og:image', content: ogImg },
    { property: 'og:image:alt', content: ogAlt }
  ];

  ogTags.forEach(({ property, content }) => {
    let tag = document.querySelector(`meta[property="${property}"]`) || document.createElement('meta');
    tag.setAttribute('property', property);
    tag.setAttribute('content', content);
    if (!tag.parentNode) document.head.appendChild(tag);
  });

  const twitterTags = [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: ogImg },
    { name: 'twitter:url', content: currentUrl }
  ];

  twitterTags.forEach(({ name, content }) => {
    let tag = document.querySelector(`meta[name="${name}"]`) || document.createElement('meta');
    tag.setAttribute('name', name);
    tag.setAttribute('content', content);
    if (!tag.parentNode) document.head.appendChild(tag);
  });

  return () => {
    document.title = 'Independence Day Greeting 🇮🇳';
  };
}, [sanitizedName, currentUrl, language]);

  useEffect(() => {
    if (snackbarMessage) {
      const timeout = setTimeout(() => setSnackbarMessage(null), 2500);
      return () => clearTimeout(timeout);
    }
  }, [snackbarMessage]);

  useEffect(() => {
    localStorage.setItem('toggleState', JSON.stringify(toggleState));
  }, [toggleState]);

  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
  }, [language]);

  const handleLanguageChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setLanguage(target.value);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl)
      .then(() => setSnackbarMessage('URL copied'))
      .catch(() => setSnackbarMessage('Failed to copy URL.'));
  };

  const redirectToHome = () => {
    window.location.href = '/';
  };

const messages = {
    en: {
      greeting: `Wishing you a very Happy Independence Day 🇮🇳`,
      message1: `Let us remember the sacrifices of our great leaders and honor their legacy by working towards a brighter future for our nation.`,
      message2: `May the flag of India always fly high and may our country continue to grow stronger and more united.`,
    },
    ta: {
      greeting: `சுதந்திர தின வாழ்த்துக்கள் 🇮🇳`,
      message1: `நம் மகான் தலைவர்களின் தியாகத்தை நினைவுகூர்ந்து, நமது தேசத்திற்கு சிறந்த எதிர்காலத்தை நோக்கி நாம் செயல்படுவோம்.`,
      message2: `இந்தியாவின் கொடி எப்போதும் உயரமாக பறக்கட்டும், மேலும் நமது நாடு பலவீனமின்றி வளர்ந்து ஒற்றுமையாக இருக்கட்டும்.`,
    },
    hi: {
      greeting: `स्वतंत्रता दिवस की शुभकामनाएं 🇮🇳`,
      message1: `आइए हम अपने महान नेताओं के बलिदानों को याद करें और उनके विरासत को एक उज्जवल भविष्य की ओर काम करके सम्मानित करें।`,
      message2: `भारत का ध्वज हमेशा ऊंचा फहराता रहे और हमारा देश और अधिक मजबूत और एकजुट होता रहे।`,
    },
    te: {
      greeting: `స్వాతంత్ర్య దినోత్సవ శుభాకాంక్షలు 🇮🇳`,
      message1: `మనం మన నాయకుల త్యాగాలను గుర్తు చేసుకొని, మన దేశానికి ఉత్తమమైన భవిష్యత్తును సాధించడానికి పనిచేద్దాం.`,
      message2: `భారత జెండా ఎల్లప్పుడూ ఎగురుతూ ఉండాలి మరియు మన దేశం మరింత బలంగా మరియు ఏకమై ఉండాలి.`,
    },
    ml: {
      greeting: `സ്വാതന്ത്ര്യ ദിനാശംസകള്‍ 🇮🇳`,
      message1: `നമ്മുടെ മഹത്തായ നേതാക്കളിന്റെ ത്യാഗങ്ങളെ ഓർക്കുക, നമ്മുടെ രാജ്യത്തിന് മികച്ച ഭാവി ലക്ഷ്യമാക്കി പ്രവർത്തിക്കുക.`,
      message2: `ഭാരതത്തിന്റെ പതാക എന്നും ഉയർന്നുയരട്ടെ, നമ്മുടെ നാട് കൂടുതൽ ശക്തവും ഐക്യത്തോടുകൂടിയതുമാകട്ടെ.`,
    },
    kn: {
      greeting: `ಸ್ವಾತಂತ್ರ್ಯೋತ್ಸವದ ಶುಭಾಶಯಗಳು 🇮🇳`,
      message1: `ನಮ್ಮ ಮಹಾನ್ ನಾಯಕರ ತ್ಯಾಗಗಳನ್ನು ನೆನೆಸಿಕೊಳ್ಳೋಣ ಮತ್ತು ನಮ್ಮ ರಾಷ್ಟ್ರದ ಉತ್ತಮ ಭವಿಷ್ಯಕ್ಕಾಗಿ ಕೆಲಸ ಮಾಡೋಣ.`,
      message2: `ಭಾರತದ ಧ್ವಜವು ಸದಾ ಎತ್ತರದಲ್ಲಿ ಹಾರಲಿ ಮತ್ತು ನಮ್ಮ ದೇಶವು ಇನ್ನಷ್ಟು ಶಕ್ತಿಯಾಗಲಿ ಮತ್ತು ಏಕೀಕೃತವಾಗಲಿ.`,
    },
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-500 via-white to-green-600 p-4">
      <div class="chat-container w-full max-w-2xl">
        <IndianFlag />
        <div class="chat-box">
          <div class="chat-bubble right">{sanitizedName} 🇮🇳 <div class="chat-time">{currentTime}</div></div>
          <div class="chat-bubble left">{messages[language].greeting}<div class="chat-time">{currentTime}</div></div>
          <div class="chat-bubble right p-0 overflow-hidden">
            {imageUrl && (
              <img src={imageUrl} alt="Greeting" class="w-full h-auto max-h-96 object-contain rounded-lg" />
            )}
            <div class="chat-time">{currentTime}</div>
          </div>
          {imageUrl && (
            <div class="chat-bubble right">
              <div class="flex flex-col items-center">
                <a
                  href={imageUrl}
                  download={basename}
                  class="bg-gradient-to-br from-pink-500 to-orange-400 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition duration-200 mb-2"
                >
                  ⬇ Download
                </a>
                <div class="chat-time">{currentTime}</div>
              </div>
            </div>
          )}
          <div class="chat-bubble left">{messages[language].message1}<div class="chat-time">{currentTime}</div></div>
          <div class="chat-bubble left">{messages[language].message2}<div class="chat-time">{currentTime}</div></div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ position: 'absolute', left: '-9999px', width: '1080px', height: '1080px' }} />

  <div class="mt-4 space-y-2 max-w-xs w-full">
  <label for="language-select" class="block text-sm font-semibold text-neutral-800">
    🌐 Choose Language
  </label>

  <select
    id="language-select"
    onChange={handleLanguageChange}
    value={language}
    class="w-full px-4 py-3 text-sm text-neutral-900 bg-white border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
  >
    <option value="en">English</option>
    <option value="ta">Tamil</option>
    <option value="hi">Hindi</option>
    <option value="te">Telugu</option>
    <option value="ml">Malayalam</option>
    <option value="kn">Kannada</option>
  </select>
  </div>

      <div class="mt-6 mb-8 max-w-2xl w-full">
        <label class="flex items-center justify-center space-x-2">
          <span>{toggleState ? 'Hide Options' : 'Show Options'}</span>
          <input type="checkbox" checked={toggleState} onChange={() => setToggleState(!toggleState)} class="sr-only" />
          <div class={`relative w-16 h-8 rounded-full ${toggleState ? 'bg-blue-600' : 'bg-red-500'}`}>
            <div class={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition ${toggleState ? 'translate-x-8' : ''}`}></div>
          </div>
        </label>
      </div>

  {toggleState && (
   <div class="bg-white p-7 mb-10 rounded-2xl shadow-xl w-full max-w-md flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
    
    <button
      onClick={copyToClipboard}
      class="w-full md:w-auto flex-1 bg-blue-600 dark:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95 transition-all shadow hover:shadow-md"
    >
      📋 Copy URL
    </button>
    
    <button
      onClick={redirectToHome}
      class="w-full md:w-auto flex-1 bg-emerald-600 dark:bg-emerald-500 text-white font-medium px-5 py-3 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-95 transition-all shadow hover:shadow-md"
    >
      ✨ Create New
    </button>
   </div>
  )}

      {snackbarMessage && <Snackbar message={snackbarMessage} onClose={() => setSnackbarMessage(null)} />}
    </div>
  );
};

export default GreetingPage;

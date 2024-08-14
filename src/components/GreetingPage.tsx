import { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
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
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata',
  };
  const formatter = new Intl.DateTimeFormat('en-IN', options);
  return formatter.format(new Date());
};

const Snackbar = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div class="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 max-w-72 w-full">
    <span class="flex-1">{message}</span>
    <button onClick={onClose} class="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
      &times;
    </button>
  </div>
);

const GreetingPage = (props: GreetingPageProps & JSX.IntrinsicElements['div']) => {
  const [loading, setLoading] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [toggleState, setToggleState] = useState(false);
  const [language, setLanguage] = useState('en');
  const { name } = props;
  const sanitizedName = sanitizeName(name || '');
  const currentTime = getFormattedTime();
  const currentUrl = window.location.href;

  useEffect(() => {
    const savedToggleState = localStorage.getItem('toggleState');
    if (savedToggleState !== null) {
      setToggleState(JSON.parse(savedToggleState));
    }

    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    setTimeout(() => {
      setLoading(false);
    }, 2000);

    const metaTitle = `${sanitizedName ? `${sanitizedName}` : ''} - Independence Day Greeting 🇮🇳`;
    const metaDescription = `Wishing you a very Happy Independence Day From ${sanitizedName ? `${sanitizedName}` : ''} - Check out your personalized greeting page.`;

    document.title = metaTitle;

    let metaDescriptionTag = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (metaDescriptionTag) {
      metaDescriptionTag.content = metaDescription;
    } else {
      metaDescriptionTag = document.createElement('meta');
      metaDescriptionTag.name = 'description';
      metaDescriptionTag.content = metaDescription;
      document.head.appendChild(metaDescriptionTag);
    }

    let linkCanonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (linkCanonicalTag) {
      linkCanonicalTag.href = currentUrl;
    } else {
      linkCanonicalTag = document.createElement('link');
      linkCanonicalTag.rel = 'canonical';
      linkCanonicalTag.href = currentUrl;
      document.head.appendChild(linkCanonicalTag);
    }

    return () => {
      document.title = 'Independence Day Greeting 🇮🇳';
      const metaDescriptionTag = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (metaDescriptionTag) metaDescriptionTag.content = '';
      const linkCanonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (linkCanonicalTag) linkCanonicalTag.href = '';
    };
  }, [sanitizedName, currentUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl)
      .then(() => setSnackbarMessage('URL copied'))
      .catch(() => setSnackbarMessage('Failed to copy URL.'));
  };

  const redirectToHome = () => {
    try {
      window.location.href = '/';
    } catch (error) {
      console.error('Error redirecting to home:', error);
      setSnackbarMessage('Failed to redirect. Please try again.');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (snackbarMessage) {
      timer = setTimeout(() => {
        setSnackbarMessage(null);
      }, 2500);
    }
    return () => clearTimeout(timer);
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
      {loading ? (
        <div class="flex items-center justify-center mb-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-800"></div>
        </div>
      ) : (
        <>
          <div class="chat-container">
            <IndianFlag />
            <div class="chat-box">
              <div class="chat-bubble right shadow-md focus:outline-none transition-transform duration-200 transform hover:scale-105">
                {sanitizedName ? `${sanitizedName} 🇮🇳` : '🇮🇳 Your Name Here'}
                <div class="chat-time">{currentTime}</div>
              </div>
              <div class="chat-bubble left shadow-md focus:outline-none transition-transform duration-200 transform hover:scale-105 text-base">
                {messages[language].greeting}
                <div class="chat-time">{currentTime}</div>
              </div>
              <div class="chat-bubble right shadow-md focus:outline-none transition-transform duration-200 transform hover:scale-105 text-base">
                {messages[language].message1}
                <div class="chat-time">{currentTime}</div>
              </div>
              <div class="chat-bubble left shadow-md focus:outline-none transition-transform duration-200 transform hover:scale-105 text-base">
                {messages[language].message2}
                <div class="chat-time">{currentTime}</div>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-center space-y-3">
            <label for="language-select" class="text-black font-bold">
              Choose Language
            </label>
            <select
              id="language-select"
              onChange={handleLanguageChange}
              value={language}
              class="p-2 rounded-lg shadow-lg text-black border-2 border-black focus:outline-none focus:ring focus:border-blue-300 transition duration-200"
            >
              <option value="en">English</option>
              <option value="ta">Tamil</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
              <option value="ml">Malayalam</option>
              <option value="kn">Kannada</option>
            </select>
          </div>
          <br />
          <div class="mb-4">
            <label class="flex items-center cursor-pointer">
              <span class="mr-2 text-lg">{toggleState ? 'Hide Options' : 'Show Options'}</span>
              <div class="relative">
                <input type="checkbox" checked={toggleState} onChange={() => setToggleState(!toggleState)} class="sr-only" />
                <div class={`block w-16 h-8 rounded-full ${toggleState ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div class={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${toggleState ? 'transform translate-x-8' : ''}`}></div>
              </div>
            </label>
          </div>
          {toggleState && (
            <div class="bg-white p-6 rounded-lg shadow-md mb-10 w-full max-w-md flex justify-between items-center space-x-4">
              <button onClick={copyToClipboard} class="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700">
                Copy URL
              </button>
              <button onClick={redirectToHome} class="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-green-500 hover:to-green-700">
                Create
              </button>
            </div>
          )}
        </>
      )}
      {snackbarMessage && (
        <Snackbar
          message={snackbarMessage}
          onClose={() => setSnackbarMessage(null)}
        />
      )}
    </div>
  );
};

export default GreetingPage;

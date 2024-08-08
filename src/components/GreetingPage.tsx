import { JSX } from 'preact';
// @ts-ignore
import DOMPurify from 'dompurify';
import slugify from 'slugify';
import { useEffect, useState } from 'preact/hooks';
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
    timeZone: 'Asia/Kolkata'
  };
  const formatter = new Intl.DateTimeFormat('en-IN', options);
  return formatter.format(new Date());
};

const Snackbar = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div class="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 max-w-xs w-full">
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
  const { name } = props;
  const sanitizedName = sanitizeName(name || '');
  const currentTime = getFormattedTime();
  const currentUrl = window.location.href;

  useEffect(() => {
    const savedToggleState = localStorage.getItem('toggleState');
    if (savedToggleState !== null) {
      setToggleState(JSON.parse(savedToggleState));
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
      .then(() => setSnackbarMessage('Greeting URL copied'))
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

  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-500 via-white to-green-600 p-4">
      {loading ? (
        <div class="flex items-center justify-center mb-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-800"></div>
        </div>
      ) : (
        <>
      <div class="chat-container mb-4">
          <IndianFlag />
            <div class="chat-box">
              <div class="chat-bubble right shadow-md focus:outline-none transition-transform duration-200 transform hover:scale-105">
                {sanitizedName ? `${sanitizedName} 🇮🇳` : '🇮🇳 Your Name Here'}
                <div class="chat-time">{currentTime}</div>
              </div>
              <div class="chat-bubble left shadow-md focus:outline-none transition-transform duration-200 transform hover:scale-105">
                <p>Wishing you a very Happy Independence Day 🇮🇳</p>
                <div class="chat-time">{currentTime}</div>
              </div>
              <div class="chat-bubble right shadow-md focus:outline-none transition-transform duration-200 transform hover:scale-105">
                <p>Let us remember the sacrifices of our great leaders and honor their legacy by working towards a brighter future for our nation</p>
                <div class="chat-time">{currentTime}</div>
              </div>
              <div class="chat-bubble left shadow-md focus:outline-none transition-transform duration-200 transform hover:scale-105">
                <p>May the flag of India always fly high and may our country continue to grow stronger and more united</p>
                <div class="chat-time">{currentTime}</div>
              </div>
            </div>
          </div>
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
            <div class="bg-white p-6 rounded-lg shadow-md mb-6 w-full max-w-md flex justify-between items-center space-x-4">
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

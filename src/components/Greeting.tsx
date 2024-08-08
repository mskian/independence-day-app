import { useState } from 'preact/hooks';
import slugify from 'slugify';
import IndianFlag from './IndianFlag';

const Greeting = () => {
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const validateName = (name: string): boolean => {
    const sanitized = name.trim();
    if (sanitized === '') {
      setError('Name cannot be empty.');
      return false;
    }
    if (sanitized.length === 1) {
      setError('Name must be at least 2 characters.');
      return false;
    }
    if (sanitized.length < 2 || sanitized.length > 36) {
      setError('Name must be at least 2 characters and cannot exceed 36 characters.');
      return false;
    }

    return true;
  };

  const sanitizeInput = (input: string): string => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  };

  const handleInputChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setName(value);
    setError(null);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (validateName(name)) {
      const sanitized = sanitizeInput(name);
      const slug = slugify(sanitized, { replacement: '-', remove: /[*+~.()'"!:@]/g, lower: false, strict: false });
      window.location.href = `/${slug}`;
    }
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-500 via-white to-green-600">
      <div class="flex flex-col items-center justify-center max-w-md w-full p-6">
        <div class="bg-gradient-to-r from-white via-gray-100 to-gray-200 p-6 rounded-lg shadow-lg w-full text-center">
          <IndianFlag />
          <br />
          <h2 class="text-3xl font-bold text-gray-800 mb-4">Independence Day Greeting</h2>
          <p class="text-lg text-gray-700 mb-6">Enter your name to receive a personalized greeting</p>
          <form onSubmit={handleSubmit} class="bg-gradient-to-r from-orange-500 to-green-800 text-white p-8 rounded-lg shadow-md w-full">
            <div class="mb-6">
              <input
                type="text"
                id="name"
                value={name}
                onInput={handleInputChange}
                class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-yellow-100 text-rose-900"
                placeholder="Enter your name here"
                autocomplete='off'
              />
              {error && <p class="text-red-900 text-base italic mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              class="w-full py-3 bg-gradient-to-r from-rose-400 to-purple-500 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              Submit
            </button>
          </form>
          <div class="mt-10">
          <hr class="border-t-2 border-gray-800 my-8" />
          <p class="text-sm text-gray-700 mb-6">Built Using 🥳 Preact and Vite 🔥<br />🥤 <a href="https://github.com/mskian/independence-day-app" target="_blank" rel="nofollow noopener" class="text-rose-900 hover:underline">
           View on GitHub</a>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Greeting;

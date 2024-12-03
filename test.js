export default class Chatbot {
  constructor() {
    // Empty config object, it will be populated only from the JSON file
    this.config = {};
    
    this.isVisible = false; // Chatbot starts as hidden.
    this.hasDefaultMessageDisplayed = false;
    this.messages = [];

    // Styles and elements will only be created after loading the config from JSON
    this.loadConfig(); 
  }

  // Method to load configuration from a JSON file
  loadConfig() {
    fetch('chatbot-config.json')
      .then(response => {
        if (!response.ok) {
          throw new Error("Error fetching the config file");
        }
        return response.json();
      })
      .then(data => {
        // Assign the fetched data to the config, no defaults
        this.config = data;

        // Ensure that mandatory config values are present
        this.validateConfig();

        // Apply styles and content after config is loaded
        this.createStyles();
        this.createChatbotElement();
        // this.updateStyles();
        this.updateContent();
      })
      .catch(error => console.error('Error loading config:', error));
  }

  // Method to validate the config and throw errors if required fields are missing
  validateConfig() {
    const requiredFields = [
      'logo', 'name', 'primaryColor', 'secondaryColor', "tertiaryColor", 'icon', 
      "Yposition", "Xposition", "inputBorder", "inputShadow", "opacity", "width", 
      "height", "dottime", "defaultMessage"
    ];
    
    requiredFields.forEach(field => {
      if (!this.config[field]) {
        throw new Error(`Missing required config field: ${field}`);
      }
    });
  }

  createRgbaWithOpacity(color, opacity = this.config.opacity) {
    // Extract the RGB components from the color string (assuming it's in rgba or rgb format)
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const [r, g, b] = [rgbMatch[1], rgbMatch[2], rgbMatch[3]];
      return `rgba(${r}, ${g}, ${b}, ${opacity})`; // Append opacity to create rgba color
    }
    return color; // Fallback if the color format is not correct
  }

  createStyles() {

    const style = document.createElement('style');
    const primaryOpaque = this.createRgbaWithOpacity(this.config.primaryColor); 
    const secondaryOpaque = this.createRgbaWithOpacity(this.config.secondaryColor); 
    const tertiaryOpaque = this.createRgbaWithOpacity(this.config.tertiaryColor); 

    style.textContent = `
    .chatbot-container {
      font-family: ${this.config.fontFamily}; 
      position: fixed;
      ${this.config.Yposition}: 20px; 
      ${this.config.Xposition}: 20px; 
      width: ${this.config.width};
      background-color: ${this.config.primaryColor}; 
      border-radius: 20px; 
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      display: block;
      z-index: 1000;
      
      /* Start hidden and off-screen */
      opacity: 0;
      transform: translateY(0);
      pointer-events: none; /* Disable interaction when hidden */
      
      /* Transition effect */
      transition: opacity 0.5s ease, transform 1s ease;
    }
    
    .chatbot-container.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto; /* Enable interaction */
    }


      .suggestions {
        display: flex;
        justify-content: center; /* Center the suggestion buttons horizontally */
        flex-wrap: wrap; /* Allow wrapping if there are many buttons */
        gap: 8px; /* Space between buttons */
        padding: 5px;
    }
      .chatbot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-radius:  ${this.config.borderRadius};
      }

      .chatbot-title {
        font-weight: bold;
        font-size: 18px;
        color: ${this.config.tertiaryColor}; 
      }
      .close-button {
        background: ${this.config.backgroundCloseButton};
        border-radius: ${this.config.borderRadius};
        color: ${this.config.secondaryColor};
        border: none;
        font-size: 30px;
        cursor: pointer;
      }
      /* The chatbot-messages container */
    .chatbot-messages {
      height: ${this.config.height};
      overflow-y: auto;
      padding: 10px;
      display: flex;
      flex-direction: column; /* Ensures that messages are stacked vertically */
    }

    /* Base styles for all messages */
    .message {
      margin-bottom: 10px;
      padding: 8px 12px;
      border-radius: ${this.config.borderRadius};
      max-width: 70%; /* Ensure messages don't stretch across the full width */
    }

    /* User messages: aligned to the right */
    .user-message {
      color: white;
      align-self: flex-end; /* Align the user's message to the right */
      margin-left: auto; /* Pushes the message to the rightmost side */
      background-color: ${tertiaryOpaque}; 
      box-shadow: 0 0 10px ${primaryOpaque}; /*Should become a variable*/
    }

    /* Bot messages: aligned to the left */
    .bot-message {
      color: white;
      align-self: flex-start; /* Align bot messages to the left */
      background-color: rgba(0, 0, 0, 0.25); 
    }

    .chatbot-input {
      display: flex;
      padding: 5px;
      background-color: ${tertiaryOpaque}; 
      margin: 10px;
      border-radius: ${this.config.borderRadius};
      transition: border 0.3s ease, box-shadow 0.3s ease; 
    }
    
    /* When the input is focused */
    .chatbot-input:focus-within {
      ${this.config.inputBorder}: 1px solid ${this.config.secondaryColor}; /* Border color */
      // border-radius: ${this.config.borderRadius};
      ${this.config.inputShadow}: 0 0 10px ${this.config.secondaryColor}; 
    }

      .chatbot-input input {
        flex-grow: 1;
        padding: 8px;
        margin-right: 8px;
        background-color: transparent; /* Make input background fully transparent */
        border: none; /* Remove borders */
        outline: none; /* Remove focus outline */
        color: white; /* Ensure the typed text is visible */
        font-size: 16px; /* Adjust text size */
    }
  
      .chatbot-input button {
        padding: 10px;
        margin-right: 1px;
        color: white;
        border: none;
        border-radius: ${this.config.borderRadius};
        cursor: pointer;
        background-color: ${this.config.primaryColor}
      }

      .chatbot-input input::placeholder {
        color: rgba(255, 255, 255); /* Grey color with transparency */
    }

    /* Placeholder becomes invisible when input is focused */
      .chatbot-input input:focus::placeholder {
          color: rgba(256, 256, 256, 0.5); /* Make placeholder invisible when typing */
      }
      
      .suggestion-button {
        padding: 6px 12px;
        border: none; /* Removes the border */
        border-radius: ${this.config.borderRadius};
        cursor: pointer;
        color: white;
        background-color: ${tertiaryOpaque}; 
    }
    
      .toggle-chatbot {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: ${this.config.toggleRadius}; 
        background-color:  ${this.config.primaryColor}; 
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        z-index: 1000;
      }

      .toggle-chatbot img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }

      .bot-message {
        color: white;
        align-self: flex-start;
        background-color: rgba(0, 0, 0, 0.25);
      }
      
      .thinking-dots::after {
        content: '';
        display: inline-block;
        margin-left: 5px;
        width: 0.5em;
        height: 0.5em;
        border-radius: 50%;
        background-color: transparent;
        animation: dots-loading 1.5s steps(1, end) infinite;
      }

      @keyframes dots-loading {
        0%, 20% {
          background-color: transparent;
          box-shadow: 0em 0em transparent, 1.2em 0em transparent, 2.4em 0em transparent;
        }
        40% {
          background-color: white;
          box-shadow: 0em 0em white, 1.2em 0em transparent, 2.4em 0em transparent;
        }
        60% {
          box-shadow: 0em 0em white, 1.2em 0em white, 2.4em 0em transparent;
        }
        80%, 100% {
          box-shadow: 0em 0em white, 1.2em 0em white, 2.4em 0em white;
        }
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translate3d(0, 10px, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }
      
      .message {
        animation: fadeInUp 0.3s ease-out;
      }

      /* WebKit-based browsers (Chrome, Safari, etc.) scrollbar styling */
    .chatbot-messages::-webkit-scrollbar {
      width: 12px; 
    }

    .chatbot-messages::-webkit-scrollbar-track {
      background: ${this.config.primaryColor}; /* Background color of the scrollbar track */
      border-radius: 10px;
      margin: 20px
      padding: 0 10px
    }

    .chatbot-messages::-webkit-scrollbar-thumb {
      background-color: ${tertiaryOpaque}; /* Color of the scrollbar thumb */
      border-radius: 10px; /* Rounded corners on the scrollbar thumb */
      border: 3px solid ${this.config.primaryColor}; /* Border around the thumb */
    }


    `;
    document.head.appendChild(style);
  }

  
  createChatbotElement() {
    // Function to map inputButtonType to corresponding icon or text
      const getInputButtonContent = (type) => {
        switch (type) {
          case 'up-arrow':
            return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#01E7F7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="25" x2="12" y2="5"></line>
                      <polyline points="5 12 12 5 19 12"></polyline>
                    </svg>`;
          case 'tick':
            return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#01E7F7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>`;
          case 'send':
            return 'Send';
          case 'ok':
            return 'Ok';
          case 'right-arrow':
            return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#01E7F7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="1" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>`;
          default:
            return 'Send'; // Default to "Send" if no match
        }
      };

    // Check if logo is provided, otherwise use the name
    const titleContent = this.config.logo && this.config.logo.endsWith('.svg')
    ? `<img src="${this.config.logo}" alt="Chatbot Logo" style="width: 40px; height: 40px;">`
    : this.config.name;

    const titleName = this.config.name
  
    const iconContent = this.config.icon.endsWith('.svg')
      ? `<img src="${this.config.icon}" alt="Chatbot Icon"/>`
      : this.config.icon;
  
    const inputButtonContent = getInputButtonContent(this.config.inputButtonType); // Get button content based on the config
  
    const chatbotHTML = `
      <button class="toggle-chatbot" id="toggleChatbot">${iconContent}</button>
      <div class="chatbot-container" id="chatbotContainer">
        <div class="chatbot-header">
          <span class="chatbot-logo">${titleContent}</span> <span class = "chatbot-title">${titleName}</span>
          <button class="close-button" id="closeChatbot">&times;</button>
        </div>
        <div class="chatbot-messages" id="chatbotMessages"></div>
        <div class="suggestions" id="suggestions"></div>
        <div class="chatbot-input">
          <input type="text" id="userInput" placeholder="Type something...">
          <button id="sendMessage">
          ${inputButtonContent}
          </button>
        </div>
      </div>
    `;
  
    const chatbotElement = document.createElement('div');
    chatbotElement.innerHTML = chatbotHTML;
    document.body.appendChild(chatbotElement);
  
    this.chatbotContainer = document.getElementById('chatbotContainer');
    this.toggleChatbot = document.getElementById('toggleChatbot');
    this.closeChatbot = document.getElementById('closeChatbot');
    this.chatbotMessages = document.getElementById('chatbotMessages');
    this.userInput = document.getElementById('userInput');
    this.sendMessage = document.getElementById('sendMessage');
    this.suggestionsContainer = document.getElementById('suggestions');
  
    this.toggleChatbot.addEventListener('click', () => this.toggleChatbotVisibility());
    this.closeChatbot.addEventListener('click', () => this.toggleChatbotVisibility());
    this.sendMessage.addEventListener('click', () => this.handleSend());
    this.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });
  
    this.createSuggestions();
  }
  

  updateContent() {
    const iconContent = this.config.icon.endsWith('.svg')
      ? `<img src="${this.config.icon}" alt="Chatbot Icon"/>`
      : this.config.icon;
  
    this.toggleChatbot.innerHTML = iconContent;
  
    const titleContent = this.config.logo && this.config.logo.endsWith('.svg')
      ? `<img src="${this.config.logo}" alt="Chatbot Logo" style="width: 40px; height: 40px;">`
      : this.config.name;
  
    this.chatbotContainer.querySelector('.chatbot-logo').innerHTML = titleContent;
  
    this.createSuggestions();
  }
  
  toggleChatbotVisibility() {
    if (this.isVisible) {
      // Hide chatbot
      this.chatbotContainer.classList.remove('visible');
    } else {
      // Show chatbot
      this.chatbotContainer.classList.add('visible');
    }
    this.isVisible = !this.isVisible; // Toggle visibility state

    // Display the default message the first time the chatbot is opened
    if (this.isVisible && !this.hasDefaultMessageDisplayed) {
      this.addMessage(this.config.defaultMessage || "👋🏻  Hi! How can I help you today?", 'bot');
      this.hasDefaultMessageDisplayed = true;
    }
  }
  
    addMessage(text, sender) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', `${sender}-message`);
      messageElement.textContent = text;
      this.chatbotMessages.appendChild(messageElement);
      this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }
  
    async handleSend() {
      const text = this.userInput.value.trim();
      if (text) {
          this.addMessage(text, 'user');
          this.userInput.value = '';
  
          // Show thinking dots immediately after the user message
          const thinkingDots = this.showThinkingDots();
  
          // Check if the input matches predefined suggestions
          const suggestionResponse = this.getSuggestionResponse(text);
  
          // If there is a suggestion match, return predefined response
          if (suggestionResponse) {
              this.chatbotMessages.removeChild(thinkingDots); // Remove thinking dots
              this.addMessage(suggestionResponse, 'bot');
          } else {
              // If no suggestion match, process input and send to backend (Google Cloud)
              try {
                  const response = await this.processUserInput(text);
  
                  // Remove thinking dots after receiving the response
                  this.chatbotMessages.removeChild(thinkingDots);
                  this.addMessage(response, 'bot');
              } catch (error) {
                  console.error('Error fetching response:', error);
  
                  // Handle error case by removing dots and showing a message
                  this.chatbotMessages.removeChild(thinkingDots);
                  this.addMessage('Sorry, something went wrong while fetching the response.', 'bot');
              }
          }
      }
  }
  
  
      // Helper to send user input to backend and retrieve OpenAI response
      async processUserInput(userInput) {
          // Save user input and the file info
          const ID_chatbot_client = this.config.ID_chatbot_client;
          const payload = { userInput, ID_chatbot_client}; // Build payload with user input and filename
      
          try {
              const response = await fetch('http://127.0.0.1:5001/', { // Replace with your backend URL
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload) // Send user input to the server,
              });
              const result = await response.json(); // Wait for server's response (OpenAI's response)
              return result.message || 'Sorry, I could not retrieve an answer at this moment.';
          } catch (error) {
              console.error('Error fetching from server:', error);
              return 'There was an error retrieving the response.';
          } 
      }
  
    showThinkingDots() {
      const thinkingDots = document.createElement('div');
      thinkingDots.classList.add('message', 'bot-message', 'thinking-dots');
      this.chatbotMessages.appendChild(thinkingDots);
      this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
      return thinkingDots;
    }
  
    async simulateDelay(seconds) {
      return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
  
    getResponse(text) {
      return "This is a default response."; // Placeholder response
    }
  
    createSuggestions() {
      this.suggestionsContainer.innerHTML = '';
      this.config.suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.classList.add('suggestion-button');
        button.textContent = suggestion;
  
        button.addEventListener('click', async () => {
          this.addMessage(suggestion, 'user');
  
          const thinkingDots = this.showThinkingDots();
          await this.simulateDelay(this.config.dottime);
          this.chatbotMessages.removeChild(thinkingDots);
  
          const response = this.getSuggestionResponse(suggestion);
          this.addMessage(response, 'bot');
        });
  
        this.suggestionsContainer.appendChild(button);
      });
    }
  
    // Predefined responses for suggestions
    getSuggestionResponse(text) {
      const suggestionIndex = this.config.suggestions.indexOf(text);
      if (suggestionIndex !== -1) {
          return this.config.responses[suggestionIndex];
      }
      return null;
    }
  }

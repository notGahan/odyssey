document.addEventListener('DOMContentLoaded', () => {
    const styleButtons = document.querySelectorAll('.style-btn');
    const questionInput = document.getElementById('questionInput');
    const inputContainer = document.querySelector('.input-container');
    const inputPrefix = document.querySelector('.input-prefix');
    const introContainer = document.querySelector('.intro-container');
    const chatContainer = document.querySelector('.chat-container');
    const messagesContainer = document.querySelector('.messages-container');
    const chatInput = document.querySelector('.chat-input');
    const startNewChatBtn = document.querySelector('.start-new-chat');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    const modalInput = document.querySelector('.modal-input');
    const modalSubmit = document.querySelector('.modal-submit');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <img src="assets/images/incorrect-icon.svg" alt="Error">
        <span>Incorrect keyword!</span>
    `;
    document.querySelector('.modal').insertBefore(errorMessage, modalSubmit);
    let selectedStyle = '';
    let userMessageCount = 0;
    let currentSecretWord = '';
    let pendingMessage = null;
    let completedChallenges = 0;
    let initialQuestion = '';

    const challenges = [
        {
            prompt: "Go to the Digital Fabrication Lab and find the SECRET CODE WORD kept inside a box.",
            secretWord: "Jellybean"
        },
        {
            prompt: "Head to the Bio Lab and find the SECRET CODE WORD kept inside a box.",
            secretWord: "Pickle"
        },
        {
            prompt: "Go to the umbrella stand and find the SECRET CODE WORD kept inside a box.",
            secretWord: "Poptart"
        },
        {
            prompt: "Look under the couches and find the SECRET CODE WORD kept inside a box.",
            secretWord: "Pineapple"
        }
    ];

    // Shuffle array function
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    let shuffledChallenges = shuffleArray([...challenges]).slice(0, 2);
    const challengeTriggers = [2, 4]; // Show modal before 3rd and 5th messages

    function showModal(challenge) {
        modalContent.textContent = challenge.prompt;
        currentSecretWord = challenge.secretWord;
        modalInput.value = '';
        modalOverlay.classList.add('active');
        modalInput.focus();
    }

    modalSubmit.addEventListener('click', () => {
        if (modalInput.value.toLowerCase() === currentSecretWord.toLowerCase()) {
            modalOverlay.classList.remove('active');
            modalInput.classList.remove('error');
            errorMessage.classList.remove('visible');
            completedChallenges++;
            proceedWithMessage();
        } else {
            modalInput.classList.add('error');
            errorMessage.classList.add('visible');
        }
    });

    modalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            modalSubmit.click();
        }
    });

    // Modify your message handling to check for challenges
    function checkForChallenge() {
        // Check before 4th, 8th, and 12th user messages
        if (challengeTriggers.includes(userMessageCount)) {
            const challengeIndex = challengeTriggers.indexOf(userMessageCount);
            if (challengeIndex < shuffledChallenges.length) {
                showModal(shuffledChallenges[challengeIndex]);
                return true;
            }
        }
        return false;
    }

    // Update your message handling functions
    function addMessage(content, isAI = false) {
        if (!isAI) {
            userMessageCount++;  // Only increment for user messages
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isAI ? 'ai' : 'you'}`;
        
        if (isAI) {
            messageDiv.innerHTML = `
                <div class="message-avatar">AI</div>
                <div class="message-content">${content}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">You</div>
                ${content}
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'odyssey-loading';
        loadingDiv.innerHTML = `
            <img src="assets/images/loading-icon.svg" alt="Loading">
            Odyssey is thinking...
        `;
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return loadingDiv;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return typingDiv;
    }

    questionInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && questionInput.value.trim() !== '') {
            const question = inputPrefix.textContent + questionInput.value;
            initialQuestion = question;
            
            // Switch to chat interface
            introContainer.style.display = 'none';
            chatContainer.classList.add('active');
            
            if (checkForChallenge()) {
                pendingMessage = question;
                return;
            }
            
            // Add user's question
            addMessage(question, false);
            
            try {
                // Show loading state
                chatInput.disabled = true;
                chatInput.placeholder = 'Odyssey is thinking...';
                const typingIndicator = showTypingIndicator();
                
                // Get AI response
                const response = await sendMessage(question);
                
                // Remove typing indicator
                typingIndicator.remove();
                
                // Add AI's response
                addMessage(response, true);
                
                // Reset input
                chatInput.disabled = false;
                chatInput.placeholder = 'Reply to Odyssey...';
                chatInput.focus();
            } catch (error) {
                console.error('Error:', error);
                addMessage('Sorry, I encountered an error. Please try again.', true);
            }
        }
    });

    chatInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && chatInput.value.trim() !== '') {
            const message = chatInput.value;
            chatInput.value = '';
            
            if (checkForChallenge()) {
                pendingMessage = message;
                return;
            }
            
            addMessage(message, false);
            
            try {
                chatInput.disabled = true;
                chatInput.placeholder = 'Odyssey is thinking...';
                const typingIndicator = showTypingIndicator();
                
                const response = await sendMessage(message);
                typingIndicator.remove();
                addMessage(response, true);
                
                chatInput.disabled = false;
                chatInput.placeholder = 'Reply to Odyssey...';
                chatInput.focus();
            } catch (error) {
                console.error('Error:', error);
                addMessage('Sorry, I encountered an error. Please try again.', true);
            }
        }
    });

    startNewChatBtn.addEventListener('click', () => {
        chatContainer.classList.remove('active');
        introContainer.style.display = 'block';
        messagesContainer.innerHTML = '';
        chatInput.value = '';
        questionInput.value = '';
        inputPrefix.textContent = '';
        questionInput.disabled = true;
        questionInput.placeholder = 'How can Odyssey help?';
        styleButtons.forEach(btn => btn.classList.remove('active'));
        inputContainer.classList.remove('active');
        userMessageCount = 0;
        shuffledChallenges = shuffleArray([...challenges]).slice(0, 2);  // Reset to 2 challenges
    });

    // Add this function to handle pending messages
    function proceedWithMessage() {
        if (pendingMessage) {
            const message = pendingMessage;
            pendingMessage = null;
            
            addMessage(message, false);
            
            // Continue with AI response
            (async () => {
                try {
                    chatInput.disabled = true;
                    chatInput.placeholder = 'Odyssey is thinking...';
                    const typingIndicator = showTypingIndicator();
                    
                    let response;
                    if (completedChallenges === 2) {
                        // Final response - direct answer to initial question
                        response = await sendMessage(initialQuestion, true);
                        // Clear modal content after final answer
                        modalContent.textContent = '';
                        modalInput.value = '';
                    } else {
                        // Normal Socratic response
                        response = await sendMessage(message);
                    }
                    
                    typingIndicator.remove();
                    addMessage(response, true);
                    
                    chatInput.disabled = false;
                    chatInput.placeholder = 'Reply to Odyssey...';
                    chatInput.focus();
                } catch (error) {
                    console.error('Error:', error);
                    addMessage('Sorry, I encountered an error. Please try again.', true);
                }
            })();
        }
    }

    async function sendMessage(message, isDirectResponse = false) {
        const systemPrompt = isDirectResponse ? 
            `Now that the user has completed all challenges, provide a direct and comprehensive answer to their original question. 
            Be thorough but concise, and focus on giving practical, actionable information.
            Respond in 3-4 sentences maximum. Start the response with "Okay, I'll give you the answer since you worked hard for it."` 
            : 
            `You are to use the Socratic Inquiry method to respond, focusing on asking relevant questions rather than providing direct answers.
            Ask questions on the lines of why they want that, what they want from that etc. 
            Question the very nature of the question from the philosophical lens to make them think deeper about the context of what they are asking. 
            GO TO THE ORIGIN AND HISTORY OF THINGS. Try connecting the dots in how things evolved over a period of time and geography. How the world is interconnected. 
            Prod them into asking social, ethical and value based questions. Look at things from the lens of a philosopher and an anthropologist. 
            Use colloquial language.
            YOU HAVE TO RESPOND IN LESS THAN 2 OR 3 SENTENCES
            Avoid giving answers directly as much as possible. Instead, ask questions that will guide the user to try and figure out the answer themselves.`;

        const response = await fetch('http://192.168.1.189:1234/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    { role: "user", content: message }
                ],
                model: "lmstudio-community/llama-3.2-3b-instruct",
                stream: false
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Add back the button click handlers
    styleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            styleButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Store selected style
            selectedStyle = button.dataset.style;
            
            // Set the prefix text based on button
            inputPrefix.textContent = button.textContent.trim() + ' ';
            
            // Enable input and update placeholder
            questionInput.disabled = false;
            questionInput.placeholder = '';
            questionInput.focus();

            // Show Step 2 content
            inputContainer.classList.add('active');
        });
    });

    // Add input handler to reset error state
    modalInput.addEventListener('input', () => {
        modalInput.classList.remove('error');
        errorMessage.classList.remove('visible');
    });

    // Keep the existing focus handler as well
    modalInput.addEventListener('focus', () => {
        modalInput.classList.remove('error');
        errorMessage.classList.remove('visible');
    });
}); 
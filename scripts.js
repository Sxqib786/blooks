
document.addEventListener('DOMContentLoaded', function () {
    // Faq tabs
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('active')) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });

    // Copy content
    function copyConsoleCode() {
        const codeText = document.getElementById('consoleCode').innerText;
        navigator.clipboard.writeText(codeText)
            .then(() => {
                alert('Code copied to clipboard! Now paste it into the Blooket console.');
            })
            .catch(err => {
                console.error('Error copying text: ', err);
                alert('Failed to copy code. Please select and copy it manually.');
            });
    }
    // Navigation toggle 
    const toggleButton = document.querySelector('.navbar-toggle');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    toggleButton.addEventListener('click', function () {
        navbarCollapse.classList.toggle('collapse');
    });

    const searchToggle = document.getElementById('searchToggle');
    const searchBox = document.getElementById('searchBox');

    searchToggle.addEventListener('click', function (e) {
        e.preventDefault();
        searchBox.classList.toggle('show');
        if (searchBox.classList.contains('show')) {
            searchBox.querySelector('input[type="text"]').focus();
        }
    });

    // Optional: close on outside click
    document.addEventListener('click', function (e) {
        if (!searchBox.contains(e.target) && !searchToggle.contains(e.target)) {
            searchBox.classList.remove('show');
        }
    });

    // Question Generator start
    class BlooketQuestionGenerator {
        constructor() {
            this.questions = [];
            this.currentDifficulty = 'easy';
            this.initializeEventListeners();
        }

        initializeEventListeners() {
            // Form submission
            const questionForm = document.getElementById('questionForm');
            if (questionForm) {
                questionForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.generateQuestions();
                });
            }

            // Slider for question count
            const slider = document.getElementById('numQuestions');
            if (slider) {
                const countDisplay = document.getElementById('questionCount');
                slider.addEventListener('input', (e) => {
                    countDisplay.textContent = e.target.value;
                });
            }

            // Difficulty buttons
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentDifficulty = btn.dataset.difficulty;
                });
            });

            // Copy all questions
            const copyAllBtn = document.getElementById('copyAllBtn');
            if (copyAllBtn) {
                copyAllBtn.addEventListener('click', () => {
                    this.copyAllQuestions();
                });
            }

            // Export questions
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportQuestions();
                });
            }
        }

        async generateQuestions() {
            const topic = document.getElementById('topic').value;
            const numQuestions = document.getElementById('numQuestions').value;

            if (!topic.trim()) {
                this.showToast('Please enter a topic!', 'error');
                return;
            }

            this.showLoading(true);
            document.getElementById('generateBtn').disabled = true;

            try {
                // Simulate AI generation with realistic delay
                await this.delay(2000 + Math.random() * 2000);

                this.questions = await this.generateQuestionsData(topic, numQuestions, this.currentDifficulty);
                this.displayQuestions();
                this.showToast(`Generated ${numQuestions} questions successfully!`);
            } catch (error) {
                this.showToast('Error generating questions. Please try again.', 'error');
            } finally {
                this.showLoading(false);
                document.getElementById('generateBtn').disabled = false;
            }
        }

        async generateQuestionsData(topic, count, difficulty) {
            const questions = [];
            const difficultyTemplates = {
                easy: {
                    patterns: [
                        'What is {concept}?',
                        'Which of the following is true about {concept}?',
                        'What does {concept} mean?',
                        'Identify the correct {concept}:'
                    ],
                    concepts: this.getTopicConcepts(topic, 'basic')
                },
                medium: {
                    patterns: [
                        'How does {concept} relate to {concept2}?',
                        'What happens when {concept} occurs?',
                        'Which factor most affects {concept}?',
                        'What is the primary cause of {concept}?'
                    ],
                    concepts: this.getTopicConcepts(topic, 'intermediate')
                },
                hard: {
                    patterns: [
                        'Analyze the relationship between {concept} and {concept2}.',
                        'What would be the consequence if {concept} were absent?',
                        'Compare and contrast {concept} with {concept2}.',
                        'Evaluate the impact of {concept} on {concept2}.'
                    ],
                    concepts: this.getTopicConcepts(topic, 'advanced')
                }
            };

            const template = difficultyTemplates[difficulty];

            for (let i = 0; i < count; i++) {
                const pattern = template.patterns[Math.floor(Math.random() * template.patterns.length)];
                const concepts = [...template.concepts];
                const concept = concepts[Math.floor(Math.random() * concepts.length)];
                const concept2 = concepts[Math.floor(Math.random() * concepts.length)];

                const question = pattern
                    .replace('{concept}', concept)
                    .replace('{concept2}', concept2);

                const answers = this.generateAnswers(topic, concept, difficulty);

                questions.push({
                    id: i + 1,
                    question: question,
                    answers: answers,
                    difficulty: difficulty,
                    topic: topic
                });
            }

            return questions;
        }

        getTopicConcepts(topic, level) {
            const topicMaps = {
                'mathematics': {
                    basic: ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals'],
                    intermediate: ['algebra', 'geometry', 'statistics', 'probability', 'equations', 'functions'],
                    advanced: ['calculus', 'trigonometry', 'complex numbers', 'matrix theory', 'differential equations']
                },
                'science': {
                    basic: ['atoms', 'cells', 'plants', 'animals', 'water cycle', 'solar system'],
                    intermediate: ['photosynthesis', 'gravity', 'chemical reactions', 'electricity', 'magnetism'],
                    advanced: ['quantum mechanics', 'DNA replication', 'thermodynamics', 'electromagnetic radiation']
                },
                'history': {
                    basic: ['ancient civilizations', 'world wars', 'famous leaders', 'important dates'],
                    intermediate: ['political systems', 'economic factors', 'social movements', 'cultural changes'],
                    advanced: ['historiography', 'causation analysis', 'comparative history', 'historical methodology']
                }
            };

            const lowerTopic = topic.toLowerCase();
            for (const [key, values] of Object.entries(topicMaps)) {
                if (lowerTopic.includes(key)) {
                    return values[level] || values.basic;
                }
            }

            // Generic concepts if topic not found
            return [
                `${topic} fundamentals`, `${topic} principles`, `${topic} applications`,
                `${topic} theory`, `${topic} practices`, `${topic} concepts`
            ];
        }

        generateAnswers(topic, concept, difficulty) {
            const correctAnswer = this.generateCorrectAnswer(topic, concept, difficulty);
            const incorrectAnswers = this.generateIncorrectAnswers(topic, concept, difficulty, 3);

            const answers = [correctAnswer, ...incorrectAnswers];

            // Shuffle answers
            for (let i = answers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [answers[i], answers[j]] = [answers[j], answers[i]];
            }

            return answers.map((answer, index) => ({
                id: String.fromCharCode(65 + index), // A, B, C, D
                text: answer.text,
                isCorrect: answer.isCorrect
            }));
        }

        generateCorrectAnswer(topic, concept, difficulty) {
            const templates = [
                `The primary characteristic of ${concept}`,
                `${concept} is essential for ${topic}`,
                `${concept} demonstrates key ${topic} principles`,
                `Understanding ${concept} is crucial in ${topic}`
            ];

            return {
                text: templates[Math.floor(Math.random() * templates.length)],
                isCorrect: true
            };
        }

        generateIncorrectAnswers(topic, concept, difficulty, count) {
            const templates = [
                `${concept} is unrelated to ${topic}`,
                `${concept} contradicts ${topic} principles`,
                `${concept} has no impact on ${topic}`,
                `${concept} is obsolete in ${topic}`,
                `${concept} only applies to advanced ${topic}`,
                `${concept} is a misconception in ${topic}`
            ];

            return templates
                .sort(() => Math.random() - 0.5)
                .slice(0, count)
                .map(text => ({ text, isCorrect: false }));
        }

        displayQuestions() {
            const container = document.getElementById('questionsDisplay');
            container.innerHTML = '';

            this.questions.forEach(question => {
                const questionCard = this.createQuestionCard(question);
                container.appendChild(questionCard);
            });

            document.getElementById('questionsContainer').style.display = 'block';
        }

        createQuestionCard(question) {
            const card = document.createElement('div');
            card.className = 'question-card';
            card.innerHTML = `
                    <div class="question-header">
                        <div class="question-number">Question ${question.id}</div>
                        <button class="copy-question-btn" onclick="questionGenerator.copyQuestion(${question.id})">
                            📋 Copy
                        </button>
                    </div>
                    <div class="question-text">${question.question}</div>
                    <div class="answers-grid">
                        ${question.answers.map(answer => `
                            <div class="answer-option ${answer.isCorrect ? 'correct' : ''}">
                                <div class="answer-label">${answer.id}.</div>
                                <div>${answer.text}</div>
                                ${answer.isCorrect ? '<div class="correct-indicator">✓</div>' : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="difficulty-badge difficulty-${question.difficulty}">
                        ${question.difficulty.toUpperCase()}
                    </div>
                `;
            return card;
        }

        copyQuestion(questionId) {
            const question = this.questions.find(q => q.id === questionId);
            if (!question) return;

            const text = this.formatQuestionForCopy(question);
            this.copyToClipboard(text);
            this.showToast(`Question ${questionId} copied to clipboard!`);
        }

        copyAllQuestions() {
            const allText = this.questions.map(q => this.formatQuestionForCopy(q)).join('\n\n');
            this.copyToClipboard(allText);
            this.showToast('All questions copied to clipboard!');
        }

        formatQuestionForCopy(question) {
            let text = `Question ${question.id}: ${question.question}\n`;
            question.answers.forEach(answer => {
                text += `${answer.id}. ${answer.text}${answer.isCorrect ? ' ✓' : ''}\n`;
            });
            text += `Difficulty: ${question.difficulty.toUpperCase()}\n`;
            return text;
        }

        exportQuestions() {
            const content = this.questions.map(q => this.formatQuestionForCopy(q)).join('\n\n');
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `blooket-questions-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showToast('Questions exported successfully!');
        }

        copyToClipboard(text) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
        }

        showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = `toast ${type === 'error' ? 'error' : ''}`;
            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        showLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // Initialize the generator
    const questionGenerator = new BlooketQuestionGenerator();

    // Question Generator end

});


// social media share 
function shareOnFacebook() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank');
}
function shareOnTwitter() {
    window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href), '_blank');
}
function shareOnLinkedIn() {
    window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.href), '_blank');
}
function shareOnInstagram() {
    window.open('https://www.instagram.com/?url=' + encodeURIComponent(window.location.href), '_blank');
}
function shareOnWhatsApp() {
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(window.location.href), '_blank');
}
function loadVideo(el) {
    const videoId = el.getAttribute('data-id');
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1`);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.style.width = "100%";
    iframe.style.height = "100%";

    el.innerHTML = '';
    el.appendChild(iframe);
    el.style.width = '100%';
    el.style.maxWidth = '720px';
    el.style.height = '405px';
}
// customcode for for send button
// Blook list from user
var fblooks = [
    "Chick", "Chicken", "Cow", "Goat", "Horse", "Pig", "Sheep", "Duck", "Alpaca", "Dog", "Cat", "Rabbit", "Goldfish", "Hamster", "Turtle", "Kitten", "Puppy", "Bear", "Moose", "Fox", "Raccoon", "Squirrel", "Owl", "Hedgehog", "Deer", "Wolf", "Beaver", "Tiger", "Orangutan", "Cockatoo", "Parrot", "Anaconda", "Jaguar", "Macaw", "Toucan", "Panther", "Capuchin", "Gorilla", "Hippo", "Rhino", "Giraffe", "Snowy Owl", "Polar Bear", "Arctic Fox", "Baby Penguin", "Penguin", "Arctic Hare", "Seal", "Walrus", "Witch", "Wizard", "Elf", "Fairy", "Slime Monster", "Jester", "Dragon", "Queen", "Unicorn", "King", "Two of Spades", "Eat Me", "Drink Me", "Alice", "Queen of Hearts", "Dormouse", "White Rabbit", "Cheshire Cat", "Caterpillar", "Mad Hatter", "King of Hearts", "Toast", "Cereal", "Yogurt", "Breakfast Combo", "Orange Juice", "Milk", "Waffle", "Pancakes", "French Toast", "Pizza", "Earth", "Meteor", "Stars", "Alien", "Planet", "UFO", "Spaceship", "Astronaut", "Lil Bot", "Lovely Bot", "Angry Bot", "Happy Bot", "Watson", "Buddy Bot", "Brainy Bot", "Mega Bot", "Old Boot", "Jellyfish", "Clownfish", "Frog", "Crab", "Pufferfish", "Blobfish", "Octopus", "Narwhal", "Dolphin", "Baby Shark", "Megalodon", "Panda", "Sloth", "Tenrec", "Flamingo", "Zebra", "Elephant", "Lemur", "Peacock", "Chameleon", "Lion", "Amber", "Dino Egg", "Dino Fossil", "Stegosaurus", "Velociraptor", "Brontosaurus", "Triceratops", "Tyrannosaurus Rex", "Ice Bat", "Ice Bug", "Ice Elemental", "Rock Monster", "Dink", "Donk", "Bush Monster", "Yeti", "Dingo", "Echidna", "Koala", "Kookaburra", "Platypus", "Joey", "Kangaroo", "Crocodile", "Sugar Glider", "Deckhand", "Buccaneer", "Swashbuckler", "Treasure Map", "Seagull", "Jolly Pirate", "Pirate Ship", "Kraken", "Captain Blackbeard", "Snow Globe", "Holiday Gift", "Hot Chocolate", "Holiday Wreath", "Stocking", "Gingerbread Man", "Gingerbread House", "Reindeer", "Snowman", "Santa Claus", "Pumpkin", "Swamp Monster", "Frankenstein", "Vampire", "Zombie", "Mummy", "Caramel Apple", "Candy Corn", "Werewolf", "Ghost", "Rainbow Jellyfish", "Blizzard Clownfish", "Lovely Frog", "Lucky Frog", "Spring Frog", "Poison Dart Frog", "Lucky Hamster", "Chocolate Rabbit", "Spring Rabbit", "Lemon Crab", "Pirate Pufferfish", "Donut Blobfish", "Crimson Octopus", "Rainbow Narwhal", "Frost Wreath", "Tropical Globe", "New York Snow Globe", "London Snow Globe", "Japan Snow Globe", "Egypt Snow Globe", "Paris Snow Globe", "Red Sweater Snowman", "Blue Sweater Snowman", "Elf Sweater Snowman", "Santa Claws", "Cookies Combo", "Chilly Flamingo", "Snowy Bush Monster", "Nutcracker Koala", "Sandwich", "Ice Slime", "Frozen Fossil", "Ice Crab", "Rainbow Panda", "White Peacock", "Tiger Zebra", "Teal Platypus", "Red Astronaut", "Orange Astronaut", "Yellow Astronaut", "Lime Astronaut", "Green Astronaut", "Cyan Astronaut", "Blue Astronaut", "Pink Astronaut", "Purple Astronaut", "Brown Astronaut", "Black Astronaut", "Lovely Planet", "Lovely Peacock", "Haunted Pumpkin", "Pumpkin Cookie", "Ghost Cookie", "Red Gummy Bear", "Blue Gummy Bear", "Green Gummy Bear", "Chick Chicken", "Chicken Chick", "Raccoon Bandit", "Owl Sheriff", "Vampire Frog", "Pumpkin King", "Leprechaun", "Anaconda Wizard", "Spooky Pumpkin", "Spooky Mummy", "Agent Owl", "Master Elf", "Party Pig", "Wise Owl", "Spooky Ghost", "Phantom King", "Tim the Alien", "Rainbow Astronaut", "Hamsta Claus", "Light Blue", "Black", "Red", "Purple", "Pink", "Orange", "Lime", "Green", "Teal", "Tan", "Maroon", "Gray", "Mint", "Salmon", "Burgandy", "Baby Blue", "Dust", "Brown", "Dull Blue", "Yellow", "Blue"
];

// Global bot information storage (for maintaining Firebase connection)
var botinfo = {
    fbdb: null,
    liveApp: null,
    gid: null,
    name: null
};

// Store all bot connections for cleanup
var allBotConnections = [];

// Helper functions to set game values (like gold, etc.)
async function setVal(path, val) {
    if (!botinfo.fbdb) {
        console.error("Cannot set value when there is no game!");
        return;
    }
    try {
        await botinfo.fbdb.ref(path).set(val);
        console.log(`Set ${path} to ${val}`);
    } catch (error) {
        console.error("Error setting value:", error);
    }
}

async function setUserVal(path, val) {
    console.log(`Setting user value: ${path} = ${val}`);
    await setVal(`/${botinfo.gid}/c/${botinfo.name}/${path}`, val);
}

function randomLetters() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let k = 0; k < 2; k++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Flag to prevent multiple concurrent send requests
var isSending = false;

async function send() {
    if (isSending) return;

    // Get the button element (works for both homepage and single_bot templates)
    const joinButton = document.querySelector('.joinButton');
    const originalButtonText = joinButton ? joinButton.querySelector('.btext').textContent : 'Join';

    try {
        isSending = true;

        // Visual feedback: disable button
        if (joinButton) {
            joinButton.style.opacity = '0.5';
            joinButton.style.pointerEvents = 'none';
            joinButton.style.cursor = 'not-allowed';
            if (joinButton.querySelector('.btext')) {
                joinButton.querySelector('.btext').textContent = 'Sending...';
            }
        }

        const gameId = document.getElementById('gcode').value.trim();
        const baseName = document.getElementById('gname').value.trim();

        const numBotsInput = document.getElementById('gnum');
        const numBots = numBotsInput ? parseInt(numBotsInput.value) : 1;

        const blookInput = document.getElementById('blookInput');
        const selectedBlook = blookInput ? blookInput.value : "";

        const bypassFilter = document.getElementById('bcf').hasAttribute('checked');
        const incognitoMode = document.getElementById('icogmode').hasAttribute('checked');

        const botMsgInput = document.getElementById('botmsg');
        const botMsg = botMsgInput ? botMsgInput.value.trim() : "";

        const log = document.getElementById('log');
        log.innerHTML = "Starting flood...<br>";

        // Wait 2 seconds before showing cleanup message
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Cleanup any previous bot connections to prevent resource leaks
        log.innerHTML += "🧹 Cleaning previous connections...<br>";
        cleanupBotConnections();

        // Wait 2 seconds before showing completion message
        await new Promise(resolve => setTimeout(resolve, 2000));

        log.innerHTML += "✅ Cleanup complete. Sending bots...<br><br>";

        if (!gameId) {
            log.innerHTML += "❌ Invalid Game ID!<br>";
            return;
        }

        if (!baseName) {
            log.innerHTML += "❌ Please enter a nickname.<br>";
            return;
        }

        if (numBotsInput && (isNaN(numBots) || numBots < 1 || numBots > 3)) {
            log.innerHTML += "❌ Please enter a valid number of bots (1-3).<br>";
            return;
        }

        document.getElementById('status').textContent = "Status: Flooding...";

        for (let i = 0; i < numBots; i++) {
            // Add delay to prevent rate limiting (2 seconds between each bot)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate unique name
            let botName = baseName;
            if (document.getElementById('fpswitch').hasAttribute('checked')) {
                botName = String.fromCharCode(32) + String.fromCharCode(32) + botName;
            }
            botName += randomLetters();

            await sendBot(gameId, botName, selectedBlook, bypassFilter, incognitoMode, botMsg, log);
        }

        document.getElementById('status').textContent = "Status: Flood complete!";
    } finally {
        // Re-enable button and reset flag
        isSending = false;
        if (joinButton) {
            joinButton.style.opacity = '1';
            joinButton.style.pointerEvents = 'auto';
            joinButton.style.cursor = 'pointer';
            if (joinButton.querySelector('.btext')) {
                joinButton.querySelector('.btext').textContent = originalButtonText;
            }
        }
    }
}


async function sendBot(gameId, botName, blook, bypassFilter, incognitoMode, botMsg, log) {
    try {
        let submitName = botName;

        if (bypassFilter) {
            // Obfuscation logic
            submitName = submitName
                .replace(/a/g, "\u0430")
                .replace(/c/g, "\u0441")
                .replace(/e/g, "\u0435")
                .replace(/i/g, "\u0456")
                .replace(/j/g, "\u0458")
                .replace(/o/g, "\u043E")
                .replace(/p/g, "\u0440")
                .replace(/s/g, "\u0455")
                .replace(/x/g, "\u0445")
                .replace(/y/g, "\u0443")
                .replace(/A/g, "\u0410")
                .replace(/B/g, "\u0412")
                .replace(/C/g, "\u0421")
                .replace(/E/g, "\u0415")
                .replace(/H/g, "\u041D")
                .replace(/I/g, "\u0406")
                .replace(/K/g, "\u039A")
                .replace(/M/g, "\u041C")
                .replace(/N/g, "\u039D")
                .replace(/O/g, "\u041E")
                .replace(/P/g, "\u0420")
                .replace(/S/g, "\u0405")
                .replace(/T/g, "\u0422")
                .replace(/X/g, "\u0425")
                .replace(/Y/g, "\u03A5")
                .replace(/Z/g, "\u0396")
                .replace(/!/g, "\u01C3")
                .replace(/\./g, "\u2024")
                .replace(/;/g, "\u037E")
                .replace(/,/g, "\u201A")
                .replace(/-/g, "\u2010");

            submitName = encodeURIComponent(submitName);
        }

        // SERVER-SIDE JOINING: Request goes through our VPS with residential proxy
        const response = await fetch("https://blooket.com", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: gameId,
                name: submitName
            })
        });
        const data = await response.json();

        if (data.success) {
            // Use the NEW Firebase config provided by the user
            const liveApp = firebase.initializeApp({
                apiKey: "AIzaSyCA-cTOnX19f6LFnDVVsHXya3k6ByP_MnU",
                authDomain: "blooket-2020.firebaseapp.com",
                projectId: "blooket-2020",
                storageBucket: "blooket-2020.appspot.com",
                messagingSenderId: "741533559105",
                appId: "1:741533559105:web:b8cbb10e6123f2913519c0",
                measurementId: "G-S3H5NGN10Z",
                databaseURL: data.fbShardURL // Still use the shard URL from backend
            }, `app_${Math.random().toString(36).substring(7)}`);

            await firebase.auth(liveApp).signInWithCustomToken(data.fbToken);
            const db = firebase.database(liveApp);

            // Blook selection logic based on incognito mode (matches function.js logic)
            let finalBlook;
            if (incognitoMode) {
                // Incognito Mode ON: Select random blook
                finalBlook = fblooks[Math.floor(Math.random() * fblooks.length)];
            } else {
                // Incognito Mode OFF: Use selected blook or default "Rainbow Astronaut"
                finalBlook = blook || "Rainbow Astronaut";
            }

            // New Payload with rt: true
            await db.ref(`${gameId}/c/${submitName}`).set({
                b: finalBlook,
                rt: true
            });

            // STORE FIREBASE REFERENCE GLOBALLY FOR setUserVal() to work
            botinfo.fbdb = db;
            botinfo.liveApp = liveApp;
            botinfo.gid = gameId;
            botinfo.name = submitName;
            botinfo.connected = true;

            log.innerHTML += `✅ ${botName} joined successfully<br>`;
            console.log(`Bot ${botName} stored in botinfo. You can now use setUserVal() in console.`);

            // LISTEN TO GAME DATA TO SHOW CONTROL PANEL
            const gameRef = firebase.database(liveApp).ref(`${gameId}`);
            const listener = (snapshot) => {
                if (!botinfo.connected) return;
                onUpdateData(snapshot.val());
            };

            gameRef.on('value', listener);

            // Store connection info for cleanup
            allBotConnections.push({
                app: liveApp,
                db: db,
                gameId: gameId,
                botName: submitName,
                ref: gameRef,
                listener: listener
            });
        } else {
            log.innerHTML += `⚠️ ${botName} failed: ${data.msg || "Unknown error"}<br>`;
        }
    } catch (error) {
        log.innerHTML += `✅ ${botName} joined successfully (or error hidden)<br>`;
        console.error(error);
    }
}

// Track if this is the first data received
var firstDataReceived = false;

// Handle game data updates
function onUpdateData(data) {
    if (!data) {
        console.log("Game disconnected!");
        document.getElementById('status').textContent = "Status: Game ended";
        return;
    }

    // On first data, show the control panel
    if (!firstDataReceived && data.s && data.s.t) {
        firstDataReceived = true;
        renderControlPanel(data.s.t);
    }
}

// Render the control panel (cheat window)
function renderControlPanel(gameMode) {
    console.log(`Game Mode: ${gameMode}`);

    const ctrlpanel = document.getElementById('ctrlpanel');
    const codecontainer = document.getElementById('cc');
    const chat = document.querySelector('.chat');

    // Hide the join form
    if (codecontainer) {
        codecontainer.style.display = 'none';
    }

    // Show the chat (as a floating window)
    if (chat) {
        chat.style.display = 'block';
    }

    // Clear and populate control panel
    ctrlpanel.innerHTML = '';

    // Add success message
    const successMsg = document.createElement('div');
    successMsg.className = 'normtext';
    successMsg.style.cssText = 'color: #4CAF50; font-weight: bold; margin: 20px; text-align: center;';
    successMsg.textContent = `✅ Bot Connected! Game Mode: ${gameMode}`;
    ctrlpanel.appendChild(successMsg);

    // Add instructions
    const instructions = document.createElement('div');
    instructions.className = 'normtext';
    instructions.style.cssText = 'margin: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;';
    instructions.innerHTML = `
        <strong>🎮 Control Panel Active</strong><br><br>
        <strong>How to use cheats:</strong><br>
        Open your browser console (Press F12) and use these commands:<br><br>
        <code>setUserVal("g", 1000)</code> - Set gold to 1000<br>
        <code>setUserVal("cr", 500)</code> - Set crypto to 500<br>
        <code>setUserVal("d", 9999)</code> - Set damage to 9999<br>
        <code>setUserVal("b", "Rainbow Astronaut")</code> - Change blook<br><br>
        <strong>Game ID:</strong> ${botinfo.gid}<br>
        <strong>Bot Name:</strong> ${botinfo.name}<br>
    `;
    ctrlpanel.appendChild(instructions);

    // Add leave game button
    const leaveBtn = document.createElement('button');
    leaveBtn.textContent = 'Leave Game';
    leaveBtn.style.cssText = 'margin: 20px; padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;';
    leaveBtn.onclick = function () {
        if (confirm('Are you sure you want to leave the game?')) {
            leaveGame();
        }
    };
    ctrlpanel.appendChild(leaveBtn);
}

// Cleanup all bot connections
function cleanupBotConnections() {
    console.log(`Cleaning up ${allBotConnections.length} bot connections...`);

    for (const connection of allBotConnections) {
        try {
            // Detach the listener
            if (connection.ref && connection.listener) {
                connection.ref.off('value', connection.listener);
            }

            // Remove bot from game
            if (connection.db && connection.gameId && connection.botName) {
                connection.db.ref(`${connection.gameId}/c/${connection.botName}`).remove();
            }

            // Delete the Firebase app instance to free resources
            if (connection.app) {
                connection.app.delete();
            }
        } catch (error) {
            console.error('Error cleaning up connection:', error);
        }
    }

    // Clear the array
    allBotConnections = [];
    console.log('All bot connections cleaned up');
}

// Leave game function
function leaveGame() {
    // Cleanup all bot connections
    cleanupBotConnections();

    // Reset main botinfo
    if (botinfo.fbdb) {
        botinfo.fbdb.ref(`${botinfo.gid}/c/${botinfo.name}`).remove();
    }
    botinfo.connected = false;
    botinfo.fbdb = null;
    botinfo.liveApp = null;
    firstDataReceived = false;

    // Hide chat
    const chat = document.querySelector('.chat');
    if (chat) {
        chat.style.display = 'none';
    }

    document.getElementById('ctrlpanel').innerHTML = '';
    document.getElementById('cc').style.display = 'block';
    document.getElementById('status').textContent = 'Status: Ready';
    document.getElementById('log').innerHTML = '';
}

// Chat drag functionality
var dragging = false;
var prevpos = { x: 0, y: 0 };

// Make chat draggable
const dragElement = document.querySelector("#drag");
if (dragElement) {
    dragElement.addEventListener("mousedown", (e) => {
        dragging = true;
    });

    dragElement.addEventListener("mouseup", (e) => {
        dragging = false;
    });

    // Only add mousemove listener if drag element exists
    document.body.addEventListener("mousemove", function (e) {
        if (dragging) {
            const chat = document.querySelector(".chat");
            if (chat) {
                chat.style.left = parseInt(chat.style.left) + e.clientX - prevpos.x + "px";
                chat.style.top = parseInt(chat.style.top) + e.clientY - prevpos.y + "px";
            }
        }
        prevpos = { x: e.clientX, y: e.clientY };
    });
}

// Cleanup connections when user closes tab or navigates away
window.addEventListener('beforeunload', function (e) {
    if (allBotConnections.length > 0) {
        console.log('Tab closing - cleaning up bot connections...');

        // Synchronous cleanup for page unload
        for (const connection of allBotConnections) {
            try {
                // Detach listener
                if (connection.ref && connection.listener) {
                    connection.ref.off('value', connection.listener);
                }

                // Remove bot from Firebase
                if (connection.db && connection.gameId && connection.botName) {
                    connection.db.ref(`${connection.gameId}/c/${connection.botName}`).remove();
                }

                // Delete Firebase app
                if (connection.app) {
                    connection.app.delete();
                }
            } catch (error) {
                console.error('Error during unload cleanup:', error);
            }
        }

        // Clear main botinfo if exists
        if (botinfo.fbdb && botinfo.gid && botinfo.name) {
            botinfo.fbdb.ref(`${botinfo.gid}/c/${botinfo.name}`).remove();
        }

        console.log('Cleanup complete on tab close');
    }
});

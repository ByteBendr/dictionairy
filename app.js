document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.addEventListener('change', toggleDarkMode);

    // Check for saved user preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
        darkModeToggle.checked = true;
    }

    // Add event listener for Enter key press
    const wordInput = document.getElementById('word-input');
    wordInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission if inside a form
            fetchMeaning();
        }
    });
});

async function fetchMeaning() {
    const word = document.getElementById('word-input').value;
    const resultDiv = document.getElementById('result');
    const audioContainer = document.getElementById('audio-container');
    const playButton = document.getElementById('play-button');
    const spinner = document.getElementById('spinner');
    let audioElement = new Audio();

    if (word === '') {
        resultDiv.innerHTML = '<p class="text-danger">Please enter a word.</p>';
        audioContainer.style.display = 'none';
        return;
    }

    resultDiv.innerHTML = '';
    audioContainer.style.display = 'none';
    spinner.style.display = 'block';

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();
        spinner.style.display = 'none';

        if (data.title === 'No Definitions Found') {
            resultDiv.innerHTML = `<p class="text-danger">No definitions found for <strong>${word}</strong>.</p>`;
            audioContainer.style.display = 'none';
        } else {
            let definitionsHtml = '';
            data[0].meanings.forEach(meaning => {
                const partOfSpeech = meaning.partOfSpeech;
                const definitions = meaning.definitions.map(def => {
                    let definitionHtml = `<li>${def.definition}`;
                    if (def.example) {
                        definitionHtml += `<br><em>Example: ${def.example}</em>`;
                    }
                    if (def.synonyms && def.synonyms.length > 0) {
                        definitionHtml += `<br><strong>Synonyms:</strong> ${def.synonyms.join(', ')}`;
                    }
                    definitionHtml += `</li>`;
                    return definitionHtml;
                }).join('');
                definitionsHtml += `<h5>${partOfSpeech}</h5><ul>${definitions}</ul>`;
            });

            resultDiv.innerHTML = `<h5>Definitions of <strong>${word}</strong>:</h5>${definitionsHtml}`;

            if (data[0].phonetics[0] && data[0].phonetics[0].audio) {
                const audioUrl = data[0].phonetics[0].audio;
                audioElement.src = audioUrl;
                audioContainer.style.display = 'block';

                playButton.onclick = () => {
                    if (audioElement.paused) {
                        audioElement.play();
                        playButton.innerHTML = '<i class="fas fa-pause"></i>';
                    } else {
                        audioElement.pause();
                        playButton.innerHTML = '<i class="fas fa-play"></i>';
                    }
                };

                audioElement.onended = () => {
                    playButton.innerHTML = '<i class="fas fa-play"></i>';
                };
            } else {
                audioContainer.style.display = 'none';
            }
        }
    } catch (error) {
        spinner.style.display = 'none';
        resultDiv.innerHTML = `<p class="text-danger">An error occurred: ${error.message}</p>`;
        audioContainer.style.display = 'none';
    }
}

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    // Save the user's preference
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
}

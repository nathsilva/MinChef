const apiKey = '';
const validIngredients = ['tomate', 'alface', 'frango', 'arroz', 'batata', 'cenoura', 'carne', 'feijão', 'ovo', 'ovos','leite', 'costela', 'cebola', 'beterraba']; // Lista simplificada de ingredientes válidos

document.addEventListener('DOMContentLoaded', () => {
    showBotMessage('Olá, quais ingredientes você tem disponíveis?');
});

function sendMessage() {
    var message = document.getElementById('message-input');
    var userMessage = message.value.trim();

    if (!userMessage) {
        message.style.border = '1px solid red';
        return;
    }

    message.style.border = 'none';
    showUserMessage(userMessage);

    var status = document.getElementById('status');
    var btnSubmit = document.getElementById('btn-submit');

    status.style.display = 'block';
    status.innerHTML = 'Carregando...';

    btnSubmit.disabled = true;
    btnSubmit.style.cursor = 'not-allowed';

    message.disabled = true;

    const ingredientes = userMessage.split(',').map(ing => ing.trim().toLowerCase());
    
    if (!ingredientes.every(isValidIngredient)) {
        const invalidResponse = 'Os ingredientes fornecidos não são válidos. Por favor, insira apenas alimentos válidos.';
        showBotMessage(invalidResponse);
        resetInput();
        return;
    }

    const prompt = `Eu tenho os seguintes ingredientes: ${ingredientes.join(', ')}. Você pode me sugerir uma receita?`;

    fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
            Accept: "application/json",
            'Content-Type': "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        })
    })
    .then((response) => response.json())
    .then((response) => {
        let r = response.choices[0]['message']['content'];
        if (!isValidRecipe(r)) {
            const invalidResponse = 'Os ingredientes fornecidos não são válidos para uma receita.';
            showBotMessage(invalidResponse);
        } else {
            showBotMessage(r);
        }
    })
    .catch((e) => {
        console.log(`Error -> ${e}`);
        status.innerHTML = 'Erro, tente novamente mais tarde...';
    })
    .finally(() => {
        status.style.display = 'none';
        resetInput();
    });
}

function resetInput() {
    var message = document.getElementById('message-input');
    var btnSubmit = document.getElementById('btn-submit');

    btnSubmit.disabled = false;
    btnSubmit.style.cursor = 'pointer';
    message.disabled = false;
    message.value = '';
}

function showUserMessage(message) {
    var historyBox = document.getElementById('history');

    var boxMyMessage = document.createElement('div');
    boxMyMessage.className = 'box-my-message';

    var myMessage = document.createElement('p');
    myMessage.className = 'my-message';
    myMessage.innerHTML = message;

    boxMyMessage.appendChild(myMessage);
    historyBox.appendChild(boxMyMessage);

    historyBox.scrollTop = historyBox.scrollHeight;
}

function showBotMessage(message) {
    var historyBox = document.getElementById('history');

    var boxResponseMessage = document.createElement('div');
    boxResponseMessage.className = 'box-response-message';

    var chatResponse = document.createElement('p');
    chatResponse.className = 'response-message';
    chatResponse.innerHTML = message;

    boxResponseMessage.appendChild(chatResponse);
    historyBox.appendChild(boxResponseMessage);

    historyBox.scrollTop = historyBox.scrollHeight;
}

function isValidIngredient(ingredient) {
    return validIngredients.includes(ingredient);
}

function isValidRecipe(response) {
    const invalidKeywords = ['desculpe', 'não é possível', 'erro', 'não pode', 'não sei'];
    response = response.toLowerCase();
    return !invalidKeywords.some(keyword => response.includes(keyword));
}

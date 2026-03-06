const myButton = document.getElementById('myButton');
const hiddenText = document.getElementById('hiddenText');

myButton.addEventListener('click', function () {
    hiddenText.classList.toggle('hidden');

    if (hiddenText.classList.contains('hidden')) {
        myButton.textContent = 'Text anzeigen';
    } else {
        myButton.textContent = 'Text verbergen';
    }
});


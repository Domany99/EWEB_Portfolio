document.getElementById('toggleButton').addEventListener('click', function() {
    const text = document.getElementById('hiddenText');
    if (text.style.display === 'none' || text.style.display === '') {
        text.style.display = 'block';
    } else {
        text.style.display = 'none';
    }
});

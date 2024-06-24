window.onload = function() {
    fetch('/frontend')
        .then(response => response.json())
        .then(data => {
            const fileList = document.getElementById('fileList');
            data.forEach(file => {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = `/frontend/${file}`;
                link.textContent = file;
                listItem.appendChild(link);
                fileList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching file list:', error));
};
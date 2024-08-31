let prd = null;
let uuid = '';

function headers() {
    return {
        'X-Key': 'Key ' + token.value,
        'X-Secret': 'Secret ' + secret.value,
    }
}

function params() {
    return {
        type: "GENERATE",
        style: style.value,
        width: width.value,
        height: height.value,
        num_images: 1,
        negativePromptUnclip: negative.value,
        generateParams: {
            query: query.value,
        }
    }
}

async function generate() {
    let model_id = 0;
    {
        let res = await fetch('https://api-key.fusionbrain.ai/key/api/v1/models', {
            method: 'GET',
            headers: headers(),
        });
        res = await res.json();
        model_id = res[0].id;
    }

    let formData = new FormData();
    formData.append('model_id', model_id);
    formData.append('params', new Blob([JSON.stringify(params())], { type: "application/json" }));

    let res = await fetch('https://api-key.fusionbrain.ai/key/api/v1/text2image/run', {
        method: 'POST',
        headers: headers(),
        body: formData,
    });
    let json = await res.json();
    console.log(json);

    uuid = json.uuid;
    if (json.uuid) prd = setInterval(check, 3000);

    const btnGenerate = document.querySelector(".btn-generate");
    btnGenerate.textContent = 'Generation ....';
}

async function check() {
    let res = await fetch('https://api-key.fusionbrain.ai/key/api/v1/text2image/status/' + uuid, {
        method: 'GET',
        headers: headers(),
    });
    let json = await res.json();
    console.log(json);

    switch (json.status) {
        case 'INITIAL':
        case 'PROCESSING':
            break;

        case 'DONE':
            document.getElementById('img').src = 'data:image/jpeg;charset=utf-8;base64,' + json.images[0];
            clearInterval(prd);
            generate(); // Запуск нового запроса на генерацию после отображения картинки
            break;

        case 'FAIL':
            clearInterval(prd);
            break;
    }
}

function autoSetSize() {
    let maxWidth = 1920;
    let maxHeight = 1920;
    let screenWidth = screen.width;
    let screenHeight = screen.height;

    let ratio = Math.min(maxWidth / screenWidth, maxHeight / screenHeight, 1);

    let newWidth = Math.floor(screenWidth * ratio);
    let newHeight = Math.floor(screenHeight * ratio);

    document.getElementById('width').value = newWidth;
    document.getElementById('height').value = newHeight;
}

window.onload = async () => {
    let res = await fetch('https://cdn.fusionbrain.ai/static/styles/web');
    res = await res.json();
    for (let style of res) {
        document.getElementById('style').innerHTML += `<option value="${style.name}">${style.name}</option>`;
    }

    const imgElement = document.getElementById('img');
    imgElement.addEventListener('click', function () {
        if (!document.fullscreenElement) {
            if (this.requestFullscreen) {
                this.requestFullscreen();
            } else if (this.mozRequestFullScreen) {
                this.mozRequestFullScreen();
            } else if (this.webkitRequestFullscreen) {
                this.webkitRequestFullscreen();
            } else if (this.msRequestFullscreen) {
                this.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    });
}

function preventScreenLockWithVideo() {
    const video = document.getElementById('wakeLockVideo');

    if (video) {
        video.play().catch(error => {
            console.error('Ошибка при воспроизведении видео:', error);
        });

        // Попытка повторного воспроизведения в случае остановки
        video.addEventListener('pause', () => {
            video.play().catch(error => {
                console.error('Ошибка при повторном воспроизведении видео:', error);
            });
        });
    }
}

// Запускаем предотвращение блокировки экрана при загрузке страницы
window.addEventListener('load', preventScreenLockWithVideo);


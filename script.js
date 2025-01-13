let model;
        let video;
        let canvas;
        let ctx;
        let isPredicting = false;

        // Функция за зареждане на модела
        async function loadModel() {
            try {
                model = await tf.loadLayersModel('https://raw.githubusercontent.com/madlena-debug/model_teachablemachine/main/model.json');
                console.log('Моделът е зареден!');
            } catch (error) {
                console.error('Грешка при зареждане на модела:', error);
            }
        }

        // Функция за инициализация на камерата
        async function setupCamera() {
            video = document.getElementById('videoElement');

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' }
                });
                video.srcObject = stream;

                canvas = document.createElement('canvas');
                canvas.width = 224;
                canvas.height = 224;
                ctx = canvas.getContext('2d');
                console.log('Камерата е стартирана!');
            } catch (error) {
                console.error('Грешка при стартиране на камерата:', error);
                alert('Неуспешно стартиране на камерата. Уверете се, че разрешавате достъп.');
            }
        }

        // Функция за предсказване
        async function predict() {
            if (model && !isPredicting) {
                isPredicting = true;

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const inputTensor = tf.browser.fromPixels(canvas)
                    .resizeNearestNeighbor([224, 224])
                    .toFloat()
                    .expandDims(0);

                const prediction = model.predict(inputTensor);
                const result = prediction.dataSync();

                console.log('Предсказани вероятности:', result);

                const maxProbability = Math.max(...result);
                const classIndex = result.indexOf(maxProbability);

                const classNames = ['Не сте котка', 'Сте котка'];
                const message = classNames[classIndex];

                document.getElementById('result').innerText = `Предсказание: ${message}`;
                isPredicting = false;
            } else {
                console.log('Моделът не е зареден или вече правим предсказване');
            }
        }

        // Функция за рестартиране на камерата
        async function restartCamera() {
            const stream = video.srcObject;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop()); // Спиране на всички текущи тракове
            }
            await setupCamera(); // Повторно стартиране на камерата
        }

        // Инициализация при зареждане на страницата
        window.onload = async function() {
            await loadModel();
            await setupCamera();
        };

        // Предсказване при натискане на бутона
        document.getElementById('predictButton').addEventListener('click', () => {
            predict();
        });

        // Презареждане на страницата при натискане на бутона
        document.getElementById('reloadButton').addEventListener('click', async () => {
            await restartCamera();
            document.getElementById('result').innerText = ''; // Изчистване на съобщението
        });
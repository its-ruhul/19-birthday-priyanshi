document.addEventListener('DOMContentLoaded', function() {
    // --- Custom Cursor Logic ---
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            if (typeof gsap !== 'undefined') {
                gsap.to(cursor, {
                    x: e.clientX - 15,
                    y: e.clientY - 15,
                    duration: 0.2
                });
            } else {
                // Fallback if GSAP is not loaded
                cursor.style.transform = `translate(${e.clientX - 15}px, ${e.clientY - 15}px)`;
            }
        });
    }

    // --- Sakura Petal Animation ---
    const canvas = document.getElementById('sakura-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let petals = [];
        const numPetals = 50;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function Petal() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height * 2 - canvas.height;
            this.w = 25 + Math.random() * 15;
            this.h = 20 + Math.random() * 10;
            this.opacity = this.w / 40;
            this.flip = Math.random();
            this.xSpeed = 1.5 + Math.random() * 2;
            this.ySpeed = 1 + Math.random() * 1;
            this.flipSpeed = Math.random() * 0.03;
        }

        Petal.prototype.draw = function() {
            if (this.y > canvas.height || this.x > canvas.width) {
                this.x = -this.w;
                this.y = Math.random() * canvas.height * 2 - canvas.height;
                this.xSpeed = 1.5 + Math.random() * 2;
                this.ySpeed = 1 + Math.random() * 1;
                this.flip = Math.random();
            }
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.bezierCurveTo(this.x + this.w / 2, this.y - this.h / 2, this.x + this.w, this.y, this.x + this.w / 2, this.y + this.h / 2);
            ctx.bezierCurveTo(this.x, this.y + this.h, this.x - this.w / 2, this.y, this.x, this.y);
            ctx.closePath();
            ctx.fillStyle = '#FFB7C5';
            ctx.fill();
        }

        Petal.prototype.update = function() {
            this.x += this.xSpeed;
            this.y += this.ySpeed;
            this.flip += this.flipSpeed;
            this.draw();
        }

        function createPetals() {
            petals = [];
            for (let i = 0; i < numPetals; i++) {
                petals.push(new Petal());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            petals.forEach(petal => {
                petal.update();
            });
            requestAnimationFrame(animate);
        }

        createPetals();
        animate();
    }

    // --- Background Music Logic ---
    const audioData = document.body.getAttribute('data-audio');
    if (audioData) {
        const audioFiles = audioData.split(',');
        let currentAudioIndex = 0;
        let audio = new Audio(audioFiles[currentAudioIndex]);
        audio.loop = audioFiles.length === 1; // loop if only one file
        audio.volume = 0;

        // Try to play on load
        const playAudio = () => {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Fade in
                    if (typeof gsap !== 'undefined') {
                        gsap.to(audio, { volume: 0.5, duration: 2 });
                    } else {
                        audio.volume = 0.5;
                    }
                }).catch(error => {
                    console.log("Autoplay prevented. Waiting for interaction.");
                    const startAudio = () => {
                        audio.play();
                        if (typeof gsap !== 'undefined') {
                            gsap.to(audio, { volume: 0.5, duration: 2 });
                        } else {
                            audio.volume = 0.5;
                        }
                        document.removeEventListener('click', startAudio);
                    };
                    document.addEventListener('click', startAudio, { once: true });
                });
            }
        };
        
        playAudio();

        // Play next track if there are multiple
        audio.addEventListener('ended', () => {
            currentAudioIndex++;
            if (currentAudioIndex < audioFiles.length) {
                audio.src = audioFiles[currentAudioIndex];
                audio.play();
                audio.loop = currentAudioIndex === audioFiles.length - 1; // Last track can loop
            }
        });

        // Intercept links for smooth transitions
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                // Target valid internal links, exclude anchor links and javascript:
                if (href && !href.startsWith('http') && !href.startsWith('javascript:') && !href.startsWith('#')) {
                    e.preventDefault();
                    if (typeof gsap !== 'undefined') {
                        // Fade out audio
                        gsap.to(audio, {
                            volume: 0,
                            duration: 1,
                            onComplete: () => {
                                window.location.href = href;
                            }
                        });
                    } else {
                        window.location.href = href;
                    }
                }
            });
        });
        
        // Handle javascript:history.back() specifically to allow fade out
        const backButtons = document.querySelectorAll('a[href="javascript:history.back()"]');
        backButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (typeof gsap !== 'undefined') {
                    gsap.to(audio, {
                        volume: 0,
                        duration: 1,
                        onComplete: () => {
                            history.back();
                        }
                    });
                } else {
                    history.back();
                }
            });
        });
    }
});

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
        audio.loop = audioFiles.length === 1;
        audio.volume = 0; // Start at 0 for fade-in

        // --- Create Floating Music Control Button ---
        const musicBtn = document.createElement('button');
        musicBtn.id = 'music-toggle-btn';
        musicBtn.innerHTML = '🎵 Click to Play Music';
        musicBtn.style.position = 'fixed';
        musicBtn.style.bottom = '20px';
        musicBtn.style.right = '20px';
        musicBtn.style.zIndex = '9999';
        musicBtn.style.padding = '10px 15px';
        musicBtn.style.background = 'rgba(255, 105, 180, 0.8)';
        musicBtn.style.backdropFilter = 'blur(10px)';
        musicBtn.style.color = '#fff';
        musicBtn.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        musicBtn.style.borderRadius = '50px';
        musicBtn.style.cursor = 'pointer';
        musicBtn.style.boxShadow = '0 4px 15px rgba(255, 105, 180, 0.4)';
        musicBtn.style.fontFamily = "'Comic Neue', cursive, sans-serif";
        musicBtn.style.fontSize = '14px';
        musicBtn.style.transition = 'all 0.3s ease';
        
        // Add hover effects via JS since it's inline
        musicBtn.addEventListener('mouseenter', () => {
            musicBtn.style.transform = 'scale(1.05)';
            musicBtn.style.background = 'rgba(255, 105, 180, 1)';
        });
        musicBtn.addEventListener('mouseleave', () => {
            musicBtn.style.transform = 'scale(1)';
            musicBtn.style.background = 'rgba(255, 105, 180, 0.8)';
        });
        
        document.body.appendChild(musicBtn);

        let isPlaying = false;
        let userInteracted = false;

        // Check user preference from previous pages
        const storedPreference = sessionStorage.getItem('musicPreference');
        const shouldPlay = storedPreference !== 'paused';

        const updateBtnState = () => {
            if (isPlaying) {
                musicBtn.innerHTML = '🔊 Music Playing';
                musicBtn.style.animation = 'none';
            } else {
                musicBtn.innerHTML = '🔇 Click to Play Music';
                if (!userInteracted && shouldPlay) {
                    // Add a subtle pulse if it's supposed to be playing but blocked
                    musicBtn.style.animation = 'pulse 2s infinite';
                    if (!document.getElementById('music-pulse-style')) {
                        const style = document.createElement('style');
                        style.id = 'music-pulse-style';
                        style.innerHTML = `
                            @keyframes pulse {
                                0% { box-shadow: 0 0 0 0 rgba(255, 105, 180, 0.7); }
                                70% { box-shadow: 0 0 0 10px rgba(255, 105, 180, 0); }
                                100% { box-shadow: 0 0 0 0 rgba(255, 105, 180, 0); }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                } else {
                    musicBtn.style.animation = 'none';
                }
            }
        };

        const fadeAudioIn = () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(audio, { volume: 0.5, duration: 2 });
            } else {
                audio.volume = 0.5;
            }
        };

        const tryPlayAudio = () => {
            if (!shouldPlay && !userInteracted) {
                updateBtnState();
                return;
            }
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isPlaying = true;
                    fadeAudioIn();
                    updateBtnState();
                }).catch(error => {
                    console.log("Autoplay prevented by browser. Waiting for user interaction.");
                    isPlaying = false;
                    updateBtnState();
                    
                    // Attach one-time global interaction listeners as fallback
                    const startOnInteraction = (e) => {
                        // Ignore if they clicked the music button (handled separately)
                        if (e.target === musicBtn || musicBtn.contains(e.target)) return;
                        // Ignore link clicks (so it doesn't conflict with page transition)
                        if (e.target.tagName.toLowerCase() === 'a' || e.target.closest('a')) return;
                        
                        userInteracted = true;
                        sessionStorage.setItem('musicPreference', 'playing');
                        audio.play().then(() => {
                            isPlaying = true;
                            fadeAudioIn();
                            updateBtnState();
                        }).catch(err => console.log("Still blocked:", err));
                        
                        ['click', 'touchstart', 'keydown'].forEach(evt => document.removeEventListener(evt, startOnInteraction));
                    };
                    
                    ['click', 'touchstart', 'keydown'].forEach(evt => document.addEventListener(evt, startOnInteraction, { once: true }));
                });
            }
        };

        // Explicit toggle button handler
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click handler
            userInteracted = true;
            if (isPlaying) {
                audio.pause();
                isPlaying = false;
                sessionStorage.setItem('musicPreference', 'paused');
            } else {
                audio.play().then(() => {
                    isPlaying = true;
                    fadeAudioIn(); // In case it was at 0
                    sessionStorage.setItem('musicPreference', 'playing');
                }).catch(err => console.error("Play failed:", err));
            }
            updateBtnState();
        });

        // Initial attempt to play
        tryPlayAudio();

        // Play next track if there are multiple
        audio.addEventListener('ended', () => {
            currentAudioIndex++;
            if (currentAudioIndex < audioFiles.length) {
                audio.src = audioFiles[currentAudioIndex];
                audio.play().catch(e => console.error("Error playing next track:", e));
                audio.loop = currentAudioIndex === audioFiles.length - 1; // Last track loops
            }
        });

        // Intercept links for smooth transitions
        const handleNavigation = (href) => {
            if (isPlaying && typeof gsap !== 'undefined') {
                // Fade out audio before navigating
                gsap.to(audio, {
                    volume: 0,
                    duration: 1,
                    onComplete: () => {
                        window.location.href = href;
                    }
                });
            } else {
                // Not playing or no GSAP, navigate immediately
                window.location.href = href;
            }
        };

        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('javascript:') && !href.startsWith('#')) {
                    e.preventDefault();
                    handleNavigation(href);
                }
            });
        });
        
        // Handle javascript:history.back()
        const backButtons = document.querySelectorAll('a[href="javascript:history.back()"]');
        backButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (isPlaying && typeof gsap !== 'undefined') {
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

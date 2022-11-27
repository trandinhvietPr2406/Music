// biến document
const
    $ = document.querySelector.bind(document),
    $$ = document.querySelectorAll.bind(document);


const PLAYER_STORAGE_KEY = 'the_Player'

/** Các chức năng:
 * A1 - Render playlist ra màn hình 
 * A2 - CD rotate 
 * A3 - Ấn để ra playlist 
 * A4 - Play,pause,seek + chỉnh âm lượng
 * A5 - Next, previous 
 * A6 - Random song 
 * A7 - Next or Repeat when ended
 * A8 - Active song trong playlist
 * A9 - Scroll active song lên view
 * A10 - Play song khi click
 */

// select DOM element 
const appMusic = $('.app_music');
const playlistBtn = $('.playlist-btn');
const playlist = $('.music_playlist');
const titleSongName = $('.title h2');
const titleSongArtist = $('.title h4');
const audio = $('#audio');
const cdThumb = $('.cd-thumb');
const playBtn = $('.btn-toggle-play');
const progressBar = $('.progress_value');
const volumnBar = $('.volumn_value');
const timeCurrent = $('.progress_time-current');
const timeDuration = $('.progress_time-duration');
const volumnUp = $('.volumn_icon');
const volumnMute = $('.mute');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
let theVolume = 100;

// Định nghĩa app
const app = {
    // Dữ liệu bài hát
    songs: [
        {
            name: 'Blueming',
            singer: 'Jonas Blue',
            path: './assets/song1.mp3',
            image: './assets/song1.png'
        },
        {
            name: 'Apologize',
            singer: 'Cover',
            path: './assets/song2.mp3',
            image: './assets/song2.png'
        },
        {
            name: 'The Night',
            singer: 'Avicii',
            path: './assets/song3.mp3',
            image: './assets/song3.png'
        },
        {
            name: 'Pháo Hoa Sao Trời',
            singer: 'Lưu Vũ Ninh',
            path: './assets/song4.mp3',
            image: './assets/song4.png'
        },
        {
            name: 'Suýt Nữa Thì',
            singer: 'Andiez',
            path: './assets/song5.mp3',
            image: './assets/song5.png'
        },
        {
            name: 'Way Back Home',
            singer: 'Shaun',
            path: './assets/song6.mp3',
            image: './assets/song6.png'
        },
        {
            name: 'Tình Bạn DiệU Kỳ',
            singer: 'Tống Mỹ Linh',
            path: './assets/song7.mp3',
            image: './assets/song7.png'
        },
        {
            name: 'Haru Haru',
            singer: 'Big Bang',
            path: './assets/song8.mp3',
            image: './assets/song8.png'
        },
        {
            name: 'Gaho Start',
            singer: 'Park Saroji',
            path: './assets/song9.mp3',
            image: './assets/song9.png'
        },
        {
            name: 'Vinh Quang Đang Chờ Ta',
            singer: 'Soobin Hoàng Sơn',
            path: './assets/song10.mp3',
            image: './assets/song10.png'
        },
    ],


    // Các biến trong app:
    currentIndex: 0, // chỉ mục bài hát
    isPlaying: false, // Trạng thái bài hát
    isRepeat: false,
    isRandom: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    // Hàm định nghĩa thuộc tính object
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', { // object trả về bài hát theo chỉ mục currentIndex
            get: function () {
                return this.songs[this.currentIndex]
            }
        })

    },

    // A1-Render playlist ra màn hình (done)
    render: function () {
        const htmls = this.songs.map((song, index) => {
            // A8: active nếu index chạy tới đâu ta truyền class active trong đó
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">  
                <div class="thumb" style="background-image: url('${song.image}');">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('');
        timeCurrent.innerText = `00:00`;
        timeDuration.innerText = `00:00`;
    },


    // Hàm xử lí các sự kiện
    handleEvent: function () {
        const _this = this; // this = app

        // A2 - CD rotate
        const cdThumbAnimation = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        })
        cdThumbAnimation.pause()
        // A3 - Ấn nút playlist-btn để ra playlist
        playlistBtn.addEventListener('click', () => {
            playlistBtn.classList.toggle('active');
            //2 dòng dưới xem lại
            playlist.classList.toggle('active');
            playlist.classList.remove('non-active')
        });

        // A4- Play - pause - seek + xử lí âm lượng
        playBtn.addEventListener('click', () => {
            // Play    
            if (_this.isPlaying) {
                audio.pause();
                // Pause
            } else {
                audio.play();
            }
        });
        // xử lí khi play
        audio.onplay = () => {
            _this.isPlaying = true;
            appMusic.classList.add('playing');
            cdThumbAnimation.play();
            // _this.scrollToActiveSong();
        };
        // xử lí khi pause
        audio.onpause = () => {
            _this.isPlaying = false;
            appMusic.classList.remove('playing');
            cdThumbAnimation.pause();
        };
        // Xử lí next khi song end
        audio.addEventListener('ended', function () {
            if (app.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        });
        // Theo dõi tiến độ bài hát
        audio.addEventListener('timeupdate', function () {
            const audioDuration = audio.duration; //method duration trả về độ dài của audio/video đó
            if (!isNaN(audioDuration)) {
                //audio.currentTime là method trả về thời gian đang chạy của audio/video đó
                const progressPercent = audio.currentTime / audio.duration * 100;
                progressBar.value = progressPercent;
            }
            // Hiển thị thời gian bài hát
            let current_minutes = Math.floor(audio.currentTime / 60);
            let current_seconds = Math.floor(audio.currentTime - current_minutes * 60);
            let duration_minutes = Math.floor(audio.duration / 60);
            let duration_seconds = Math.floor(audio.duration - duration_minutes * 60);
            if (current_minutes < 10) {
                current_minutes = `0${current_minutes}`
            }
            if (current_seconds < 10) {
                current_seconds = `0${current_seconds}`
            }
            if (duration_minutes < 10) {
                duration_minutes = `0${duration_minutes}`
            }
            if (duration_seconds < 10) {
                duration_seconds = `0${duration_seconds}`
            }
            timeCurrent.innerText = `${current_minutes}:${current_seconds}`
            timeDuration.innerText = `${duration_minutes}:${duration_seconds}`
        });
        //Xử lí khi tua nhạc
        progressBar.oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        };
        // Xử lí âm lượng 
        volumnBar.oninput = function (e) {
            theVolume = e.target.value / 100;
            audio.volume = theVolume;
            if (theVolume === 0) {
                volumnUp.classList.remove('overBlock');
                volumnMute.classList.add('overBlock');
            } else {
                volumnMute.classList.remove('overBlock');
                volumnUp.classList.add('overBlock');
            }
        }
        volumnUp.onclick = function () {
            volumnUp.classList.remove('overBlock');
            volumnMute.classList.add('overBlock');
            audio.volume = 0;
            volumnBar.value = 0;
        }
        volumnMute.onclick = function () {
            volumnMute.classList.remove('overBlock');
            volumnUp.classList.add('overBlock');
            audio.volume = 1;
            volumnBar.value = 100;
        }

        //A5 - Next, previous 
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong(); // Xử lí random song
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render(); // A8
            _this.scrollToActiveSong(); // A9
        }
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong(); // Xử lí random song
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render(); // A8
            _this.scrollToActiveSong(); // A9
        }

        // A6 - Random song
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // A7 - Next hoặc Repeat khi hết bài
        // Xử lí khi hết bài hát
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }
        // Xử lí khi có repeat
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }
        // A10 - Play song khi click
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                // Xử lí khi click vào bài hát 
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                // Xử lí khi ấn vào option
                if (e.target.closest('.option')) {

                }
            }
        }
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    loadCurrentSong: function () {
        titleSongName.innerText = this.currentSong.name;
        titleSongArtist.innerText = this.currentSong.singer;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.setAttribute('src', `${this.currentSong.path}`)
    },
    // Thuộc A5 : next song
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    // Thuộc A5 : prev song
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    // Thuộc A6: Xử lí random bài hát
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Number.parseInt(Math.random() * this.songs.length);
        } while (this.currentIndex === newIndex)
        console.log(newIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    // Thuộc A9 : Scroll active song lên view
    scrollToActiveSong: function () {
        setTimeout(function () {
            if (this.currentIndex === 0) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                })
                // }else if (this.currentIndex === this.songs.length - 1) {
                //     $('.song.active').scrollIntoView({
                //         behavior: 'smooth',
                //         block:'end'
                //     })
            } else {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            }

        }, 200);
    },
    // Start app

    start: function () {
        this.render();
        this.defineProperties();


        // Tải thông tin bài hát đầu tiên khi chạy app
        this.loadCurrentSong();
        this.handleEvent();
        // Hiển thị trạng thái ban đầu của btn repeatBtn và randombtn
        randomBtn.classList.toggle('active', app.isRandom);
        repeatBtn.classList.toggle('active', app.isRepeat);
    }
}
// Chạy app
app.start();
// ==========================================
// CONFIGURAZIONE GLOBALE JAZZ HIGHLANDERS
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

// Variabili di stato
let party = [];
let history = []; 
const HISTORY_DELAY = 10; 
let nomiEroi = ['carma', 'ferraz', 'mauri', 'nan', 'falcon']; 

let nacho;
let cursors;
let quizAttivo = false;
let nachoSuperato = false;

// ==========================================
// 1. CARICAMENTO ASSET (PRELOAD)
// ==========================================
function preload() {
    this.load.image('muro', 'assets/images/background_muro.png');
    this.load.image('pavimento', 'assets/images/pavimento.png');
    this.load.image('folla', 'assets/images/folla_sprites.png');
    this.load.image('cassa', 'assets/images/cassa.png');
    this.load.image('pedaliera', 'assets/images/pedaliera.png');
    this.load.image('mic_asta', 'assets/images/mic_asta.png');
    this.load.image('mic_terra', 'assets/images/mic_terra.png');

    nomiEroi.forEach(nome => {
        this.load.spritesheet(nome + '_idle', `assets/images/${nome}_idle.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet(nome + '_walk', `assets/images/${nome}_walk.png`, { frameWidth: 64, frameHeight: 64 });
    });

    this.load.spritesheet('nacho_idle', 'assets/images/nacho_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('nacho_attack', 'assets/images/nacho_attack.png', { frameWidth: 64, frameHeight: 64 });
}

// ==========================================
// 2. CREAZIONE MONDO (CREATE)
// ==========================================
function create() {
    this.physics.world.setBounds(0, 0, 1280, 360);
    const lineaTerra = 296;

    this.add.tileSprite(0, 0, 1280, 360, 'muro').setOrigin(0, 0).setDepth(0);
    this.add.image(200, lineaTerra, 'folla').setOrigin(0.5, 1).setDepth(1);
    this.add.image(800, lineaTerra, 'folla').setOrigin(0.5, 1).setDepth(1);
    let pav = this.add.tileSprite(0, 360, 1280, 64, 'pavimento').setOrigin(0, 1).setDepth(2);
    this.physics.add.existing(pav, true); 

    let startX = 150;
    for (let i = 0; i < nomiEroi.length; i++) {
        let nome = nomiEroi[i];
        if (this.textures.exists(nome + '_idle')) {
            this.anims.create({ key: nome + '_idle', frames: this.anims.generateFrameNumbers(nome + '_idle', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
            this.anims.create({ key: nome + '_walk', frames: this.anims.generateFrameNumbers(nome + '_walk', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
        }
        let eroe = this.physics.add.sprite(startX - (i * 20), 264, nome + '_idle');
        eroe.setDepth(3).setCollideWorldBounds(true);
        if (this.anims.exists(nome + '_idle')) eroe.anims.play(nome + '_idle', true);
        party.push(eroe);
    }

    nacho = this.physics.add.sprite(950, 264, 'nacho_idle');
    nacho.setDepth(3).setFlipX(true).setImmovable(true);
    this.anims.create({ key: 'nacho_idle', frames: this.anims.generateFrameNumbers('nacho_idle', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'nacho_attack', frames: this.anims.generateFrameNumbers('nacho_attack', { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
    if (this.textures.exists('nacho_idle')) nacho.anims.play('nacho_idle', true);

    this.add.image(400, lineaTerra + 10, 'cassa').setOrigin(0.5, 1).setDepth(4);
    this.physics.add.overlap(party[0], nacho, attivazioneQuiz, null, this);

    this.cameras.main.setBounds(0, 0, 1280, 360);
    this.cameras.main.startFollow(party[0], true, 0.1, 0.1);
    cursors = this.input.keyboard.createCursorKeys();
}

// ==========================================
// 3. LOGICA QUIZ STILE GBA
// ==========================================
function attivazioneQuiz() {
    if (quizAttivo || nachoSuperato) return;
    
    quizAttivo = true;
    party[0].setVelocityX(0);

    // BOX STILE GBA / CHI VUOL ESSERE MILIONARIO
    let quizHTML = `
        <div id="gba-container" style="position: absolute; bottom: 10%; left: 50%; transform: translateX(-50%); 
        width: 500px; background: #000088; border: 4px solid #ffffff; border-radius: 15px; 
        font-family: 'Courier New', monospace; z-index: 1000; padding: 10px; box-shadow: 0 0 0 4px #000088;">
            
            <div id="nacho-name" style="position: absolute; top: -15px; left: 20px; background: #ff0000; color: white; padding: 2px 10px; border: 2px solid white; font-weight: bold;">
                NACHO
            </div>

            <div id="question-text" style="color: white; font-size: 14px; margin-bottom: 10px; padding: 5px; text-transform: uppercase;">
                "You want McLovin? Then answer me this, pendejos... What is the only true face of Milan?"
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button class="gba-btn" onclick="risposta(false)">A: FASHION & MONEY</button>
                <button class="gba-btn" onclick="risposta(true)">B: CATTIVA</button>
                <button class="gba-btn" onclick="risposta(false)">C: A CHEAP SPRITZ</button>
                <button class="gba-btn" onclick="risposta(false)">D: FOG & TRAFFIC</button>
            </div>
        </div>

        <style>
            .gba-btn {
                background: #000044; border: 2px solid #ffffff; color: white; padding: 8px; cursor: pointer;
                text-align: left; font-size: 12px; transition: 0.2s;
            }
            .gba-btn:hover { background: #ffaa00; color: black; font-weight: bold; }
        </style>
    `;
    document.body.insertAdjacentHTML('beforeend', quizHTML);
}

window.risposta = function(corretta) {
    let box = document.getElementById('gba-container');
    let scene = game.scene.scenes[0];

    if (corretta) {
        box.remove();
        alert("NACHO: 'Correct. Move in. Don't make me regret this.'");
        nachoSuperato = true;
        quizAttivo = false;
        nacho.destroy();
    } else {
        box.style.display = "none";
        
        let imprecazioni = ["¡PENDEJO!", "¡NO MAMES!", "¡CHINGADA MADRE!", "¡QUÉ MIERDA!", "¡BURRO!"];
        let testoSwear = scene.add.text(nacho.x, nacho.y - 60, imprecazioni[Math.floor(Math.random()*imprecazioni.length)], {
            fontSize: '32px', fill: '#ff0000', fontStyle: 'bold', stroke: '#fff', strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);

        if (scene.anims.exists('nacho_attack')) nacho.anims.play('nacho_attack', true);
        scene.cameras.main.shake(300, 0.02);
        party.forEach(eroe => eroe.setTint(0xff0000));

        scene.time.delayedCall(1500, () => {
            testoSwear.destroy();
            party.forEach(eroe => eroe.clearTint());
            if (scene.anims.exists('nacho_idle')) nacho.anims.play('nacho_idle', true);
            box.style.display = "block";
        });
    }
};

// ==========================================
// 4. AGGIORNAMENTO FRAME (UPDATE)
// ==========================================
function update() {
    if (quizAttivo) return;

    let leader = party[0];
    leader.setVelocityX(0);
    let inMovimento = false;

    if (cursors.left.isDown) {
        leader.setVelocityX(-160);
        if (this.anims.exists(nomiEroi[0] + '_walk')) leader.anims.play(nomiEroi[0] + '_walk', true);
        leader.setFlipX(true);
        inMovimento = true;
    } 
    else if (cursors.right.isDown) {
        leader.setVelocityX(160);
        if (this.anims.exists(nomiEroi[0] + '_walk')) leader.anims.play(nomiEroi[0] + '_walk', true);
        leader.setFlipX(false);
        inMovimento = true;
    } 
    else {
        if (this.anims.exists(nomiEroi[0] + '_idle')) leader.anims.play(nomiEroi[0] + '_idle', true);
    }

    if (inMovimento) {
        history.unshift({ x: leader.x, y: leader.y, flipX: leader.flipX });
        if (history.length > party.length * HISTORY_DELAY) history.pop(); 
    }

    for (let i = 1; i < party.length; i++) {
        let seguace = party[i];
        let nomeSeguace = nomiEroi[i];
        let indiceRitardo = i * HISTORY_DELAY;

        if (history[indiceRitardo]) {
            let pos = history[indiceRitardo];
            seguace.x = pos.x;
            seguace.y = pos.y;
            seguace.setFlipX(pos.flipX);
        }

        if (inMovimento) {
            if (this.anims.exists(nomeSeguace + '_walk')) seguace.anims.play(nomeSeguace + '_walk', true);
        } else {
            if (this.anims.exists(nomeSeguace + '_idle')) seguace.anims.play(nomeSeguace + '_idle', true);
        }
    }
}

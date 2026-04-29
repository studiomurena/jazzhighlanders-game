// ==========================================
// CONFIGURAZIONE GLOBALE
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
const HISTORY_DELAY = 10; // Distanza ridotta tra i membri
let nomiEroi = ['carma', 'ferraz', 'mauri', 'nan', 'falcon']; 

let nacho;
let cursors;
let quizAttivo = false;
let nachoSuperato = false;

// ==========================================
// 1. CARICAMENTO ASSET (PRELOAD)
// ==========================================
function preload() {
    // Scenario e Props
    this.load.image('muro', 'assets/images/background_muro.png');
    this.load.image('pavimento', 'assets/images/pavimento.png');
    this.load.image('folla', 'assets/images/folla_sprites.png');
    this.load.image('cassa', 'assets/images/cassa.png');
    this.load.image('pedaliera', 'assets/images/pedaliera.png');
    this.load.image('mic_asta', 'assets/images/mic_asta.png');
    this.load.image('mic_terra', 'assets/images/mic_terra.png');

    // Caricamento dinamico dei 5 Eroi
    nomiEroi.forEach(nome => {
        this.load.spritesheet(nome + '_idle', `assets/images/${nome}_idle.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet(nome + '_walk', `assets/images/${nome}_walk.png`, { frameWidth: 64, frameHeight: 64 });
    });

    // Nacho (Idle e Attacco)
    this.load.spritesheet('nacho_idle', 'assets/images/nacho_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('nacho_attack', 'assets/images/nacho_attack.png', { frameWidth: 64, frameHeight: 64 });
}

// ==========================================
// 2. CREAZIONE MONDO (CREATE)
// ==========================================
function create() {
    this.physics.world.setBounds(0, 0, 1280, 360);
    const lineaTerra = 296;

    // Sfondo e Pavimento
    this.add.tileSprite(0, 0, 1280, 360, 'muro').setOrigin(0, 0).setDepth(0);
    this.add.image(200, lineaTerra, 'folla').setOrigin(0.5, 1).setDepth(1);
    this.add.image(800, lineaTerra, 'folla').setOrigin(0.5, 1).setDepth(1);
    let pav = this.add.tileSprite(0, 360, 1280, 64, 'pavimento').setOrigin(0, 1).setDepth(2);
    this.physics.add.existing(pav, true); 

    // Creazione Eroi
    let startX = 150;
    for (let i = 0; i < nomiEroi.length; i++) {
        let nome = nomiEroi[i];
        
        // Creazione animazioni se non esistono
        if (this.textures.exists(nome + '_idle')) {
            this.anims.create({ key: nome + '_idle', frames: this.anims.generateFrameNumbers(nome + '_idle', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
            this.anims.create({ key: nome + '_walk', frames: this.anims.generateFrameNumbers(nome + '_walk', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
        }

        let eroe = this.physics.add.sprite(startX - (i * 20), 264, nome + '_idle');
        eroe.setDepth(3).setCollideWorldBounds(true);
        if (this.anims.exists(nome + '_idle')) eroe.anims.play(nome + '_idle', true);
        party.push(eroe);
    }

    // Creazione Nacho
    nacho = this.physics.add.sprite(900, 264, 'nacho_idle');
    nacho.setDepth(3).setFlipX(true).setImmovable(true);
    
    this.anims.create({ key: 'nacho_idle', frames: this.anims.generateFrameNumbers('nacho_idle', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'nacho_attack', frames: this.anims.generateFrameNumbers('nacho_attack', { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
    
    if (this.textures.exists('nacho_idle')) nacho.anims.play('nacho_idle', true);

    // Props
    this.add.image(400, lineaTerra + 10, 'cassa').setOrigin(0.5, 1).setDepth(4);
    this.add.image(500, lineaTerra + 15, 'pedaliera').setOrigin(0.5, 1).setDepth(4);
    this.add.image(850, lineaTerra + 5, 'mic_terra').setOrigin(0.5, 1).setDepth(4);

    // Collisione Trigger Quiz
    this.physics.add.overlap(party[0], nacho, attivazioneQuiz, null, this);

    // Telecamera
    this.cameras.main.setBounds(0, 0, 1280, 360);
    this.cameras.main.startFollow(party[0], true, 0.1, 0.1);
    
    cursors = this.input.keyboard.createCursorKeys();
}

// ==========================================
// 3. LOGICA QUIZ E NACHO
// ==========================================
function attivazioneQuiz() {
    if (quizAttivo || nachoSuperato) return;
    
    quizAttivo = true;
    party[0].setVelocityX(0);

    let quizHTML = `
        <div id="quiz-box" style="position: absolute; top: 20%; left: 50%; transform: translate(-50%, -20%); 
        background: rgba(0,0,0,0.95); color: white; padding: 20px; border: 3px solid #ff0000; font-family: 'Courier New', monospace; z-index: 1000; text-align: center; box-shadow: 0 0 30px #ff0000;">
            <p style="color: #ff0000; font-size: 18px; font-weight: bold;">NACHO: "Hold up, pendejos! No one enters without the Vibe Check."</p>
            <p style="font-size: 16px;">What is the only true face of Milan?</p>
            <button onclick="risposta(false)" style="margin: 10px; padding: 10px; cursor: pointer; background: #333; color: white; border: 1px solid white;">A) Fashion & Money</button><br>
            <button onclick="risposta(true)" style="margin: 10px; padding: 10px; cursor: pointer; background: #333; color: white; border: 1px solid white;">B) CATTIVA</button><br>
            <button onclick="risposta(false)" style="margin: 10px; padding: 10px; cursor: pointer; background: #333; color: white; border: 1px solid white;">C) A cheap spritz</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', quizHTML);
}

window.risposta = function(corretta) {
    let box = document.getElementById('quiz-box');
    let scene = game.scene.scenes[0];

    if (corretta) {
        box.remove();
        alert("NACHO: 'Correct. Move in, cabrones. McLovin is crying like a baby somewhere in there.'");
        nachoSuperato = true;
        quizAttivo = false;
        nacho.destroy();
    } else {
        // RISPOSTA SBAGLIATA - NACHO SI INCAZZA
        box.style.display = "none";
        
        let imprecazioni = ["¡PENDEJO!", "¡NO MAMES!", "¡CHINGADA MADRE!", "¡ESTUPIDO!", "¡FUERA DE AQUÍ!"];
        let testoSwear = scene.add.text(nacho.x, nacho.y - 60, imprecazioni[Math.floor(Math.random()*imprecazioni.length)], {
            fontSize: '28px', fill: '#ff0000', fontStyle: 'bold', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(10);

        // Animazione Attacco Nacho
        if (scene.anims.exists('nacho_attack')) nacho.anims.play('nacho_attack', true);

        // Effetto Danno
        scene.cameras.main.shake(300, 0.02);
        party.forEach(eroe => eroe.setTint(0xff0000));

        // Delay prima di riprovare
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

    // Controlli Leader (Carma)
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

    // Logica History per il Trenino
    if (inMovimento) {
        history.unshift({ x: leader.x, y: leader.y, flipX: leader.flipX });
        if (history.length > party.length * HISTORY_DELAY) history.pop(); 
    }

    // Movimento Seguaci
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

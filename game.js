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

// Variabili globali
let party = []; // Questo è il nostro "trenino" di eroi
let history = []; // L'array che registra le "briciole di pane" (le posizioni passate)
const HISTORY_DELAY = 15; // Distanza tra un personaggio e l'altro (in fotogrammi)
let nomiEroi = ['carma', 'ferraz', 'mauri', 'nan', 'falcon']; // L'ordine del party

let nacho;
let cursors;
let sfondo;
let pavimento;

function preload() {
    this.load.image('muro', 'assets/images/background_muro.png');
    this.load.image('pavimento', 'assets/images/pavimento.png');
    this.load.image('folla', 'assets/images/folla_sprites.png');
    
    this.load.image('cassa', 'assets/images/cassa.png');
    this.load.image('pedaliera', 'assets/images/pedaliera.png');
    this.load.image('mic_asta', 'assets/images/mic_asta.png');
    this.load.image('mic_terra', 'assets/images/mic_terra.png');

    // Carichiamo dinamicamente tutti i 5 eroi!
    // ASSICURATI DI AVERE TUTTI QUESTI FILE SU GITHUB, ESATTAMENTE CON QUESTI NOMI!
    for (let i = 0; i < nomiEroi.length; i++) {
        let nome = nomiEroi[i];
        this.load.spritesheet(nome + '_idle', 'assets/images/' + nome + '_idle.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet(nome + '_walk', 'assets/images/' + nome + '_walk.png', { frameWidth: 64, frameHeight: 64 });
    }

    // E carichiamo il caro vecchio Nacho
    this.load.spritesheet('nacho_idle', 'assets/images/nacho_idle.png', { frameWidth: 64, frameHeight: 64 });
}

function create() {
    this.physics.world.setBounds(0, 0, 1280, 360);
    const lineaTerra = 296;

    // LIVELLO 0, 1, 2 (Sfondo, Folla, Pavimento)
    this.add.tileSprite(0, 0, 1280, 360, 'muro').setOrigin(0, 0).setDepth(0);
    this.add.image(200, lineaTerra, 'folla').setOrigin(0.5, 1).setDepth(1);
    this.add.image(800, lineaTerra, 'folla').setOrigin(0.5, 1).setDepth(1);
    pavimento = this.add.tileSprite(0, 360, 1280, 64, 'pavimento').setOrigin(0, 1).setDepth(2);
    this.physics.add.existing(pavimento, true); 

    // CREIAMO IL PARTY (LIVELLO 3)
    let startX = 100;
    for (let i = 0; i < nomiEroi.length; i++) {
        let nome = nomiEroi[i];
        
        // Creiamo le animazioni per ognuno
        this.anims.create({ key: nome + '_idle', frames: this.anims.generateFrameNumbers(nome + '_idle', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: nome + '_walk', frames: this.anims.generateFrameNumbers(nome + '_walk', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });

        // Li mettiamo in fila, uno dietro l'altro all'inizio del gioco
        let eroe = this.physics.add.sprite(startX - (i * 20), 264, nome + '_idle');
        eroe.setDepth(3);
        eroe.setCollideWorldBounds(true);
        eroe.anims.play(nome + '_idle', true);
        
        party.push(eroe); // Li mettiamo nell'array del party
    }

    // NACHO
    nacho = this.physics.add.sprite(600, 264, 'nacho_idle');
    nacho.setDepth(3);
    nacho.setCollideWorldBounds(true);
    nacho.setFlipX(true);
    this.anims.create({ key: 'nacho_idle', frames: this.anims.generateFrameNumbers('nacho_idle', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
    nacho.anims.play('nacho_idle', true);

    // LIVELLO 4 (Props)
    this.add.image(250, lineaTerra + 10, 'cassa').setOrigin(0.5, 1).setDepth(4);
    this.add.image(350, lineaTerra + 15, 'pedaliera').setOrigin(0.5, 1).setDepth(4);
    this.add.image(700, lineaTerra + 5, 'mic_terra').setOrigin(0.5, 1).setDepth(4);

    // LA TELECAMERA ORA SEGUE CARMA (party[0])
    this.cameras.main.setBounds(0, 0, 1280, 360);
    this.cameras.main.startFollow(party[0]);

    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    let leader = party[0]; // Carma è il leader
    leader.setVelocityX(0);

    let inMovimento = false; // Ci serve per capire se stiamo registrando la "history"

    // CONTROLLI DEL LEADER
    if (cursors.left.isDown) {
        leader.setVelocityX(-160);
        leader.anims.play(nomiEroi[0] + '_walk', true);
        leader.setFlipX(true);
        inMovimento = true;
    } 
    else if (cursors.right.isDown) {
        leader.setVelocityX(160);
        leader.anims.play(nomiEroi[0] + '_walk', true);
        leader.setFlipX(false);
        inMovimento = true;
    } 
    else {
        leader.anims.play(nomiEroi[0] + '_idle', true);
    }

    // LA MAGIA DEL TRENINO
    // Se il leader si muove, registriamo la sua posizione e direzione in cima all'array history
    if (inMovimento) {
        history.unshift({
            x: leader.x,
            y: leader.y,
            flipX: leader.flipX
        });

        // Tagliamo la memoria vecchia per non appesantire il browser
        // Ci servono al massimo (5 eroi * 15 delay) = 75 posizioni in memoria
        if (history.length > party.length * HISTORY_DELAY) {
            history.pop(); 
        }
    }

    // AGGIORNIAMO I SEGUACI (iniziamo da 1, perché 0 è il leader)
    for (let i = 1; i < party.length; i++) {
        let seguace = party[i];
        let nomeSeguace = nomiEroi[i];
        let indiceRitardo = i * HISTORY_DELAY;

        // Se c'è una "briciola di pane" salvata abbastanza indietro nel tempo, la seguiamo
        if (history[indiceRitardo]) {
            let posizionePassata = history[indiceRitardo];
            seguace.x = posizionePassata.x;
            seguace.y = posizionePassata.y;
            seguace.setFlipX(posizionePassata.flipX);
        }

        // Animazioni dei seguaci:
        // Se il leader si sta muovendo (e loro hanno una history), camminano.
        // Se il leader è fermo, anche loro tornano in idle, ovunque si trovino.
        if (inMovimento) {
            seguace.anims.play(nomeSeguace + '_walk', true);
        } else {
            seguace.anims.play(nomeSeguace + '_idle', true);
        }
    }
}

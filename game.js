// CONFIGURAZIONE BASE DEL GIOCO
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    pixelArt: true, // Fondamentale! Mantiene i contorni netti stile retro
    physics: {
        default: 'arcade', // Sistema di fisica per gestire scontri e muri
        arcade: {
            gravity: { y: 0 }, // Niente salti, niente gravità verso il basso!
            debug: false // Mettilo a 'true' se vuoi vedere i bordi invisibili delle collisioni
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Variabili globali che useremo dopo
let ferraz;
let cursors;

// 1. PRELOAD: Carichiamo in memoria le immagini prima che il gioco inizi
function preload() {
    // Sfondo e Pavimento (assumiamo che li hai messi in assets/images/)
    this.load.image('muro', 'assets/images/background_muro.png');
    this.load.image('pavimento', 'assets/images/pavimento.png');

    // Carichiamo lo spritesheet di Ferraz. 
    // Metti le dimensioni esatte del SINGOLO frame (es. 64x64)
    this.load.spritesheet('ferraz_idle', 'assets/images/ferraz_idle.png', { frameWidth: 64, frameHeight: 64 });
}

// 2. CREATE: Posizioniamo la roba sullo schermo quando il gioco parte
function create() {
    // Aggiungiamo lo sfondo al centro dello schermo (320, 180)
    // Usiamo tileSprite così in futuro potremo farlo scorrere all'infinito
    this.add.tileSprite(320, 180, 640, 360, 'muro');

    // Aggiungiamo il pavimento in basso. y = 360 - metà dell'altezza del pavimento (es. 32 se il file è alto 64)
    const pavimento = this.add.tileSprite(320, 328, 640, 64, 'pavimento');
    
    // Attiviamo la fisica per il pavimento in modo che Ferraz non ci cada attraverso (se mai mettessimo la gravità)
    this.physics.add.existing(pavimento, true); 

    // Creiamo Ferraz, posizionandolo a sinistra (x: 100) e appoggiato sul pavimento
    ferraz = this.physics.add.sprite(100, 260, 'ferraz_idle');
    
    // Evitiamo che esca fuori dallo schermo per ora
    ferraz.setCollideWorldBounds(true);

    // Creiamo l'animazione di IDLE (Ferraz che respira da fermo)
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('ferraz_idle', { start: 0, end: 3 }), // Assumiamo 4 frame di animazione
        frameRate: 6, // Velocità dell'animazione
        repeat: -1 // -1 significa che va in loop all'infinito
    });

    // Facciamo partire l'animazione
    ferraz.anims.play('idle', true);

    // Diciamo a Phaser di ascoltare le frecce della tastiera
    cursors = this.input.keyboard.createCursorKeys();
}

// 3. UPDATE: Questo codice gira 60 volte al secondo (qui gestiremo il movimento e gli attacchi)
function update() {
    // Per ora Ferraz sta fermo e respira. Nel prossimo step inseriremo 'walk' e 'attack'!
}

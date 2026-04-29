// CONFIGURAZIONE BASE DEL GIOCO
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, 
            debug: false // Metti a 'true' se vuoi vedere i quadrati di collisione
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Variabili globali
let ferraz;
let nacho; // Aggiunto il nostro primo cattivo!
let cursors;
let sfondo;
let pavimento;

function preload() {
    // 1. SCENARIO E FOLLA
    this.load.image('muro', 'assets/images/background_muro.png');
    this.load.image('pavimento', 'assets/images/pavimento.png');
    this.load.image('folla', 'assets/images/folla_sprites.png');
    
    // 2. PROPS SEPARATI
    this.load.image('cassa', 'assets/images/cassa.png');
    this.load.image('pedaliera', 'assets/images/pedaliera.png');
    this.load.image('mic_asta', 'assets/images/mic_asta.png');
    this.load.image('mic_terra', 'assets/images/mic_terra.png');

    // 3. EROI E CATTIVI (Assicurati che i frameWidth e Height siano esatti!)
    this.load.spritesheet('ferraz_idle', 'assets/images/ferraz_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('ferraz_walk', 'assets/images/ferraz_walk.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('nacho_idle', 'assets/images/nacho_idle.png', { frameWidth: 64, frameHeight: 64 });
}

function create() {
    // Rendiamo il mondo di gioco lungo 1280 pixel
    this.physics.world.setBounds(0, 0, 1280, 360);
    
    // LA LINEA DI TERRA: Y = 296 (Fondo schermo 360 - 64 altezza pavimento)
    const lineaTerra = 296;

    // LIVELLO 0: Sfondo
    sfondo = this.add.tileSprite(0, 0, 1280, 360, 'muro').setOrigin(0, 0).setDepth(0);

    // LIVELLO 1: Folla (Origin ai piedi)
    this.add.image(200, lineaTerra, 'folla').setOrigin(0.5, 1).setDepth(1);
    this.add.image(800, lineaTerra, 'folla').setOrigin(0.5, 1).setDepth(1);

    // LIVELLO 2: Pavimento
    pavimento = this.add.tileSprite(0, 360, 1280, 64, 'pavimento').setOrigin(0, 1).setDepth(2);
    this.physics.add.existing(pavimento, true); 

    // LIVELLO 3: I Personaggi (Eroi e Cattivi)
    // FERRAZ - Il centro di uno sprite 64x64 è a 32. Quindi 296 - 32 = 264.
    ferraz = this.physics.add.sprite(100, 264, 'ferraz_idle');
    ferraz.setDepth(3); 
    ferraz.setCollideWorldBounds(true);

    // NACHO - Lo mettiamo più avanti nel corridoio (X=600)
    nacho = this.physics.add.sprite(600, 264, 'nacho_idle');
    nacho.setDepth(3);
    nacho.setCollideWorldBounds(true);
    nacho.setFlipX(true); // Gira Nacho in modo che guardi a sinistra verso Ferraz!

    // LIVELLO 4: I Props sparsi
    this.add.image(250, lineaTerra + 10, 'cassa').setOrigin(0.5, 1).setDepth(4);
    this.add.image(350, lineaTerra + 15, 'pedaliera').setOrigin(0.5, 1).setDepth(4);
    this.add.image(700, lineaTerra + 5, 'mic_terra').setOrigin(0.5, 1).setDepth(4);
    this.add.image(900, lineaTerra + 10, 'mic_asta').setOrigin(0.5, 1).setDepth(4);
    this.add.image(1150, lineaTerra + 10, 'cassa').setOrigin(0.5, 1).setDepth(4);

    // ANIMAZIONI (Diamo nomi chiari per non confonderci in futuro)
    this.anims.create({
        key: 'ferraz_idle',
        frames: this.anims.generateFrameNumbers('ferraz_idle', { start: 0, end: 3 }), 
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: 'ferraz_walk',
        frames: this.anims.generateFrameNumbers('ferraz_walk', { start: 0, end: 3 }), 
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'nacho_idle',
        frames: this.anims.generateFrameNumbers('nacho_idle', { start: 0, end: 3 }), // Assicurati di avere almeno 4 frame per l'idle di Nacho, o cambia i numeri
        frameRate: 6,
        repeat: -1
    });

    // Facciamo partire le animazioni di base
    ferraz.anims.play('ferraz_idle', true);
    nacho.anims.play('nacho_idle', true);

    // TELECAMERA E COMANDI
    this.cameras.main.setBounds(0, 0, 1280, 360);
    this.cameras.main.startFollow(ferraz);

    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    ferraz.setVelocityX(0); // Ferma Ferraz ogni frame se non premi nulla

    // MOVIMENTO EROE
    if (cursors.left.isDown) {
        ferraz.setVelocityX(-160); 
        ferraz.anims.play('ferraz_walk', true); 
        ferraz.setFlipX(true); 
    }
    else if (cursors.right.isDown) {
        ferraz.setVelocityX(160);
        ferraz.anims.play('ferraz_walk', true);
        ferraz.setFlipX(false); 
    }
    else {
        ferraz.anims.play('ferraz_idle', true);
    }
}

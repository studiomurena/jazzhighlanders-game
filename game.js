const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, 
            debug: false 
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let ferraz;
let cursors;
let sfondo;
let pavimento;

function preload() {
    this.load.image('muro', 'assets/images/background_muro.png');
    this.load.image('pavimento', 'assets/images/pavimento.png');
    
    // ASSICURATI CHE QUESTE DIMENSIONI SIANO QUELLE REALI DEL SINGOLO FRAME!
    this.load.spritesheet('ferraz_idle', 'assets/images/ferraz_idle.png', { frameWidth: 64, frameHeight: 64 });
    // Aggiungiamo anche la camminata (assicurati di caricare il file su GitHub!)
    this.load.spritesheet('ferraz_walk', 'assets/images/ferraz_walk.png', { frameWidth: 64, frameHeight: 64 });
}

function create() {
    // Rendiamo il "mondo" del gioco più lungo dello schermo (es. largo 1280 pixel)
    this.physics.world.setBounds(0, 0, 1280, 360);

    // Mettiamo lo sfondo e il pavimento a partire da x=0. 
    // Ora li facciamo larghi 1280 per coprire tutto il livello!
    sfondo = this.add.tileSprite(0, 180, 1280, 360, 'muro').setOrigin(0, 0.5);
    pavimento = this.add.tileSprite(0, 328, 1280, 64, 'pavimento').setOrigin(0, 0.5);
    
    this.physics.add.existing(pavimento, true); 

    // Ferraz nasce a sinistra
    ferraz = this.physics.add.sprite(100, 260, 'ferraz_idle');
    ferraz.setCollideWorldBounds(true);

    // Animazione IDLE
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('ferraz_idle', { start: 0, end: 3 }), 
        frameRate: 6,
        repeat: -1
    });

    // Animazione WALK (Camminata)
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('ferraz_walk', { start: 0, end: 3 }), // Cambia 'end' in base a quante pose di camminata hai
        frameRate: 10,
        repeat: -1
    });

    // Sblocchiamo la telecamera: ora seguirà Ferraz!
    this.cameras.main.setBounds(0, 0, 1280, 360);
    this.cameras.main.startFollow(ferraz);

    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // AZZERIAMO LA VELOCITÀ OGNI FRAME
    ferraz.setVelocityX(0);

    // MOVIMENTO A SINISTRA
    if (cursors.left.isDown) {
        ferraz.setVelocityX(-160); // Velocità di camminata
        ferraz.anims.play('walk', true); // Fa partire l'animazione
        ferraz.setFlipX(true); // Gira l'immagine di Ferraz verso sinistra
    }
    // MOVIMENTO A DESTRA
    else if (cursors.right.isDown) {
        ferraz.setVelocityX(160);
        ferraz.anims.play('walk', true);
        ferraz.setFlipX(false); // Gira l'immagine di Ferraz verso destra
    }
    // FERMO
    else {
        ferraz.anims.play('idle', true);
    }
}

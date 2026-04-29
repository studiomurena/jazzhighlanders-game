function preload() {
    this.load.image('muro', 'assets/images/background_muro.png');
    this.load.image('pavimento', 'assets/images/pavimento.png');
    
    // Carichiamo anche i nuovi elementi! 
    // Per ora li carichiamo come "image" semplice per fare scena velocemente
    this.load.image('folla', 'assets/images/folla_sprites.png');
    this.load.image('props', 'assets/images/props_sprites.png');

    this.load.spritesheet('ferraz_idle', 'assets/images/ferraz_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('ferraz_walk', 'assets/images/ferraz_walk.png', { frameWidth: 64, frameHeight: 64 });
}

function create() {
    this.physics.world.setBounds(0, 0, 1280, 360);

    // LIVELLO 0: Il Muro (Sfondo lontanissimo)
    sfondo = this.add.tileSprite(0, 180, 1280, 360, 'muro').setOrigin(0, 0.5);
    sfondo.setDepth(0);

    // LIVELLO 1: La Folla (Appoggiata al muro, dietro l'azione)
    // Aggiungiamo un paio di gruppetti di persone sparsi per il locale
    this.add.image(200, 230, 'folla').setDepth(1);
    this.add.image(800, 230, 'folla').setDepth(1);

    // LIVELLO 2: Il Pavimento
    pavimento = this.add.tileSprite(0, 328, 1280, 64, 'pavimento').setOrigin(0, 0.5);
    pavimento.setDepth(2);
    this.physics.add.existing(pavimento, true); 

    // LIVELLO 3: I Personaggi (Ferraz)
    ferraz = this.physics.add.sprite(100, 260, 'ferraz_idle');
    ferraz.setDepth(3); // Ferraz è a livello 3, quindi copre la folla ma sta sul pavimento
    ferraz.setCollideWorldBounds(true);

    // LIVELLO 4: I Props (In primissimo piano, davanti a tutti)
    // Mettiamo le casse e i cavi davanti ai piedi di Ferraz
    this.add.image(400, 310, 'props').setDepth(4);
    this.add.image(1000, 310, 'props').setDepth(4);

    // Animazioni
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('ferraz_idle', { start: 0, end: 3 }), 
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('ferraz_walk', { start: 0, end: 3 }), 
        frameRate: 10,
        repeat: -1
    });

    this.cameras.main.setBounds(0, 0, 1280, 360);
    this.cameras.main.startFollow(ferraz);

    cursors = this.input.keyboard.createCursorKeys();
}

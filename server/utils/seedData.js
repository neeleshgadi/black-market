import mongoose from "mongoose";
import { Alien, User, Order, Cart } from "../models/index.js";

const alienSeedData = [
  {
    "name": "Rizzok",
    "faction": "Acid",
    "planet": "Glorax Marsh",
    "rarity": "Epic",
    "price": 500,
    "image": "/uploads/alien-1753208301575-823007842.png",
    "backstory": "Born in the luminous sludge pits of Glorax Marsh, Rizzok is a hardened scout of the Acid Faction, raised among bioluminescent fungi and toxic waters. Known for his unmatched agility and corrosive combat style, he patrols the marshlands with silent resolve, hunting intruders and defending the sacred bio-reactive pools. His allegiance to the Acid Faction is marked by the glowing hazard symbol he wears — a warning to all who trespass.\r\n\r\nLegends speak of a time when Rizzok melted an entire squadron of enemy bots with a single lash of his tongue. Though considered common by rank, his cunning, speed, and familiarity with the terrain make him a terrifying foe in the fungal wilds.",
    "abilities": [
      "Toxic Tongue Lash",
      "Marsh Cloak",
      "Spore Pulse"
    ],
    "clothingStyle": "Biohazard tactical armor infused with glowing venom sacs",
    "featured": true,
    "inStock": true
  },
  {
    "name": "Viktoh",
    "faction": "Chromalight",
    "planet": "Prismara",
    "rarity": "Legendary",
    "price": 1000,
    "image": "/uploads/alien-1753236770196-164231794.png",
    "backstory": "Born in the crystalline caverns of Prismara, Viktoh is a radiant being of sentient photonic energy. As a member of the Chromalight faction, Viktoh channels ambient starlight into precise beams that reveal truth and destroy illusion.\r\n\r\nViktoh once served as a guide through the prismatic storms that sweep Prismara’s skies, mastering the ability to phase through crystal walls and sense temporal shifts through echoes of light. Though humble in origin, Viktoh now serves as an emissary of the Chromalight, illuminating the darkest corners of the galaxy with intellect and spectral grace.",
    "abilities": [
      "Lightbeam Pulse",
      "Prism Shift",
      "Radiant Echo"
    ],
    "clothingStyle": "Luminous flowweave vestments with refractive cape",
    "featured": true,
    "inStock": true
  },
  {
    "name": "Vohrak",
    "faction": "Cryonox",
    "planet": "Niflheim Prime",
    "rarity": "Rare",
    "price": 300,
    "image": "/uploads/alien-1753237101147-245349268.png",
    "backstory": "Vohrak was forged in the icy depths of Niflheim Prime, where only the fiercest survive. Born during a century-long blizzard known as the Shatterstorm, he rose from an orphaned outcast to become one of the Cryonox’s elite ice sentinels. Stoic and ruthless, Vohrak has mastered ancient Cryo-Rune magic and fused it with glacial armor harvested from the planet’s core.\r\n\r\nDespite being a Common class, Vohrak is feared by even rare elites due to his relentless discipline and cold logic. His loyalty to the Cryonox is unwavering, and he believes in the doctrine: “Victory is preserved in frost.”\r\n\r\nHis ultimate goal? To awaken the Frozen Colossus beneath the planet's crust, a legendary weapon said to reshape the cryospheres of the galaxy.",
    "abilities": [
      "Frost Rend",
      "Cryo Camouflage"
    ],
    "clothingStyle": "Glacial plate armor interwoven with dark frost-threaded cloaks",
    "featured": true,
    "inStock": true
  },
  {
    "name": "Lunexa",
    "faction": "Prism",
    "planet": "Aurora Helix",
    "rarity": "Legendary",
    "price": 1000,
    "image": "/uploads/alien-1753237213885-160025884.png",
    "backstory": "Lunexa, born under the convergence of three dying stars, is the high priestess of the Astralborn, an ancient race who believe their spirits reincarnate through constellations. From the moon-temples of Seraphis-9, she was trained in celestial arts that blend science with spirituality.\r\n\r\nMarked from birth by the Sigil of Nova, Lunexa possesses the ability to manipulate stellar energies and warp light and gravity around her. She is revered not only as a warrior but as a galactic oracle whose visions shape the fate of entire planetary systems.\r\n\r\nHer presence is seen as both a blessing and a warning — for where Lunexa walks, time bends, and destinies unravel. Legends say she guards the Codex of Collapse, a celestial relic capable of rewriting the laws of physics themselves.",
    "abilities": [
      "Prism Shift",
      "Aurora Pulse",
      "Crystalline Refract"
    ],
    "clothingStyle": "Crystalline Bioluminescent Armor",
    "featured": true,
    "inStock": true
  },
  {
    "name": "Thornyx",
    "faction": "Spinehowl",
    "planet": "Krellion Prime",
    "rarity": "Common",
    "price": 100,
    "image": "/uploads/alien-1753237665673-387087400.png",
    "backstory": "Born beneath the twin eclipses of Krellion Prime, Thornyx is a primal enforcer of the Spinehowl—an elite faction of feral warriors sworn to protect the sacred lunar plains. With a body built for stealth and a soul bound to the moons, Thornyx hunts intruders in total silence until the moment of eruption. Rumor has it, Thornyx once tore through a battalion of Syntar Mechs alone, guided only by the whispers of the dark sky.",
    "abilities": [
      "Lunar Howl",
      "Void Pounce",
      "Spineburst Shield"
    ],
    "featured": true,
    "inStock": true
  },
  {
    "name": "Nimval",
    "faction": "Hollowfang",
    "planet": "Umbraxis",
    "rarity": "Common",
    "price": 100,
    "image": "/uploads/alien-1753237957685-549228284.png",
    "backstory": "Nimval is a shadowspawn of Umbraxis — a war-torn planet perpetually shrouded in twilight. Among the Hollowfangs, Nimval is known as a quiet observer and cunning tracker. While most Hollowfangs rely on brute ferocity, Nimval dances between dimensions, weaving darkness like a second skin. Born during the eclipse of the twin moons, some say Nimval carries an ancient soul fragment bound to Umbraxis’s core. Though common in rank, its aura whispers of something far more... evolved.",
    "abilities": [
      "Void Pounce",
      "Hollow Howl",
      "Spectral Claw"
    ],
    "featured": true,
    "inStock": true
  },
  {
    "name": "Gorrthak",
    "faction": "Clawspike",
    "planet": "Yuldron",
    "rarity": "Common",
    "price": 100,
    "image": "/uploads/alien-1753242100488-553812192.png",
    "backstory": "Born in the scorched canyons of Yuldron, Gorrthak is one of the fiercest warriors of the Clawspike faction — a brutal brotherhood of lupine berserkers. His body is scorched with glowing magma veins, a sign of his pact with the Fire Titans of the Deep Core. Feared across the molten battlefields, Gorrthak seeks not conquest, but eternal combat to honor the fallen spirits of his kind.",
    "abilities": [
      "Volcanic Roar",
      "Emberclaw Swipe"
    ],
    "clothingStyle": "Tribal Battlegear with volcanic-iron pauldrons",
    "featured": true,
    "inStock": true
  },
  {
    "name": "Varnyx",
    "faction": "Lunar Prowl",
    "planet": "Iskyr",
    "rarity": "Common",
    "price": 100,
    "image": "/uploads/alien-1753242235496-158271451.png",
    "backstory": "Under the haunting moons of Iskyr, the Lunar Prowl defends the ancient forests from invaders and trespassers. Varnyx, the fiercest among them, is not only feared for his brute strength but for his unparalleled stealth. Legends speak of him moving so quietly, even the wind holds its breath.\r\n\r\nOnce a lone guardian of the hollowed crescent groves, Varnyx now prowls the galaxies, tracking those who defile sacred grounds. His glowing eyes are the last thing many see before the shadows swallow them whole.\r\n\r\nHe speaks little. His presence is command enough.",
    "abilities": [
      "Moonveil Ambush",
      "Crescent Claw",
      "Howl of Iskyr"
    ],
    "clothingStyle": "Scrap-armored hide with rusted metallic shoulder plates and bone-threaded utility belts",
    "featured": false,
    "inStock": true
  },
  {
    "name": "Gorrmash",
    "faction": "Feralbyte",
    "planet": "Dravokar",
    "rarity": "Rare",
    "price": 300,
    "image": "/uploads/alien-1753242449034-494914038.png",
    "backstory": "Gorrmash hails from the volatile jungles of Dravokar, a planet scarred by volcanic eruptions and cloaked in toxic mists. Born into a brood of war-beasts, Gorrmash rose through the brutal Feralbyte rites—ancient combat trials meant to forge unbreakable warriors. Unlike others of his kind, he possesses a rare tactical mind beneath his primal fury.",
    "abilities": [
      "Physical Might",
      "Savage Instincts",
      "Feralbyte Bond"
    ],
    "clothingStyle": "Industrial exo-rig armor with exposed gears, hydraulic gauntlets, and smog-filter helm",
    "featured": true,
    "inStock": true
  },
  {
    "name": "Thalexa",
    "faction": "Bloomvoid",
    "planet": "Lystara",
    "rarity": "Epic",
    "price": 500,
    "image": "/uploads/alien-1753242647448-761395881.png",
    "backstory": "Thalexa hails from the lush bioluminescent world of Lystara, where flora and sentience have merged over eons. As a member of the Bloomvoid, Thalexa is both warrior and guardian of life essence. The flora woven into their body isn’t mere decoration—it’s alive, reactive, and attuned to the balance of ecosystems. They are revered on Lystara not for violence, but for their ability to tame chaos with growth.",
    "abilities": [
      "Floral Pulse"
    ],
    "clothingStyle": "Organic Floral Armor – petals and vines grown into protective yet elegant formations.",
    "featured": true,
    "inStock": true
  },
  {
    "name": "Kriznarr",
    "faction": "Pulseforge",
    "planet": "Neoridium",
    "rarity": "Rare",
    "price": 300,
    "image": "/uploads/alien-1753244503367-940518415.png",
    "backstory": "Born amidst the volatile energy storms of Neoridium, Kriznarr was forged—not in fire, but in pure plasma. A hardened sentinel of the Pulseforge, he channels raw ionic energy through his muscular frame. His mission: enforce balance across the volatile rift zones of the galaxy and extract corrupted energy from rogue tech-wielders.\r\n\r\nKriznarr is known for his brutal precision and unyielding loyalty to the Pulseforge Codex. He believes energy is sacred—meant to empower, not to exploit. Any who dare twist its essence find themselves crushed in his glowing fists.\r\n\r\nEven among the battle-hardened ranks of the Pulseforge, Kriznarr is a legend whispered through static and lightning.",
    "abilities": [
      "Ion Crush",
      "Pulse Shroud",
      "Overload Core"
    ],
    "featured": false,
    "inStock": true
  },
  {
    "name": "Lunvok",
    "faction": "Techspire",
    "planet": "Virex",
    "rarity": "Rare",
    "price": 300,
    "image": "/uploads/alien-1753245270275-972329949.png",
    "backstory": "Born in the floating data sanctums of Virex, Lunvok is a philosopher-engineer of the Techspire, an elite order dedicated to the pursuit of logic, harmony, and hyper-advanced technology. While others wage war with brute force, Lunvok manipulates systems, gravity, and perception itself to neutralize threats before a single blow is struck.\r\n\r\nHe is a master of holo-temporal projections, able to simulate events before they happen and select the optimal future. To Lunvok, conflict is simply a miscalculation—one he is uniquely equipped to correct.\r\n\r\nWearing ancient robes woven from magnetic code-fibers, Lunvok stands as both a historian and harbinger, ensuring the Techspire's knowledge is never corrupted nor lost.",
    "abilities": [
      "🌀 Event Horizon Field",
      "🔮 Quantum Recall",
      "📚 Mindweave Protocol"
    ],
    "featured": false,
    "inStock": true
  },
  {
    "name": "Miravax",
    "faction": "Azure Reaches",
    "planet": "Ocelara",
    "rarity": "Rare",
    "price": 300,
    "image": "/uploads/alien-1753245442757-423906731.png",
    "backstory": "From the bioluminescent depths of Ocelara, where the waters sing with ancient whispers, Miravax rises as a sentinel of balance and grace. The Azure Reaches is not merely a faction but a sacred covenant—to protect the oceans’ equilibrium and harness their timeless wisdom.\r\n\r\nMiravax is revered for her deep empathy and mastery over waterborne communication, allowing her to commune with marine life and even influence the tides themselves. While others clash in battle, Miravax sways the battlefield like a current, redirecting threats and soothing chaos.\r\n\r\nHer flowing attire, crafted from reactive sea-silk, mimics the movement of currents and confuses the eye—perfect for underwater stealth and evasion.",
    "abilities": [
      "💧 Tidecall",
      "🐚 Echo Pulse",
      "🌫️ Mistform Veil"
    ],
    "featured": false,
    "inStock": true
  },
  {
    "name": "Yuvexa",
    "faction": "Etherwinds",
    "planet": "Serenova",
    "rarity": "Legendary",
    "price": 1000,
    "image": "/uploads/alien-1753245724435-192793208.png",
    "backstory": "On the floating isles of Serenova, where dawn never truly fades and the air hums with thought, Yuvexa is both a myth and a presence. As a high ascendant of the Etherwinds, she is said to have been born from stardust and memory, shaped by the collective dreams of her people.\r\n\r\nYuvexa serves as a temporal weaver—able to bend time and atmospheric essence with graceful intention. While her presence is calming, those who challenge her soon discover the volatile power hidden within her tranquil exterior. Her floating steps stir currents of potential energy, and her eyes hold galaxies worth of insight.\r\n\r\nLegends say Yuvexa has walked not only across planets, but through moments yet to come.",
    "abilities": [
      "🌪️ Skytrace",
      "🕊️ Breath of Aeons",
      "🌫️ Serene Veil"
    ],
    "featured": false,
    "inStock": true
  },
  {
    "name": "Thrilloq",
    "faction": "Kinetix",
    "planet": "Fluxitron",
    "rarity": "Epic",
    "price": 500,
    "image": "/uploads/alien-1753245938060-257367266.png",
    "backstory": "Hailing from the vibrant, energy-rich world of Fluxitron, Thrilloq is a distinguished member of the Kinetix Faction, a collective dedicated to the study and mastery of motion, energy, and the fundamental forces of the universe. Born with an unusually high affinity for kinetic manipulation, Thrilloq's skin often shimmers with the residual energies they constantly process. As a prodigy within the Kinetix, they quickly rose through the ranks, their unparalleled speed and fluid movements becoming legendary. Thrilloq serves as a frontline scout and a swift infiltrator, always seeking to understand and harness the dynamic energies of new worlds, embodying the Kinetix's pursuit of ultimate mastery over movement and power.",
    "abilities": [
      "Kinetic Burst",
      "Vibrant Pulse",
      "Graviton Glide"
    ],
    "featured": false,
    "inStock": true
  },
  {
    "name": "Jynxen",
    "faction": "Synthburn",
    "planet": "Embergrid",
    "rarity": "Epic",
    "price": 500,
    "image": "/uploads/alien-1753246136988-690001577.png",
    "backstory": "From the perpetually smoldering core of Embergrid, a planet forged in volcanic cataclysms, emerges Jynxen, a prime operative of the Synthburn Faction. Unlike traditional fire-wielders, the Synthburn harness and refine volatile synthetic energies, shaping them into tools of both destruction and controlled creation. Jynxen's armor is a sophisticated conduit, designed to contain and amplify the furious energies that rage within, manifesting as the ever-present flames around their head and hands. They are a living embodiment of Embergrid's harsh beauty – fierce, resilient, and utterly consumed by the power they wield. Jynxen's mission is to expand the Synthburn's reach, ensuring their fiery doctrine burns brightly across the galaxy.",
    "abilities": [
      "Pyroclastic Barrage",
      "Synthetic Blaze Aura",
      "Core Ignition"
    ],
    "featured": false,
    "inStock": true
  },
  {
    "name": "Lyrixxa",
    "faction": "Holobloom",
    "planet": "Aetherflora",
    "rarity": "Legendary",
    "price": 1000,
    "image": "/uploads/alien-1753246328891-99196065.png",
    "backstory": "From the ethereal gardens of Aetherflora, a world where light and life intertwine, emerges Lyrixxa, a beacon of the Holobloom Faction. The Holobloom are guardians of nascent life and masters of light-based manifestation, cultivating reality with beauty and precision. Lyrixxa, with her naturally shimmering form and radiant wings, embodies the very essence of Aetherflora – a living conduit for its ambient energies. She weaves illusions with the finesse of a master painter and propagates vitality with every gentle touch. Lyrixxa's purpose is to seek out and nurture new forms of life across the cosmos, spreading the Holobloom's philosophy of harmonious growth and the captivating power of light.",
    "abilities": [
      "Holographic Bloom",
      "Luminous Pollination",
      "Aetherial Glide"
    ],
    "featured": false,
    "inStock": true
  },
  {
    "name": "Qynthor",
    "faction": "Radiark",
    "planet": "Voltara",
    "rarity": "Legendary",
    "price": 1000,
    "image": "/uploads/alien-1753246550738-949473423.png",
    "backstory": "Hailing from the perpetually storm-wracked and energy-rich planet of Voltara, Qynthor is a master conduit within the enigmatic Radiark Faction. The Radiark delve into the most dangerous and potent forms of energy, specifically the untamed forces of radiation and pure electrical discharge, seeking to harness them for their own agenda. Qynthor's very being is permeated by Voltara's ambient energies, causing his skin to subtly glow with internal power and his eyes to burn with concentrated might. The glowing orbs he wields are not mere artifacts, but distilled essence of Voltara's tempestuous core, allowing him to manipulate catastrophic forces with chilling precision. Driven by the Radiark's ambition, Qynthor travels the cosmos, seeking to either control or eradicate any energy source that cannot be bent to their will, ensuring the Radiark's dominance over the very fabric of power.",
    "abilities": [
      "Arc Flux",
      "Radiant Pulse",
      "Static Shielding"
    ],
    "featured": false,
    "inStock": true
  },
  {
    "name": "Saffira",
    "faction": "Dreamweavers",
    "planet": "Lumenveil",
    "rarity": "Legendary",
    "price": 1000,
    "image": "/uploads/alien-1753246868428-766394398.png",
    "backstory": "From the shimmering, mist-shrouded spires of Lumenveil, a world where reality itself seems to hum with ancient, gentle energies, comes Saffira, a revered member of the Dreamweavers Faction. The Dreamweavers are not just observers of the subconscious; they are artisans of the mind, dedicated to preserving peace and harmony across the cosmos through subtle psychological influence and the mending of troubled souls. Saffira, marked by the radiant golden patterns that trace the flow of Aether-light beneath her skin, is a master of this delicate craft. She journeys through the waking and sleeping worlds, seeking out discord and quiet suffering. With a gentle touch and a whisper in the mind's eye, she can guide sentient beings towards clarity, truth, and inner peace, always striving to ensure that the dreams of the galaxy remain vibrant and untarnished.",
    "abilities": [
      "Dreamscape Infiltration",
      "Lumen-Pattern Weaving",
      "Empathic Resonance"
    ],
    "featured": false,
    "inStock": true
  }
];

const adminUserData = {
  "email": "neeleshgadi@gmail.com",
  "firstName": "Neelesh",
  "lastName": "Gadi",
  "isAdmin": true,
  "wishlist": [],
  "password": "Neelesh@2003"
};

const testUserData = {
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  "isAdmin": false,
  "wishlist": [
    "687fcf75dca49ea26df92e7b",
    "687fcf75dca49ea26df92e7d"
  ],
  "password": "test123456"
};

// Additional user data
const additionalUsers = [
  {
    "email": "king@kong.com",
    "firstName": "King",
    "lastName": "Kong",
    "isAdmin": false,
    "wishlist": [],
    "password": "user123456"
  }
];

export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing aliens only (preserve users)
    await Alien.deleteMany({});
    console.log("✅ Cleared existing aliens");

    // Check if admin user exists, create if not
    let adminUser = await User.findOne({ email: adminUserData.email });
    if (!adminUser) {
      adminUser = new User(adminUserData);
      await adminUser.save();
      console.log("✅ Created admin user");
    } else {
      // Update existing admin user to ensure admin status
      adminUser.isAdmin = true;
      await adminUser.save();
      console.log("✅ Updated existing admin user");
    }

    // Check if test user exists, create if not
    let testUser = await User.findOne({ email: testUserData.email });
    if (!testUser) {
      testUser = new User(testUserData);
      await testUser.save();
      console.log("✅ Created test user");
    } else {
      console.log("✅ Test user already exists");
    }
    
    // Create additional users if any
    for (const userData of additionalUsers) {
      let existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created additional user: ${userData.email}`);
      } else {
        console.log(`✅ Additional user already exists: ${userData.email}`);
      }
    }

    // Create aliens
    const aliens = await Alien.insertMany(alienSeedData);
    console.log(`✅ Created ${aliens.length} alien collectibles`);

    // Add some aliens to test user's wishlist
    if (testUser) {
      const randomAliens = aliens.slice(0, 3);
      testUser.wishlist = randomAliens.map((alien) => alien._id);
      await testUser.save();
      console.log("✅ Added aliens to test user wishlist");
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - ${aliens.length} aliens created`);
    console.log(`   - ${1 + 1 + additionalUsers.length} users preserved/created`);
    console.log(`   - Admin login: ${adminUserData.email} / Neelesh@2003`);
    console.log(`   - Test login: ${testUserData.email} / test123456`);
    if (additionalUsers.length > 0) {
      console.log(`   - Additional users: ${additionalUsers.length}`);
    }

    return {
      aliens,
      users: [adminUser, testUser],
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

export const clearDatabase = async (includeUsers = false) => {
  try {
    console.log("🧹 Clearing database...");

    await Alien.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});

    if (includeUsers) {
      await User.deleteMany({});
      console.log("✅ Database cleared successfully (including users)");
    } else {
      console.log("✅ Database cleared successfully (users preserved)");
    }
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  }
};

export { alienSeedData, adminUserData, testUserData, additionalUsers };

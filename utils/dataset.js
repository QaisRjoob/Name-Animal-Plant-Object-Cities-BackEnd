/**
 * Bot word dataset organized by category and starting letter.
 * Words are tiered: easy (index 0-2), medium (3-5), hard (6+)
 *
 * For Arabic, we use a minimal set as a starting point.
 * Extend with your own data later.
 */

const staticDataset = {
  names: {
    A: ['Alice', 'Adam', 'Anna', 'Alejandro', 'Anastasia', 'Achilles', 'Ambrose'],
    B: ['Bob', 'Bella', 'Ben', 'Beatrice', 'Benedict', 'Balthazar', 'Bartholomew'],
    C: ['Carlos', 'Clara', 'Chris', 'Cecilia', 'Cornelius', 'Cassiopeia', 'Crispin'],
    D: ['David', 'Diana', 'Dan', 'Dorothea', 'Demetrius', 'Desdemona', 'Diogenes'],
    E: ['Eva', 'Edward', 'Emma', 'Eleonora', 'Evander', 'Euphemia', 'Erasmus'],
    F: ['Frank', 'Fiona', 'Fred', 'Felicity', 'Ferdinand', 'Felicitas', 'Faustus'],
    G: ['George', 'Grace', 'Gary', 'Genevieve', 'Gideon', 'Guinevere', 'Galadriel'],
    H: ['Harry', 'Hannah', 'Henry', 'Harriet', 'Horatio', 'Hermione', 'Hildegard'],
    I: ['Ivan', 'Iris', 'Ian', 'Isabella', 'Ignatius', 'Iphigenia', 'Isidore'],
    J: ['Jack', 'Julia', 'James', 'Josephine', 'Jasper', 'Jezebel', 'Jebediah'],
    K: ['Kevin', 'Karen', 'Kyle', 'Katarina', 'Killian', 'Kassandra', 'Krishnamurti'],
    L: ['Luke', 'Laura', 'Leo', 'Leonora', 'Lancelot', 'Lysandra', 'Lysistrata'],
    M: ['Mark', 'Mary', 'Mike', 'Magdalena', 'Maximus', 'Melisande', 'Methodius'],
    N: ['Nick', 'Nina', 'Noah', 'Natalia', 'Nathaniel', 'Nicodemus', 'Nephele'],
    O: ['Oscar', 'Olivia', 'Owen', 'Octavia', 'Odysseus', 'Ophelia', 'Oenomaus'],
    P: ['Paul', 'Paula', 'Peter', 'Penelope', 'Perseus', 'Persephone', 'Ptolemy'],
    Q: ['Quinn', 'Quentin', 'Queenie', 'Quinlan', 'Quiana', 'Quillan', 'Quirinus'],
    R: ['Ryan', 'Rosa', 'Rob', 'Rosalind', 'Reginald', 'Romilda', 'Robespierre'],
    S: ['Sam', 'Sara', 'Steve', 'Seraphina', 'Sebastian', 'Scheherazade', 'Sophonias'],
    T: ['Tom', 'Tina', 'Tim', 'Theodora', 'Thaddeus', 'Themistocles', 'Tiberius'],
    U: ['Uma', 'Ulric', 'Ursula', 'Ulysses', 'Umberto', 'Uriella', 'Uthred'],
    V: ['Vera', 'Victor', 'Vince', 'Valentina', 'Virgil', 'Vivienne', 'Vespasian'],
    W: ['Will', 'Wendy', 'Walt', 'Wilhelmina', 'Winston', 'Winifred', 'Walburga'],
    X: ['Xena', 'Xavier', 'Xander', 'Ximena', 'Xenophon', 'Xiomara', 'Xerxes'],
    Y: ['Yara', 'Yusuf', 'Yuki', 'Yasmine', 'Yolanda', 'Yevgenia', 'Yevdokiya'],
    Z: ['Zoe', 'Zach', 'Zelda', 'Zara', 'Zebediah', 'Zenobia', 'Zoroaster'],
  },

  plants: {
    A: ['Apple', 'Aloe', 'Ash', 'Acacia', 'Amaranth', 'Agapanthus', 'Agrimony'],
    B: ['Bamboo', 'Basil', 'Birch', 'Begonia', 'Bougainvillea', 'Bloodroot', 'Bladderwort'],
    C: ['Cactus', 'Cedar', 'Corn', 'Chrysanthemum', 'Cyclamen', 'Carnivorous sundew', 'Cinquefoil'],
    D: ['Daisy', 'Daffodil', 'Date palm', 'Delphinium', 'Dieffenbachia', 'Dodder', 'Duckweed'],
    E: ['Elm', 'Eucalyptus', 'Echinacea', 'Evening primrose', 'Elderberry', 'Elecampane', 'Epiphyllum'],
    F: ['Fern', 'Fig', 'Foxglove', 'Forsythia', 'Fuchsia', 'Fleabane', 'Frankincense tree'],
    G: ['Grass', 'Ginger', 'Gardenia', 'Geranium', 'Ginkgo', 'Goldenrod', 'Glasswort'],
    H: ['Holly', 'Hibiscus', 'Hawthorn', 'Hydrangea', 'Hyssop', 'Hellebore', 'Hornbeam'],
    I: ['Iris', 'Ivy', 'Impatiens', 'Indigo', 'Ironwood', 'Iceland poppy', 'Inkberry'],
    J: ['Jasmine', 'Juniper', 'Jack fruit', 'Jonquil', 'Japanese maple', 'Jaborandi', 'Jimsonweed'],
    K: ['Kale', 'Kelp', 'Kiwi vine', 'Kudzu', 'Kniphofia', 'Kohlrabi', 'Krameria'],
    L: ['Lavender', 'Lily', 'Lotus', 'Lichen', 'Lungwort', 'Larkspur', 'Larch'],
    M: ['Maple', 'Mint', 'Mango', 'Magnolia', 'Moonflower', 'Mandrake', 'Mistletoe'],
    N: ['Nettle', 'Narcissus', 'Nightshade', 'Nettleleaf', 'Nutmeg', 'Needle palm', 'Nicotiana'],
    O: ['Oak', 'Orchid', 'Olive', 'Oxalis', 'Oregano', 'Oat grass', 'Osage orange'],
    P: ['Pine', 'Palm', 'Peony', 'Primrose', 'Pitcher plant', 'Passionflower', 'Pigweed'],
    Q: ['Quince', 'Queen Anne\'s lace', 'Quaking aspen', 'Quandong', 'Queensland hemp', 'Quillwort', 'Quiver tree'],
    R: ['Rose', 'Rosemary', 'Rhubarb', 'Rafflesia', 'Rockrose', 'Rue', 'Ryegrass'],
    S: ['Sunflower', 'Sage', 'Sequoia', 'Skunk cabbage', 'Snapdragon', 'Sphagnum', 'Silkweed'],
    T: ['Tulip', 'Thyme', 'Tamarind', 'Thistle', 'Trillium', 'Tarragon', 'Toadflax'],
    U: ['Umbrella plant', 'Ulex', 'Uva-ursi', 'Ulmus', 'Urtica', 'Ursinia', 'Uvularia'],
    V: ['Violet', 'Vine', 'Verbena', 'Venus flytrap', 'Valerian', 'Vanilla', 'Viburnum'],
    W: ['Willow', 'Wheat', 'Walnut', 'Waterlily', 'Wolfsbane', 'Wisteria', 'Wormwood'],
    X: ['Xanthium', 'Xerophyte', 'Xanthorrhoea', 'Xylosma', 'Xylopia', 'Xanthoceras', 'Xylaria'],
    Y: ['Yew', 'Yucca', 'Yarrow', 'Yellow dock', 'Yerba mate', 'Yellow iris', 'Ylang-ylang'],
    Z: ['Zinnia', 'Zucchini', 'Zamia', 'Zephyranthes', 'Zigzag plant', 'Ziziphus', 'Zostera'],
  },

  animals: {
    A: ['Ant', 'Alligator', 'Albatross', 'Axolotl', 'Addax', 'Angelfish', 'Armadillo'],
    B: ['Bear', 'Buffalo', 'Bat', 'Barracuda', 'Baboon', 'Bilby', 'Bonobo'],
    C: ['Cat', 'Crocodile', 'Cheetah', 'Capybara', 'Cassowary', 'Chameleon', 'Coelacanth'],
    D: ['Dog', 'Dolphin', 'Duck', 'Dugong', 'Dingo', 'Dragonfly', 'Dhole'],
    E: ['Eagle', 'Elephant', 'Eel', 'Echidna', 'Emu', 'Ermine', 'Electric ray'],
    F: ['Fox', 'Frog', 'Flamingo', 'Falcon', 'Firefly', 'Fer-de-lance', 'Fossa'],
    G: ['Gorilla', 'Giraffe', 'Gecko', 'Gazelle', 'Guppy', 'Geoduck', 'Gerenuk'],
    H: ['Horse', 'Hippo', 'Hawk', 'Hamster', 'Hagfish', 'Harpy eagle', 'Hellbender'],
    I: ['Iguana', 'Ibis', 'Impala', 'Inchworm', 'Indri', 'Indian cobra', 'Ivory gull'],
    J: ['Jaguar', 'Jellyfish', 'Jay', 'Jackal', 'Jerboa', 'Jumping spider', 'Jabiru'],
    K: ['Kangaroo', 'Koala', 'Kiwi', 'Kingfisher', 'Komodo dragon', 'Kinkajou', 'Kakapo'],
    L: ['Lion', 'Leopard', 'Lemur', 'Lobster', 'Lynx', 'Lyrebird', 'Lamprey'],
    M: ['Monkey', 'Mouse', 'Moose', 'Meerkat', 'Mantis', 'Mudskipper', 'Manatee'],
    N: ['Narwhal', 'Newt', 'Nighthawk', 'Numbat', 'Nudibranch', 'Nilgai', 'Nematode'],
    O: ['Owl', 'Octopus', 'Orca', 'Ocelot', 'Ostrich', 'Okapi', 'Olm'],
    P: ['Penguin', 'Parrot', 'Panda', 'Piranha', 'Platypus', 'Pangolin', 'Peacock'],
    Q: ['Quail', 'Quokka', 'Quetzal', 'Queen conch', 'Queensland lungfish', 'Queenfish', 'Quahog'],
    R: ['Rabbit', 'Raven', 'Rattlesnake', 'Rhino', 'Roadrunner', 'Remora', 'Riflebird'],
    S: ['Snake', 'Shark', 'Seal', 'Salamander', 'Stingray', 'Sunfish', 'Saiga'],
    T: ['Tiger', 'Turtle', 'Toucan', 'Tarantula', 'Tapir', 'Thylacine', 'Tarsier'],
    U: ['Uakari', 'Umbrella bird', 'Urchin', 'Urial', 'Unau', 'Utah prairie dog', 'Ulysses butterfly'],
    V: ['Vulture', 'Viper', 'Vicuña', 'Vampire bat', 'Vole', 'Vervet monkey', 'Viperfish'],
    W: ['Wolf', 'Whale', 'Weasel', 'Walrus', 'Wombat', 'Wolverine', 'Wandering albatross'],
    X: ['Xenops', 'X-ray tetra', 'Xantus\'s hummingbird', 'Xerus', 'Xeme', 'Xenopus frog', 'Xiphosuran'],
    Y: ['Yak', 'Yellow perch', 'Yellowfin tuna', 'Yellow mongoose', 'Yapok', 'Yorkshire terrier', 'Yellowhammer'],
    Z: ['Zebra', 'Zebu', 'Zorilla', 'Zander', 'Zapata wren', 'Zebra shark', 'Zone-tailed hawk'],
  },

  objects: {
    A: ['Axe', 'Anchor', 'Arrow', 'Anvil', 'Abacus', 'Astrolabe', 'Autoclave'],
    B: ['Ball', 'Book', 'Bottle', 'Binoculars', 'Barometer', 'Bellows', 'Boomerang'],
    C: ['Chair', 'Clock', 'Compass', 'Candle', 'Cauldron', 'Crossbow', 'Clavichord'],
    D: ['Desk', 'Door', 'Drum', 'Dagger', 'Derrick', 'Drawbridge', 'Divining rod'],
    E: ['Envelope', 'Eraser', 'Engine', 'Easel', 'Escapement', 'Epaulette', 'Extant'],
    F: ['Fan', 'Fork', 'Funnel', 'Flask', 'Furnace', 'Flagpole', 'Firestarter'],
    G: ['Globe', 'Glass', 'Glove', 'Gear', 'Gallows', 'Goblet', 'Grappling hook'],
    H: ['Hammer', 'Hose', 'Helmet', 'Harp', 'Hourglass', 'Harness', 'Hygrometer'],
    I: ['Iron', 'Inkwell', 'Instrument', 'Ingot', 'Inclinometer', 'Irons', 'Ice pick'],
    J: ['Jar', 'Jacket', 'Javelin', 'Jack', 'Jackscrew', 'Journal', 'Jug'],
    K: ['Knife', 'Key', 'Kettle', 'Kite', 'Knapsack', 'Kiln', 'Kaleidoscope'],
    L: ['Lamp', 'Ladder', 'Lens', 'Loom', 'Lute', 'Lathe', 'Level'],
    M: ['Map', 'Mirror', 'Mallet', 'Magnet', 'Mortar', 'Microscope', 'Mandolin'],
    N: ['Needle', 'Net', 'Notebook', 'Nail', 'Nozzle', 'Nutcracker', 'Noose'],
    O: ['Oar', 'Oven', 'Organ', 'Oil lamp', 'Oscilloscope', 'Odometer', 'Oboe'],
    P: ['Pen', 'Plate', 'Pulley', 'Pistol', 'Pendulum', 'Periscope', 'Phonograph'],
    Q: ['Quill', 'Quiver', 'Quadrant', 'Quarry block', 'Quern', 'Quick clamp', 'Quartz clock'],
    R: ['Rope', 'Rifle', 'Ruler', 'Ratchet', 'Rapier', 'Razor', 'Rolling pin'],
    S: ['Sword', 'Saw', 'Scale', 'Shield', 'Sextant', 'Scalpel', 'Sundial'],
    T: ['Table', 'Torch', 'Telescope', 'Trowel', 'Trebuchet', 'Theodolite', 'Tuning fork'],
    U: ['Umbrella', 'Urn', 'Utensil', 'Unicycle', 'Upright piano', 'Utility knife', 'Ukulele'],
    V: ['Vase', 'Valve', 'Violin', 'Vice', 'Voltmeter', 'Ventilator', 'Vellum'],
    W: ['Wheel', 'Watch', 'Wrench', 'Winch', 'Whistle', 'Whetstone', 'Windlass'],
    X: ['Xylophone', 'X-acto knife', 'X-ray machine', 'Xerographic drum', 'X-brace', 'Xenon lamp', 'Xyster'],
    Y: ['Yoke', 'Yarn', 'Yo-yo', 'Yardstick', 'Yale lock', 'Yellow flag', 'Yarn winder'],
    Z: ['Zipper', 'Zither', 'Zoom lens', 'Zero gauge', 'Zinc plate', 'Z-bar', 'Zoetrope'],
  },

  cities: {
    A: ['Amsterdam', 'Athens', 'Austin', 'Ankara', 'Antwerp', 'Ashgabat', 'Asmara'],
    B: ['Berlin', 'Bangkok', 'Barcelona', 'Bogotá', 'Baghdad', 'Bucharest', 'Brisbane'],
    C: ['Cairo', 'Chicago', 'Copenhagen', 'Casablanca', 'Colombo', 'Caracas', 'Canberra'],
    D: ['Dubai', 'Delhi', 'Dublin', 'Dhaka', 'Damascus', 'Dakar', 'Denver'],
    E: ['Edinburgh', 'Essen', 'Edmonton', 'El Paso', 'Ekaterinburg', 'Entebbe', 'Erlangen'],
    F: ['Frankfurt', 'Florence', 'Fukuoka', 'Freetown', 'Fortaleza', 'Fez', 'Fresno'],
    G: ['Geneva', 'Glasgow', 'Guangzhou', 'Guadalajara', 'Gothenburg', 'Gaborone', 'Guayaquil'],
    H: ['Hong Kong', 'Houston', 'Hamburg', 'Havana', 'Helsinki', 'Hanoi', 'Hyderabad'],
    I: ['Istanbul', 'Indianapolis', 'Islamabad', 'Ibadan', 'Isfahan', 'Innsbruck', 'Iquique'],
    J: ['Jakarta', 'Johannesburg', 'Jerusalem', 'Jeddah', 'Jinan', 'Jacksonville', 'Juneau'],
    K: ['Kabul', 'Karachi', 'Kuala Lumpur', 'Kiev', 'Kinshasa', 'Kathmandu', 'Khartoum'],
    L: ['London', 'Lagos', 'Los Angeles', 'Lima', 'Lisbon', 'Ljubljana', 'Luanda'],
    M: ['Madrid', 'Mexico City', 'Mumbai', 'Moscow', 'Manila', 'Milan', 'Montevideo'],
    N: ['New York', 'Nairobi', 'Nicosia', 'Nagoya', 'Naples', 'Nouméa', 'Nizhny Novgorod'],
    O: ['Oslo', 'Ottawa', 'Osaka', 'Orlando', 'Ouagadougou', 'Odessa', 'Oman (Muscat)'],
    P: ['Paris', 'Prague', 'Perth', 'Phnom Penh', 'Porto', 'Pretoria', 'Panama City'],
    Q: ['Quebec', 'Quito', 'Quetta', 'Quezon City', 'Qingdao', 'Queenstown', 'Quelimane'],
    R: ['Rome', 'Riyadh', 'Rio de Janeiro', 'Rotterdam', 'Rabat', 'Reykjavik', 'Rangoon'],
    S: ['Sydney', 'Singapore', 'Seoul', 'Stockholm', 'São Paulo', 'Sarajevo', 'Santiago'],
    T: ['Tokyo', 'Toronto', 'Tehran', 'Taipei', 'Tunis', 'Tallinn', 'Tashkent'],
    U: ['Ulaanbaatar', 'Utrecht', 'Ufa', 'Urumqi', 'Uppsala', 'Ulsan', 'Ushuaia'],
    V: ['Vienna', 'Vancouver', 'Venice', 'Vilnius', 'Vladivostok', 'Valencia', 'Valletta'],
    W: ['Warsaw', 'Washington DC', 'Wellington', 'Wuhan', 'Windhoek', 'Winnipeg', 'Wrocław'],
    X: ['Xi\'an', 'Xiamen', 'Xochimilco', 'Xinjiang', 'Xuzhou', 'Xanthi', 'Xalapa'],
    Y: ['Yangon', 'Yokohama', 'Yerevan', 'Yaoundé', 'Yekaterinburg', 'Yogyakarta', 'Yalta'],
    Z: ['Zurich', 'Zagreb', 'Zhengzhou', 'Zanzibar', 'Zaragoza', 'Zomba', 'Zwolle'],
  },

  // ─── ARABIC STATIC DATASET (minimal example for all letters) ──────────────
  names_ar: {
    'ا': ['أحمد', 'أمين', 'إبراهيم', 'أميرة', 'إيمان', 'أمجد', 'أروى'],
    'ب': ['باسم', 'بشرى', 'بدر', 'بلقيس', 'بشير', 'بهاء', 'بثينة'],
    'ت': ['تامر', 'تهاني', 'توفيق', 'تغريد', 'تيسير', 'تميم', 'تحدث'],
    'ث': ['ثامر', 'ثريا', 'ثابت', 'ثروت', 'ثائر', 'ثعلب', 'ثمينة'],
    'ج': ['جمال', 'جمانة', 'جواد', 'جليلة', 'جابر', 'جميلة', 'جهاد'],
    'ح': ['حسن', 'حنان', 'حسين', 'حورية', 'حامد', 'حليمة', 'حذيفة'],
    'خ': ['خالد', 'خديجة', 'خليل', 'خولة', 'خيري', 'خزيمة', 'خلف'],
    'د': ['داوود', 'دينا', 'درويش', 'دنيا', 'دهام', 'ديمة', 'دريد'],
    'ذ': ['ذو الفقار', 'ذكريات', 'ذيب', 'ذوقان', 'ذو يزن', 'ذرية', 'ذهبية'],
    'ر': ['رامي', 'رنا', 'راشد', 'رغدة', 'رياض', 'رتيبة', 'رؤوف'],
    'ز': ['زيد', 'زهرة', 'زياد', 'زينب', 'زكريا', 'زينة', 'زهير'],
    'س': ['سامر', 'سلمى', 'سعيد', 'سعاد', 'سليمان', 'سفيرة', 'سهاد'],
    'ش': ['شادي', 'شيماء', 'شريف', 'شذى', 'شهاب', 'شمس', 'شهيرة'],
    'ص': ['صالح', 'صبا', 'صبري', 'صفية', 'صقر', 'صافية', 'صولة'],
    'ض': ['ضرار', 'ضحى', 'ضياء', 'ضيف', 'ضوء', 'ضمرة', 'ضباب'],
    'ط': ['طارق', 'طاهرة', 'طريف', 'طليعة', 'طه', 'طيبة', 'طلال'],
    'ظ': ['ظافر', 'ظلال', 'ظبيان', 'ظريف', 'ظبية', 'ظفرة', 'ظهر'],
    'ع': ['عادل', 'عائشة', 'عمر', 'عزة', 'علي', 'عفاف', 'عمران'],
    'غ': ['غسان', 'غالية', 'غازي', 'غادة', 'غريب', 'غزل', 'غدير'],
    'ف': ['فادي', 'فاطمة', 'فريد', 'فوزية', 'فاروق', 'فريدة', 'فضل'],
    'ق': ['قاسم', 'قمر', 'قدري', 'قيس', 'قبيلة', 'قطب', 'قنطار'],
    'ك': ['كريم', 'كاملة', 'كمال', 'كوكب', 'كاظم', 'كفاح', 'كرم'],
    'ل': ['لؤي', 'لينا', 'لطفي', 'لمياء', 'لبيب', 'لجين', 'لطيفة'],
    'م': ['محمود', 'مريم', 'محمد', 'منال', 'مصطفى', 'منيرة', 'معتز'],
    'ن': ['نادر', 'نادية', 'ناصر', 'نور', 'نبيل', 'نضال', 'ناهد'],
    'ه': ['هشام', 'هبة', 'هاني', 'هدى', 'هيثم', 'هالة', 'هويدة'],
    'و': ['وائل', 'وفاء', 'وسام', 'وداد', 'وليد', 'وصال', 'وحيد'],
    'ي': ['ياسر', 'يسرى', 'يوسف', 'يمنى', 'يعقوب', 'يسار', 'يمامة'],
  },
  plants_ar: {
    'ا': ['أرز', 'أقحوان', 'أثل', 'أراك', 'أستر', 'أرطى', 'أزدرخت'],
    'ب': ['بقدونس', 'بابونج', 'بامية', 'بازلاء', 'باذنجان', 'بطيخ', 'برسيم'],
    'ت': ['تفاح', 'تمر', 'توت', 'ترمس', 'تنوب', 'توليب', 'تین'],
    'ث': ['ثوم', 'ثعلب', 'ثمد', 'ثرمد', 'ثناء', 'ثغام', 'ثرثار'],
    'ج': ['جزور', 'جزر', 'جوز', 'جلنار', 'جريد', 'جلابية', 'جميز'],
    'ح': ['حنظل', 'حبق', 'حلبة', 'حلفا', 'حمص', 'حندقوق', 'حور'],
    'خ': ['خس', 'خيار', 'خبيز', 'خلة', 'خوخ', 'خروع', 'خزامى'],
    'د': ['دوم', 'دلب', 'دبق', 'دراق', 'درة', 'دوما', 'دوارة'],
    'ذ': ['ذريرة', 'ذنب الخيل', 'ذعرة', 'ذعار', 'ذفراء', 'ذليل', 'ذماري'],
    'ر': ['رمان', 'ريحان', 'رجلة', 'رند', 'رعن', 'رغل', 'رقط'],
    'ز': ['زيتون', 'زعتر', 'زنجبيل', 'زهرة', 'زينة', 'زعرور', 'زنبقة'],
    'س': ['سمسم', 'سفرجل', 'سوسن', 'سدر', 'سلق', 'سرمق', 'سلم'],
    'ش': ['شعير', 'شيح', 'شوكة', 'شليك', 'شمر', 'شلجم', 'شجيرة'],
    'ص': ['صبار', 'صعتر', 'صليخ', 'صمو', 'صنوبر', 'صندان', 'صبر'],
    'ض': ['ضرم', 'ضرو', 'ضب', 'ضريسة', 'ضعث', 'ضفرة', 'ضهياء'],
    'ط': ['طماطم', 'طحلب', 'طيون', 'طرفاء', 'طرفة', 'طلح', 'طباق'],
    'ظ': ['ظراب', 'ظيان', 'ظل', 'ظرب', 'ظفر', 'ظهر', 'ظليم'],
    'ع': ['عنب', 'عباد الشمس', 'عرعر', 'عنبر', 'عبق', 'عرفج', 'علندى'],
    'غ': ['غار', 'غاف', 'غبيراء', 'غرقد', 'غضا', 'غرب', 'غصين'],
    'ف': ['فجل', 'فول', 'فستق', 'فينة', 'فل', 'فرفار', 'فيح'],
    'ق': ['قصب', 'قراص', 'قثاء', 'قرة', 'قافقا', 'قمرية', 'قزدير'],
    'ك': ['كمون', 'كركم', 'كزبرة', 'كرفس', 'كاكا', 'كرم', 'كدس'],
    'ل': ['لوز', 'لوبياء', 'لقاح', 'ليمون', 'لبلاب', 'لانتانا', 'لحلاح'],
    'م': ['موز', 'مشمش', 'مريمية', 'مليسا', 'مكسر', 'منثور', 'ملوخية'],
    'ن': ['نعناع', 'نرجس', 'نخيل', 'نفل', 'نماص', 'نيس', 'نخاس'],
    'ه': ['هندباء', 'هليلج', 'هليون', 'هشيم', 'هناء', 'هيض', 'هيما'],
    'و': ['ورد', 'وزال', 'ودنة', 'وريقة', 'وصمة', 'وكال', 'وسمي'],
    'ي': ['ياسمين', 'يقطين', 'يسر', 'يبروح', 'يلم', 'يمام', 'يليل'],
  },
  animals_ar: {
    'ا': ['أسد', 'أرنب', 'أفعى', 'إبل', 'أخطبوط', 'أطوم', 'أبوق'],
    'ب': ['بقر', 'بطة', 'باز', 'بوم', 'بجع', 'ببر', 'بجعة'],
    'ت': ['تمساح', 'تيس', 'تدرج', 'تم', 'تربس', 'تقوق', 'تلال'],
    'ث': ['ثعلب', 'ثعبان', 'ثور', 'ثدل', 'ثعل', 'ثلم', 'ثمر'],
    'ج': ['جمل', 'جندب', 'جراد', 'جرس', 'جيج', 'جلد', 'جربوع'],
    'ح': ['حصان', 'حمار', 'حوت', 'حبار', 'حلم', 'حجل', 'حمامة'],
    'خ': ['خنزير', 'خروف', 'خفاش', 'خادج', 'خنفس', 'خيل', 'خطاف'],
    'د': ['دب', 'دجاج', 'دلفين', 'دور', 'ديك', 'دراج', 'دلق'],
    'ذ': ['ذئب', 'ذرة', 'ذيب', 'ذعرة', 'ذفر', 'ذليل', 'ذمار'],
    'ر': ['رنة', 'رعد', 'رخم', 'رازق', 'رعاة', 'رباح', 'ربد'],
    'ز': ['زرافة', 'زنبور', 'زرد', 'زريق', 'زحل', 'زغدة', 'زقاق'],
    'س': ['سمكة', 'سلحفاة', 'سنجاب', 'سردين', 'سحلية', 'سرطان', 'سعلة'],
    'ش': ['شاة', 'شيهم', 'شبن', 'شبرق', 'شلم', 'شنار', 'شحي'],
    'ص': ['صقر', 'صرد', 'صخر', 'صبي', 'صدف', 'صعوة', 'صيد'],
    'ض': ['ضبع', 'ضب', 'ضفدع', 'ضرس', 'ضاحك', 'ضبار', 'ضني'],
    'ط': ['طاووس', 'طائر', 'طير', 'طلحة', 'طرم', 'طفل', 'طرطان'],
    'ظ': ['ظبي', 'ظليم', 'ظربان', 'ظراب', 'ظفر', 'ظهور', 'ظليل'],
    'ع': ['عقاب', 'عصفور', 'عنكبوت', 'عقرب', 'عجل', 'عوسق', 'عباب'],
    'غ': ['غزال', 'غراب', 'غوريلا', 'غشيم', 'غرم', 'غريق', 'غلاج'],
    'ف': ['فيل', 'فهد', 'فرس', 'فأر', 'فاختة', 'فنك', 'فيس'],
    'ق': ['قرش', 'قط', 'قنفذ', 'قرد', 'قندس', 'قوق', 'قبرة'],
    'ك': ['كلب', 'كنغر', 'كسلان', 'كوبرا', 'كركي', 'كوجا', 'كاب'],
    'ل': ['لبؤة', 'لقلق', 'لنغر', 'لوري', 'لوس', 'لبد', 'لعاب'],
    'م': ['ماعز', 'مهر', 'موسى', 'مصاص', 'مطوق', 'ملوكي', 'مرد'],
    'ن': ['نمر', 'نحلة', 'نعامة', 'نمل', 'نسر', 'نورس', 'نهد'],
    'ه': ['هدهد', 'هامور', 'هجين', 'هير', 'هيدرا', 'هلال', 'همام'],
    'و': ['وزغ', 'وبر', 'ورل', 'وزة', 'وعل', 'وشق', 'ولق'],
    'ي': ['يعسوب', 'يمن', 'يسوع', 'يأجوج', 'يسار', 'يغم', 'يلد'],
  },
  objects_ar: {
    'ا': ['إبرة', 'أريكة', 'إناء', 'ألة', 'أبريق', 'أرجوحة', 'أسورة'],
    'ب': ['باب', 'بساط', 'بركة', 'بوصلة', 'بطارية', 'براد', 'باخرة'],
    'ت': ['تلفاز', 'ترس', 'تخت', 'تاج', 'تبر', 'توم', 'تيسة'],
    'ث': ['ثوب', 'ثرمو', 'ثريا', 'ثلاجة', 'ثابت', 'ثعلب', 'ثمود'],
    'ج': ['جدار', 'جرس', 'جسر', 'جوال', 'جفنة', 'جلجام', 'جذع'],
    'ح': ['حبل', 'حصير', 'حذاء', 'حقيبة', 'حوض', 'حجر', 'حافظة'],
    'خ': ['خاتم', 'خبز', 'خيمة', 'خزانة', 'خنجر', 'خوذة', 'خروف'],
    'د': ['دلو', 'دفتر', 'درج', 'دبوس', 'دوار', 'دردور', 'درع'],
    'ذ': ['ذخيرة', 'ذراع', 'ذيل', 'ذرة', 'ذلاقة', 'ذفرة', 'ذمارة'],
    'ر': ['راديو', 'رمح', 'رسالة', 'راية', 'رغيف', 'رف', 'رزم'],
    'ز': ['زجاج', 'زرد', 'زورق', 'زينة', 'زبد', 'زعر', 'زلز'],
    'س': ['سيف', 'سرير', 'ساعة', 'سكين', 'سلة', 'سجادة', 'سقف'],
    'ش': ['شاشة', 'شوكة', 'شباك', 'شراع', 'شاحنة', 'شرفة', 'شطرنج'],
    'ص': ['صندوق', 'صورة', 'صحن', 'صابر', 'صومعة', 'صوان', 'صباح'],
    'ض': ['ضرس', 'ضاد', 'ضفة', 'ضحية', 'ضغطة', 'ضباب', 'ضريح'],
    'ط': ('طاولة', 'طائرة', 'طبل', 'طنبور', 'طارة', 'طربوش', 'طاعون'),
    'ظ': ['ظل', 'ظرف', 'ظبية', 'ظهور', 'ظفيرة', 'ظلال', 'ظهيرة'],
    'ع': ['علم', 'عربة', 'عرش', 'عصا', 'عود', 'عطر', 'عنان'],
    'غ': ['غلاف', 'غذاء', 'غطاء', 'غرفة', 'غابة', 'غبار', 'غرابيل'],
    'ف': ['فأس', 'فانوس', 'فردة', 'فرشاة', 'فستان', 'فكرة', 'فنجان'],
    'ق': ['قلم', 'قلب', 'قبعة', 'قارب', 'قرص', 'قفل', 'قيثارة'],
    'ك': ['كتاب', 'كرة', 'كوب', 'كرسي', 'كمان', 'كأس', 'كنز'],
    'ل': ['لوحة', 'لغز', 'لافتة', 'لحاف', 'لجام', 'لؤلؤة', 'لسان'],
    'م': ['مفتاح', 'مصباح', 'مرآة', 'مروحة', 'مزن', 'مقص', 'منزل'],
    'ن': ['نجمة', 'نافذة', 'نخلة', 'نقود', 'نرد', 'نعل', 'نول'],
    'ه': ['هاتف', 'هلال', 'هيكل', 'هريسة', 'هواء', 'هنجر', 'هدهد'],
    'و': ['ورق', 'وسادة', 'واحة', 'وترة', 'وعاء', 'وردة', 'وزن'],
    'ي': ['يد', 'ياقوت', 'يمين', 'يافة', 'يوليو', 'يخت', 'ياسمينة'],
  },
  cities_ar: {
    'ا': ['الرياض', 'القاهرة', 'إسطنبول', 'أبوظبي', 'الدوحة', 'عمان', 'بغداد'],
    'ب': ['بيروت', 'بغداد', 'باكو', 'برلين', 'بروكسل', 'برشلونة', 'بومباي'],
    'ت': ['تونس', 'تارودانت', 'تلمسان', 'تبريز', 'تيرانا', 'تولوز', 'تيارت'],
    'ث': ['ثلاثاء', 'ثرب', 'ثغر', 'ثمود', 'ثنية', 'ثويرة', 'ثعالب'],
    'ج': ['جدة', 'جاكارتا', 'جوهانسبرغ', 'جيبوتي', 'جنين', 'جبل', 'جرش'],
    'ح': ['حلب', 'حمص', 'حماة', 'حضرموت', 'حلوان', 'حائل', 'حفر الباطن'],
    'خ': ['خاركيف', 'خمس', 'خان يونس', 'خرم أباد', 'خريبكة', 'خلود', 'خيبر'],
    'د': ['دمشق', 'دبي', 'دكار', 'دلهي', 'دير الزور', 'درعا', 'دنقلة'],
    'ذ': ['ذمار', 'ذيبان', 'ذات الحاج', 'ذراع', 'ذكريات', 'ذوق', 'ذي قار'],
    'ر': ['رباط', 'روما', 'ريو', 'رام الله', 'رأس', 'رفح', 'راشيا'],
    'ز': ['زغرب', 'زنجبار', 'زحلة', 'زفتى', 'زرقاء', 'زويل', 'زهراء'],
    'س': ['سوريا', 'سفاكس', 'سوسة', 'سيدني', 'سنغافورة', 'سلطنة', 'سوهاج'],
    'ش': ['شقا', 'شيراز', 'شبرا', 'شرم', 'شمال', 'شبهة', 'شطورة'],
    'ص': ['صعدة', 'صنعاء', 'صبراتة', 'صلالة', 'صيدا', 'صور', 'صرواح'],
    'ض': ['ضباء', 'ضمد', 'ضفير', 'ضهر', 'ضباب', 'ضواحي', 'ضبعة'],
    'ط': ['طوكيو', 'طربلس', 'طنجة', 'طرابزون', 'طبرق', 'طبرية', 'طريف'],
    'ظ': ['ظفار', 'ظاهرة', 'ظبي', 'ظليل', 'ظاهر', 'ظليمة', 'ظهران'],
    'ع': ['عمان', 'عجمان', 'عسير', 'عفيف', 'علب', 'عجلون', 'عريش'],
    'غ': ['غزة', 'غدامس', 'غرداية', 'غابورون', 'غينيا', 'غرناطة', 'غيلان'],
    'ف': ['فاس', 'فلسطين', 'فارنا', 'فادوتس', 'فلورنسا', 'فكتوري', 'فينكس'],
    'ق': ['قرطبة', 'قسنطينة', 'قندهار', 'قيروان', 'قابس', 'قفصة', 'قدس'],
    'ك': ['كابل', 'كراتشي', 'كندا', 'كوبنهاغن', 'كولونيا', 'كربلاء', 'كركوك'],
    'ل': ['لندن', 'لاباز', 'لشبونة', 'لبنان', 'لوس أنجلوس', 'لارنكا', 'لاذقية'],
    'م': ['مكة', 'مدينة', 'ميونخ', 'مانيلا', 'مصر', 'مراكش', 'مالقة'],
    'ن': ['نيويورك', 'نابلس', 'نابولي', 'نواكشوط', 'نيس', 'نظر', 'نهر'],
    'ه': ['هران', 'هلسنكي', 'هامبورغ', 'هونغ كونغ', 'هيوستن', 'هدار', 'هافانا'],
    'و': ['واشنطن', 'وهران', 'وادي', 'ورزازات', 'ووبر', 'وكرة', 'وسيم'],
    'ي': ['ينبع', 'يريفان', 'يافا', 'يابان', 'ياغودينا', 'يالي', 'يورك'],
  },
};

// ----------------------------------------------------------------------
//  Runtime dataset (can be replaced from DB later)
// ----------------------------------------------------------------------
let runtimeDataset = { ...staticDataset };
// Build Arabic category keys (names_ar → names, etc.)
const arabicCategories = {
  names_ar: 'names',
  plants_ar: 'plants',
  animals_ar: 'animals',
  objects_ar: 'objects',
  cities_ar: 'cities',
};
for (const [arabicKey, englishKey] of Object.entries(arabicCategories)) {
  if (staticDataset[arabicKey]) {
    runtimeDataset[englishKey] = runtimeDataset[englishKey] || {};
    Object.assign(runtimeDataset[englishKey], staticDataset[arabicKey]);
  }
}

const normalizeLetter = (letter, alphabet = 'en') => {
  const value = String(letter || '').trim();
  if (!value) return '';
  if (alphabet === 'ar') return value; // keep Arabic character as is
  return /^[a-z]$/i.test(value) ? value.toUpperCase() : value;
};

// Singular to plural category mapping (frontend API uses singular)
const categoryPluralMap = {
  'name': 'names',
  'plant': 'plants',
  'animal': 'animals',
  'object': 'objects',
  'cities': 'cities',
};

const getDatasetCategory = (singularCategory) => {
  return categoryPluralMap[singularCategory] || singularCategory;
};

const getArabicFallbackCategory = (datasetCategory) => {
  return `${datasetCategory}_ar`;
};

const getWordsForCategory = (dataset, datasetCategory, normalizedLetter, alphabet) => {
  if (!dataset || !datasetCategory || !normalizedLetter) return [];

  const directWords = dataset[datasetCategory]?.[normalizedLetter] || [];
  if (directWords.length) return directWords;

  if (alphabet === 'ar') {
    const arabicWords = dataset[getArabicFallbackCategory(datasetCategory)]?.[normalizedLetter] || [];
    if (arabicWords.length) return arabicWords;
  }

  return [];
};

const pickWordFromPool = (words, difficulty, usedWords = []) => {
  let pool;
  if (difficulty === 'easy') pool = words.slice(0, 3);
  else if (difficulty === 'medium') pool = words.slice(3, 6);
  else pool = words.slice(6);
  if (!pool.length) pool = words;

  const available = pool.filter((word) => !usedWords.includes(String(word).toLowerCase()));
  if (!available.length) {
    return { word: '', poolSize: pool.length, availableSize: 0 };
  }

  const selected = available[Math.floor(Math.random() * available.length)];
  return { word: selected, poolSize: pool.length, availableSize: available.length };
};

/**
 * Get a word for a bot (supports both English and Arabic via the `alphabet` flag)
 * @param {string} category - 'names'|'plants'|'animals'|'objects'|'cities'
 * @param {string} letter - starting letter (e.g., 'A' or 'ا')
 * @param {string} difficulty - 'easy'|'medium'|'hard'
 * @param {string[]} usedWords - words already used in this round
 * @param {string} alphabet - 'en' or 'ar'
 */
const getBotWord = (category, letter, difficulty, usedWords = [], alphabet = 'en') => {
  const datasetCategory = getDatasetCategory(category); // Convert singular to plural
  const normalizedLetter = normalizeLetter(letter, alphabet);
  const runtimeWords = getWordsForCategory(runtimeDataset, datasetCategory, normalizedLetter, alphabet);
  const runtimePick = pickWordFromPool(runtimeWords, difficulty, usedWords);

  console.log(`[getBotWord] Runtime | Category: "${category}" → "${datasetCategory}" | Letter: "${letter}" (normalized: "${normalizedLetter}") | Alphabet: ${alphabet} | Candidates: ${runtimeWords.length} | Pool: ${runtimePick.poolSize} | Available: ${runtimePick.availableSize}`);

  if (runtimePick.word) {
    console.log(`[getBotWord] ✓ Selected from runtime dataset: "${runtimePick.word}"`);
    return runtimePick.word;
  }

  const fallbackDataset = alphabet === 'ar' ? staticDataset : staticDataset;
  const fallbackWords = getWordsForCategory(fallbackDataset, datasetCategory, normalizedLetter, alphabet);
  const fallbackPick = pickWordFromPool(fallbackWords, difficulty, usedWords);

  console.log(`[getBotWord] Fallback | Category: "${category}" → "${datasetCategory}" | Letter: "${letter}" (normalized: "${normalizedLetter}") | Alphabet: ${alphabet} | Candidates: ${fallbackWords.length} | Pool: ${fallbackPick.poolSize} | Available: ${fallbackPick.availableSize}`);

  if (fallbackPick.word) {
    console.log(`[getBotWord] ✓ Selected from fallback dataset: "${fallbackPick.word}"`);
    return fallbackPick.word;
  }

  console.log(`[getBotWord] ❌ No words available in runtime or fallback datasets | Category: "${category}" | Letter: "${letter}"`);
  return '';
};

/**
 * Convenience wrapper for Arabic
 */
const getBotArabicWord = (category, letter, difficulty, usedWords) =>
  getBotWord(category, letter, difficulty, usedWords, 'ar');

const getAllLetters = (alphabet = 'en') => {
  if (alphabet === 'ar') {
    // Return all Arabic letters we have in the dataset (keys of any category)
    const sampleCategory = runtimeDataset.names;
    if (sampleCategory) return Object.keys(sampleCategory).sort();
  }
  return Object.keys(runtimeDataset.names || {}).sort();
};

const setRuntimeDataset = (nextDataset) => {
  if (!nextDataset || typeof nextDataset !== 'object') {
    runtimeDataset = { ...staticDataset };
    return;
  }
  runtimeDataset = nextDataset;
};

const getDataset = () => runtimeDataset;

module.exports = {
  staticDataset,
  getDataset,
  setRuntimeDataset,
  getBotWord,
  getBotArabicWord,
  getAllLetters,
  getDatasetCategory,
};
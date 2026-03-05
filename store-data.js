// ===== НАЗВАНИЯ ЗОН =====
const ZONE_NAMES = {
    produce:    'Овощи и фрукты',
    dairy:      'Молоко и сыры',
    bakery:     'Хлеб и выпечка',
    meat:       'Мясо и колбасы',
    frozen:     'Заморозка',
    drinks:     'Напитки',
    snacks:     'Снеки и сладкое',
    alcohol:    'Алкоголь',
    household:  'Бытовая химия',
    checkout:   'Касса',
};

// ===== АКЦИОННЫЕ ТОВАРЫ ПО ЗОНАМ =====
const PROMO_ITEMS = {
    produce: [
        { name: 'Авокадо Перу',         oldPrice: 120, newPrice: 79,  discount: 34, x: 33, y: 22, zone: 'produce',   icon: 'fa-seedling'       },
        { name: 'Виноград Кишмиш',      oldPrice: 180, newPrice: 119, discount: 34, x: 34, y: 22, zone: 'produce',   icon: 'fa-seedling'       },
    ],
    dairy: [
        { name: 'Творог Простоквашино', oldPrice: 110, newPrice: 75,  discount: 32, x: 10, y: 2,  zone: 'dairy',     icon: 'fa-droplet'        },
        { name: 'Йогурт Danone',        oldPrice: 89,  newPrice: 59,  discount: 34, x: 14, y: 2,  zone: 'dairy',     icon: 'fa-droplet'        },
    ],
    bakery: [
        { name: 'Круассан с маслом',    oldPrice: 75,  newPrice: 49,  discount: 35, x: 20, y: 8,  zone: 'bakery',    icon: 'fa-bread-slice'    },
        { name: 'Багет французский',    oldPrice: 89,  newPrice: 59,  discount: 34, x: 21, y: 8,  zone: 'bakery',    icon: 'fa-bread-slice'    },
    ],
    meat: [
        { name: 'Куриное филе охл.',    oldPrice: 320, newPrice: 219, discount: 32, x: 37, y: 10, zone: 'meat',      icon: 'fa-drumstick-bite' },
        { name: 'Фарш говяжий',         oldPrice: 380, newPrice: 259, discount: 32, x: 37, y: 14, zone: 'meat',      icon: 'fa-drumstick-bite' },
    ],
    frozen: [
        { name: 'Пельмени Цезарь',      oldPrice: 280, newPrice: 189, discount: 33, x: 14, y: 14, zone: 'frozen',    icon: 'fa-snowflake'      },
        { name: 'Мороженое Пломбир',    oldPrice: 120, newPrice: 79,  discount: 34, x: 20, y: 14, zone: 'frozen',    icon: 'fa-snowflake'      },
    ],
    drinks: [
        { name: 'Сок Rich Апельсин',    oldPrice: 149, newPrice: 99,  discount: 34, x: 22, y: 10, zone: 'drinks',    icon: 'fa-wine-bottle'    },
        { name: 'Вода Evian 1.5л',      oldPrice: 110, newPrice: 69,  discount: 37, x: 22, y: 12, zone: 'drinks',    icon: 'fa-wine-bottle'    },
    ],
    snacks: [
        { name: 'Шоколад Milka 100г',   oldPrice: 130, newPrice: 85,  discount: 35, x: 26, y: 10, zone: 'snacks',    icon: 'fa-cookie'         },
        { name: 'Чипсы Lay\'s',         oldPrice: 110, newPrice: 72,  discount: 35, x: 26, y: 12, zone: 'snacks',    icon: 'fa-cookie'         },
    ],
    alcohol: [
        { name: 'Вино Каберне',         oldPrice: 650, newPrice: 449, discount: 31, x: 3,  y: 10, zone: 'alcohol',   icon: 'fa-wine-glass'     },
        { name: 'Пиво Heineken',        oldPrice: 120, newPrice: 79,  discount: 34, x: 3,  y: 12, zone: 'alcohol',   icon: 'fa-beer-mug-empty' },
    ],
    household: [
        { name: 'Fairy Platinum 500мл', oldPrice: 250, newPrice: 169, discount: 32, x: 30, y: 10, zone: 'household', icon: 'fa-soap'           },
        { name: 'Ariel Pods 12шт',      oldPrice: 420, newPrice: 289, discount: 31, x: 30, y: 12, zone: 'household', icon: 'fa-soap'           },
    ],
};

// ===== МАГАЗИН =====
const STORE = {
    gridCols: 42,
    gridRows: 30,
    cellSize: 20,

    // Вход снизу по центру
    startPoint: { x: 20, y: 28 },

    // ===== СТЕНЫ =====
    walls: [
        // Внешние стены
        { x: 0,  y: 0,  w: 42, h: 1  },  // верх
        { x: 0,  y: 29, w: 42, h: 1  },  // низ
        { x: 0,  y: 0,  w: 1,  h: 30 },  // лево
        { x: 41, y: 0,  w: 1,  h: 30 },  // право

        // Стеллаж ряд 1 (сверху, длинный)
        { x: 8,  y: 7,  w: 1,  h: 6  },
        { x: 9,  y: 7,  w: 6,  h: 1  },
        { x: 9,  y: 12, w: 6,  h: 1  },

        // Стеллаж ряд 2
        { x: 16, y: 7,  w: 1,  h: 6  },
        { x: 17, y: 7,  w: 6,  h: 1  },
        { x: 17, y: 12, w: 6,  h: 1  },

        // Стеллаж ряд 3
        { x: 24, y: 7,  w: 1,  h: 6  },
        { x: 25, y: 7,  w: 6,  h: 1  },
        { x: 25, y: 12, w: 6,  h: 1  },

        // Стеллаж ряд 4
        { x: 32, y: 7,  w: 1,  h: 6  },
        { x: 33, y: 7,  w: 4,  h: 1  },
        { x: 33, y: 12, w: 4,  h: 1  },

        // Морозильные лари (центр)
        { x: 10, y: 15, w: 5,  h: 3  },
        { x: 16, y: 15, w: 5,  h: 3  },
        { x: 22, y: 15, w: 5,  h: 3  },
        { x: 28, y: 15, w: 4,  h: 3  },

        // Касса
        { x: 3,  y: 24, w: 5,  h: 2  },
    ],

    // ===== ЗОНЫ =====
    zones: [
        // Холодильники верхней стены
        { id: 'dairy',     x: 1,  y: 1,  w: 18, h: 5,  color: '#F0F9FF', labelColor: '#0369A1', label: 'Молоко и сыры'     },
        { id: 'frozen',    x: 19, y: 1,  w: 14, h: 5,  color: '#EEF2FF', labelColor: '#3730A3', label: 'Заморозка'         },
        { id: 'meat',      x: 33, y: 1,  w: 8,  h: 5,  color: '#FFF1F2', labelColor: '#BE123C', label: 'Мясо и колбасы'   },

        // Холодильники правой стены
        { id: 'meat',      x: 37, y: 6,  w: 4,  h: 16, color: '#FFF1F2', labelColor: '#BE123C', label: 'Мясо и колбасы'   },

        // Алкоголь — левая стена
        { id: 'alcohol',   x: 1,  y: 6,  w: 6,  h: 16, color: '#FDF4FF', labelColor: '#7E22CE', label: 'Алкоголь'         },

        // Стеллажи центр — ряд 1
        { id: 'drinks',    x: 8,  y: 6,  w: 8,  h: 8,  color: '#ECFDF5', labelColor: '#047857', label: 'Напитки'          },
        { id: 'snacks',    x: 16, y: 6,  w: 8,  h: 8,  color: '#FFFBEB', labelColor: '#B45309', label: 'Снеки и сладкое'  },
        { id: 'household', x: 24, y: 6,  w: 8,  h: 8,  color: '#EFF6FF', labelColor: '#1D4ED8', label: 'Бытовая химия'   },

        // Морозильные лари
        { id: 'frozen',    x: 8,  y: 14, w: 26, h: 6,  color: '#EEF2FF', labelColor: '#3730A3', label: 'Заморозка'        },

        // Хлеб
        { id: 'bakery',    x: 8,  y: 20, w: 12, h: 6,  color: '#FFF7ED', labelColor: '#C2410C', label: 'Хлеб и выпечка'  },

        // Овощи и фрукты — правый нижний угол
        { id: 'produce',   x: 28, y: 20, w: 9,  h: 6,  color: '#F0FDF4', labelColor: '#15803D', label: 'Овощи и фрукты'  },

        // Касса
        { id: 'checkout',  x: 1,  y: 23, w: 8,  h: 5,  color: '#F8FAFC', labelColor: '#475569', label: 'Касса'           },
    ],

    // ===== ТОВАРЫ =====
    products: [
        // --- МОЛОКО И СЫРЫ (верх, холодильники) ---
        { id: 1,  name: 'Молоко 3.2% 1л',      zone: 'dairy',     x: 3,  y: 3,  icon: 'fa-droplet'        },
        { id: 2,  name: 'Кефир Простоквашино',  zone: 'dairy',     x: 5,  y: 3,  icon: 'fa-droplet'        },
        { id: 3,  name: 'Сметана 20%',          zone: 'dairy',     x: 7,  y: 3,  icon: 'fa-droplet'        },
        { id: 4,  name: 'Масло сливочное 82%',  zone: 'dairy',     x: 9,  y: 3,  icon: 'fa-droplet'        },
        { id: 5,  name: 'Сыр Российский',       zone: 'dairy',     x: 11, y: 3,  icon: 'fa-cheese'         },
        { id: 6,  name: 'Яйца С1 10шт',         zone: 'dairy',     x: 13, y: 3,  icon: 'fa-egg'            },
        { id: 7,  name: 'Ряженка 4%',           zone: 'dairy',     x: 15, y: 3,  icon: 'fa-droplet'        },
        { id: 8,  name: 'Творог 9%',            zone: 'dairy',     x: 17, y: 3,  icon: 'fa-droplet'        },

        // --- ЗАМОРОЗКА (верх, холодильники) ---
        { id: 9,  name: 'Пицца Margherita',     zone: 'frozen',    x: 20, y: 3,  icon: 'fa-snowflake'      },
        { id: 10, name: 'Вареники с картошкой', zone: 'frozen',    x: 22, y: 3,  icon: 'fa-snowflake'      },
        { id: 11, name: 'Рыбные палочки',       zone: 'frozen',    x: 24, y: 3,  icon: 'fa-snowflake'      },
        { id: 12, name: 'Мороженое Пломбир',    zone: 'frozen',    x: 26, y: 3,  icon: 'fa-snowflake'      },
        { id: 13, name: 'Блинчики с мясом',     zone: 'frozen',    x: 28, y: 3,  icon: 'fa-snowflake'      },
        { id: 14, name: 'Замороженные овощи',   zone: 'frozen',    x: 30, y: 3,  icon: 'fa-snowflake'      },

        // --- МЯСО (верх + правая стена) ---
        { id: 15, name: 'Грудка куриная',       zone: 'meat',      x: 34, y: 3,  icon: 'fa-drumstick-bite' },
        { id: 16, name: 'Свинина шея',          zone: 'meat',      x: 36, y: 3,  icon: 'fa-drumstick-bite' },
        { id: 17, name: 'Фарш смешанный',       zone: 'meat',      x: 38, y: 8,  icon: 'fa-drumstick-bite' },
        { id: 18, name: 'Сёмга стейк',          zone: 'meat',      x: 38, y: 10, icon: 'fa-fish'           },
        { id: 19, name: 'Колбаса Докторская',   zone: 'meat',      x: 38, y: 12, icon: 'fa-drumstick-bite' },
        { id: 20, name: 'Сосиски Молочные',     zone: 'meat',      x: 38, y: 14, icon: 'fa-drumstick-bite' },

        // --- АЛКОГОЛЬ (левая стена) ---
        { id: 21, name: 'Вино Каберне Совиньон',zone: 'alcohol',   x: 3,  y: 8,  icon: 'fa-wine-glass'     },
        { id: 22, name: 'Шампанское Абрау',     zone: 'alcohol',   x: 3,  y: 10, icon: 'fa-wine-glass'     },
        { id: 23, name: 'Пиво Heineken 0.5л',   zone: 'alcohol',   x: 3,  y: 12, icon: 'fa-beer-mug-empty' },
        { id: 24, name: 'Пиво Балтика 7',       zone: 'alcohol',   x: 3,  y: 14, icon: 'fa-beer-mug-empty' },
        { id: 25, name: 'Виски Jack Daniel\'s', zone: 'alcohol',   x: 3,  y: 16, icon: 'fa-wine-bottle'    },
        { id: 26, name: 'Водка Белуга',         zone: 'alcohol',   x: 3,  y: 18, icon: 'fa-wine-bottle'    },

        // --- НАПИТКИ (стеллаж 1) ---
        { id: 27, name: 'Coca-Cola 1.5л',       zone: 'drinks',    x: 10, y: 8,  icon: 'fa-wine-bottle'    },
        { id: 28, name: 'Pepsi 1.5л',           zone: 'drinks',    x: 10, y: 10, icon: 'fa-wine-bottle'    },
        { id: 29, name: 'Вода Святой Источник', zone: 'drinks',    x: 12, y: 8,  icon: 'fa-wine-bottle'    },
        { id: 30, name: 'Сок Добрый Яблоко',    zone: 'drinks',    x: 12, y: 10, icon: 'fa-wine-bottle'    },
        { id: 31, name: 'Чай Lipton 100пак',    zone: 'drinks',    x: 14, y: 8,  icon: 'fa-mug-hot'        },
        { id: 32, name: 'Кофе Nescafe',         zone: 'drinks',    x: 14, y: 10, icon: 'fa-mug-hot'        },

        // --- СНЕКИ (стеллаж 2) ---
        { id: 33, name: 'Шоколад Alpen Gold',   zone: 'snacks',    x: 18, y: 8,  icon: 'fa-cookie'         },
        { id: 34, name: 'Печенье Юбилейное',    zone: 'snacks',    x: 18, y: 10, icon: 'fa-cookie'         },
        { id: 35, name: 'Орехи кешью 150г',     zone: 'snacks',    x: 20, y: 8,  icon: 'fa-cookie'         },
        { id: 36, name: 'Чипсы Pringles',       zone: 'snacks',    x: 20, y: 10, icon: 'fa-cookie'         },
        { id: 37, name: 'Мармелад Haribo',      zone: 'snacks',    x: 22, y: 8,  icon: 'fa-cookie'         },
        { id: 38, name: 'Халва подсолнечная',   zone: 'snacks',    x: 22, y: 10, icon: 'fa-cookie'         },

        // --- БЫТОВАЯ ХИМИЯ (стеллаж 3) ---
        { id: 39, name: 'Шампунь Head&Shoulders',zone: 'household', x: 26, y: 8,  icon: 'fa-soap'          },
        { id: 40, name: 'Зубная паста Colgate', zone: 'household', x: 26, y: 10, icon: 'fa-soap'           },
        { id: 41, name: 'Стиральный порошок',   zone: 'household', x: 28, y: 8,  icon: 'fa-soap'           },
        { id: 42, name: 'Средство для посуды',  zone: 'household', x: 28, y: 10, icon: 'fa-soap'           },
        { id: 43, name: 'Туалетная бумага',     zone: 'household', x: 30, y: 8,  icon: 'fa-soap'           },
        { id: 44, name: 'Влажные салфетки',     zone: 'household', x: 30, y: 10, icon: 'fa-soap'           },

        // --- МОРОЗИЛЬНЫЕ ЛАРИ (центр) ---
        { id: 45, name: 'Пельмени Русские',     zone: 'frozen',    x: 12, y: 16, icon: 'fa-snowflake'      },
        { id: 46, name: 'Котлеты Домашние',     zone: 'frozen',    x: 14, y: 16, icon: 'fa-snowflake'      },
        { id: 47, name: 'Мороженое Магнат',     zone: 'frozen',    x: 18, y: 16, icon: 'fa-snowflake'      },
        { id: 48, name: 'Замороженная пицца',   zone: 'frozen',    x: 20, y: 16, icon: 'fa-snowflake'      },
        { id: 49, name: 'Креветки варёные',     zone: 'frozen',    x: 24, y: 16, icon: 'fa-snowflake'      },
        { id: 50, name: 'Кальмар кольца',       zone: 'frozen',    x: 26, y: 16, icon: 'fa-snowflake'      },

        // --- ХЛЕБ И ВЫПЕЧКА (низ центр) ---
        { id: 51, name: 'Хлеб Бородинский',     zone: 'bakery',    x: 10, y: 22, icon: 'fa-bread-slice'    },
        { id: 52, name: 'Батон нарезной',        zone: 'bakery',    x: 12, y: 22, icon: 'fa-bread-slice'    },
        { id: 53, name: 'Булочки для бургера',   zone: 'bakery',    x: 14, y: 22, icon: 'fa-bread-slice'    },
        { id: 54, name: 'Лаваш тонкий',          zone: 'bakery',    x: 16, y: 22, icon: 'fa-bread-slice'    },
        { id: 55, name: 'Круассан масляный',     zone: 'bakery',    x: 10, y: 24, icon: 'fa-bread-slice'    },
        { id: 56, name: 'Пита хлеб',             zone: 'bakery',    x: 12, y: 24, icon: 'fa-bread-slice'    },

        // --- ОВОЩИ И ФРУКТЫ (правый нижний угол) ---
        { id: 57, name: 'Яблоки Гала',           zone: 'produce',   x: 30, y: 22, icon: 'fa-apple-whole'    },
        { id: 58, name: 'Бананы',                zone: 'produce',   x: 32, y: 22, icon: 'fa-seedling'       },
        { id: 59, name: 'Помидоры черри',         zone: 'produce',   x: 30, y: 24, icon: 'fa-seedling'       },
        { id: 60, name: 'Огурцы',                zone: 'produce',   x: 32, y: 24, icon: 'fa-seedling'       },
        { id: 61, name: 'Морковь',               zone: 'produce',   x: 34, y: 22, icon: 'fa-seedling'       },
        { id: 62, name: 'Картофель 1кг',         zone: 'produce',   x: 34, y: 24, icon: 'fa-seedling'       },
    ],
};
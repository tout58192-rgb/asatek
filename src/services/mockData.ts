import type {
  Category,
  DashboardCounts,
  HomeBanner,
  InquiryWithItems,
  ProductWithDetails,
  SiteSettingsMap,
} from '../types/db';

const nowIso = new Date().toISOString();
const twoDaysAgoIso = new Date(Date.now() - 2 * 86400 * 1000).toISOString();
const fiveDaysAgoIso = new Date(Date.now() - 5 * 86400 * 1000).toISOString();

// Sample wholesale data for preview mode when Supabase env vars are not configured.
// NOTE: All PKR prices below are sample placeholder rates for preview only.
export const mockCategories: Category[] = [
  {
    id: 'cat-ups',
    slug: 'ups',
    name_en: 'UPS',
    name_ur: 'یو پی ایس',
    icon: 'Zap',
    image_url: null,
    sort_order: 1,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: 'cat-solar',
    slug: 'solar',
    name_en: 'Solar Systems',
    name_ur: 'سولر سسٹمز',
    icon: 'Sun',
    image_url: null,
    sort_order: 2,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: 'cat-inverters',
    slug: 'inverters',
    name_en: 'Inverters',
    name_ur: 'انورٹرز',
    icon: 'PlugZap',
    image_url: null,
    sort_order: 3,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: 'cat-chargers',
    slug: 'battery-chargers',
    name_en: 'Battery Chargers',
    name_ur: 'بیٹری چارجرز',
    icon: 'BatteryCharging',
    image_url: null,
    sort_order: 4,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: 'cat-capacitors',
    slug: 'capacitors',
    name_en: 'Capacitors',
    name_ur: 'کیپیسیٹرز',
    icon: 'Component',
    image_url: null,
    sort_order: 5,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: 'cat-resistors',
    slug: 'resistors',
    name_en: 'Resistors',
    name_ur: 'ریزسٹرز',
    icon: 'Component',
    image_url: null,
    sort_order: 6,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: 'cat-heatsinks',
    slug: 'heat-sinks',
    name_en: 'Heat Sinks',
    name_ur: 'ہیٹ سنکس',
    icon: 'Fan',
    image_url: null,
    sort_order: 7,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: 'cat-igbt',
    slug: 'igbt',
    name_en: 'IGBTs',
    name_ur: 'آئی جی بی ٹی',
    icon: 'Cpu',
    image_url: null,
    sort_order: 8,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: 'cat-pcb',
    slug: 'pcb',
    name_en: 'PCBs',
    name_ur: 'پی سی بی',
    icon: 'CircuitBoard',
    image_url: null,
    sort_order: 9,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
];

export const mockProducts: ProductWithDetails[] = [
  {
    id: 'prod-sc5-va-1260',
    category_id: 'cat-solar',
    slug: 'sc5-va-1260-solar-charge-controller',
    sku: 'SC5 VA-1260',
    name_en: 'ASATEK SC5 VA-1260 PWM Solar Charge Controller (12V 60A)',
    name_ur: 'ایساٹیک SC5 VA-1260 PWM سولر چارج کنٹرولر (12V 60A)',
    short_desc_en:
      'Heavy-duty 12V 60A PWM solar charge controller equipped with digital Voltmeter & Ammeter for real-time solar charging monitoring.',
    short_desc_ur:
      'ڈیجیٹل وولٹ میٹر اور ایمپیئر میٹر کے ساتھ 12V 60A ہیوی ڈیوٹی PWM سولر چارج کنٹرولر۔',
    moq: 5,
    availability: 'in_stock',
    is_active: true,
    is_featured: true,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-101', product_id: 'prod-sc5-va-1260', min_qty: 5, unit_price: 2650 },
      { id: 't-102', product_id: 'prod-sc5-va-1260', min_qty: 20, unit_price: 2450 },
      { id: 't-103', product_id: 'prod-sc5-va-1260', min_qty: 50, unit_price: 2300 },
    ],
    specs: [
      { id: 's-101', product_id: 'prod-sc5-va-1260', label_en: 'System Voltage', label_ur: 'سسٹم وولٹیج', value_en: '12V DC', value_ur: '12V DC', sort_order: 1 },
      { id: 's-102', product_id: 'prod-sc5-va-1260', label_en: 'Rated Current', label_ur: 'ریٹڈ کرنٹ', value_en: '60A PWM', value_ur: '60A PWM', sort_order: 2 },
      { id: 's-103', product_id: 'prod-sc5-va-1260', label_en: 'Max PV Input', label_ur: 'زیادہ سے زیادہ PV ان پٹ', value_en: '30V / 1000W', value_ur: '30V / 1000W', sort_order: 3 },
      { id: 's-104', product_id: 'prod-sc5-va-1260', label_en: 'Display Metering', label_ur: 'ڈسپلے میٹرنگ', value_en: 'Voltmeter + Ammeter', value_ur: 'وولٹ میٹر + ایمپیئر میٹر', sort_order: 4 },
    ],
  },
  {
    id: 'prod-sc5-v-1260',
    category_id: 'cat-solar',
    slug: 'sc5-v-1260-solar-charge-controller',
    sku: 'SC5 V-1260',
    name_en: 'ASATEK SC5 V-1260 PWM Solar Charge Controller (12V 60A)',
    name_ur: 'ایساٹیک SC5 V-1260 PWM سولر چارج کنٹرولر (12V 60A)',
    short_desc_en:
      '12V 60A PWM solar charge controller with built-in digital Voltmeter display, engineered for 12V tubular and lead-acid solar setups.',
    short_desc_ur:
      'ڈیجیٹل وولٹ میٹر کے ساتھ 12V 60A PWM سولر چارج کنٹرولر، 12V بیٹری سسٹم کے لیے موزوں۔',
    moq: 5,
    availability: 'in_stock',
    is_active: true,
    is_featured: false,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-104', product_id: 'prod-sc5-v-1260', min_qty: 5, unit_price: 2400 },
      { id: 't-105', product_id: 'prod-sc5-v-1260', min_qty: 20, unit_price: 2220 },
      { id: 't-106', product_id: 'prod-sc5-v-1260', min_qty: 50, unit_price: 2080 },
    ],
    specs: [
      { id: 's-105', product_id: 'prod-sc5-v-1260', label_en: 'System Voltage', label_ur: 'سسٹم وولٹیج', value_en: '12V DC', value_ur: '12V DC', sort_order: 1 },
      { id: 's-106', product_id: 'prod-sc5-v-1260', label_en: 'Rated Current', label_ur: 'ریٹڈ کرنٹ', value_en: '60A PWM', value_ur: '60A PWM', sort_order: 2 },
      { id: 's-107', product_id: 'prod-sc5-v-1260', label_en: 'Max PV Input', label_ur: 'زیادہ سے زیادہ PV ان پٹ', value_en: '30V / 1000W', value_ur: '30V / 1000W', sort_order: 3 },
      { id: 's-108', product_id: 'prod-sc5-v-1260', label_en: 'Display Metering', label_ur: 'ڈسپلے میٹرنگ', value_en: 'Voltmeter Only', value_ur: 'صرف وولٹ میٹر', sort_order: 4 },
    ],
  },
  {
    id: 'prod-sc5-va-2460',
    category_id: 'cat-solar',
    slug: 'sc5-va-2460-solar-charge-controller',
    sku: 'SC5 VA-2460',
    name_en: 'ASATEK SC5 VA-2460 PWM Solar Charge Controller (24V 60A)',
    name_ur: 'ایساٹیک SC5 VA-2460 PWM سولر چارج کنٹرولر (24V 60A)',
    short_desc_en:
      'High-capacity 24V 60A PWM solar charge controller with dual Voltmeter + Ammeter readout supporting up to 1400W PV arrays.',
    short_desc_ur:
      '1400W تک سولر پینلز کے لیے وولٹ میٹر اور ایمپیئر میٹر کے ساتھ 24V 60A سولر چارج کنٹرولر۔',
    moq: 5,
    availability: 'in_stock',
    is_active: true,
    is_featured: true,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-107', product_id: 'prod-sc5-va-2460', min_qty: 5, unit_price: 3150 },
      { id: 't-108', product_id: 'prod-sc5-va-2460', min_qty: 20, unit_price: 2950 },
      { id: 't-109', product_id: 'prod-sc5-va-2460', min_qty: 50, unit_price: 2780 },
    ],
    specs: [
      { id: 's-109', product_id: 'prod-sc5-va-2460', label_en: 'System Voltage', label_ur: 'سسٹم وولٹیج', value_en: '24V DC', value_ur: '24V DC', sort_order: 1 },
      { id: 's-110', product_id: 'prod-sc5-va-2460', label_en: 'Rated Current', label_ur: 'ریٹڈ کرنٹ', value_en: '60A PWM', value_ur: '60A PWM', sort_order: 2 },
      { id: 's-111', product_id: 'prod-sc5-va-2460', label_en: 'Max PV Input', label_ur: 'زیادہ سے زیادہ PV ان پٹ', value_en: '60V / 1400W', value_ur: '60V / 1400W', sort_order: 3 },
      { id: 's-112', product_id: 'prod-sc5-va-2460', label_en: 'Display Metering', label_ur: 'ڈسپلے میٹرنگ', value_en: 'Voltmeter + Ammeter', value_ur: 'وولٹ میٹر + ایمپیئر میٹر', sort_order: 4 },
    ],
  },
  {
    id: 'prod-sc5-v-2460',
    category_id: 'cat-solar',
    slug: 'sc5-v-2460-solar-charge-controller',
    sku: 'SC5 V-2460',
    name_en: 'ASATEK SC5 V-2460 PWM Solar Charge Controller (24V 60A)',
    name_ur: 'ایساٹیک SC5 V-2460 PWM سولر چارج کنٹرولر (24V 60A)',
    short_desc_en:
      '24V 60A PWM controller with crisp digital voltmeter and reverse-polarity protection for dual-battery solar systems.',
    short_desc_ur:
      'ڈبل بیٹری سولر سسٹمز کے لیے ڈیجیٹل وولٹ میٹر کے ساتھ 24V 60A سولر چارج کنٹرولر۔',
    moq: 5,
    availability: 'in_stock',
    is_active: true,
    is_featured: false,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-110', product_id: 'prod-sc5-v-2460', min_qty: 5, unit_price: 2900 },
      { id: 't-111', product_id: 'prod-sc5-v-2460', min_qty: 20, unit_price: 2720 },
      { id: 't-112', product_id: 'prod-sc5-v-2460', min_qty: 50, unit_price: 2560 },
    ],
    specs: [
      { id: 's-113', product_id: 'prod-sc5-v-2460', label_en: 'System Voltage', label_ur: 'سسٹم وولٹیج', value_en: '24V DC', value_ur: '24V DC', sort_order: 1 },
      { id: 's-114', product_id: 'prod-sc5-v-2460', label_en: 'Rated Current', label_ur: 'ریٹڈ کرنٹ', value_en: '60A PWM', value_ur: '60A PWM', sort_order: 2 },
      { id: 's-115', product_id: 'prod-sc5-v-2460', label_en: 'Max PV Input', label_ur: 'زیادہ سے زیادہ PV ان پٹ', value_en: '60V / 1400W', value_ur: '60V / 1400W', sort_order: 3 },
      { id: 's-116', product_id: 'prod-sc5-v-2460', label_en: 'Display Metering', label_ur: 'ڈسپلے میٹرنگ', value_en: 'Voltmeter Only', value_ur: 'صرف وولٹ میٹر', sort_order: 4 },
    ],
  },
  {
    id: 'prod-sc6-1230',
    category_id: 'cat-solar',
    slug: 'sc6-1230-3-in-1-solar-controller',
    sku: 'SC6-1230',
    name_en: 'ASATEK SC6-1230 3-in-1 Solar Charge Controller (12V 30A)',
    name_ur: 'ایساٹیک SC6-1230 تھری ان ون سولر چارج کنٹرولر (12V 30A)',
    short_desc_en:
      'Compact 3-in-1 12V 30A PWM solar charge controller designed for small home solar systems up to 500W PV.',
    short_desc_ur:
      '500W تک گھریلو سولر سسٹمز کے لیے کمپیکٹ 3-in-1 12V 30A سولر چارج کنٹرولر۔',
    moq: 10,
    availability: 'in_stock',
    is_active: true,
    is_featured: true,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-113', product_id: 'prod-sc6-1230', min_qty: 10, unit_price: 1450 },
      { id: 't-114', product_id: 'prod-sc6-1230', min_qty: 30, unit_price: 1320 },
      { id: 't-115', product_id: 'prod-sc6-1230', min_qty: 100, unit_price: 1200 },
    ],
    specs: [
      { id: 's-117', product_id: 'prod-sc6-1230', label_en: 'System Voltage', label_ur: 'سسٹم وولٹیج', value_en: '12V DC (3-in-1)', value_ur: '12V DC (3-in-1)', sort_order: 1 },
      { id: 's-118', product_id: 'prod-sc6-1230', label_en: 'Rated Current', label_ur: 'ریٹڈ کرنٹ', value_en: '30A PWM', value_ur: '30A PWM', sort_order: 2 },
      { id: 's-119', product_id: 'prod-sc6-1230', label_en: 'Max PV Input', label_ur: 'زیادہ سے زیادہ PV ان پٹ', value_en: '30V / 500W', value_ur: '30V / 500W', sort_order: 3 },
    ],
  },
  {
    id: 'prod-sc6-2430',
    category_id: 'cat-solar',
    slug: 'sc6-2430-3-in-1-solar-controller',
    sku: 'SC6-2430',
    name_en: 'ASATEK SC6-2430 3-in-1 Solar Charge Controller (24V 30A)',
    name_ur: 'ایساٹیک SC6-2430 تھری ان ون سولر چارج کنٹرولر (24V 30A)',
    short_desc_en:
      'Reliable 3-in-1 24V 30A PWM solar charge controller supporting up to 60V / 700W PV input with automatic cut-off.',
    short_desc_ur:
      '60V / 700W تک سولر ان پٹ اور آٹو کٹ آف کے ساتھ 24V 30A تھری ان ون کنٹرولر۔',
    moq: 10,
    availability: 'in_stock',
    is_active: true,
    is_featured: false,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-116', product_id: 'prod-sc6-2430', min_qty: 10, unit_price: 1650 },
      { id: 't-117', product_id: 'prod-sc6-2430', min_qty: 30, unit_price: 1520 },
      { id: 't-118', product_id: 'prod-sc6-2430', min_qty: 100, unit_price: 1400 },
    ],
    specs: [
      { id: 's-120', product_id: 'prod-sc6-2430', label_en: 'System Voltage', label_ur: 'سسٹم وولٹیج', value_en: '24V DC (3-in-1)', value_ur: '24V DC (3-in-1)', sort_order: 1 },
      { id: 's-121', product_id: 'prod-sc6-2430', label_en: 'Rated Current', label_ur: 'ریٹڈ کرنٹ', value_en: '30A PWM', value_ur: '30A PWM', sort_order: 2 },
      { id: 's-122', product_id: 'prod-sc6-2430', label_en: 'Max PV Input', label_ur: 'زیادہ سے زیادہ PV ان پٹ', value_en: '60V / 700W', value_ur: '60V / 700W', sort_order: 3 },
    ],
  },
  {
    id: 'prod-ups-1200',
    category_id: 'cat-ups',
    slug: 'asatek-ups-1200va-homage-type',
    sku: 'ASK-UPS-1200',
    name_en: 'ASATEK 1200VA Heavy-Duty Industrial & Home UPS',
    name_ur: 'ایساٹیک 1200VA ہیوی ڈیوٹی انڈسٹریل اور گھریلو یو پی ایس',
    short_desc_en:
      'Pure copper transformer UPS unit with fast changeover, high/low voltage cut-off, and multi-stage intelligent battery charging.',
    short_desc_ur:
      'خالص کاپر ٹرانسفارمر اور فاسٹ چینج اوور کے ساتھ 1200VA ہیوی ڈیوٹی یو پی ایس۔',
    moq: 2,
    availability: 'in_stock',
    is_active: true,
    is_featured: true,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-119', product_id: 'prod-ups-1200', min_qty: 2, unit_price: 18500 },
      { id: 't-120', product_id: 'prod-ups-1200', min_qty: 10, unit_price: 17400 },
      { id: 't-121', product_id: 'prod-ups-1200', min_qty: 25, unit_price: 16500 },
    ],
    specs: [
      { id: 's-123', product_id: 'prod-ups-1200', label_en: 'Capacity', label_ur: 'گنجائش', value_en: '1200VA / 900W', value_ur: '1200VA / 900W', sort_order: 1 },
      { id: 's-124', product_id: 'prod-ups-1200', label_en: 'Battery Voltage', label_ur: 'بیٹری وولٹیج', value_en: '12V Single Battery', value_ur: '12V سنگل بیٹری', sort_order: 2 },
      { id: 's-125', product_id: 'prod-ups-1200', label_en: 'Charging Current', label_ur: 'چارجنگ کرنٹ', value_en: '15A / 20A Selectable', value_ur: '15A / 20A منتخب کریں', sort_order: 3 },
      { id: 's-126', product_id: 'prod-ups-1200', label_en: 'Protection', label_ur: 'حفاظت', value_en: 'Overload & Short-Circuit', value_ur: 'اوور لوڈ اور شارٹ سرکٹ تحفظ', sort_order: 4 },
    ],
  },
  {
    id: 'prod-inv-2400',
    category_id: 'cat-inverters',
    slug: 'asatek-pure-sine-inverter-2400va',
    sku: 'ASK-INV-2400',
    name_en: 'ASATEK 2400VA 24V Pure Sine Wave Inverter',
    name_ur: 'ایساٹیک 2400VA 24V پیور سائن ویو انورٹر',
    short_desc_en:
      'High-efficiency 24V pure sine wave power inverter built for fans, motors, LED loads, and sensitive electronics.',
    short_desc_ur:
      'پنکھوں، موٹروں اور حساس الیکٹرانکس کے لیے 24V پیور سائن ویو انورٹر۔',
    moq: 2,
    availability: 'made_to_order',
    is_active: true,
    is_featured: false,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-122', product_id: 'prod-inv-2400', min_qty: 2, unit_price: 29500 },
      { id: 't-123', product_id: 'prod-inv-2400', min_qty: 10, unit_price: 27800 },
    ],
    specs: [
      { id: 's-127', product_id: 'prod-inv-2400', label_en: 'Waveform', label_ur: 'ویو فارم', value_en: 'Pure Sine Wave', value_ur: 'پیور سائن ویو', sort_order: 1 },
      { id: 's-128', product_id: 'prod-inv-2400', label_en: 'Rated Power', label_ur: 'ریٹڈ پاور', value_en: '2400VA / 1920W', value_ur: '2400VA / 1920W', sort_order: 2 },
      { id: 's-129', product_id: 'prod-inv-2400', label_en: 'DC Input', label_ur: 'ڈی سی ان پٹ', value_en: '24V DC', value_ur: '24V DC', sort_order: 3 },
    ],
  },
  {
    id: 'prod-chg-1220',
    category_id: 'cat-chargers',
    slug: 'asatek-smart-battery-charger-12v-20a',
    sku: 'ASK-CHG-1220',
    name_en: 'ASATEK 12V 20A Automatic Battery Charger',
    name_ur: 'ایساٹیک 12V 20A آٹومیٹک بیٹری چارجر',
    short_desc_en:
      'Microcontroller-controlled 12V 20A battery charger with auto-cut, reverse polarity alarm, and fan cooling for tubular & dry batteries.',
    short_desc_ur:
      'آٹو کٹ آف اور کولنگ فین کے ساتھ 12V 20A آٹومیٹک بیٹری چارجر۔',
    moq: 5,
    availability: 'in_stock',
    is_active: true,
    is_featured: false,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-124', product_id: 'prod-chg-1220', min_qty: 5, unit_price: 4200 },
      { id: 't-125', product_id: 'prod-chg-1220', min_qty: 20, unit_price: 3900 },
      { id: 't-126', product_id: 'prod-chg-1220', min_qty: 50, unit_price: 3650 },
    ],
    specs: [
      { id: 's-130', product_id: 'prod-chg-1220', label_en: 'Output Voltage', label_ur: 'آؤٹ پٹ وولٹیج', value_en: '12V DC (14.4V Boost / 13.6V Float)', value_ur: '12V DC', sort_order: 1 },
      { id: 's-131', product_id: 'prod-chg-1220', label_en: 'Max Current', label_ur: 'زیادہ سے زیادہ کرنٹ', value_en: '20A Continuous', value_ur: '20A مسلسل', sort_order: 2 },
      { id: 's-132', product_id: 'prod-chg-1220', label_en: 'AC Input Range', label_ur: 'اے سی ان پٹ', value_en: '130V – 270V AC', value_ur: '130V – 270V AC', sort_order: 3 },
    ],
  },
  {
    id: 'prod-cap-450v',
    category_id: 'cat-capacitors',
    slug: 'electrolytic-capacitor-450v-470uf',
    sku: 'ASK-CAP-450-470',
    name_en: 'High-Temp 450V 470uF Electrolytic DC Bus Capacitor',
    name_ur: 'ہائی ٹمپریچر 450V 470uF الیکٹرولیٹک کیپیسیٹر',
    short_desc_en:
      '105°C low-ESR snap-in electrolytic capacitor engineered for inverter DC bus filtering and SMPS power stages.',
    short_desc_ur:
      'انورٹرز اور پاور سپلائیز کے لیے 105°C ہائی ٹمپریچر 450V 470uF کیپیسیٹر۔',
    moq: 50,
    availability: 'in_stock',
    is_active: true,
    is_featured: false,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-127', product_id: 'prod-cap-450v', min_qty: 50, unit_price: 260 },
      { id: 't-128', product_id: 'prod-cap-450v', min_qty: 200, unit_price: 235 },
      { id: 't-129', product_id: 'prod-cap-450v', min_qty: 500, unit_price: 215 },
    ],
    specs: [
      { id: 's-133', product_id: 'prod-cap-450v', label_en: 'Capacitance', label_ur: 'کیپیسٹینس', value_en: '470uF ±20%', value_ur: '470uF ±20%', sort_order: 1 },
      { id: 's-134', product_id: 'prod-cap-450v', label_en: 'Rated Voltage', label_ur: 'ریٹڈ وولٹیج', value_en: '450V DC', value_ur: '450V DC', sort_order: 2 },
      { id: 's-135', product_id: 'prod-cap-450v', label_en: 'Temperature Rating', label_ur: 'درجہ حرارت کی حد', value_en: '105°C (3000 hrs)', value_ur: '105°C', sort_order: 3 },
    ],
  },
  {
    id: 'prod-res-10w',
    category_id: 'cat-resistors',
    slug: 'wirewound-cement-resistor-10w-0r1',
    sku: 'ASK-RES-10W-0R1',
    name_en: '10W 0.1Ω Ceramic Wirewound Power Resistor Pack',
    name_ur: '10W 0.1Ω سیرامک وائر واؤنڈ پاور ریزسٹر',
    short_desc_en:
      'High-surge ceramic cement current-sensing resistor for UPS, inverter MOSFET/IGBT driver stages, and charger boards.',
    short_desc_ur:
      'یو پی ایس اور انورٹر بورڈز کے لیے 10W 0.1 اوم سیرامک پاور ریزسٹر۔',
    moq: 100,
    availability: 'in_stock',
    is_active: true,
    is_featured: false,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-130', product_id: 'prod-res-10w', min_qty: 100, unit_price: 28 },
      { id: 't-131', product_id: 'prod-res-10w', min_qty: 500, unit_price: 23 },
      { id: 't-132', product_id: 'prod-res-10w', min_qty: 1000, unit_price: 19 },
    ],
    specs: [
      { id: 's-136', product_id: 'prod-res-10w', label_en: 'Power Rating', label_ur: 'پاور ریٹنگ', value_en: '10 Watts', value_ur: '10 واٹ', sort_order: 1 },
      { id: 's-137', product_id: 'prod-res-10w', label_en: 'Resistance', label_ur: 'مزاحمت', value_en: '0.1 Ohm ±5%', value_ur: '0.1 اوم ±5%', sort_order: 2 },
      { id: 's-138', product_id: 'prod-res-10w', label_en: 'Package Type', label_ur: 'پیکیج', value_en: 'Axial Ceramic Cement', value_ur: 'سیرامک سیمنٹ', sort_order: 3 },
    ],
  },
  {
    id: 'prod-hs-alu',
    category_id: 'cat-heatsinks',
    slug: 'extruded-aluminium-heatsink-150mm',
    sku: 'ASK-HS-150AL',
    name_en: 'Extruded Aluminium Power Heat Sink (150mm × 80mm)',
    name_ur: 'ایکسٹروڈڈ ایلومینیم پاور ہیٹ سنک (150mm × 80mm)',
    short_desc_en:
      'Heavy-fin 6063 extruded aluminium thermal profile pre-machined for TO-220 / TO-247 MOSFETs and IGBTs.',
    short_desc_ur:
      'موسفٹ اور آئی جی بی ٹی ٹھنڈا رکھنے کے لیے ہیوی ایلومینیم ہیٹ سنک۔',
    moq: 20,
    availability: 'in_stock',
    is_active: true,
    is_featured: false,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-133', product_id: 'prod-hs-alu', min_qty: 20, unit_price: 480 },
      { id: 't-134', product_id: 'prod-hs-alu', min_qty: 100, unit_price: 425 },
    ],
    specs: [
      { id: 's-139', product_id: 'prod-hs-alu', label_en: 'Material', label_ur: 'میٹریل', value_en: '6063-T5 Aluminium Alloy', value_ur: '6063-T5 ایلومینیم', sort_order: 1 },
      { id: 's-140', product_id: 'prod-hs-alu', label_en: 'Dimensions', label_ur: 'سائز', value_en: '150 × 80 × 32 mm', value_en_alt: '', value_ur: '150 × 80 × 32 mm', sort_order: 2 } as never,
    ].map((s) => ({
      id: s.id,
      product_id: s.product_id,
      label_en: s.label_en,
      label_ur: s.label_ur,
      value_en: s.value_en,
      value_ur: s.value_ur,
      sort_order: s.sort_order,
    })),
  },
  {
    id: 'prod-igbt-60n60',
    category_id: 'cat-igbt',
    slug: 'igbt-60n60-600v-60a-to247',
    sku: 'ASK-IGBT-60N60',
    name_en: '60N60 600V 60A High-Speed Trench IGBT (TO-247)',
    name_ur: '60N60 600V 60A ہائی اسپیڈ آئی جی بی ٹی (TO-247)',
    short_desc_en:
      'Original-grade 600V 60A TO-247 IGBT with fast soft-recovery co-packaged diode for solar inverters and UPS H-bridges.',
    short_desc_ur:
      'سولر انورٹرز اور یو پی ایس کے لیے 600V 60A ہائی اسپیڈ آئی جی بی ٹی۔',
    moq: 25,
    availability: 'out_of_stock',
    is_active: true,
    is_featured: false,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-135', product_id: 'prod-igbt-60n60', min_qty: 25, unit_price: 390 },
      { id: 't-136', product_id: 'prod-igbt-60n60', min_qty: 100, unit_price: 350 },
      { id: 't-137', product_id: 'prod-igbt-60n60', min_qty: 500, unit_price: 320 },
    ],
    specs: [
      { id: 's-141', product_id: 'prod-igbt-60n60', label_en: 'Collector-Emitter Voltage', label_ur: 'وولٹیج', value_en: '600V', value_ur: '600V', sort_order: 1 },
      { id: 's-142', product_id: 'prod-igbt-60n60', label_en: 'Collector Current', label_ur: 'کرنٹ', value_en: '60A @ 100°C', value_ur: '60A @ 100°C', sort_order: 2 },
      { id: 's-143', product_id: 'prod-igbt-60n60', label_en: 'Package', label_ur: 'پیکیج', value_en: 'TO-247', value_ur: 'TO-247', sort_order: 3 },
    ],
  },
  {
    id: 'prod-pcb-ups',
    category_id: 'cat-pcb',
    slug: 'asatek-ups-control-pcb-fr4',
    sku: 'ASK-PCB-UPS12',
    name_en: 'ASATEK 12V UPS Main Control & Driver PCB (FR-4 2oz Copper)',
    name_ur: 'ایساٹیک 12V یو پی ایس مین کنٹرول پی سی بی (FR-4)',
    short_desc_en:
      'Double-sided 2oz heavy-copper FR-4 PCB with solder mask and silkscreen, designed for 1000VA–1500VA local UPS assembly.',
    short_desc_ur:
      '1000VA سے 1500VA یو پی ایس اسمبلی کے لیے 2oz کاپر ڈبل سائیڈ FR-4 پی سی بی۔',
    moq: 10,
    availability: 'in_stock',
    is_active: true,
    is_featured: false,
    created_at: nowIso,
    updated_at: nowIso,
    images: [],
    price_tiers: [
      { id: 't-138', product_id: 'prod-pcb-ups', min_qty: 10, unit_price: 680 },
      { id: 't-139', product_id: 'prod-pcb-ups', min_qty: 50, unit_price: 610 },
      { id: 't-140', product_id: 'prod-pcb-ups', min_qty: 200, unit_price: 550 },
    ],
    specs: [
      { id: 's-144', product_id: 'prod-pcb-ups', label_en: 'Base Material', label_ur: 'میٹریل', value_en: 'FR-4 High-Tg 1.6mm', value_ur: 'FR-4 1.6mm', sort_order: 1 },
      { id: 's-145', product_id: 'prod-pcb-ups', label_en: 'Copper Weight', label_ur: 'کاپر وزن', value_en: '2 oz Heavy Copper', value_ur: '2 oz ہیوی کاپر', sort_order: 2 },
      { id: 's-146', product_id: 'prod-pcb-ups', label_en: 'Surface Finish', label_ur: 'فنش', value_en: 'HASL Lead-Free', value_ur: 'HASL لیڈ فری', sort_order: 3 },
    ],
  },
];

export const mockSettings: SiteSettingsMap = {
  site_name: { value_en: 'ASATEK', value_ur: 'ایساٹیک' },
  logo_url: { value_en: '', value_ur: '' },
  tagline: {
    value_en: 'Factory-Direct Power Electronics & Wholesale Components',
    value_ur: 'براہ راست فیکٹری پاور الیکٹرانکس اور ہول سیل پرزہ جات',
  },
  hero_title: {
    value_en: 'Factory-Direct Power Electronics',
    value_ur: 'فیکٹری سے براہ راست پاور الیکٹرانکس',
  },
  hero_subtitle: {
    value_en:
      'Wholesale PWM solar charge controllers, UPS systems, inverters, battery chargers, and OEM power components manufactured in Sadiqabad, Pakistan.',
    value_ur:
      'صادق آباد، پاکستان میں تیار کردہ سولر چارج کنٹرولرز، یو پی ایس، انورٹرز، بیٹری چارجرز اور الیکٹرانکس پرزہ جات ہول سیل ریٹس پر دستیاب ہیں۔',
  },
  whatsapp_number: { value_en: '923000000000', value_ur: '923000000000' },
  phone: { value_en: '+92 300 0000000 (Update in Admin)', value_ur: '+92 300 0000000' },
  email: { value_en: 'sales@asatekpower.pk', value_ur: 'sales@asatekpower.pk' },
  address: {
    value_en: 'Nehar Kinara, Sadiqabad, District Rahim Yar Khan, Punjab, Pakistan',
    value_ur: 'نہر کنارہ، صادق آباد، ضلع رحیم یار خان، پنجاب، پاکستان',
  },
  working_hours: {
    value_en: 'Monday – Saturday: 9:00 AM – 6:00 PM PKT',
    value_ur: 'پیر تا ہفتہ: صبح 9:00 تا شام 6:00 بجے',
  },
  maps_url: {
    value_en: 'https://maps.google.com/?q=Sadiqabad+Punjab+Pakistan',
    value_ur: 'https://maps.google.com/?q=Sadiqabad+Punjab+Pakistan',
  },
  facebook_url: { value_en: '', value_ur: '' },
  instagram_url: { value_en: '', value_ur: '' },
  youtube_url: {
    value_en: 'https://www.youtube.com/@asatek3863',
    value_ur: 'https://www.youtube.com/@asatek3863',
  },
  about_title: { value_en: 'ASATEK POWER LINK', value_ur: 'ایساٹیک پاور لنک' },
  about_body: {
    value_en:
      'Based at Nehar Kinara in Sadiqabad, Punjab, ASATEK Power Link manufactures and supplies reliable PWM solar charge controllers, industrial and computer UPS units, battery chargers, and wholesale power electronics components across Pakistan. Our service and support network spans Sadiqabad, Karachi, Hyderabad, Bahawalpur, Lahore, Rawalpindi, Peshawar, and partner workshops nationwide.',
    value_ur:
      'نہر کنارہ، صادق آباد میں قائم ایساٹیک پاور لنک معیاری PWM سولر چارج کنٹرولرز، یو پی ایس، بیٹری چارجرز اور پاور الیکٹرانکس پرزہ جات پورے پاکستان میں ہول سیل فراہم کرتا ہے۔ ہمارے سروس سینٹرز صادق آباد، کراچی، حیدرآباد، بہاولپور، لاہور، راولپنڈی اور پشاور سمیت ملک کے مختلف شہروں میں موجود ہیں۔',
  },
  hero_image_url: { value_en: '', value_ur: '' },
  about_image_url: { value_en: '', value_ur: '' },
  favicon_url: { value_en: '', value_ur: '' },
};

export const mockInquiries: InquiryWithItems[] = [
  {
    id: 'inq-1001',
    reference: 'ASK-20261121-0001',
    type: 'quote',
    channel: 'website',
    name: 'Tariq Mahmood',
    phone: '03001234567',
    city: 'Multan',
    business_name: 'Al-Rehman Solar & UPS',
    message: 'Please confirm bilty dispatch for Monday.',
    status: 'new',
    admin_note: null,
    created_at: nowIso,
    status_updated_at: nowIso,
    confirmed_at: null,
    total_amount: 88600,
    skip_reason: null,
    items: [
      {
        id: 'ii-1',
        inquiry_id: 'inq-1001',
        product_id: 'prod-sc5-va-1260',
        product_name: 'ASATEK SC5 VA-1260 PWM Solar Charge Controller (12V 60A)',
        sku: 'SC5 VA-1260',
        quantity: 20,
        unit_price: 2450,
      },
      {
        id: 'ii-2',
        inquiry_id: 'inq-1001',
        product_id: 'prod-sc6-1230',
        product_name: 'ASATEK SC6-1230 3-in-1 Solar Charge Controller (12V 30A)',
        sku: 'SC6-1230',
        quantity: 30,
        unit_price: 1320,
      },
    ],
  },
  {
    id: 'inq-1002',
    reference: 'ASK-20261119-0002',
    type: 'quote',
    channel: 'whatsapp',
    name: 'Kamran Siddiqui',
    phone: '03217654321',
    city: 'Lahore',
    business_name: 'Hall Road Power Traders',
    message: 'Need 24V 60A models with voltmeter + ammeter.',
    status: 'confirmed',
    admin_note: 'Quoted bilty rate via Daewoo Cargo.',
    created_at: twoDaysAgoIso,
    status_updated_at: twoDaysAgoIso,
    confirmed_at: twoDaysAgoIso,
    total_amount: 139000,
    skip_reason: null,
    items: [
      {
        id: 'ii-3',
        inquiry_id: 'inq-1002',
        product_id: 'prod-sc5-va-2460',
        product_name: 'ASATEK SC5 VA-2460 PWM Solar Charge Controller (24V 60A)',
        sku: 'SC5 VA-2460',
        quantity: 50,
        unit_price: 2780,
      },
    ],
  },
  {
    id: 'inq-1003',
    reference: 'ASK-20261116-0003',
    type: 'contact',
    channel: 'website',
    name: 'Usman Ghani',
    phone: '03339988776',
    city: 'Bahawalpur',
    business_name: 'Ghani Electronics Workshop',
    message: 'Looking for regular monthly supply of UPS PCBs and 450V capacitors.',
    status: 'closed',
    admin_note: 'Dealer catalogue shared on WhatsApp.',
    created_at: fiveDaysAgoIso,
    status_updated_at: fiveDaysAgoIso,
    confirmed_at: null,
    total_amount: 0,
    skip_reason: null,
    items: [],
  },
  {
    id: 'inq-1004',
    reference: 'ASK-20261118-0004',
    type: 'quote',
    channel: 'website',
    name: 'Zeeshan Solar Works',
    phone: '03015554433',
    city: 'Faisalabad',
    business_name: 'Zeeshan Traders',
    message: 'Check availability first.',
    status: 'cancelled',
    admin_note: 'Customer postponed project.',
    created_at: twoDaysAgoIso,
    status_updated_at: twoDaysAgoIso,
    confirmed_at: null,
    total_amount: 24000,
    skip_reason: 'Buyer postponed project to next month',
    items: [
      {
        id: 'ii-4',
        inquiry_id: 'inq-1004',
        product_id: 'prod-sc5-v-1260',
        product_name: 'ASATEK SC5 V-1260 PWM Solar Charge Controller (12V 60A)',
        sku: 'SC5 V-1260',
        quantity: 10,
        unit_price: 2400,
      },
    ],
  },
];

const MOCK_STORE_KEY = 'asatek_preview_mock_store_v1';

export interface MockStoreShape {
  categories: Category[];
  products: ProductWithDetails[];
  settings: SiteSettingsMap;
  banners: HomeBanner[];
  inquiries: InquiryWithItems[];
  seqCounter: number;
}

function createInitialMockStore(): MockStoreShape {
  return {
    categories: [...mockCategories],
    products: mockProducts.map((p) => ({
      ...p,
      images: [...p.images],
      price_tiers: [...p.price_tiers],
      specs: [...p.specs],
    })),
    settings: { ...mockSettings },
    banners: [],
    inquiries: mockInquiries.map((i) => ({ ...i, items: [...i.items] })),
    seqCounter: 4,
  };
}

function loadMockStore(): MockStoreShape {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return createInitialMockStore();
  }
  try {
    const raw = window.sessionStorage.getItem(MOCK_STORE_KEY);
    if (!raw) return createInitialMockStore();
    const parsed = JSON.parse(raw) as Partial<MockStoreShape>;
    const defaults = createInitialMockStore();
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : defaults.categories,
      products: Array.isArray(parsed.products) ? parsed.products : defaults.products,
      settings: parsed.settings ? parsed.settings : defaults.settings,
      banners: Array.isArray(parsed.banners) ? parsed.banners : defaults.banners,
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : defaults.inquiries,
      seqCounter: typeof parsed.seqCounter === 'number' ? parsed.seqCounter : defaults.seqCounter,
    };
  } catch {
    return createInitialMockStore();
  }
}

export const mockStore: MockStoreShape = loadMockStore();

export function saveMockStore(): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(MOCK_STORE_KEY, JSON.stringify(mockStore));
  } catch {
    // Ignore storage quota errors
  }
}

export function getMockDashboardCounts(): DashboardCounts {
  const sevenDaysAgo = Date.now() - 7 * 86400 * 1000;
  return {
    total_products: mockStore.products.length,
    active_products: mockStore.products.filter((p) => p.is_active).length,
    new_orders: mockStore.inquiries.filter(
      (i) => i.type === 'quote' && i.status === 'new',
    ).length,
    new_inquiries: mockStore.inquiries.filter((i) => i.status === 'new').length,
    inquiries_last_7_days: mockStore.inquiries.filter(
      (i) => new Date(i.created_at).getTime() >= sevenDaysAgo,
    ).length,
  };
}

export function getMockTrackedOrder(
  reference: string,
  phone: string,
): import('../types/db').TrackedOrder | null {
  const refNorm = reference.trim().toLowerCase();
  const phoneDigits = phone.replace(/\D/g, '');
  if (!refNorm || !phoneDigits) return null;

  const found = mockStore.inquiries.find((i) => {
    const iPhoneDigits = (i.phone || '').replace(/\D/g, '');
    return (
      i.reference.toLowerCase() === refNorm &&
      (iPhoneDigits === phoneDigits ||
        iPhoneDigits.endsWith(phoneDigits.slice(-10)) &&
          phoneDigits.endsWith(iPhoneDigits.slice(-10)))
    );
  });
  if (!found) return null;

  const calcTotal =
    found.total_amount ??
    found.items.reduce(
      (sum, item) => sum + Number(item.unit_price ?? 0) * item.quantity,
      0,
    );

  return {
    reference: found.reference,
    status: found.status,
    created_at: found.created_at,
    status_updated_at: found.status_updated_at ?? found.created_at,
    skip_reason: found.skip_reason ?? null,
    total_amount: calcTotal,
    items: found.items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      sku: item.sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  };
}

export function getMockAdminSalesSummary(
  from: string,
  to: string,
): import('../types/db').AdminSalesSummary {
  const fromTs = new Date(`${from}T00:00:00`).getTime();
  const toTs = new Date(`${to}T23:59:59.999`).getTime();
  const revenueStatuses = new Set(['confirmed', 'dispatched', 'completed']);

  const ordersInRange = mockStore.inquiries.filter((i) => {
    const ts = new Date(i.created_at).getTime();
    return i.type === 'quote' && ts >= fromTs && ts <= toTs;
  });

  const calcAmount = (i: InquiryWithItems) =>
    i.total_amount ??
    i.items.reduce(
      (s, it) => s + Number(it.unit_price ?? 0) * it.quantity,
      0,
    );

  const revenueOrders = ordersInRange.filter((i) => revenueStatuses.has(i.status));
  const totalRevenue = revenueOrders.reduce((s, i) => s + calcAmount(i), 0);

  const dailyMap = new Map<string, { orders: number; revenue: number }>();
  for (const o of ordersInRange) {
    const day = o.created_at.slice(0, 10);
    const cur = dailyMap.get(day) ?? { orders: 0, revenue: 0 };
    cur.orders += 1;
    if (revenueStatuses.has(o.status)) cur.revenue += calcAmount(o);
    dailyMap.set(day, cur);
  }

  const monthlyMap = new Map<string, { orders: number; revenue: number }>();
  for (const o of mockStore.inquiries.filter((i) => i.type === 'quote')) {
    const month = o.created_at.slice(0, 7);
    const cur = monthlyMap.get(month) ?? { orders: 0, revenue: 0 };
    cur.orders += 1;
    if (revenueStatuses.has(o.status)) cur.revenue += calcAmount(o);
    monthlyMap.set(month, cur);
  }

  const topMap = new Map<string, { qty: number; revenue: number }>();
  const trendMap = new Map<string, { qty: number; orders: number }>();
  for (const o of ordersInRange) {
    const seenInOrder = new Set<string>();
    for (const it of o.items) {
      const tCur = trendMap.get(it.product_name) ?? { qty: 0, orders: 0 };
      tCur.qty += it.quantity;
      if (!seenInOrder.has(it.product_name)) {
        tCur.orders += 1;
        seenInOrder.add(it.product_name);
      }
      trendMap.set(it.product_name, tCur);

      if (revenueStatuses.has(o.status)) {
        const topCur = topMap.get(it.product_name) ?? { qty: 0, revenue: 0 };
        topCur.qty += it.quantity;
        topCur.revenue += Number(it.unit_price ?? 0) * it.quantity;
        topMap.set(it.product_name, topCur);
      }
    }
  }

  const statusMap = new Map<import('../types/db').InquiryStatus, number>();
  const channelMap = new Map<
    import('../types/db').InquiryChannel,
    { orders: number; revenue: number }
  >();
  const cityMap = new Map<string, { orders: number; revenue: number }>();

  for (const o of ordersInRange) {
    statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1);
    const ch = channelMap.get(o.channel) ?? { orders: 0, revenue: 0 };
    ch.orders += 1;
    if (revenueStatuses.has(o.status)) ch.revenue += calcAmount(o);
    channelMap.set(o.channel, ch);

    const city = o.city?.trim() || 'Unspecified';
    const ct = cityMap.get(city) ?? { orders: 0, revenue: 0 };
    ct.orders += 1;
    if (revenueStatuses.has(o.status)) ct.revenue += calcAmount(o);
    cityMap.set(city, ct);
  }

  return {
    range: { from, to },
    totals: {
      orders: ordersInRange.length,
      new_orders: ordersInRange.filter((i) => i.status === 'new').length,
      skipped_orders: ordersInRange.filter((i) => i.status === 'skipped').length,
      cancelled_orders: ordersInRange.filter((i) => i.status === 'cancelled').length,
      confirmed_orders: revenueOrders.length,
      revenue: totalRevenue,
      avg_order_value:
        revenueOrders.length > 0
          ? Math.round(totalRevenue / revenueOrders.length)
          : 0,
    },
    daily: [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, val]) => ({ date, ...val })),
    monthly: [...monthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, val]) => ({ month, ...val })),
    top_products: [...topMap.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 8)
      .map(([name, val]) => ({ name, ...val })),
    trending_products: [...trendMap.entries()]
      .sort((a, b) => b[1].orders - a[1].orders || b[1].qty - a[1].qty)
      .slice(0, 8)
      .map(([name, val]) => ({ name, ...val })),
    by_status: [...statusMap.entries()].map(([status, orders]) => ({
      status,
      orders,
    })),
    by_channel: [...channelMap.entries()].map(([channel, val]) => ({
      channel,
      ...val,
    })),
    by_city: [...cityMap.entries()]
      .sort((a, b) => b[1].orders - a[1].orders)
      .slice(0, 8)
      .map(([city, val]) => ({ city, ...val })),
  };
}

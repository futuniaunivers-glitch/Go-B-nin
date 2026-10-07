import { Category, Product, StoreSettings } from '../types';

export const DEFAULT_SETTINGS: StoreSettings = {
  businessName: 'Grossiste des Senteurs 229',
  tagline: 'Parfums • Huiles • Déodorants • Désodorisants • Diffuseurs',
  phone: '+229 0162018807',
  whatsappNumber: '2290162018807',
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029VbBztfaAzNbmNlgWDh09',
  tiktokUrl: 'https://www.tiktok.com/@grossiste.des.sen',
  facebookUrl: 'https://www.facebook.com/share/1FQCGbQojV/',
  mapsUrl: 'https://maps.app.goo.gl/33vSted1uW78ohqr8?g_st=awb',
  locationText: 'Cotonou, Bénin — Disponible en boutique et livraison partout au Bénin',
  deliveryInfo:
    'Livraison rapide par livreur ou zem à Cotonou, Calavi et environs. Expédition par bus / taxi pour les autres villes (Porto-Novo, Parakou, Bohicon, Natitingou, Abomey-Calavi, etc.).',
  salesConditions: [
    'Paiement par Mobile Money ou Moov Money exigé.',
    'Aucun paiement à la livraison.',
    'Les commandes sont confirmées après paiement.',
    'À la livraison, vous ne payez que les frais de livraison.',
    "À défaut de prendre la douzaine d'un article, le minimum pour bénéficier du prix de gros est de 3 pièces par article.",
    'Minimum de 6 pièces pour les huiles en mini-format.',
    'Pas de réservation à moitié.',
  ],
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-parfums', name: 'Parfums', isActive: true, order: 1 },
  { id: 'cat-huiles', name: 'Huiles', isActive: true, order: 2 },
  { id: 'cat-deodorants', name: 'Déodorants', isActive: true, order: 3 },
  { id: 'cat-desodorisants', name: 'Désodorisants', isActive: true, order: 4 },
  { id: 'cat-diffuseurs', name: 'Diffuseurs', isActive: true, order: 5 },
  { id: 'cat-autres', name: 'Autres', isActive: true, order: 6 },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-yara-100ml',
    name: 'Eau de Parfum Yara Lattafa 100ml',
    categoryId: 'cat-parfums',
    description:
      'Parfum oriental gourmand très prisé. Notes de vanille, mandarine, héliotrope et musc. Flacon emblématique rose.',
    imageUrl:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    thumbUrl:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80',
    imagePath: null,
    thumbPath: null,
    stock: 45,
    lowStockThreshold: 10,
    detailPrice: 12000,
    wholesaleEnabled: true,
    wholesaleTiers: [
      { minQuantity: 3, pricePerUnit: 10500 },
      { minQuantity: 6, pricePerUnit: 9800 },
      { minQuantity: 12, pricePerUnit: 9000 },
    ],
    isActive: true,
    isDemo: true,
  },
  {
    id: 'prod-khamrah-100ml',
    name: 'Eau de Parfum Khamrah Lattafa 100ml',
    categoryId: 'cat-parfums',
    description:
      'Fragrance luxueuse et envoûtante aux accords de cannelle, noix de muscade, dattes et vanille pralinée.',
    imageUrl:
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    thumbUrl:
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80',
    imagePath: null,
    thumbPath: null,
    stock: 28,
    lowStockThreshold: 8,
    detailPrice: 16000,
    wholesaleEnabled: true,
    wholesaleTiers: [
      { minQuantity: 3, pricePerUnit: 14500 },
      { minQuantity: 6, pricePerUnit: 13500 },
      { minQuantity: 12, pricePerUnit: 12500 },
    ],
    isActive: true,
    isDemo: true,
  },
  {
    id: 'prod-huile-musc-tahara',
    name: 'Huile Parfumée Concentrée Musc Tahara 12ml',
    categoryId: 'cat-huiles',
    description:
      'Huile de musc blanc pur crémeuse sans alcool. Senteur propre, douce et longue tenue 24h. Idéale pour la revente.',
    imageUrl:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    thumbUrl:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80',
    imagePath: null,
    thumbPath: null,
    stock: 120,
    lowStockThreshold: 20,
    detailPrice: 2500,
    wholesaleEnabled: true,
    wholesaleTiers: [
      { minQuantity: 6, pricePerUnit: 1800 },
      { minQuantity: 12, pricePerUnit: 1500 },
      { minQuantity: 24, pricePerUnit: 1300 },
    ],
    isActive: true,
    isDemo: true,
  },
  {
    id: 'prod-huile-oud-wood',
    name: 'Huile Concentrée Oud & Vanille 6ml',
    categoryId: 'cat-huiles',
    description:
      'Mini format roll-on ultra concentré. Accord boisé puissant et vanille ambrée.',
    imageUrl:
      'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
    thumbUrl:
      'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=400&q=80',
    imagePath: null,
    thumbPath: null,
    stock: 8,
    lowStockThreshold: 10,
    detailPrice: 1500,
    wholesaleEnabled: true,
    wholesaleTiers: [
      { minQuantity: 6, pricePerUnit: 1000 },
      { minQuantity: 12, pricePerUnit: 850 },
      { minQuantity: 24, pricePerUnit: 700 },
    ],
    isActive: true,
    isDemo: true,
  },
  {
    id: 'prod-deo-asad-200ml',
    name: 'Déodorant Spray Corps Asad Lattafa 200ml',
    categoryId: 'cat-deodorants',
    description:
      'Body spray longue durée, senteur épicée boisée masculine. Très forte rotation commerciale.',
    imageUrl:
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
    thumbUrl:
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=400&q=80',
    imagePath: null,
    thumbPath: null,
    stock: 65,
    lowStockThreshold: 12,
    detailPrice: 3500,
    wholesaleEnabled: true,
    wholesaleTiers: [
      { minQuantity: 3, pricePerUnit: 2900 },
      { minQuantity: 6, pricePerUnit: 2600 },
      { minQuantity: 12, pricePerUnit: 2300 },
    ],
    isActive: true,
    isDemo: true,
  },
  {
    id: 'prod-desodorisant-ambiance',
    name: 'Désodorisants Textile & Ambiance Oud Mood 300ml',
    categoryId: 'cat-desodorisants',
    description:
      'Spray désodorisant puissant pour salons, rideaux, draps, voitures et vêtements. Neutralise les odeurs.',
    imageUrl:
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
    thumbUrl:
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80',
    imagePath: null,
    thumbPath: null,
    stock: 50,
    lowStockThreshold: 10,
    detailPrice: 3000,
    wholesaleEnabled: true,
    wholesaleTiers: [
      { minQuantity: 3, pricePerUnit: 2500 },
      { minQuantity: 6, pricePerUnit: 2200 },
      { minQuantity: 12, pricePerUnit: 1900 },
    ],
    isActive: true,
    isDemo: true,
  },
  {
    id: 'prod-diffuseur-rotin',
    name: 'Diffuseur de Parfum à Tiges Rotin 100ml',
    categoryId: 'cat-diffuseurs',
    description:
      'Flacon en verre avec bâtonnets en rotin naturel. Diffusion continue pendant 6 à 8 semaines dans le salon ou bureau.',
    imageUrl:
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    thumbUrl:
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80',
    imagePath: null,
    thumbPath: null,
    stock: 18,
    lowStockThreshold: 5,
    detailPrice: 4500,
    wholesaleEnabled: true,
    wholesaleTiers: [
      { minQuantity: 3, pricePerUnit: 3800 },
      { minQuantity: 6, pricePerUnit: 3400 },
      { minQuantity: 12, pricePerUnit: 3000 },
    ],
    isActive: true,
    isDemo: true,
  },
  {
    id: 'prod-brume-ambre-rose',
    name: 'Brume Corporelle Shimmering Rose & Vanille 250ml',
    categoryId: 'cat-autres',
    description:
      'Brume parfumée pour le corps et les cheveux aux reflets nacrés dorés. Très populaire pour cadeaux.',
    imageUrl:
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    thumbUrl:
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
    imagePath: null,
    thumbPath: null,
    stock: 0, // In stock: 0 (Rupture demonstration)
    lowStockThreshold: 5,
    detailPrice: 4000,
    wholesaleEnabled: true,
    wholesaleTiers: [
      { minQuantity: 3, pricePerUnit: 3300 },
      { minQuantity: 6, pricePerUnit: 2900 },
      { minQuantity: 12, pricePerUnit: 2500 },
    ],
    isActive: true,
    isDemo: true,
  },
];

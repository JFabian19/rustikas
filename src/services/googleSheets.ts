import Papa from 'papaparse';
import { DEFAULT_MENU_DATA, type Category, type Dish } from '../data/menuData';

// ID de la hoja de Google Sheets configurado por el usuario
export const SHEET_ID = '1v5wmHAjEqOIje_-m-7f9cVrq20KYomHbesM5w2gYJnk';

export interface SheetDish {
  categoria_id?: string;
  Categoria?: string;
  'Categoría'?: string;
  'Nombre de la categoría'?: string;
  nombre?: string;
  Plato?: string;
  'Nombre del plato'?: string;
  descripcion?: string;
  'Descripción'?: string;
  Descripcion?: string;
  precio?: string;
  Precio?: string;
  url_imagen?: string;
  'Imagen URL'?: string;
  'Imagen url'?: string;
  Imagen?: string;
  orden?: string;
}

export interface SheetCategory {
  id?: string;
  Categoria?: string;
  'Categoría'?: string;
  nombre?: string;
  Nombre?: string;
  destacada?: string;
  horario?: string;
  orden?: string;
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const normalizeName = (text?: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// Mapa de imágenes locales por nombre de plato
const LOCAL_IMAGE_MAP = new Map<string, string>();
DEFAULT_MENU_DATA.forEach((category) => {
  category.items.forEach((dish) => {
    if (dish.imagen) {
      LOCAL_IMAGE_MAP.set(normalizeName(dish.nombre), dish.imagen);
    }
  });
});

const DEFAULT_CATEGORY_MAP = new Map<string, Category>();
DEFAULT_MENU_DATA.forEach((category) => {
  DEFAULT_CATEGORY_MAP.set(category.id, category);
  DEFAULT_CATEGORY_MAP.set(normalizeName(category.nombre), category);
});

export const fetchSheetData = async <T>(sheetName: string): Promise<T[]> => {
  if (!SHEET_ID) return [];
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve((results.data as T[]) || []),
        error: () => resolve([]),
      });
    });
  } catch (error) {
    console.error(`Error fetching sheet ${sheetName}:`, error);
    return [];
  }
};

const fetchFirstAvailableSheet = async <T>(sheetNames: string[]): Promise<T[]> => {
  for (const name of sheetNames) {
    const data = await fetchSheetData<T>(name);
    if (data && data.length > 0) {
      return data;
    }
  }
  return [];
};

const formatPrice = (rawPrice?: string | number): string => {
  if (!rawPrice) return 'S/ 0.00';
  const str = String(rawPrice).trim();
  const match = str.replace(',', '.').match(/[\d.]+/);
  if (!match) return str.startsWith('S/') ? str : `S/ ${str}`;
  const num = parseFloat(match[0]);
  if (isNaN(num)) return str;
  return `S/ ${num.toFixed(2)}`;
};

const resolveImageUrl = (url?: string, dishName?: string): string | undefined => {
  const value = url?.trim();
  if (value) {
    if (/^(?:https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;
    return `${import.meta.env.BASE_URL}${value.replace(/^\/+/, '')}`;
  }

  // Si está vacío, recurre a la imagen local precargada en la web
  if (dishName) {
    const localImg = LOCAL_IMAGE_MAP.get(normalizeName(dishName));
    if (localImg) return localImg;
  }

  return undefined;
};

interface MenuPayload {
  categorias: SheetCategory[];
  platos: SheetDish[];
}

const fetchMenuFromWebApp = (): Promise<MenuPayload | null> => new Promise((resolve) => {
  if (!WEB_APP_URL) { resolve(null); return; }

  const callbackName = `rustikasMenu_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const script = document.createElement('script');
  const windowWithCallback = window as unknown as Record<string, (payload: MenuPayload) => void>;
  const cleanup = () => {
    window.clearTimeout(timeout);
    script.remove();
    delete windowWithCallback[callbackName];
  };
  const timeout = window.setTimeout(() => { cleanup(); resolve(null); }, 10_000);

  windowWithCallback[callbackName] = (payload) => { cleanup(); resolve(payload); };
  script.onerror = () => { cleanup(); resolve(null); };
  script.src = `${WEB_APP_URL}${WEB_APP_URL.includes('?') ? '&' : '?'}resource=menu&callback=${callbackName}`;
  document.head.appendChild(script);
});

export const fetchMenuData = async (): Promise<Category[] | null> => {
  const secureMenu = await fetchMenuFromWebApp();
  const [rawCategories, rawDishes] = secureMenu
    ? [secureMenu.categorias, secureMenu.platos]
    : await Promise.all([
      fetchFirstAvailableSheet<SheetCategory>(['Categorias', 'Categorías', 'categorias', 'categorías', 'Hoja 1']),
      fetchFirstAvailableSheet<SheetDish>(['Platos', 'platos', 'Hoja 2']),
    ]);

  if (!rawCategories.length || !rawDishes.length) return null;

  // Normalizar categorías desde la hoja (soporta columna 'Categoria', 'Categoría', 'nombre', etc.)
  const parsedCategories = rawCategories
    .map((catRow: any, index: number) => {
      const nombre = (catRow.Categoria || catRow['Categoría'] || catRow.nombre || catRow.Nombre || Object.values(catRow)[0] || '').toString().trim();
      if (!nombre) return null;

      const slug = catRow.id ? String(catRow.id).trim() : slugify(nombre);
      const defaultMatch = DEFAULT_CATEGORY_MAP.get(slug) || DEFAULT_CATEGORY_MAP.get(normalizeName(nombre));

      const destacadaRaw = catRow.destacada !== undefined ? String(catRow.destacada).trim().toUpperCase() : undefined;
      const destacada = destacadaRaw ? destacadaRaw === 'SI' : (defaultMatch?.destacada || false);
      const horario = catRow.horario?.trim() || defaultMatch?.horario || undefined;
      const orden = catRow.orden ? Number(catRow.orden) : index + 1;

      return {
        id: slug,
        nombre,
        destacada,
        horario,
        orden,
      };
    })
    .filter((cat): cat is NonNullable<typeof cat> => cat !== null);

  if (!parsedCategories.length) return null;

  // Agrupar platos por categoría
  const menu: Category[] = parsedCategories.map((category) => {
    const matchingDishes = rawDishes.filter((dishRow: any) => {
      const catVal = (dishRow.Categoria || dishRow['Categoría'] || dishRow['Nombre de la categoría'] || dishRow.categoria_id || dishRow.categoria || '').toString().trim();
      if (!catVal) return false;

      const catSlug = slugify(catVal);
      const catNorm = normalizeName(catVal);

      return catSlug === category.id || catNorm === normalizeName(category.nombre) || catVal.toLowerCase() === category.id.toLowerCase();
    });

    const items: Dish[] = matchingDishes
      .map((dishRow: any) => {
        const nombre = (dishRow.Plato || dishRow['Nombre del plato'] || dishRow.nombre || dishRow.Nombre || '').toString().trim();
        const precio = (dishRow.Precio || dishRow.precio || '').toString().trim();
        if (!nombre || !precio) return null;

        const descripcion = (dishRow.Descripcion || dishRow['Descripción'] || dishRow.descripcion || '').toString().trim() || undefined;
        const rawImg = (dishRow['Imagen URL'] || dishRow['Imagen url'] || dishRow.Imagen || dishRow.url_imagen || dishRow.url || '').toString().trim();
        const imagen = resolveImageUrl(rawImg, nombre);

        return {
          nombre,
          descripcion,
          precio: formatPrice(precio),
          imagen,
        };
      })
      .filter((dish): dish is NonNullable<typeof dish> => dish !== null);

    return {
      id: category.id,
      nombre: category.nombre,
      destacada: category.destacada,
      horario: category.horario,
      items,
    };
  });

  return menu.length ? menu : null;
};

// Configura aquí la URL de tu Google Apps Script Web App para poder enviar datos si se desea backend personalizado
export const WEB_APP_URL: string = '';

export const submitSheetData = async (sheetName: string, data: any): Promise<boolean> => {
  if (!WEB_APP_URL) {
    console.warn('Falta configurar WEB_APP_URL. Simulando envío a:', sheetName, data);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  }

  try {
    await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheetName,
        data,
      }),
    });

    return true;
  } catch (error) {
    console.error(`Error submitting to sheet ${sheetName}:`, error);
    return false;
  }
};

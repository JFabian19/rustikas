import Papa from 'papaparse';
import type { Category, Dish } from '../data/menuData';

// Coloca aquí tu ID de Google Sheets si deseas sincronizar desde una hoja de cálculo actualizada.
// Si se deja vacío (''), se utilizará la carta local configurada en DEFAULT_MENU_DATA.
export const SHEET_ID = '';

export interface SheetDish {
  categoria_id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  url_imagen: string;
  orden?: string;
}

export interface SheetCategory {
  id: string;
  nombre: string;
  destacada?: string;
  horario?: string;
  orden?: string;
}

export const fetchSheetData = async <T>(sheetName: string): Promise<T[]> => {
  if (!SHEET_ID) return [];
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`No se pudo leer la hoja ${sheetName}.`);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data as T[]),
        error: (error: any) => reject(error),
      });
    });
  } catch (error) {
    console.error(`Error fetching sheet ${sheetName}:`, error);
    return [];
  }
};

const isFeatured = (value?: string) => value?.trim().toUpperCase() === 'SI';
const sortByOrder = <T extends { orden?: string }>(items: T[]) => [...items].sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));

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
  const [categories, dishes] = secureMenu
    ? [secureMenu.categorias, secureMenu.platos]
    : await Promise.all([
      fetchSheetData<SheetCategory>('categorias'),
      fetchSheetData<SheetDish>('platos'),
    ]);

  if (!categories.length || !dishes.length) return null;

  const menu = sortByOrder(categories)
    .filter((category) => category.id?.trim() && category.nombre?.trim())
    .map((category) => {
      const items: Dish[] = sortByOrder(dishes)
        .filter((dish) => dish.categoria_id?.trim() === category.id.trim() && dish.nombre?.trim() && dish.precio?.trim())
        .map((dish) => ({
          nombre: dish.nombre.trim(),
          descripcion: dish.descripcion?.trim() || undefined,
          precio: `S/ ${Number(dish.precio).toFixed(2)}`,
          imagen: dish.url_imagen?.trim() || undefined,
        }));

      return {
        id: category.id.trim(),
        nombre: category.nombre.trim(),
        destacada: isFeatured(category.destacada),
        horario: category.horario?.trim() || undefined,
        items,
      };
    });

  return menu.length ? menu : null;
};

// Configura aquí la URL de tu Google Apps Script Web App para poder enviar datos
// Instrucciones: Crea un Apps Script, pega el código que te di, impleméntalo como Aplicación Web y pega la URL de ejecución aquí.
export const WEB_APP_URL: string = '';

export const submitSheetData = async (sheetName: string, data: any): Promise<boolean> => {
  if (!WEB_APP_URL) {
    console.warn('Falta configurar WEB_APP_URL. Simulando envío a:', sheetName, data);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  }

  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // Importante para evitar problemas de CORS con Apps Script
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

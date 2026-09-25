export interface Dish {
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio: string;
}

export interface Category {
  id: string;
  nombre: string;
  destacada?: boolean;
  horario?: string;
  items: Dish[];
}

const localAsset = (path?: string) => path
  ? `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
  : undefined;

const item = (nombre: string, precio: string, descripcion?: string, imagen?: string): Dish => ({
  nombre,
  precio,
  descripcion,
  imagen: localAsset(imagen),
});

// Nueva carta de Rustikas
export const DEFAULT_MENU_DATA: Category[] = [
  {
    id: 'menu-brasa',
    nombre: 'Menú brasa',
    destacada: true,
    horario: 'Solo dos veces a la semana',
    items: [
      item('Chifa + 1/8 pollo', 'S/ 10.00', 'Chifa + 1/8 pollo + refresco + caldito', '/menu-brasa-1-8-pollo-completo.webp'),
      item('Chaufa', 'S/ 10.00', 'Chaufa + refresco + caldito', '/menu-chaufa-completo.webp'),
      item('Mostrito', 'S/ 10.00', 'Mostrito + refresco + caldito', '/menu-mostrito-completo.webp'),
    ],
  },
  {
    id: 'pollos',
    nombre: 'Pollos',
    items: [
      item('1/8 de pollo', 'S/ 10.00', '1/8 pollo + papas + cremas + ensalada + chicha', '/combo-octavo-chicha.webp'),
      item('1/4 de pollo', 'S/ 15.00', '1/4 pollo + papas + cremas + ensalada + chicha', '/combo-cuarto-chicha.webp'),
      item('1/2 pollo', 'S/ 35.00', '1/2 pollo + papas + cremas + ensalada + chicha', '/pollo-brasa-medio-completo.webp'),
      item('1 pollo', 'S/ 60.00', '1 pollo + ensalada + papas + cremas + chicha', '/pollo-brasa-entero-completo.webp'),
    ],
  },
  {
    id: 'mostros',
    nombre: 'Mostros',
    items: [
      item('Mostrito brasa', 'S/ 10.00', '1/8 pollo + chaufa + ensalada + papas + cremas + chicha', '/pollo-mostrito-octavo-completo.webp'),
      item('Mostrito broaster', 'S/ 12.00', '1/8 pollo broaster + chaufa + papas + ensalada + cremas + chicha', '/mostrito-broaster-completo.webp'),
      item('Mostrito pollo a la plancha', 'S/ 10.00', 'Pechuga + chaufa + papas + ensalada + chicha', '/mostrito-plancha.webp'),
      item('Mostrito a la cubana', 'S/ 14.00', '1/8 pollo + huevo frito + plátano frito + chaufa + papas + ensalada + cremas + chicha', '/mostrito-cubana.webp'),
    ],
  },
  {
    id: 'mostrazos',
    nombre: 'Mostrazos',
    items: [
      item('Mostrazo brasa', 'S/ 17.00', '1/4 pollo + chaufa + ensalada + papas + cremas + chicha', '/pollo-mostrito-cuarto-completo.webp'),
      item('Mostrazo broaster', 'S/ 19.00', '1/4 pollo broaster + chaufa + papas + ensalada + cremas + chicha', '/mostrazo-broaster-completo.webp'),
      item('Mostrazo pollo a la plancha', 'S/ 15.00', 'Pechuga + chaufa + papas + ensalada + chicha', '/mostrazo-plancha-completo.webp'),
      item('Mostrazo a la cubana', 'S/ 20.00', '1/4 pollo + huevo frito + plátano frito + chaufa + papas + ensalada + cremas + chicha', '/mostrazo-cubana.webp'),
    ],
  },
  {
    id: 'combos',
    nombre: 'Combos',
    items: [],
  },
  {
    id: 'chifa',
    nombre: 'Chifa',
    items: [
      item('Chaufa de pollo', 'S/ 10.00', 'Chaufa de pollo + cremas + chicha', '/chaufa-pollo-completo.webp'),
      item('Chaufa de chancho', 'S/ 12.00', 'Chaufa de chancho + cremas + chicha', '/chaufa-chancho-completo.webp'),
      item('Chaufa de res', 'S/ 12.00', 'Chaufa de res + cremas + chicha', '/chaufa-res-completo.webp'),
      item('Aeropuerto simple', 'S/ 10.00', 'Aeropuerto simple + cremas + chicha', '/aeropuerto-completo.webp'),
      item('Aeropuerto especial', 'S/ 13.00', 'Aeropuerto especial + cremas + chicha', '/aeropuerto-especial-completo.webp'),
      item('Combinado simple', 'S/ 12.00', 'Combinado simple + cremas + chicha', '/combinado-completo.webp'),
    ],
  },
  {
    id: 'extras',
    nombre: 'Extras',
    items: [],
  },
  {
    id: 'bebidas',
    nombre: 'Bebidas',
    items: [
      item('Inca o Coca Cola personal', 'S/ 2.50', undefined, '/bebida-personal.webp'),
      item('Inca o Coca Cola 600 ml', 'S/ 4.00', undefined, '/bebida-inca-600.webp'),
      item('Inca o Coca Cola 1 L', 'S/ 7.00', undefined, '/bebida-inca-1l.webp'),
      item('Inca o Coca Cola 1.5 L', 'S/ 9.00', undefined, '/bebida-inca-1-5l.webp'),
      item('Inca o Coca Cola 2.25 L', 'S/ 11.00', undefined, '/bebida-inca-2-25l.webp'),
      item('Inca o Coca Cola 3 L', 'S/ 14.00', undefined, '/bebida-inca-3l.webp'),
      item('Gordita', 'S/ 5.00', undefined, '/bebida-gordita.webp'),
      item('Pepsi 750 ml', 'S/ 4.00', undefined, '/bebida-pepsi-750.webp'),
      item('Pepsi 1 L', 'S/ 5.50', undefined, '/bebida-pepsi-1l.webp'),
      item('Pepsi 1.5 L', 'S/ 6.50', undefined, '/bebida-pepsi-1-5l.webp'),
      item('Pepsi 2 L', 'S/ 7.50', undefined, '/bebida-pepsi-2l.webp'),
      item('Pepsi 3 L', 'S/ 11.00', undefined, '/bebida-pepsi-3l.webp'),
      item('Agua Cielo o San Luis', 'S/ 2.00', undefined, '/bebida-agua.webp'),
      item('Cerveza Pilsen', 'S/ 8.00', undefined, '/bebida-pilsen.webp'),
      item('Cusqueña trigo o negra', 'S/ 10.00', undefined, '/bebida-cusquena.webp'),
      item('Concordia 1.5 L', 'S/ 5.50', undefined, '/bebida-concordia.webp'),
      item('Pepsi, Concordia o 7up 355 ml', 'S/ 1.50', undefined, '/bebida-mix-355.webp'),
      item('Gatorade', 'S/ 3.00', undefined, '/bebida-gatorade.webp'),
      item('Chicha o maracuyá 1 L', 'S/ 10.00', undefined, '/bebida-chicha-maracuya-1l.webp'),
      item('Chicha o maracuyá 500 ml', 'S/ 6.00', undefined, '/bebida-chicha-maracuya-500.webp'),
      item('Infusiones (té, anís y manzanilla)', 'S/ 2.50', undefined, '/bebida-infusiones.webp'),
    ],
  },
];
